'use strict';

const express = require('express');
const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  const searchTerm = req.query.searchTerm;
    let filter = {};

    if (searchTerm) {
      const re = new RegExp(searchTerm, i);
      filter.title = { $regex: re };
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
      res.location(`${req.url}/${note._id}`).json(note);
    })
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 1, title: 'Updated Temp 1' });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();
});

module.exports = router;