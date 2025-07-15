const mongoose = require('mongoose'); 
 
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, //Garante que não haverá usuários com o mesmo nome
        trim: true //Remove os espaços em branco antes e depois
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user', //valor padrão quando criado um novo usuário
    }, 
    createdAt: {
        type: Date, 
        default: Date.now //define data de criação automaticamente. 
    }
});
 
module.exports = mongoose.model('User', userSchema);