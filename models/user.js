const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: { 
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullname: String
});

userSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, result) => {
    delete result._id,
    delete result._v,
    delete result.password;
  }
});

exports.module = mongoose.model('User', userSchema);