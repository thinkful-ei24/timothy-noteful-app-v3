const express = require('express');
const User = require('../models/user');

const router = express.Router();

function validationError(message){
  const err = new Error(message);
  err.status = 422;
  return err;
}

router.post('/', (req, res, next) => {
  const { username, password, fullName } = req.body;

  const requireFields = ['username', 'password'];
  const missingField = requireFields.find(field => (!(field in req.body)));
  
  if(missingField) {
    const err = validationError(`${missingField} field is missing`);
    return next(err);
  }

  const trimmedFields = ['username', 'password'];
  const nontrimmedField = trimmedFields.find(field => 
    req.body[field].trim() !== req.body[field]
  );

  if(nontrimmedField) {
    const err = validationError(`${nontrimmedField} cannot start or end with whitespace`);
    return next(err);
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };

  const tooSmallField = Object.keys(sizedFields).find(field => 
    'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
  );

  const tooLargeField = Object.keys(sizedFields).find(field => 
    'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
  );

  if(tooSmallField || tooLargeField) {
    const message = ( 
      tooSmallField
        ? `${tooSmallField} must be at least ${sizedFields[tooSmallField].min} characters` 
        : `${tooLargeField} must be at most ${sizedFields[tooLargeField].max} characters`
    );
    const err = validationError(message);
    return next(err);
  }

  User.find({ username })
    .countDocuments()
    .then(count => {
      if(count > 0) {
        const err = validationError('Username already exists');
        return Promise.reject(err);
      }

      return User.hashPassword(password);
    })
    .then(digest => {
      return User.create({
        username,
        password: digest,
        fullName
      });
    })
    .then(user => {
      return res.status(201).json(user);
    })
    .catch(next);
});


module.exports = router;