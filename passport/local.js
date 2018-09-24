const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

const localStrategy = new LocalStrategy((username, password, done) => {

  let user;

  User.find( { username })
    .then(_user => {
      user = _user;
      if(!user) return Promise.reject({

      });
      
      return user.validatePassword(password);
    })
    .then(isValid => {
      if(!isValid) return Promise.reject({

      });

      return done(null, user);
    })
    .catch(err => {
      
      done(err);
    });

});

module.exports = localStrategy;