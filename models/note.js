const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema(
  {
    title : {type: String, required: true},
    content: String,
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }
  }
);

// add createdAt and updatedAt fields
notesSchema.set('timestamps', true);

notesSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id, // delete `_id`
    delete ret._v;
  }
});

notesSchema.methods.serialize = function(){
  return {
    id: this.id.toString(),
    title: this.title,
    content: this.content,
    folderId: this.folderId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Note', notesSchema);