'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const User = require('../models/user');
const Note = require('../models/note');
const Folder = require('../models/folder');
const { folders, notes, users } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Folders API', function(){
  let token;
  let user;
  let userId;

  before(function () {
    this.timeout(10000);

    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser:true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function(){
    this.timeout(5000);
    return Promise.all([
      User.insertMany(users),
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Folder.createIndexes()
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

  describe('GET folder endpoint', function(){

    it('should return the correct number of folders', function(){

      const queryPromise = Folder.find({ userId })
        .countDocuments();

      const reqPromise = chai.request(app)
        .get('/api/folders')
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([queryPromise, reqPromise])
        .then(([queryCount, res])=> {
          expect(res.body.length).to.equal(queryCount);
        });
    });

    it('should return an array of folders with correct fields', function(){

      return chai.request(app)
        .get('/api/folders')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          res.body.forEach(folder => {
            expect(folder).to.include.keys('id', 'name', 'userId');
          });
        });
    });
  });

  describe('GET folder by Id endpoint', function(){

    it('should return correct folder', function(){
      let folder;
      return Folder.findOne({ userId })
        .then(_folder => {
          folder = _folder;
          const id = folder.id;
          return chai.request(app)
            .get(`/api/folders/${id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.include.keys('id', 'name');
          expect(res.body.name).to.equal(folder.name);
          expect(res.body.id).to.equal(folder.id);  
          expect(ObjectId(res.body.userId)).to.deep.equal(folder.userId);
        });
    });

    it('should return 404 if id is non-existent', function(){
      const nonexistentId = 'DOESNOTEXIST';

      return chai.request(app)
        .get(`/api/folders/${nonexistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 if the id is invalid', function(){
      const invalidId = 'invalidid';
      return chai.request(app)
        .get(`/api/folders/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.include.keys('id', 'name', 'userId');
          expect(res.body.name).to.equal(validFolder.name);
          expect(res.body.userId).to.equal(userId);
        });
    });

    it('should insert the folder into the collection', function(){
      const validFolder = {
        name: 'Projects'
      };

      return chai.request(app)
        .post('/api/folders')
        .send(validFolder)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          const id = res.body.id;
          return Folder.findOne({ _id: id, userId });
        })
        .then(folder => {
          expect(folder.name).to.equal(validFolder.name);
          expect(folder.userId).to.deep.equal(ObjectId(userId));
        });
    });
    
    it('should return 400 if name field is missing', function(){
      const invalidFolder = {};

      return chai.request(app)
        .post('/api/folders')
        .send(invalidFolder)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should return 400 if folder name already exists', function(){
      
      return Folder.findOne({ userId })
        .then(folder => {
          const newFolder = { name: folder.name };
          
          return chai.request(app)
            .post('/api/folders')
            .set('Authorization', `Bearer ${token}`)
            .send(newFolder);
        })
        .then(res => {
          expect(res).to.have.status(400);
        });

    });
  });

  describe('PUT folder endpoint', function(){
    
    it('should update the note in the collection', function(){
      const newFolder = {
        name: 'New Folder'
      };
      let id;
      return Folder.findOne({ userId })
        .then(folder => {
          id = folder.id;

          return chai.request(app)
            .put(`/api/folders/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(newFolder);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.include.keys('id', 'name');
          return Folder.findOne({ _id: id, userId });
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
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
        });

    });

  });

  describe('DELETE folder endpoint', function(){

    it('should delete the note from the collection', function(){
      let id;

      return Folder.findOne({ userId })
        .then(folder => {
          id = folder.id;
          
          return chai.request(app)
            .delete(`/api/folders/${id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          expect(res).to.have.status(204);

          return Folder.findOne({ _id: id, userId });
        })
        .then(folder => {
          expect(folder).to.be.null;
        });
    });

    it('should set folder id fields in notes to null', function(){
      let id;
  
      return Folder.findOne({ userId })
        .then(folder => {
          id = folder.id;

          return chai.request(app)
            .delete(`/api/folders/${id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          return Note.find({_id: id, userId });
        })
        .then(notes => {
          expect(notes.length).to.equal(0);
        });
  
    });

    it('should return 404 for nonexistent id', function(){

      return Folder.findOne({ userId: { $ne: ObjectId(userId) }})
        .then(folder => {
          const folderId = folder.id;
          return chai.request(app)
            .delete(`/api/folders/${folderId}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(404);
        });

    });

  });

});