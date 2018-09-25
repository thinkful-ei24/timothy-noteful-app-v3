const bcrypt = require('bcryptjs');
const passwords = ['baseball', 'password', 'whatever', 'secret22'];

passwords.forEach(password => {
  bcrypt.hash(password, 10)
    .then(digest => {

      console.log('digest:', digest);
      return bcrypt.compare(password, digest);
    })
    .then(isValid => {
      console.log('isValid is', isValid);
    })
    .catch(err => console.log(err));
});