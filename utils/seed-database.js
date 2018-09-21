const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Tag = require('../models/tag')
const Note = require('../models/note');
const Folder = require('../models/folder');

const { folders, notes, tags } = require('../db/seed/notes');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      Folder.createIndexes(),
      Tag.createIndexes()
    ]);
  })
  .then(([notes, folders, tags]) => {
    console.info(`Inserted ${notes.length} Notes, ${tags.length} Tags, & ${folders.length} Folders`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });