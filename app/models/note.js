const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: String,
    body: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
});

noteSchema.index({ 'body': 'text' })

module.exports = mongoose.model('Note', noteSchema);