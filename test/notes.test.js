'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API', function(){
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
    
  beforeEach(function () {
    return Note.insertMany(notes);
  });
    
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    return mongoose.disconnect();
  });
    
  describe('GET notes endpoint', function(){

    it('should return the correct number of notes', function(){

      const reqPromise =  chai.request(app).get('/api/notes');
      const queryPromise = Note.find({}).count();

      return Promise.all([reqPromise, queryPromise])
        .then(([res, dbCount]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(dbCount);
        });
    });

    it('should return an array of objects with fields id, title and content', function(){
      
      return chai.request(app)
        .get('/api/notes')
        .then(res => {
          const notes = res.body;
          notes.forEach(note => {
            expect(note).to.include.keys('id', 'title', 'content');
          });
        });
    });

    it('should return correct search results for valid query', function(){
      const fields = ['id', 'title', 'content'];
      const searchTerm = 'lady gaga';
      let resNote;

      return chai.request(app)
        .get('/api/notes')
        .query({searchTerm: searchTerm})
        .then(res => {
          resNote = res.body[0];
          return Note.findById(resNote.id);
        })
        .then(dbNote => {
          fields.forEach(key => {
            expect(resNote[key]).to.equal(dbNote[key]);
          });
        });
    });

    it('should return an empty array for an incorrect search term', function(){
      const searchTerm = 'invalidsearchterm';

      return chai.request(app)
        .get('/api/notes')
        .query({searchTerm: searchTerm})
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.length(0);
        });
    });

  });

  describe('GET note by id endpoint', function(){

    it('should return 200 and an object with fields id, title & content given a valid id', function(){

      return Note.find({})
        .then(notes => {
          const id = notes[0].id;
          return chai.request(app)
            .get(`/api/notes/${id}`);
        }) 
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');
        });
    });

    it('should return the correct note given a valid id', function(){
      const fields = ['id', 'title', 'content'];
      let id;
      let res;
      return Note.find({})
        .then(notes => {
          id = notes[0].id;
          return chai.request(app).get(`/api/notes/${id}`);
        })    
        .then(_res => {
          res = _res;
          return Note.findById(id);
        })  
        .then(note => {
          fields.forEach(key => {
            expect(note[key]).to.equal(res.body[key]);
          });
        });
    });

    it('should respond with 404 given an id that does not exist', function(){
      const nonexistentId = 'DOESNOTEXIST';

      return chai.request(app)
        .get(`/api/notes/${nonexistentId}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should respond with 400 given an invalid id', function(){
      const invalidId = 'invalid';

      return chai.request(app)
        .get(`/api/notes/${invalidId}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

  });

  describe('POST note endpoint', function(){

    it('should return the note in the response when provided a valid note', function(){
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');
          Object.keys(newNote).forEach(key => {
            expect(res.body[key]).to.equal(newNote[key]);
          });
        });
    });

    it('should insert a new note into the notes collection when provided a valid note', function(){
      const newNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then(res => {
          const id = res.body.id;
          return Note.findById(id);
        })
        .then(note => {
          Object.keys(newNote).forEach(key => {
            expect(note[key]).to.equal(newNote[key]);
          });
        });
    });

    it('should return an error when the request doesnt provide a title field', function(){
      const invalidNote = {
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(invalidNote)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.contain.key('message');
        });
    });

  });

  describe('PUT endpoint', function(){

    it('should respond with 200 and the correct fields when request is valid', function(){

      const updatedNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return Note.find({})
        .then(notes => {
          const id = notes[0].id;
          return chai.request(app)
            .put(`/api/notes/${id}`)
            .send(updatedNote);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.contain.keys('id', 'title', 'content');
          Object.keys(updatedNote).forEach(key => {
            expect(res.body[key]).to.equal(updatedNote[key]);
          });
        });
    });


    it('should update the specified note in the collection when provided a valid request', function(){
      const updatedNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };
      let id;

      return Note.find({})
        .then(notes => {
          id = notes[0].id;
          return chai.request(app)
            .put(`/api/notes/${id}`)
            .send(updatedNote);
        }) 
        .then(()=> {
          return Note.findById(id);
        })
        .then(note => {
          Object.keys(updatedNote).forEach(key => {
            expect(note[key]).to.equal(updatedNote[key]);
          });
        });
    });      

    it('should respond with 404 for an id that does not exist', function(){
      const nonexistentId = 'DOESNOTEXIST';
      const updatedNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .put(`/api/notes/${nonexistentId}`)
        .send(updatedNote) 
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should respond with 400 when provided an invalid id string', function(){
      const invalidId = 'invalid';
      const updatedNote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .put(`/api/notes/${invalidId}`)
        .send(updatedNote)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should respond with an error message when missing a title field', function(){
      const invalidNote = {
        title: '',
        content: 'Not like the brazen giant of Greek fame...'
      };
      let id;

      return Note.find({})
        .then(notes => {
          id = notes[0].id;
          return chai.request(app)
            .put(`/api/notes/${id}`)
            .send(invalidNote);
        })   
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.include.keys('message');
        });
    });
  });

  describe('DELETE note endpoint', function(){
    
    it('should return 204 and delete the specified note from the collection', function(){
      let id; 
      return Note.find({})
        .then(notes => {
          id = notes[0].id;
          return chai.request(app)
            .delete(`/api/notes/${id}`);
        })
        .then(()=> {
          return Note.findById(id);
        })
        .then(note => {
          expect(note).to.be.null;
        });
    });

  });


});