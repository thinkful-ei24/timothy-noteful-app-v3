/* global it, describe, before, beforeEach, after, afterEach */
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
const Tag = require('../models/tag');

const { folders, notes, users, tags } = require('../db/seed/notes');

function compareNotes(resNote, dbNote, tagsIsPopulated = false){
  expect(resNote.id).to.equal(dbNote.id);
  expect(resNote.title).to.equal(dbNote.title);
  expect(resNote.content).to.equal(dbNote.content);
  expect(new Date(resNote.createdAt)).to.deep.equal(dbNote.createdAt);
  expect(new Date(resNote.updatedAt)).to.deep.equal(dbNote.updatedAt);
  expect(ObjectId(resNote.folderId)).to.deep.equal(dbNote.folderId);
  compareTags(resNote.tags, dbNote.tags, tagsIsPopulated);
}

function compareNewNote(newNote, otherNote, otherNoteIsFromDb = true){
  const folderId = otherNoteIsFromDb ? ObjectId(newNote.folderId) : newNote.folderId;
  expect(newNote.title).to.equal(otherNote.title);
  expect(newNote.content).to.equal(otherNote.content);
  expect(folderId).to.deep.equal(otherNote.folderId);
  if(otherNoteIsFromDb) {
    compareTags(newNote.tags, otherNote.tags);
  } else {
    newNote.tags.forEach((newNoteTag, index) => {
      const otherNoteTag = otherNote.tags[index];
      expect(newNoteTag).to.equal(otherNoteTag);
    });
  }
}

function compareTags(resTags, dbTags, tagsIsPopulated = false){
  if(!tagsIsPopulated){
    resTags.forEach((resTag, index) => {
      const dbTag = dbTags[index];
      expect(ObjectId(resTag)).to.deep.equal(dbTag);
    });
  } else {
    resTags.forEach((resTag, index) => {
      const dbTag = dbTags[index];
      expect(resTag.id).to.deep.equal(dbTag.id);
      expect(resTag.name).to.equal(dbTag.name);
      expect(ObjectId(resTag.userId)).to.deep.equal(dbTag.userId);
      expect(new Date(resTag.createdAt)).to.deep.equal(dbTag.createdAt);
      expect(new Date(resTag.updatedAt)).to.deep.equal(dbTag.updatedAt);
    });
  }
}

const expect = chai.expect;
chai.use(chaiHttp);


