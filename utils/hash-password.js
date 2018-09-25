const bcrypt = require('bcryptjs');
const password = 'baseball';

bcrypt.hash(password, 10)
  .then(digest => {

    console.log('digest:', digest);
    return bcrypt.compare(password, digest);
  })
  .then(isValid => {
    console.log('isValid is', isValid);
  })
  .catch(err => console.log(err));