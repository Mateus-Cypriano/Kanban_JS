const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
     console.log(`\n--- Auth Middleware: Recebendo requisição: ${req.method} ${req.originalUrl} ---`); // NOVO LOG CRÍTICO
    if (req.method === 'OPTIONS') {
        console.log('Auth Middleware: Requisição OPTIONS detectada. Pulando autenticação.');
        return next(); // Pula este middleware e vai para o próximo na cadeia
    }

    const authHeader = req.header('Authorization');

    if (!authHeader) {
        console.warn('Auth Middleware: Nenhum Authorization header fornecido. Acesso negado (401).');
        return res.status(401).json({ message: 'Nenhum token fornecido, autorização negada.' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
        console.warn('Auth Middleware: Token vazio após remover "Bearer ". Acesso negado (401).');
        return res.status(401).json({ message: 'Token inválido (formato incorreto).' });
    }

    try {
        console.log('Auth Middleware: Tentando verificar token:', token.substring(0, 10) + '...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('Auth Middleware: Token decodificado (payload):', decoded);

        req.user = decoded // 
        
        if (!req.user || !req.user.id) {
            console.error('Auth Middleware: Usuário decodificado não possui ID válido. Payload:', decoded);
            return res.status(401).json({ message: 'Token inválido: informações de usuário ausentes.' });
        }

        console.log('Auth Middleware: Token validado. Usuário ID:', req.user.id, 'Role:', req.user.role);
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.warn('Auth Middleware: Token expirado. Acesso negado (401).');
            return res.status(401).json({ message: 'Token expirado, por favor, faça login novamente.' });
        }
        console.error('Auth Middleware: Token inválido. Erro:', err.message);
        res.status(401).json({ message: 'Token inválido.' });
    }
};