describe('Noteful API', function(){
  let user;
  let userId;
  let token;

  before(function () {
    this.timeout(5000);
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser:true })
      .then(() => Promise.all([User.deleteMany(), Note.deleteMany(), Tag.deleteMany(), Folder.deleteMany()]));
  });

  beforeEach(function(){
    return Promise.all([
      User.insertMany(users),
      Note.insertMany(notes),
      Tag.insertMany(tags),
      Folder.insertMany(folders)
    ])
      .then(([users]) => {
        user = users[0];
        userId = user.id;
        token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
      });
  });

  afterEach(function () {
    return Promise.all([User.deleteMany(), Note.deleteMany(), Tag.deleteMany(), Folder.deleteMany()]);
  });

  after(function () {
    this.timeout(5000);
    return mongoose.disconnect();
  });
    
  describe('GET notes endpoint', function(){

    it('should return the correct number of notes', function(){

      const reqPromise =  chai.request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`);

      const dbPromise = Note.find({ userId }).countDocuments();

      return Promise.all([reqPromise, dbPromise])
        .then(([res, dbCount]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(dbCount);
        });
    });

    it('should return an array of objects with correct fields', function(){
      const fields = ['id', 'title', 'content', 'folderId', 'tags', 'createdAt', 'updatedAt'];
      
      return chai.request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          const notes = res.body;
          notes.forEach(note => {
            expect(note).to.include.keys(fields);
          });
        });
    });

    it('should return correct search results', function(){
      const searchTerm = 'about cats';
      const re = new RegExp(searchTerm, 'i');
      
      const filter = {
        $or: [
          {title: {$regex: re}},
          {content: {$regex: re}}
        ],
        userId
      };
      const queryPromise = Note.find(filter).sort({updatedAt: 1});
      const reqPromise = chai.request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .query({searchTerm: searchTerm});

      return Promise.all([reqPromise, queryPromise])
        .then(([res, dbNotes]) => {

          expect(res.body.length).to.equal(dbNotes.length);
          res.body.forEach((resNote, index) => {
            const dbNote = dbNotes[index];
            compareNotes(resNote, dbNote);
          });
        });
    });

    it('should return the correct results if folder id is valid', function(){
      
      return Folder.findOne({ userId })
        .then(folder => {
          const id = folder.id;
          const queryPromise = Note.find({ folderId: id, userId });
          const reqPromise = chai.request(app)
            .get('/api/notes')
            .query({folderId: id})
            .set('Authorization', `Bearer ${token}`);

          return Promise.all([reqPromise, queryPromise]);
        })
        .then(([res, dbNotes]) => {
          expect(res.body.length).to.equal(dbNotes.length);
          res.body.forEach((resNote, index) => {
            const dbNote = dbNotes[index];
            compareNotes(resNote, dbNote);
          });
        });

    });

    it('should return correct results if tag id is valid', function(){
      let validTagId;

      return Tag.findOne({ userId })
        .then(tag => {
          validTagId = tag.id;

          const reqPromise = chai.request(app)
            .get('/api/notes')
            .query({ tagId: validTagId})
            .set('Authorization', `Bearer ${token}`);

          const queryPromise = Note.find({ userId, tags: validTagId });

          return Promise.all([reqPromise, queryPromise]);
        })
        .then(([res, dbNotes]) => {
          const resNotes = res.body;
          expect(resNotes.length).to.be.at.least(1);
          expect(resNotes.length).to.equal(dbNotes.length);
          resNotes.forEach((resNote, index) => {
            const dbNote = dbNotes[index];
            compareNotes(resNote, dbNote);
          });
        });
    });

    it('should return an empty array for an incorrect search term', function(){
      const searchTerm = 'invalidsearchterm';

      return chai.request(app)
        .get('/api/notes')
        .query({searchTerm: searchTerm})
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(0);
        });
    });

  });

  describe('GET note by id endpoint', function(){

    it('should return the correct note', function(){
      const fields = ['id', 'title', 'content', 'folderId', 'tags'];
      let note;

      return Note.findOne({ userId })
        .populate('tags')
        .then(_note => {
          note = _note;
          const id = note.id;
          return chai.request(app)
            .get(`/api/notes/${id}`)
            .set('Authorization', `Bearer ${token}`);
        })    
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.include.keys(fields);
          compareNotes(res.body, note, true);
        });
          
    });

    it('should return 404 given an id that does not exist', function(){
      const nonexistentId = 'DOESNOTEXIST';

      return chai.request(app)
        .get(`/api/notes/${nonexistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 given an invalid id', function(){
      const invalidId = 'invalid';

      return chai.request(app)
        .get(`/api/notes/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

  });

  describe('POST note endpoint', function(){
    let tags;
    let folder;
    let folderId;

    this.beforeEach(function(){
      const tagPromise = Tag.find({ userId });
      const folderPromise = Folder.find({ userId });

      return Promise.all([tagPromise, folderPromise])
        .then(([_tags, folders]) => {
          tags = _tags.map(tag => tag.id);
          folderId = folders[0].id;
        });
    });

    it('should return the note when provided a valid note', function(){
      const fields = ['id', 'title', 'content', 'folderId', 'tags'];
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        folderId: folderId,
        tags: tags
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys(fields);
          compareNewNote(newNote, res.body, false);
        });
    });

    it('should insert new note into the collection', function(){
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        folderId,
        tags
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          const id = res.body.id;
          return Note.findOne({ _id: id, userId });
        })
        .then(dbNote => {
          compareNewNote(newNote, dbNote);
        });
    });

    it('should return 400 if a tag id is invalid', function(){
      const invalidNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        tags: ['DOESNOTEXIST']
      };

      return chai.request(app)
        .post('/api/notes')
        .send(invalidNote)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
        });

    });

    it('should return 400 if title isnt given', function(){
      const invalidNote = {
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(invalidNote)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
        });
    });

    it('should return 400 if folder id is invalid', function(){
      const invalidFolderId = 'invalid';
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        folderId: invalidFolderId
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .set('Authorization', `Bearer ${token}`)
        .then(res => { 
          expect(res).to.have.status(400);
        });
    });

    it('should return 400 if a tag does not belong to the user', function(){
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        folderId,
        tags
      };

      return Tag.findOne({ userId: { $ne: ObjectId(userId) }})
        .then(tag => {
          newNote.tags.push(tag.id);

          return chai.request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newNote);
        })
        .then(res => {
          expect(res).to.have.status(400);
        });

    });
    
    it('should return 400 if the folder does not belong to the user', function(){
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        tags
      };

      return Folder.findOne({ userId: { $ne: ObjectId(userId) }})
        .then(folder => {
          newNote.folderId = folder.id;

          return chai.request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newNote)
            .then(res => {
              expect(res).to.have.status(400);
            });

        });

    });

    it('should return 400 if tags is not an array', function(){
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        folderId,
        tags: 'NOTANARRAY'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
        });

    });

    it('should return 400 if tag id is invalid', function(){
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        folderId,
        tags: ['INVALIDID']
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
        });


    });

  });

  describe('PUT endpoint', function(){

    let tags;
    let folder;
    let folderId;

    this.beforeEach(function(){
      const tagPromise = Tag.find({ userId });
      const folderPromise = Folder.find({ userId });

      return Promise.all([tagPromise, folderPromise])
        .then(([_tags, folders]) => {
          tags = _tags.map(tag => tag.id);
          folder = folders[0];
          folderId = folder.id;
        });
    });

    it('should return 200 and provide the correct fields', function(){
      const fields = ['id', 'title', 'content', 'folderId', 'tags'];

      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        tags,
        folderId
      };

      return Note.findOne({ userId })
        .then(note => {
          const id = note.id;
          return chai.request(app)
            .put(`/api/notes/${id}`)
            .send(newNote)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.contain.keys(fields);
        });
    });

    it('should update the specified note in the collection', function(){
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        tags,
        folderId
      };
      let id;

      return Note.find({ userId })
        .then(notes => {
          id = notes[0].id;
          return chai.request(app)
            .put(`/api/notes/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(newNote);
        }) 
        .then(()=> {
          return Note.findOne( { _id: id, userId });
        })
        .then(dbNote => {
          compareNewNote(newNote, dbNote);
        });
    });      

    it('should return 404 for an id that does not exist', function(){
      const nonexistentId = 'DOESNOTEXIST';
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        tags: tags
      };

      return chai.request(app)
        .put(`/api/notes/${nonexistentId}`)
        .send(newNote)
        .set('Authorization', `Bearer ${token}`) 
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 if note id is invalid', function(){
      const invalidId = 'invalid';
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .put(`/api/notes/${invalidId}`)
        .send(newNote)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should return 400 if folderId is invalid', function(){
      const invalidFolderId = 'invalid';
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        folderId: invalidFolderId
      };

      let id;

      return Note.findOne({ userId })
        .then(note => {
          id = note.id;
          return chai.request(app)
            .put(`/api/notes/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(newNote);
        })   
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should return 400 if the title is missing', function(){
      const invalidNote = {
        title: '',
        content: 'Not like the brazen giant of Greek fame...'
      };
      let id;

      return Note.findOne({ userId })
        .then(note => {
          id = note.id;
          return chai.request(app)
            .put(`/api/notes/${id}`)
            .send(invalidNote)
            .set('Authorization', `Bearer ${token}`);
        })   
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.include.key('message');
        });
    });

    it('should return 400 if a tag does not belong to the user', function(){
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        folderId,
        tags
      };

      return Tag.findOne({ userId: { $ne: ObjectId(userId)}})
        .then(tag => {
          newNote.tags.push(tag.id);
          return Note.findOne({ userId });
        })
        .then(note => {
          const noteId = note.id;
          return chai.request(app)
            .put(`/api/notes/${noteId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(newNote);
        })
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should return 400 if folder does not belong to the user', function(){
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...',
        tags
      };

      return Folder.findOne({ userId: { $ne: ObjectId(userId)}})
        .then(folder => {
          newNote.folderId = folder.id;
          return Note.findOne({ userId });
        })
        .then(note => {
          const noteId = note.id;
          return chai.request(app)
            .put(`/api/notes/${noteId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(newNote);
        })
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

  });

  describe('DELETE note endpoint', function(){
    
    it('should delete the note from the collection', function(){
      let id; 
      return Note.findOne({ userId })
        .then(note => {
          id = note.id;
          return chai.request(app)
            .delete(`/api/notes/${id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(()=> {
          return Note.findById(id);
        })
        .then(note => {
          expect(note).to.be.null;
        });
    });
    
    it('should return 404 if id doesnt exist', function(){
      const nonexistentId = 'DOESNOTEXIST';

      return chai.request(app)
        .delete(`/api/notes/${nonexistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .then (res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 if id is invalid', function(){
      const invalidId = 'invalid';

      return chai.request(app)
        .delete(`/api/notes/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .then (res => {
          expect(res).to.have.status(400);
        });
    });
  });


});