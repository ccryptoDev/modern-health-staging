/**
 * Category.jsater
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q');
module.exports = {

  attributes: {
    categoryName: {
      type: "string"
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },
    reason: {
      collection: 'story',
      via: 'category'
    },
    toCategoryApi: toCategoryApi
  },
  createCategory: createCategory,
  updateCategory: updateCategory,
  getAllForCategory: getAllForCategory,
  deleteCategory: deleteCategory,
  getAllCategoryList: getAllCategoryList,
  getAll: getAll,
  getOneCategory: getOneCategory
};

function getAll() {
  return Q.promise(function (resolve, reject) {
    Category
      .find({
        isDeleted: "false"
      })
      .populateAll()
      .then(function(categories) {
console.log("here is the categories",categories);
        return resolve(categories);
      })
      .catch(function (err) {
        sails.log.error("category#getAll:: Error :: ", err);
        return reject(err);
      });
  });
}

function toCategoryApi() {
  var category = this.toObject();
  return {
    name: category.categoryName,
    id: category.id
  };
}

function createCategory(data) {
  return Q.promise(function (resolve, reject) {

    if (!data) {
      sails.log.error('Category#createCategory :: data null ');

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }

    data['referenceId'] = Utils.generateReferenceId();
    var criteria = {
      categoryName: data.categoryName
    };

    Category
      .findOne(criteria)
      .then(function (category) {
        if (category) {
          return reject({
            code: 400,
            message: 'CATEGORY_ALREADY_EXISTS'
          });
        }
        Category.create(data)
          .then(resolve)
          .catch(function (err) {
            sails.log.error("Category#createCategory :: Error :: ", err);

            return reject(err);
          });
      })
      .catch(function (err) {
        // supress errors
        sails.log.error("Category :: createCategory :: Error :: ", err);

        return reject(err);

      });
  });
}

function updateCategory(data) {
  return Q.promise(function (resolve, reject) {
    console.log("here is the data",data);
    var criteria = {
      id: data.id
    };

    Category
      .findOne(criteria)
      .then(function (category) {
        console.log("hre is the category",category);
        category.categoryName = data.categoryName;
        category.save(function (err) {
          if (err) {
            sails.log.error("Category#updateCategory :: Error :: ", err);
            return reject({
              code: 500,
              message: 'INTERNAL_SERVER_ERROR'
            });
          }
        });

        return resolve(category);
      })
      .catch(function (err) {
        sails.log.error('Category#updateCategory :: Updating category error :: ', err);
        return reject(err);

      });
  });
}

function getAllForCategory(data) {
  return Q.promise(function (resolve, reject) {
    if (!data) {
      sails.log.error('Category#getAllForCategory :: category null ');

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
    var criteria = {
      id: data.categoryId
    };

    Category
      .findOne(criteria)
      .then(resolve)
      .catch(function (err) {
        sails.log.error('Category#getAllForCategory :: Error :: ', err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}

function deleteCategory(id) {
  return Q.promise(function (resolve, reject) {
    if (!id) {
      sails.log.error('Category#getAllForCategory :: category null ');

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
    console.log("here is the id",id);
    var criteria = {
      id: id,
      isDeleted:false
    };
    console.log("is the critaeria",criteria);
    Category
      .findOne(criteria)
      .then(function (category) {
        console.log("here is the category",category);
        category.isDeleted = true;
        category.save(function (err) {
          if (err) {
            sails.log.error("Category#deleteCategory :: Error in saving category :: ", err);

            return reject({
              code: 500,
              message: 'INTERNAL_SERVER_ERROR'
            });

          }
          return resolve(category);
        })
      })
      .catch(function (err) {
        sails.log.error('Category#deleteCategory :: category null ');

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });

}

function getAllCategoryList() {
  return Q.promise(function (resolve, reject) {
    Category
      .find({
        isDeleted: false
      })
      .then(function (categoryList) {
        console.log("here is the categoryList");
        return resolve(categoryList);
      })
      .catch(function (err) {
        return reject(err);
      });
  });
}


function getOneCategory(id) {
  return Q.promise(function (resolve, reject) {
    var criteria = {
      id: id
    };
    console.log("criteria for category", criteria);
    Category
      .findOne(criteria)
      .populateAll()
      .then(function (category) {
					  console.log("category data: ", category);
        if (!category) {
          sails.log.info("Category#getOneCategory :: category not found for :: ", id);

          return reject({
            code: 404,
            message: 'CATEGORY_NOT_FOUND'
          });
        }

        return resolve(category);
      })
      .catch(function (err) {
        sails.log.error("category#getOneUser:: Error :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });
  });
}
