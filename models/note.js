const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema(
    {
        title : {type: String, required: true},
        content: String
    }
);

// add createdAt and updatedAt fields
notesSchema.set('timestamps', true);

noteSchema.set('toObject', {
    virtuals: true,     // include built-in virtual `id`
    versionKey: false,  // remove `__v` version key
    transform: (doc, ret) => {
      delete ret._id; // delete `_id`
    }
  });

module.exports = mongoose.model('Note', notesSchema);