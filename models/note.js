const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema(
    {
        title : {type: String, required: true},
        content: String
    }
);

// add createdAt and updatedAt fields
notesSchema.set('timestamps', true);

module.exports = mongoose.model('Note', notesSchema);