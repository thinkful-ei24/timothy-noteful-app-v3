// 'use strict';

// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const mongoose = require('mongoose');
// const ObjectId = mongoose.Types.ObjectId;
// const app = require('../server');
// const { TEST_MONGODB_URI } = require('../config');

// const Tag = require('../models/tag');
// const Note = require('../models/note');
// const Folder = require('../models/folder');

// const { folders, notes, tags } = require('../db/seed/notes');



// const convertRes = function(res){
//   const { id, title, content, folderId, createdAt, updatedAt, tags } = res;
//   return {
//     id: id,
//     title: title,
//     content: content,
//     folderId: ObjectId(folderId),
//     createdAt: new Date(createdAt),
//     updatedAt: new Date(updatedAt),
//     tags: tags.map(tag => ObjectId(tag))
//   };
// };

// const compareResAndNote = function(resNote, dbNote){
//   resNote = convertRes(resNote);
//   Object.keys(resNote).forEach(key => {
//       expect(resNote[key]).to.deep.equal(dbNote[key]);
//   });
// };

// const expect = chai.expect;
// chai.use(chaiHttp);

// describe('Notes API', function(){
//   before(function () {

//     this.timeout(10000);
//     return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser:true })
//       .then(() => mongoose.connection.db.dropDatabase());
//   });

//   beforeEach(function(){
//     this.timeout(4000);
//     return Promise.all([
//       Note.insertMany(notes),
//       Folder.insertMany(folders),
//       Tag.insertMany(tags),
//       Folder.createIndexes(),
//       Tag.createIndexes()
//     ]);
//   });
//   //     return Promise.all([
//     //       Note.insertMany(notes),
//     //       Folder.insertMany(folders),
//     //       Tag.insertMany(tags),
//     //       Folder.createIndexes(),
//     //       Tag.createIndexes()
//     //     ]);
//   afterEach(function () {
//     return mongoose.connection.db.dropDatabase();
//   });

//   after(function () {
//     return mongoose.disconnect();
//   });
  
//   describe('GET Notes endpoint', function(){

//     it('should return the correct notes', function(){
//       const queryPromise = Note.find();
//       const reqPromise = chai.request(app).get('/api/notes');

//       return Promise.all([reqPromise, queryPromise])
//         .then(([res, dbNotes]) => {
//           const resNotes = res.body;
//           expect(res).to.have.status(200);
//           expect(resNotes).to.have.length(dbNotes.length);
//           resNotes.forEach((resNote, index) => {
//             const dbNote = dbNotes[index];
//             compareResAndNote(resNote, dbNote);
//           });
//         });
//     });

//     it('should return the correct search results', function(){
//       const searchTerm = 'about cats';
//       const re = new RegExp(searchTerm, 'i');
//       const filter = {
//         $or: [
//           { title : { $regex: re } },
//           { content: { $regex: re } }
//         ]
//       };

//       const queryPromise = Note.find(filter);
//       const reqPromise = chai.request(app).get('/api/notes').query({ searchTerm });

//       return Promise.all([reqPromise, queryPromise])
//         .then(([res, dbNotes]) => {
//           const resNotes = res.body;
//           expect(res).to.have.status(200);
//           expect(resNotes).to.have.length(dbNotes.length);
//           resNotes.forEach((resNote, index) => {
//             const dbNote = dbNotes[index];
//             compareResAndNote(resNote, dbNote);
//           });
//         });
//     });

//     it('should filter by tag id', function(){

//       return Tag.findOne()
//         .then(tag => {
//           const tagId = tag.id;
          
//           const dbPromise = Note.find({tags: tagId});
//           const apiPromise = chai.request(app).get('/api/notes/').query({ tagId });

//           return Promise.all([apiPromise, dbPromise])
//             .then(([res, dbNotes]) => {
//               const resNotes = res.body;
//               resNotes.forEach((resNote, index) => {
//                 resNote = convertRes(resNote);
//                 const dbNote = dbNotes[index];
//                 compareResAndNote(resNote, dbNote);
//               });
//             });

//         });
//     });

//     it('should filter by folder id', function(){

//       return Folder.findOne()
//         .then(folder => {
//           const folderId = folder.id;

//           const dbPromise = Note.find({folderId});
//           const apiPromise = chai.request(app).get('/api/notes').query({ folderId });

//           return Promise.all([apiPromise, dbPromise])
//             .then(([res, dbNotes]) => {
//               res.body.forEach((resNote, index) => {
//                 resNote = convertRes(resNote);
//                 const dbNote = dbNotes[index];
//                 compareResAndNote(resNote, dbNote);
//               });
//             });
//         });
//     });

//     it('should return an empty array for an invalid search term', function(){
//       const searchTerm = 'INVALIDSEARCHTERM';
//       const re = new RegExp(searchTerm, 'i');
//       const filter = {
//         $or: [
//           { title : { $regex: re } },
//           { content: { $regex: re } }
//         ]
//       };

//       return chai.request(app).get('/api/notes').query({ searchTerm })
//         .then(res => {
//           expect(res).to.have.status(200);
//           expect(res.body).to.have.length(0);
//         });
//     });
//   });

//   describe('it should return ')
// });