const mongoose = require('mongoose');

const foldersSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true
  },
  userId : {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

foldersSchema.index({ name: 1, userId: 1}, { unique: true });

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