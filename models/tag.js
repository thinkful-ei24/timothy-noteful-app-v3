const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema(
  {
    name : { type: String, required: true },
    userId: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }
);

tagsSchema.index(
  { name: 1, userId: 1},
  { unique: true }
);

// add createdAt and updatedAt fields
tagsSchema.set('timestamps', true);

tagsSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`  // remove `__v` version key
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id, // delete `_id`
    delete ret._v;
  }
});

module.exports = mongoose.model('Tag', tagsSchema);