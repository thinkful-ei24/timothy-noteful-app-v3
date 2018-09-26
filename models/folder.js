const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
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

folderSchema.index({ name: 1, userId: 1}, { unique: true });

// add createdAt and updatedAt fields
folderSchema.set('timestamps', true);

folderSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key  
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Folder', folderSchema);