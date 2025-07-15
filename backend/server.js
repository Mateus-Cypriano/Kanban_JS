require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Importa os modelos
const User = require('./models/User');
const Task = require('./models/Task');

// Importa o middleware de autenticação
const auth = require('./middleware/auth.js'); // Importa o middleware

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';

app.use(express.json());

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://kanban-js-frontend.vercel.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// Conexão com o Banco de Dados MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- ROTAS DE AUTENTICAÇÃO (EXISTENTES) ---

// Rota de Registro de Usuário
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    //validação de role
    const newUser = new User({
        username, 
        password, 
        role: role || 'user' // Define a role padrão para 'user'
    })

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Nome de usuário já existe.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor ao registrar usuário.' });
    }
});

// Rota de Login de Usuário
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login bem-sucedido!',
            token,
            user: {
                id: user._id,
                username: user.username,
            },
            role: user.role
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro no servidor ao fazer login.' });
    }
});

// --- ROTAS DE DADOS (PROTEGIDAS COM AUTENTICAÇÃO) ---

// Rota para listar todos os usuários (para o dropdown "Atribuído a")
// Adiciona 'auth' como middleware antes da função da rota
app.get('/api/users', auth, async (req, res) => {
    try {
        // Encontra todos os usuários, mas seleciona apenas 'username' e '_id'
        const users = await User.find().select('username _id'); 
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar usuários.' });
    }
});

// Rota para buscar todas as tarefas do usuário logado
app.get('/api/tasks', auth, async (req, res) => {
    try {
        // Busca apenas as tarefas criadas pelo usuário logado (opcional, ou todas)
        // Para um Kanban simples, vamos buscar todas as tarefas.
        // Se você quisesse por usuário logado: const tasks = await Task.find({ createdBy: req.user.id });
        const tasks = await Task.find().populate('assignedTo', 'username'); // 'populate' para trazer o username do usuário atribuído
        res.status(200).json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar tarefas.' });
    }
});

// Rota para criar uma nova tarefa
app.post('/api/tasks', auth, async (req, res) => {
    const { title, description, status, assignedTo } = req.body;

    // Adiciona uma validação básica dos campos obrigatórios
    if (!title || !status) {
        return res.status(400).json({ message: 'Título e status da tarefa são obrigatórios.' });
    }

    // verifica se o req.user.id está disponível
    if (!req.user || !req.user.id) {
        return res.status(401).json({message: 'Usuário não autenticado ou ID ausente'});
    }
    // Opcional: validar se o status é um dos permitidos ('to-do', 'in-progress', 'done')
    const allowedStatuses = ['to-do', 'in-progress', 'done'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status de tarefa inválido.' });
    }

    try {
        const newTask = new Task({
            title,
            description,
            status,
            assignedTo: assignedTo || null, // Se assignedTo for vazio, salva como null
            createdBy: req.user.id // associar a tarefa ao criador
        });

        await newTask.save();
        // Opcional: Popular o assignedTo antes de retornar, para que o frontend já tenha o username
        await newTask.populate('assignedTo', 'username'); 
        res.status(201).json(newTask); // Retorna a tarefa criada
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao criar tarefa.' });
    }
});

// Rota para atualizar uma tarefa existente
app.put('/api/tasks/:id', auth, async (req, res) => {
    const { id } = req.params; // Pega o ID da URL
    const { title, description, status, assignedTo } = req.body;

    if (!title || !status) {
        return res.status(400).json({ message: 'Título e status da tarefa são obrigatórios.' });
    }
    const allowedStatuses = ['to-do', 'in-progress', 'done'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status de tarefa inválido.' });
    }

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { title, description, status, assignedTo: assignedTo || null },
            { new: true, runValidators: true } // `new: true` retorna o documento atualizado; `runValidators: true` roda as validações do schema
        ).populate('assignedTo', 'username');

        if (!updatedTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }
        res.status(200).json(updatedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar tarefa.' });
    }
});

