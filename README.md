# Kanban Board: Gerenciamento Ágil de Tarefas

<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/eedbe091-895f-4076-a5e9-ea37e7261bc1" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bc32e679-b7b9-4dc6-ade1-4e6d604f2978" />


Um aplicativo web completo para gerenciamento de tarefas, inspirado na metodologia Kanban, permitindo que usuários organizem e visualizem o progresso de suas atividades de forma intuitiva.
O projeto está rodando em produção em um ambiente real, o intuito principal é gerenciar as tarefas do meu dia a dia onde trabalho, organizando minhas atividades com meu colega de setor e futuramente fazer com que além de um 
quadro de gerenciamento, sirva como uma forma de 'Chamado', implementando a ideia de outros setores solicitarem tarefas através do quadro para que possamos ter um controle maior de nossas atividades, otimizando processo. 
Evitando que algo seja esquecido, ou então ficar em dúvida se já está sendo feito por outra pessoa. 
O projeto é simples porém pretendo adicionar mais algumas funções como por exemplo limpar a base de dados do banco após uma tarefa ser 'tageada' como concluída por um certo período, exlcuindo ela do quadro Kanban automáticamente. 

---

## 🚀 Funcionalidades

* **Gestão de Tarefas Completa:** Crie, edite, mova e exclua tarefas em um painel visual.
* **Drag-and-Drop (Arrastar e Soltar):** Arraste tarefas facilmente entre as colunas "A Fazer", "Em Andamento" e "Concluído" para atualizar seu status.
* **Autenticação de Usuários:** Sistema seguro de registro e login com validação de credenciais.
* **Controle de Acesso Baseado em Papéis (RBAC):**
    * **Usuários Normais:** Podem criar, editar e excluir **apenas suas próprias tarefas**.
    * **Administradores:** Possuem permissão total para criar, editar e excluir qualquer tarefa, além de poder **limpar colunas inteiras** de atividades.
* **Interface Intuitiva:** Design limpo e responsivo para uma experiência de usuário agradável.

---

## 💡 Tecnologias Utilizadas

Este projeto é uma aplicação full-stack, dividida em Frontend, Backend e Banco de Dados.

### Frontend

* **HTML5:** Estrutura semântica da aplicação.
* **CSS3:** Estilização e responsividade da interface.
* **JavaScript (Vanilla JS):** Lógica interativa do lado do cliente, manipulação do DOM e comunicação com a API.
* **`localStorage`:** Armazenamento de tokens de autenticação e dados do usuário logado para persistência da sessão.

### Backend (API RESTful)

* **Node.js:** Ambiente de execução JavaScript no servidor.
* **Express.js:** Framework web para Node.js, para construção da API RESTful.
* **Mongoose:** ODM (Object Data Modeling) para MongoDB, facilitando a interação com o banco de dados.
* **JSON Web Tokens (JWT):** Utilizado para autenticação segura e autorização de requisições.
* **Bcrypt:** Biblioteca para hashing de senhas, garantindo a segurança das credenciais dos usuários.
* **CORS:** Middleware para habilitar requisições de diferentes origens (necessário para comunicação entre frontend e backend em domínios diferentes).
* **`dotenv`:** Para gerenciar variáveis de ambiente de forma segura durante o desenvolvimento.

### Banco de Dados

* **MongoDB:** Banco de dados NoSQL, orientado a documentos, utilizado para armazenar usuários e tarefas.

---

## 🌐 Implantação (Deploy)

O projeto está implantado e funcional nos seguintes serviços de nuvem, aproveitando seus planos de nível gratuito:

* **Frontend:** [Vercel](https://vercel.com/)
    * **URL do Projeto:** `(https://kanban-js-frontend.vercel.app/)` 
* **Backend (API):** [Render](https://render.com/)
    * **URL da API:** `https://kanban-js.onrender.com/api` 
* **Banco de Dados:** [MongoDB Atlas](https://cloud.mongodb.com/)
    * Cluster MongoDB M0 Sandbox.

---

## ⚙️ Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar e rodar o projeto em sua máquina local.

### Pré-requisitos

Certifique-se de ter instalado:

* Node.js (v18 ou superior recomendado)
* npm (gerenciador de pacotes do Node.js)
* MongoDB (localmente ou uma conta no MongoDB Atlas)
* Git

