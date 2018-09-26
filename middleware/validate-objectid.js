'use strict';

const isValid = require('mongoose').Types.ObjectId.isValid;
const Tag = require('../models/tag');
const Folder = require('../models/folder');


function validateParamId(req, res, next) {
  const id = req.params.id;
  if(!isValid(id)){
    const err = new Error('Object Id is not valid');
    err.status = 400;
    return next(err);
  }
  next();
}

function validateFolderId(req, res, next) {

  if(!('folderId' in req.body)) return next();

  const userId = req.user.id;
  const folderId = req.body.folderId;
  
  if(!isValid(folderId)){
    const err = new Error('Invalid folder id');
    err.status = 400;
    return next(err);
  }

  Folder.findOne({ _id: folderId, userId })
    .then(folder => {
      if(!folder){
        const err = new Error('Invalid folder id');
        err.status = 400;
        return next(err);
      }
      else return next();
    });
}

function validateTags(req, res, next) {

  if(!('tags' in req.body)){
    return next();
  }

  const userId = req.user.id;
  const tags = req.body.tags;

  if(!Array.isArray(tags)){
    const err = new Error('Tags field is not an array');
    err.status = 400;
    return next(err);
  }

  tags.forEach(tag => {
    if(!isValid(tag)){
      const err = new Error('At least one of the tag ids is not valid');
      err.status = 400;
      return next(err);
    }
  });

  const queryPromises = tags.map(tag => {
    return Tag.findOne({ _id: tag, userId })
      .then(result => {
        if(!result){
          const err = new Error('Invalid tag id');
          err.status = 400;
          return Promise.reject(err);
        }
        return;
      });
  });

  Promise.all(queryPromises)
    .then(() => {
      next();
    })
    .catch(next);

}


module.exports = { validateParamId, validateFolderId, validateTags } ;