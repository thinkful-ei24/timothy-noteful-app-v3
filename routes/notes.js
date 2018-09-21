'use strict';

const express = require('express');
// const Folder = require('../models/folder');
const Note = require('../models/note');
const router = express.Router();
const isValid = require('mongoose').Types.ObjectId.isValid;

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  const { folderId, searchTerm, tagId } = req.query;
  let filter = {};

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
    filter.tags = tagId
  };

  Note.find(filter)
    .sort({updatedAt: 1})
    .then(notes => res.json(notes))
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if(!isValid(id)) {
    const err = new Error('Id is invalid');
    err.status = 400;
    return next(err);
  }

  Note.findById(id)
    .populate('tags')
    .then(note => {
      if(!note) return next();
      else res.json(note);
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId, tags } = req.body;

  if(!title || title.trim() === '') {
    const err = new Error('Missing title field');
    err.status = 400;
    return next(err);
  }

  if(folderId && !isValid(folderId)){
    const err = new Error('Invalid folder id');
    err.status = 400;
    return next(err);
  }

  if(tags){
    tags.forEach(tag => {
      if(!isValid(tag)){
        const err = new Error('At least one of the tag ids is not valid');
        err.status = 400;
        console.log(err.message);
        return next(err);
      }
    });
  }

  const newNote = {
    title: title,
    content: content,
    folderId: folderId ? folderId : null,
    tags: tags
  };

  Note.create(newNote)
    .then(note => res.location(`${req.originalUrl}/${note._id}`).json(note))
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const folderId = req.body.folderId;
  const tags = req.body.tags;
  const update = {};
  const updateableFields = ['title', 'content', 'folderId', 'tags'];
  
  if(!isValid(id)) {
    const err = new Error('Id is invalid');
    err.status = 400;
    return next(err);
  }

  if('title' in req.body && req.body.title.trim() === '') {
    const err = new Error('Missing title field');
    err.status = 400;
    return next(err);
  }

  if(folderId && !isValid(folderId)){
    const err = new Error('Invalid folder id');
    err.status = 400;
    return next(err);
  }

  if(tags){
    tags.forEach(tag => {
      if(!isValid(tag)){
        const err = new Error('At least one of the tag ids is not valid');
        err.status = 400;
        console.log(err.message);
        return next(err);
      }
    });
  }

  updateableFields.forEach(field => {
    if(req.body[field]) update[field] = req.body[field];
  });

  Note.findByIdAndUpdate(id, {$set: update}, {new: true})
    .then(note => {
      if(!note) return next();
      res.json(note);
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  Note.findByIdAndRemove(id)
    .then(() => res.sendStatus(204))
    .catch(err => next(err));
});

module.exports = router;