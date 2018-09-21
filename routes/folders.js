'use strict';

const express = require('express');
const router = express.Router();
const Folder = require('../models/folder');
const Note = require('../models/note');
const isValid = require('mongoose').Types.ObjectId.isValid;


router.get('/', (req, res, next) => {

  Folder.find({})
    .sort({name: 1})
    .then(folders => res.json(folders))
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id; 
  if(!isValid(id)) {
    const err = new Error('Id is invalid');
    err.status = 400;
    return next(err);
  }

  Folder.findById(id)
    .then(folder => {
      if(!folder) return next();
      else res.json(folder);
    });
});

router.post('/', (req, res, next) => {
  const name = req.body.name;
  if(!name || name.trim() === '') {
    const err = new Error('Missing name field');
    err.status = 400;
    return next(err);
  }

  const newFolder = {
    name: req.body.name
  };

  Folder.create(newFolder)
    .then(folder => {
      return res.status(201).location(`${req.originalUrl}/${folder.id}`).json(folder);
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  if(!isValid(id)) {
    const err = new Error('Id is invalid');
    err.status = 400;
    return next(err);
  }
  
  if(!req.body.name || req.body.name.trim() === ''){
    const err = new Error('Missing name field');
    err.status = 400;
    return next(err);
  }
  
  const updatedFolder = {
    name: req.body.name
  };

  Folder.findByIdAndUpdate(id, {$set: updatedFolder}, {new : true})
    .then(folder => {
      if(!folder) return next(); 
      else res.json(folder);
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  
  if(!isValid(id)) {
    const err = new Error('Id is invalid');
    err.status = 400;
    return next(err);
  }

  Folder.findByIdAndRemove(id)
    .then(() => {
      Note.updateMany({folderId: id}, { $unset: {folderId: ''}});
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => next(err));
});

module.exports = router;