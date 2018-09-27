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
  const folderId = req.body.folderId;
  const userId = req.user.id;

  validateFolderIdHelper(folderId, userId)
    .then(() => next())
    .catch(next);

  // if(folderId === undefined) return next();

  // if(!isValid(folderId)){
  //   const err = new Error('Invalid folder id');
  //   err.status = 400;
  //   return next(err);
  // }

  // Folder.findOne({ _id: folderId, userId })
  //   .then(folder => {
  //     if(!folder){
  //       const err = new Error('Invalid folder id');
  //       err.status = 400;
  //       return next(err);
  //     }
  //     else return next();
  //   });
}

function validateFolderIdHelper(folderId, userId){
  if(folderId === undefined) return Promise.resolve();

  if(!isValid(folderId)){
    const err = new Error('The folder is not valid');
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

function validateTags(req, res, next) {
  const userId = req.user.id;
  const tags = req.body.tags;

  validateTagsHelper(tags, userId)
    .then(() => next())
    .catch(next);
  // if(tags === undefined){
  //   return next();
  // }

  // if(!Array.isArray(tags)){
  //   const err = new Error('Tags field is not an array');
  //   err.status = 400;
  //   return next(err);
  // }

  // tags.forEach(tag => {
  //   if(!isValid(tag)){
  //     const err = new Error('At least one of the tag ids is not valid');
  //     err.status = 400;
  //     return next(err);
  //   }
  // });

  // Tag.find({ _id: { $in: tags }, userId })
  //   .then(result => {
  //     if(result.length !== tags.length){
  //       const err = new Error('Invalid tag id');
  //       err.status = 400;
  //       return next(err);
  //     }
  //     return next();
  //   });

  // const queryPromises = tags.map(tag => {
  //   return Tag.findOne({ _id: tag, userId })
  //     .then(result => {
  //       if(!result){
  //         const err = new Error('Invalid tag id');
  //         err.status = 400;
  //         return Promise.reject(err);
  //       }
  //       return;
  //     });
  // });

  // Promise.all(queryPromises)
  //   .then(() => {
  //     next();
  //   })
  //   .catch(next);

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
module.exports = { validateParamId, validateFolderId, validateTags, validateFolderAndTags } ;