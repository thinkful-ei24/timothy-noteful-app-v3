const express = require('express');
const router = express.Router();
const Tag = require('../models/tag');
const Note = require('../models/note');
const ObjectId = require('mongoose').Types.ObjectId;
const isValid = require('mongoose').Types.ObjectId.isValid;

router.get('/', (req, res, next) => {

  Tag.find({})
    .then(tags => {
      res.json(tags);
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if(!isValid(id)) {
    const err = new Error('The tag id is invalid');
    err.status = 400;
    return next(err);
  }

  Tag.findById(id)
    .then(tag => {
      if(!tag) return next();
      else res.json(tag);
    })
    .catch(err => next(err));
  
});

router.post('/', (req, res, next) => {
  const name = req.body.name;

  if(!name || name.trim() === ''){
    const err = new Error('The tag is missing a name');
    err.status = 400;
    return next(err);
  }

  Tag.create({
    name: name
  })
    .then(tag => {
      return res.location(`${req.originalUrl}/${tag.name}`).status(201).send(tag);
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const name = req.body.name;

  if(!isValid(id)) {
    const err = new Error('The tag id is invalid');
    err.status = 400;
    return next(err);
  }

  if(!name || name.trim() === ''){
    const err = new Error('The tag is missing a name');
    err.status = 400;
    return next(err);
  }

  Tag.findByIdAndUpdate(
      id, 
      {$set: {name: name}},
      {new: true}
    )
    .then(tag => {
      if(!tag) return next();
      else res.json(tag);
    })
    .catch(err => {
      if(err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  
  if(!isValid(id)) {
    const err = new Error('The tag id is invalid');
    err.status = 400;
    return next(err);
  }

  Tag.findById(id)
    .then((tag) => {
      if(!tag) return next();
      return tag.remove();
    })
    .then(() => {

      return Note.updateMany(
        {}, 
        {$pull: {tags: id}});
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => next(err));

});

module.exports = router;