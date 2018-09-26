const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title : {type: String, required: true},
    content: String,
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
  }
);

// add createdAt and updatedAt fields
noteSchema.set('timestamps', true);

noteSchema.set('toObject', {
  virtuals: true, 
  versionKey: false,    // include built-in virtual `id`  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id, // delete `_id`
    delete ret._v;
  }
});

module.exports = mongoose.model('Note', noteSchema);