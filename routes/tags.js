'use strict';

const express = require('express');
const router = express.Router();
const Tag = require('../models/tag');
const Note = require('../models/note');
const { validateParamId } = require('../middleware/validate-id');

router.get('/', (req, res, next) => {
  const userId = req.user.id;

  Tag.find({ userId })
    .then(tags => {
      res.json(tags);
    })
    .catch(next);
});

router.get('/:id', validateParamId, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;

  Tag.findOne( {_id: id, userId })
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
  const userId = req.user.id;

  Tag.create({ name, userId })
    .then(tag => {
      return res.location(`${req.originalUrl}/${tag.name}`).status(201).send(tag);
    })
    .catch(next);
});

router.put('/:id', validateParamId, validateTagName, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  const name = req.body.name;

  Tag.findOneAndUpdate(
    { _id: id, userId }, 
    { $set: { name: name } },
    { new: true }
  )
    .then(tag => {
      if(!tag) return next();
      else res.json(tag);
    })
    .catch(next);
});

router.delete('/:id', validateParamId, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  
  Tag.findOne({ _id: id, userId })
    .then((tag) => {
      if(!tag) {
        return Promise.reject();
      }
      return tag.remove();
    })
    .then(() => {
      return Note.updateMany(
        { userId }, 
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