'use strict';

const isValid = require('mongoose').Types.ObjectId.isValid;

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
  const folderId = req.body.folderId;

  if(folderId && !isValid(folderId)){
    const err = new Error('Invalid folder id');
    err.status = 400;
    return next(err);
  }
  next();
}

function validateTags(req, res, next) {
  const tags = req.body.tags;

  if(tags){
    tags.forEach(tag => {
      if(!isValid(tag)){
        const err = new Error('At least one of the tag ids is not valid');
        err.status = 400;
        return next(err);
      }
    });
  }
  next();
}


module.exports = { validateParamId, validateFolderId, validateTags } ;