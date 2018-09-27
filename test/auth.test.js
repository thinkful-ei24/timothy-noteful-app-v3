const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const mongoose = require('mongoose');

chai.use(chaiHttp);
const app = require('../server');

const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { users } = require('../db/seed/notes');

describe('Auth Endpoints', function(){

  before(function(){
    this.timeout(5000);
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => User.deleteMany());
  });
  
  beforeEach(function(){
    this.timeout(5000);
  });

  afterEach(function(){
    return User.deleteMany();
  });

  after(function(){
    return mongoose.disconnect();
  });

  describe('LOGIN endpoint', function(){

    it('should return 200 status and a valid jwt', function(){

      const newUser = {
        username: 'lysander',
        password: 'notreason',
        fullname: 'Lysander Spooner'
      };

      const loginInfo = {
        username: newUser.username,
        password: newUser.password
      };

      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(201);

          return chai.request(app)
            .post('/api/login')
            .send(loginInfo);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.contain.keys('authToken');
          const authToken = res.body.authToken;
          return new Promise(resolve => {
            jwt.verify(authToken, JWT_SECRET, err => {
              if(err) {
                return resolve(false);
              } 
              resolve(true);
            });
          });
        })
        .then(jwtIsValid => {
          expect(jwtIsValid).to.to.be.true;
        });
    });

    it('should return 401 if password is invalid', function(){
      const newUser = {
        username: 'lysander',
        password: 'notreason',
        fullname: 'Lysander Spooner'
      };
      const invalidLoginInfo = {
        username: newUser.username,
        password: 'invalidpassword'
      };

      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(201);

          return chai.request(app)
            .post('/api/login')
            .send(invalidLoginInfo);
        })
        .then(res => {
          expect(res).to.have.status(401);
        });


    });

    it('should return 401 if username is not valid', function(){
      const invalidInfo = {
        username: 'invalidusername',
        password: 'password'
      };

      return chai.request(app)
        .post('/api/login')
        .send(invalidInfo)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });  
  });

  describe('REFRESH endpoint', function(){

    beforeEach(function(){
      return User.insertMany(users);
    });

    it('should return a valid jwt', function(){
  
      return User.findOne()
        .then(user => {
          expect(user).to.be.be.an('object');
          const token = jwt.sign( { user }, JWT_SECRET, { subject: user.username });

          return chai.request(app)
            .post('/api/refresh')
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.key('authToken');
          
          const authToken = res.body.authToken;

          return new Promise((resolve) => {
            jwt.verify(authToken, JWT_SECRET, (err) => {
              if(err){
                return resolve(false);
              }
              return resolve(true);
            });
          });
        })
        .then(jwtIsValid => {
          expect(jwtIsValid).to.be.true;
        });
    });

    it('should return 401 if request jwt is invalid', function(){
      const token = 'INVALIDTOKEN';

      return chai.request(app)
        .post('/api/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

  });

});
