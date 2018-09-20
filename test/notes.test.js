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

describe('Noteful API', function(){
    before(function () {
        return mongoose.connect(TEST_MONGODB_URI)
          .then(() => mongoose.connection.db.dropDatabase());
      });
    
      beforeEach(function(){
        return Promise.all([
          Note.insertMany(notes),
          Folder.insertMany(folders),
          Folder.createIndexes(),
        ]);
      });
    
      afterEach(function () {
        return mongoose.connection.db.dropDatabase();
      });
    
      after(function () {
        return mongoose.disconnect();
      });
    
  describe('GET notes endpoint', function(){

    it('should return the correct number of notes', function(){

      const reqpromise =  chai.request(app).get('/api/notes');
      const dbpromise = Note.find().count();

      return Promise.all([reqpromise, dbpromise])
        .then(([res, dbCount]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(dbCount);
        });
    });

    it('it should return an array of objects with fields id, title and content', function(){
      
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
      const fields = ['id', 'title', 'content']
      const searchTerm = 'about cats';
      let resnote;
      
      return chai.request(app)
        .get('/api/notes')
        .query({searchTerm: searchTerm})
        .then(res => {
          resnote = res.body[0];
          return Note.findById(resnote.id)
        })
        .then(dbnote => {
          fields.forEach(key => {
            expect(resnote[key]).to.equal(dbnote[key]);
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

    it('should return a 200 status given a valid id', function(){


      return Note.find({})
        .then(notes => {
          const id = notes[0].id;
          return chai.request(app)
          .get(`/api/notes/${id}`)
        }) 
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
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
          return Note.findById(id)
        })  
        .then(note => {
          fields.forEach(key => {
            expect(note[key]).to.equal(res.body[key]);
          });
        });
    });

    it('should response with a 404 given an id that does not exist', function(){
      const invalidid = 'DOESNOTEXIST';

      return chai.request(app)
        .get(`/api/notes/${invalidid}`)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should response with a 400 given an invalid id', function(){
      const invalidid = 'invalid';

      return chai.request(app)
        .get(`/api/notes/${invalidid}`)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

  });

  describe('POST note endpoint', function(){

    it('should return the note in the response when provided a valid note', function(){
      const newnote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newnote)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');
          Object.keys(newnote).forEach(key => {
            expect(res.body[key]).to.equal(newnote[key]);
          })
        });
    });

    it('should create a new note in the notes collection when provided a valid note', function(){
      const newnote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newnote)
        .then(res => {
          const id = res.body.id;
          return Note.findById(id)
        })
        .then(note => {
          Object.keys(newnote).forEach(key => {
            expect(note[key]).to.equal(newnote[key]);
          });
        })
    });

    it('should return an error when the request doesnt provide a title field', function(){
      const invalidnote = {
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(invalidnote)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.contain.key('message');
        });
    });

  });

  describe('PUT endpoint', function(){

    it('should should respond with a success status and provide the correct fields when provided a valid put request', function(){

      const newnote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return Note.find({})
        .then(notes => {
          const id = notes[0].id;
          return chai.request(app)
            .put(`/api/notes/${id}`)
            .send(newnote)
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.contain.keys('id', 'title', 'content');
        });
    });


    it('should update the specified note in the collection when provided a valid request', function(){
      const newnote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };
      let id;

      return Note.find({})
        .then(notes => {
          id = notes[0].id;
          return chai.request(app)
            .put(`/api/notes/${id}`)
            .send(newnote)
        }) 
        .then(()=> {
          return Note.findById(id);
        })
        .then(note => {
          Object.keys(newnote).forEach(key => {
            expect(note[key]).to.equal(newnote[key]);
          });
        });
    });      

    it('should response with a 404 for an id that does not exist', function(){
      const badId = 'DOESNOTEXIST';
      const newnote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .put(`/api/notes/${badId}`)
        .send(newnote) 
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should response with a 400 when provided an invalid id string', function(){
      const invalidid = 'invalid';
      const newnote = {
        title: 'The New Colossus',
        content: 'Not like the brazen giant of Greek fame...'
      };

      return chai.request(app)
        .put(`/api/notes/${invalidid}`)
        .send(newnote)
        .then(res => {
          expect(res).to.have.status(400);
        });
    });

    it('should response with an error message when missing a title field', function(){
      const invalidnote = {
        title: '',
        content: 'Not like the brazen giant of Greek fame...'
      };
      let id;

      return Note.find({})
        .then(notes => {
          id = notes[0].id;
          return chai.request(app)
            .put(`/api/notes/${id}`)
            .send(invalidnote)
        })   
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.include.keys('message');
        });
    });
  });

  describe('DELETE note endpoint', function(){
    
    it('should respond with a 204 status and delete the specified note from the collection', function(){
      let id; 
      return Note.find({})
      .then(notes => {
        id = notes[0].id;
        return chai.request(app)
          .delete(`/api/notes/${id}`)
      })
      .then(()=> {
        return Note.findById(id)
      })
      .then(note => {
        expect(note).to.be.null;
      });
    });

  });


});