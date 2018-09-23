const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Tag = require('../models/tag');

// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => {
//     const searchTerm = 'lady gaga';
//     let filter = {};

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm };
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


// get notes by id query
//   mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//     .then(() => {
//         return Note.findOne()
//     })
//     .then(note => {
//         const id = note._id;
//         return Note.findById(id)
//     })
//     .then(note => {
//         console.log(note);
//     })
//     .then(() => mongoose.disconnect())
//     .catch(err => console.log(err));

// create new notes
// const newNote = {
//     title: "Foo",
//     content: "Bar"
// };
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//     .then(() => {

//         return Note.create(newNote)
//     })
//     .then(note => {
//         console.log(note);
//     })
//     .then(() => mongoose.disconnect())
//     .catch(err => console.error(err));

// update a new note using Note.findByIdAndUpdate
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//     .then(() => {
//         return Note.findOne();
//     })
//     .then(note => {
//         const id = note._id;
//         const update = { 
//             title: "New title", 
//             content: "New content"
//         };
//         return Note.findByIdAndUpdate(id, {$set: update});
//     })
//     .then(note => {
//         console.log(note);
//     })
//     .then(() => {
//         mongoose.disconnect();
//     })
//     .catch(err => console.error(err));

// delete a note by id 

// let id; 
// mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(()=> {
//     const searchTerm = 'cats';
//     const re = new RegExp(searchTerm, 'i');
    
//     const filter = {
//       $or: [
//         {title: {$regex: re}},
//         {content: {$regex: re}}
//       ]
//     };
//     return Note.find(filter)
//       .sort({updatedAt: 1});
//   })
//   .then(notes => {
//     console.log(notes[0].id);

//   });
//   .then(() => {
//     return Note.findOne();     
//   })
//   .then(note => {
//     id = note._id;
//     console.log(id);
//     return Note.findByIdAndRemove(id);
//   })
//   .then(() => {
//     return Note.findById(id).count();
//   })
//   .then(count => console.log(count))
//   .catch(err => console.error(err));

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(()=> {
    
    return Note.findOne()
      .populate('tags');
  })
  .then(note => {
    console.log(note);
  })
  .then(() => mongoose.disconnect());