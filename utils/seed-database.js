const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Tag = require('../models/tag')
const Note = require('../models/note');
const Folder = require('../models/folder');
const User = require('../models/user');

const { folders, notes, tags, users } = require('../db/seed/notes');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      User.insertMany(users),
      Folder.createIndexes(),
      Tag.createIndexes(),
      User.createIndexes()
    ]);
  })
  .then(([notes, folders, tags]) => {
    console.info(`Inserted ${notes.length} Notes, ${tags.length} Tags, & ${folders.length} Folders, ${users.length} Users`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });