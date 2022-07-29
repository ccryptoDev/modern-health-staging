/**
 * Created by nineleaps on 28/10/16.
 */
'use strict';

module.exports = function (req, res, next) {
  // check if user exists
  var user = req.user;
  if (!user) {
    sails.log.error("@isUserOwnStory :: User is null");

    return res.handleError({
      code: 500,
      message: 'INTERNAL_SERVER_ERROR'
    });
  }

  // get the story id
  var storyId = req.param('storyId');

  if (!storyId) {
    sails.log.error("@isUserOwnStory :: StoryId not found");

    return res.handleError({
      code: 400,
      message: 'STORY_ID_MANDATORY'
    });
  }
  // query if user owns the story
  Story
    .getUserStory(storyId, user.id)
    .then(function (story) {
      req.story = story;

      return next();
    })
    .catch(function (err) {
      sails.log.error('@isUserOwnStory :: Error :: ', err);

      return res.serverError();
    })
};
