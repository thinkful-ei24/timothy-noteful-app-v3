'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const User = require('../models/user');
const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag')
const { folders, notes, tags, users } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe.only('Tags API', function(){
  let user;
  let userId;
  let token;

  before(function () {
    this.timeout(5000);
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser:true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function(){
    this.timeout(5000);
    return Promise.all([
      User.insertMany(users),
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      Folder.createIndexes(),
      Tag.createIndexes()
    ])
      .then(([ users ]) => {
        user = users[0];
        userId = user.id;
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
      });
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET tags endpoint', function(){

    it('should return the correct number of tags', function(){

      const queryPromise = Tag.find({ userId });
      const reqPromise = chai.request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([reqPromise, queryPromise])
        .then(([res, tags]) => {
          expect(res.body.length).to.equal(tags.length);
          tags.forEach((dbTag, index) => {
            expect(dbTag.name).to.equal(res.body[index]['name']);
          });
        });
    });

    it('should return the correct fields', function(){

      return chai.request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          res.body.forEach(tag => {
            expect(tag).to.include.keys('id', 'name');
          });
        });
    });
  });

  describe('GET tag by Id endpoint', function(){
    
    it('should return correct tag', function(){

      let tag;
    
      return Tag.findOne({ userId })
        .then(_tag => {
          tag = _tag;
          const id = tag.id;
          return chai.request(app)
            .get(`/api/tags/${id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal(tag.name);
          expect(res.body.userId).to.equal(userId);
        });
    });

    it('should return 404 if id is non-existent', function(){
      const nonexistentId = 'DOESNOTEXIST';

      return chai.request(app)
        .get(`/api/tags/${nonexistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {  
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 if id is invalid', function(){
      const invalidId = 'invalid';

      return chai.request(app)
        .get(`/api/tags/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {  
          expect(res).to.have.status(400);
        });

    });
  });

  describe('POST tag endpoint', function(){

    it('should insert a new tag into the collection', function(){
      const newTag = {
        name: 'newtag'
      };
      let res;

      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .set('Authorization', `Bearer ${token}`)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          const id = res.body.id; 
          return Tag.findOne({ _id: id, userId });
        })
        .then(tag => {
          expect(res.body.name).to.equal(tag.name);
          expect(res.body.userId).to.equal(userId);
        });
    });

    it('should return 400 if request is missing a name', function(){
      const invalidTag = {
        name: ' '
      };

      return chai.request(app)
        .post('/api/tags')
        .send(invalidTag)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should return 400 if name already exists', function(){

      return Tag.findOne({ userId })
        .then(tag => {
          const name = tag.name;
          const invalidTag = {
            name: name
          };
          
          return chai.request(app)
            .post('/api/tags')
            .set('Authorization', `Bearer ${token}`)
            .send(invalidTag);
        })
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('PUT tag endpoint', function(){

    const updatedTag = {
      name: 'newname'
    };

    it('should update the tag in collection', function(){
      let id;

      return Tag.findOne({ userId })
        .then(tag => {
          id = tag.id;

          return chai.request(app)
            .put(`/api/tags/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedTag);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal(updatedTag.name);
          expect(res.body.userId).to.equal(userId);
          return Tag.findOne( { _id: id, userId });
        })
        .then(dbTag => {
          expect(dbTag.name).to.equal(updatedTag.name);
        });
    });

    it('should return 404 if id is non-existent', function(){
      const nonexistentId = 'DOESNOTEXIST';

      return chai.request(app)
        .put(`/api/tags/${nonexistentId}`)
        .send(updatedTag)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 if id is invalid', function(){
      const invalidId = 'invalid';

      return chai.request(app)
        .put(`/api/tags/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedTag)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should return 400 is name is missing', function(){
      const invalidTag = {
        name: ' '
      };

      return Tag.findOne({ userId })
        .then(tag => {
          const id = tag.id;
          return chai.request(app)
            .put(`/api/tags/${id}`)
            .send(invalidTag)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(400);
        });

    });
  });

  describe('DELETE tag endpoint', function(){

    beforeEach(function(){

    });

    it('should remove tag from collection and pull tag from notes', function(){
      let id;

      return Tag.findOne({ userId })
        .then(tag => {
          id = tag.id;

          return chai.request(app)
            .delete(`/api/tags/${id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          const notesPromise = Note.find({tags: id, userId });
          const tagsPromise = Tag.findOne({ _id: id, userId });
          return Promise.all([notesPromise, tagsPromise]);
        })
        .then(([notes, tag]) =>{
          expect(notes.length).to.equal(0);
          expect(tag).to.be.null;
        });

    });

    
    it('should return 400 if id is invalid', function(){
      const invalidId = 'invalid';

      return chai.request(app)
        .delete(`/api/tags/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

  });

});