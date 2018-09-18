'use strict';

const express = require('express');
const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  const searchTerm = req.query.searchTerm;
    let filter = {};

    if (searchTerm) {
      const re = new RegExp(searchTerm, 'i');
      filter.$or = [ 
        {
          title: 
          { 
            $regex: re 
          }
        }, 
        {
          content: 
          {
            $regex: re
          }
        }
      ];
    }

    Note.find(filter).sort({updatedAt: 1})
      .then(notes => {
        res.json(notes);
      })
      .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  Note.findById(id)
    .then(note => {
      if(!note) return next();
      else res.json(note);
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  if(!req.body.title) res.status(400).json({message: 'Missing title field'});

  Note.create(req.body)
    .then(note => {
      res.location(`${req.originalUrl}/${note._id}`).json(note);
    })
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const update = {};
  const updateableFields = ['title', 'content'];

  if(!req.body.title) return res.status(400).json({message: 'Missing title field'});

  updateableFields.forEach(field => {
    if(field in req.body) update[field] = req.body[field];
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
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

module.exports = router;