// Rota para atualizar apenas o status de uma tarefa (para Drag & Drop)
app.patch('/api/tasks/:id/status', auth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status da tarefa é obrigatório.' });
    }
    const allowedStatuses = ['to-do', 'in-progress', 'done'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Status de tarefa inválido.' });
    }

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate('assignedTo', 'username');

        if (!updatedTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }
        res.status(200).json(updatedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar status da tarefa.' });
    }
});

// Rota para deletar uma tarefa
app.delete('/api/tasks/:id', auth, async (req, res) => {
    const { id } = req.params;
    console.log('Backend: Tentando deletar tarefa específica com ID:', id); // Log para depuração

    // verificação basica de usuário logado
    if (!req.user || !req.user.id) {
        return res.status(401).json({message: 'Usuário não autenticado'});
    }

    try {
        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            console.log('Backend: Tarefa com ID', id, 'não encontrada para exclusão.');
            return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }
        // -- VERIFICAÇÃO DE AUTORIZAÇÃO --
        // Se o usuário logado NÃO é o criador e NÃO é admin.
        if (deletedTask.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            console.warn(`Tentativa de exclusão não autorizada. Tarefa ID: ${id}, Criador: ${task.createdBy}, Usuário logado: ${req.user.id}, Role: ${req.user.role}`);
            return res.status(403).json({message: 'Acesso negado. Você só pode excluir a tarefa que você mesmo criou. '});
        }

        //Se a verificação passou, permite exclusão
        await deletedTask.deleteOne(); 
        res.status(200).json({message: 'Tarefa excluída com sucesso!'});
    } catch (err) {
        console.error('Backend: Erro ao excluir tarefa específica:', err);
        res.status(500).json({ message: 'Erro ao excluir tarefa.' });
    }

});


app.delete('/api/tasks', auth, async (req, res) => {
    console.log('\n--- Backend: Entrou na rota DELETE /api/tasks (limpeza em massa) ---'); // ADICIONE ISSO
    
    // Verifique o req.user que veio do middleware 'auth'
    if (!req.user || !req.user.role !== 'admin') {
        console.warn('Backend: tentativa de limpeza de coluna por usuário não-admin. Usuário ID:' , req.user ? req.user.id : 'N/A');
        return res.status(403).json({message: 'Acesso negado. Apenas administradores podem limpar colunas.'})
    }
    console.log('Backend: Usuário autenticado na rota (ID):', req.user.id); 
    console.log('Backend: Status de limpeza recebido:', req.query.status || 'todos'); 

    try {
        let deleteFilter = {};
        if (req.query.status) { // Use req.query.status diretamente
            const status = req.query.status; // Mantenha a variável status aqui para clareza
            const allowedStatuses = ['to-do', 'in-progress', 'done'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ message: 'Status de tarefa inválido para exclusão em massa.' });
            }
            deleteFilter = { status: status };
        }

        // Se você quer que apenas o usuário logado limpe SUAS tarefas, descomente a linha abaixo:
        // deleteFilter.createdBy = req.user.id; 

        const result = await Task.deleteMany(deleteFilter);

        if (result.deletedCount === 0) {
            console.log('Backend: Nenhuma tarefa encontrada para exclusão em massa com o filtro fornecido.');
            return res.status(200).json({ message: 'Nenhuma tarefa encontrada para exclusão com o filtro fornecido.' });
        }

        console.log(`Backend: ${result.deletedCount} tarefas excluídas em massa.`);
        res.status(200).json({ message: `${result.deletedCount} tarefas excluídas com sucesso!` });
    } catch (err) {
        console.error('Backend: Erro ao excluir múltiplas tarefas:', err);
        res.status(500).json({ message: 'Erro ao excluir tarefas.' });
    } finally {
        console.log('--- Backend: Saiu da rota DELETE /api/tasks ---'); // ADICIONE ISSO
    }
});


// Exemplo de rota simples para testar o servidor
app.get('/', (req, res) => {
    res.send('Servidor Kanban Backend está online!');
});

// Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});