'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const { folders, notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Folders API', function(){
  before(function () {
    this.timeout(4000);

    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser:true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function(){
    this.timeout(5000);
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Folder.createIndexes()
    ]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('GET folder endpoint', function(){

    it('should return the correct number of folders', function(){

      const queryPromise = Folder.find({}).countDocuments();
      const reqPromise = chai.request(app).get('/api/folders');

      return Promise.all([queryPromise, reqPromise])
        .then(([queryCount, res])=> {
          expect(res.body.length).to.equal(queryCount);
        });
    });

    it('should return an array of folder objects with id and name fields', function(){

      return chai.request(app)
        .get('/api/folders')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          res.body.forEach(folder => {
            expect(folder).to.include.keys('id', 'name');
          });
        });
    });
  });

  describe('GET folder by Id endpoint', function(){

    it('should return 200 given a valid id', function(){

      return Folder.findOne({})
        .then(folder => {
          const id = folder.id;
          return chai.request(app)
            .get(`/api/folders/${id}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.include.keys('id', 'name');
        });
    });

    it('should return correct folder given a valid id', function(){
      let folder;
      return Folder.findOne({})
        .then(_folder => {
          folder = _folder;
          const id = folder.id;
          return chai.request(app)
            .get(`/api/folders/${id}`);
        })
        .then(res => {
          expect(res.body.name).to.equal(folder.name);
          expect(res.body.id).to.equal(folder.id);  
        });
    });

    it('should return 404 given a non-existent id', function(){
      const nonexistentId = 'DOESNOTEXIST';

      return chai.request(app)
        .get(`/api/folders/${nonexistentId}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 given an invalid id string', function(){
      const invalidId = 'invalidid';
      return chai.request(app)
        .get(`/api/folders/${invalidId}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('POST folder endpoint', function(){

    it('should return the new folder when provided a valid folder', function(){
      const validFolder = {
        name: 'Projects'
      };

      return chai.request(app)
        .post('/api/folders')
        .send(validFolder)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.include.keys('id', 'name');
          expect(res.body.name).to.equal(validFolder.name);
        });
    });

    it('should insert the new folder into the folders collection', function(){
      const validFolder = {
        name: 'Projects'
      };

      return chai.request(app)
        .post('/api/folders')
        .send(validFolder)
        .then(res => {
          const id = res.body.id;
          return Folder.findById(id);
        })
        .then(folder => {
          expect(folder.name).to.equal(validFolder.name);
        });
    });
    
    it('should return 400 when the request doesnt provide a name', function(){
      const invalidFolder = {};

      return chai.request(app)
        .post('/api/folders')
        .send(invalidFolder)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
  });

  describe('PUT folder endpoint', function(){
    
    it('should return 200 and update the specified note in the collection', function(){
      const newFolder = {
        name: 'New Folder'
      };
      let id;
      return Folder.findOne({})
        .then(folder => {
          id = folder.id;

          return chai.request(app)
            .put(`/api/folders/${id}`)
            .send(newFolder);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.include.keys('id', 'name');
          return Folder.findById(id);
        })
        .then(folder => {
          expect(folder.name).to.be.equal(newFolder.name);
        });
        
    });

    it('should return 404 given a nonexistent id', function(){
      const newFolder = {
        name: 'New Folder'
      };

      const nonexistentId = 'DOESNOTEXIST';

      return chai.request(app)
        .put(`/api/folders/${nonexistentId}`)
        .send(newFolder)
        .then(res => {
          expect(res).to.have.status(404);
        });

    });

    it('should return 400 given an invalid id string', function(){
      const newFolder = {
        name: 'New Folder'
      };
      const invalidId = 'invalidid';
      return chai.request(app)
        .put(`/api/folders/${invalidId}`)
        .send(newFolder)
        .then(res => {
          expect(res).to.have.status(400);
        });

    });

  });

  describe('DELETE folder endpoint', function(){

    it('should return 204 and delete the specified note from the collection', function(){
      let id;

      return Folder.findOne({})
        .then(folder => {
          id = folder.id;
          
          return chai.request(app)
            .delete(`/api/folders/${id}`);
        })
        .then((res) => {
          expect(res).to.have.status(204);

          return Folder.findById(id);
        })
        .then(folder => {
          expect(folder).to.be.null;
        });
    });

    it('should set folder id fields in associated notes to null', function(){
      let id;
  
      return Folder.findOne({})
        .then(folder => {
          id = folder.id;

          return chai.request(app)
            .delete(`/api/folders/${id}`);
        })
        .then(res => {
          return Note.find({folderId: id})
        })
        .then(notes => {
          expect(notes.length).to.equal(0);
        });
  
    });

  });

});