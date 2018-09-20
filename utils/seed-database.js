const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');

const { notes } = require('../db/seed/notes');
const { folders } = require('../db/seed/folders');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {

    const notePromise = Note.insertMany(notes);
    const folderPromise = Folder.insertMany(folders);

    return Promise.all([notePromise, folderPromise, Folder.createIndexes()]);
  })
  .then(([notes, folders]) => {
    console.info(`Inserted ${notes.length} Notes & ${folders.length} Folders`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });