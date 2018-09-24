'use strict';

const express = require('express');
const router = express.Router();
const Folder = require('../models/folder');
const Note = require('../models/note');
const { validateParamId } = require('../middleware/validate-objectid');

router.get('/', (req, res, next) => {

  Folder.find({})
    .sort({ name: 1 })
    .then(folders => res.json(folders))
    .catch(next);
});

router.get('/:id', validateParamId, (req, res, next) => {
  const id = req.params.id; 

  Folder.findById(id)
    .then(folder => {
      if(!folder) return next();
      else res.json(folder);
    });
});

function validateFolderName(req, res, next){
  const name = req.body.name;
  
  if(!name|| name.trim() === ''){
    const err = new Error('Missing name field');
    err.status = 400;
    return next(err);
  }
  next();
}

router.post('/', validateFolderName, (req, res, next) => {
  const name = req.body.name;

  const newFolder = { name };

  Folder.create(newFolder)
    .then(folder => {
      return res.status(201).location(`${req.originalUrl}/${folder.id}`).json(folder);
    })
    .catch(next);
});

router.put('/:id', validateParamId, validateFolderName, (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;

  const updatedFolder = { name };

  Folder.findByIdAndUpdate(
    id, 
    { $set: updatedFolder }, 
    { new : true }
  )
    .then(folder => {
      if(!folder) return next(); 
      else res.json(folder);
    })
    .catch(next);
});

router.delete('/:id', validateParamId, (req, res, next) => {
  const folderId = req.params.id;

  Folder.findById(folderId)
    .then(folder => {
      if(!folder) {
        return Promise.reject();
      }
      return folder.remove();
    })
    .then(() => {
      return Note.updateMany(
        { folderId: folderId }, 
        { $unset: { folderId: '' } }
      );
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
});

router.use((err, req, res, next) => {
  if(err.code === 11000){
    err = new Error('The folder name already exists');
    err.status = 400;
  }
  next(err);
});

module.exports = router;