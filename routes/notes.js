'use strict';

const express = require('express');
const Note = require('../models/note');
const router = express.Router();
const { validateParamId, validateFolderId, validateTags } = require('../middleware/validate-objectid');
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.use(jwtAuth);

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const userId = req.user.id;

  const { folderId, searchTerm, tagId } = req.query;
  let filter = {};

  filter.userId = userId;
  
  if(folderId) {
    filter.folderId = folderId;
  }

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [ 
      {title: {$regex: re }}, 
      {content: {$regex: re }}
    ];
  }

  if(tagId) {
    filter.tags = tagId;
  }

  Note.find(filter)
    .sort({ updatedAt: 1 })
    .then(notes => res.json(notes))
    .catch(next);
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', validateParamId, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;

  Note.findOne({ _id: id, userId })
    .populate('tags')
    .then(note => {
      if(!note) return next();
      else res.json(note);
    })
    .catch(next);
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', validateFolderId, validateTags, (req, res, next) => {
  const { title, content, folderId, tags } = req.body;
  const userId = req.user.id;

  if(!title || title.trim() === '') {
    const err = new Error('Missing title field');
    err.status = 400;
    return next(err);
  }

  const newNote = {
    title,
    content,
    folderId: folderId ? folderId : null,
    tags: tags ? tags : [],
    userId
  };

  Note.create(newNote)
    .then(note => res.location(`${req.originalUrl}/${note._id}`).json(note))
    .catch(next);
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', validateParamId, validateFolderId, validateTags, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  const update = {};
  const updateableFields = ['title', 'content', 'folderId', 'tags'];

  if('title' in req.body && req.body.title.trim() === '') {
    const err = new Error('Missing title field');
    err.status = 400;
    return next(err);
  }

  updateableFields.forEach(field => {
    if(req.body[field]) update[field] = req.body[field];
  });

  Note.findByIdAndUpdate(
    id, 
    { $set: update }, 
    { new: true }
  )
    .then(note => {
      if(!note) return next();
      res.json(note);
    })
    .catch(next);
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', validateParamId, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;

  Note.findByOne({ _id: id, userId })
    .then(note => {
      if(!note) {
        return Promise.reject();
      } 
      return note.remove();
    })
    .then(() => res.sendStatus(204))
    .catch(next);
});

module.exports = router;