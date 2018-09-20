const mongoose = require('mongoose');

const foldersSchema = new mongoose.Schema(
    {
        name: {type: String, required: true}
    }
);

// add createdAt and updatedAt fields
foldersSchema.set('timestamps', true);

foldersSchema.set('toObject', {
    virtuals: true,     // include built-in virtual `id`
    versionKey: false,  // remove `__v` version key
    transform: (doc, ret) => {
      delete ret._id; // delete `_id`
    }
  });

module.exports = mongoose.model('Folder', foldersSchema);