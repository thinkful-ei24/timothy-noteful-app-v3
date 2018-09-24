const express = require('express');
const passport = require('passport');
const localStrategy = require('../passport/local');

const router = express.Router();

const options = { session: false, failWithError: true };
const localAuth = passport.authenticate('local', options);

router.post('/login', localAuth, (req, res, next) => {
  res.json(req.user);
});

module.exports = router;