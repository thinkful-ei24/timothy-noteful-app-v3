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

function validateFolderIdHelper(folderId, userId){
  if(folderId === undefined) return Promise.resolve();

  if(!isValid(folderId)){
    const err = new Error('The folder id is not valid');
    err.status = 400;
    return Promise.reject(err);
  }

  return Folder.findOne({ _id: folderId, userId })
    .then(folder => {
      if(!folder){
        const err = new Error('This folder does not belong to the user');
        err.status = 400;
        return Promise.reject(err);
      }
      return Promise.resolve();
    });
}

function validateTagsHelper(tags, userId){
  if(tags === undefined) return Promise.resolve();

  if(!Array.isArray(tags)){
    const err = new Error('The tags field is not an array');
    err.status = 400;
    return Promise.reject(err);
  }
  
  const invalidTags = tags.filter(tag => !isValid(tag));
  if(invalidTags.length) {
    const err = new Error('The tags array contains an invalid id');
    err.status = 400;
    return Promise.reject(err);
  }

  return Tag.find({ _id: { $in: tags}, userId })
    .then(results => {
      if(results.length !== tags.length){
        const err = new Error('The tags array contains an invalid id');
        err.status = 400;
        return Promise.reject(err);
      }
      return Promise.resolve();
    });

}

function validateFolderAndTags(req, res, next){
  const { folderId, tags }  = req.body;
  const userId = req.user.id;

  return Promise.all([
    validateFolderIdHelper(folderId, userId), 
    validateTagsHelper(tags, userId)
  ])
    .then(() => next())
    .catch(err => next(err));
}

module.exports = { validateParamId, validateFolderAndTags } ;