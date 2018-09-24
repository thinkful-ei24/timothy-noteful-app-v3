const express = require('express');
const User = require('../models/user');

const router = express.Router();

router.post('/', (req, res, next) => {
  const { username, password, fullName } = req.body;

  const requireFields = ['username', 'password'];
  const missingField = requireFields.find(field => (!(field in req.body)));
  
  if(missingField) return res.status(422).res.json({
    reason: 'Validation Error',
    message: 'Missing field',
    location: missingField
  });

  const trimmedFields = requireFields;
  const nontrimmedField = trimmedFields.find(field => req.body[field] !== req.body[field]);
  if(nontrimmedField) return res.status(422).res.json({
    reason: 'LoginError',
    message: 'Cannot start or end with whitespace',
    location: nontrimmedField
  });

  User.find({ username })
    .countDocuments()
    .then(count => {
      if(count > 0) return Promise.reject(
        {
          reason: 'Validation Error',
          message: 'Username exists',
          location: 'username'
        }
      );

      return User.hashPassword(password);
    })
    .then(digest => {
      User.create({
        username,
        password: digest,
        fullName
      });
    })
    .then(user => {
      return res.status(201)
        .json(user);
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;