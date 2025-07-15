const mongoose = require('mongoose'); 

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true, 
        trim: true
    },
    description: {
        type: String,
        trim: true
    }, 
    status: {
        type: String,
        enum: ['to-do', 'in-progress', 'done'], //A tarefa só pode ter um desses status
        default: 'to-do',
        required: true
    },
    assignedTo: { //usuario responsável pela tarefa
        type: mongoose.Schema.Types.ObjectId, // Tipo especial para IDs do MongoDB 
        ref: 'User', //referencia ao modelo user
        required: false // pode atribuir ao usuario opcionalmente. 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true // tarefa deve ter um criador
    }, 
    createdAt: {
        type: Date, 
        default: Date.now
    }
});

// Middleware para atualizar 'updatedAt' automaticamente
taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('task', taskSchema);
