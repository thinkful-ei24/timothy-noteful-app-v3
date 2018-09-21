'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag')
const { folders, notes, tags } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Tags API', function(){
  before(function () {
    this.timeout(5000);

    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser:true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function(){
    this.timeout(5000);
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      Folder.createIndexes(),
      Tag.createIndexes()
    ]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET tags endpoint', function(){

    it('should return the correct number of tags', function(){

      const queryPromise = Tag.find();
      const reqPromise = chai.request(app).get('/api/tags');

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
    
      return Tag.findOne()
        .then(_tag => {
          tag = _tag;
          const id = tag.id;
          return chai.request(app)
            .get(`/api/tags/${id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal(tag.name);
        });
    });

    it('should return 404 if id is non-existent', function(){
      const nonexistentId = 'DOESNOTEXIST';

      return chai.request(app)
        .get(`/api/tags/${nonexistentId}`)
        .then(res => {  
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 if id is invalid', function(){
      const invalidId = 'invalid';

      return chai.request(app)
        .get(`/api/tags/${invalidId}`)
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
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          const id = res.body.id; 
          return Tag.findById(id);
        })
        .then(tag => {
          expect(res.body.name).to.equal(tag.name);
        });
    });

    it('should return 400 if request is missing a name', function(){
      const invalidTag = {
        name: ' '
      };

      return chai.request(app)
        .post('/api/tags')
        .send(invalidTag)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should return 400 if name already exists', function(){

      return Tag.findOne()
        .then(tag => {
          const name = tag.name;
          const invalidTag = {
            name: name
          };
          
          return chai.request(app)
            .post('/api/tags')
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

      return Tag.findOne()
        .then(tag => {
          id = tag.id;

          return chai.request(app)
            .put(`/api/tags/${id}`)
            .send(updatedTag);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal(updatedTag.name);
          return Tag.findById(id);
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
        .then(res => {
          expect(res).to.have.status(404);
        })
    });

    it('should return 400 if id is invalid', function(){
      const invalidId = 'invalid';

      return chai.request(app)
        .put(`/api/tags/${invalidId}`)
        .send(updatedTag)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should return 400 is name is missing', function(){
      const invalidTag = {
        name: ' '
      };

      return Tag.findOne()
        .then(tag => {
          const id = tag.id;
          return chai.request(app)
            .put(`/api/tags/${id}`)
            .send(invalidTag);
        })
        .then(res => {
          expect(res).to.have.status(400);
        });

    });
  });

  describe('DELETE tag endpoint', function(){

    beforeEach(function(){


    });

    it('should remove tag from collection', function(){


    });

  });

});