'use strict';

const express = require('express');
const router = express.Router();
const Tag = require('../models/tag');
const Note = require('../models/note');
const { validateNoteId } = require('../middleware/validateObjectId');

router.get('/', (req, res, next) => {

  Tag.find()
    .then(tags => {
      res.json(tags);
    })
    .catch(next);
});

router.get('/:id', validateNoteId, (req, res, next) => {
  const id = req.params.id;

  Tag.findById(id)
    .then(tag => {
      if(!tag) return next();
      else res.json(tag);
    })
    .catch(next);
});

function validateTagName (req, res, next){
  const name = req.body.name;
  if(!name || name.trim() === ''){
    const err = new Error('The tag is missing a name');
    err.status = 400;
    return next(err);
  }
  next();
}

router.post('/', validateTagName, (req, res, next) => {
  const name = req.body.name;

  Tag.create({ name })
    .then(tag => {
      return res.location(`${req.originalUrl}/${tag.name}`).status(201).send(tag);
    })
    .catch(next);
});

router.put('/:id', validateNoteId, validateTagName, (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;

  Tag.findByIdAndUpdate(
    id, 
    { $set: { name: name } },
    { new: true }
  )
    .then(tag => {
      if(!tag) return next();
      else res.json(tag);
    })
    .catch(next);
});

router.delete('/:id', validateNoteId, (req, res, next) => {
  const id = req.params.id;
  
  Tag.findById(id)
    .then((tag) => {
      if(!tag) {
        return Promise.reject();
      }
      return tag.remove();
    })
    .then(() => {
      return Note.updateMany(
        {}, 
        { $pull: { tags: id } }
      );
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);

});

router.use((err, req, res, next) => {
  if(err.code === 11000){
    err = new Error('The tag name already exists');
    err.status = 400;
  }
  next(err);
});

module.exports = router;