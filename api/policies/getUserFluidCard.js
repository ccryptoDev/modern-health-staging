/**
 * Created by nineleaps on 17/11/16.
 */
/**
 * Created by nineleaps on 28/10/16.
 */
'use strict';

module.exports = function (req, res, next) {
  var user = req.user;
  var criteria = {
    user : user.id,
    isDeleted: false
  };
  FluidCard
    .findOne(criteria)
    .then(function (fluidCard) {
      if(!fluidCard) {
        sails.log.error("@getUserFluidCard :: Fluid card not found for user");
        return res.serverError({
          code: 404,
          message: 'NOT_FOUND'
        });
      }
      req.fluidCard = fluidCard;
      return next();
    })
    .catch(function (err) {
      sails.log.error('@getUserFluidCard :: Error :: ', err);
      return res.serverError();
    });
}
