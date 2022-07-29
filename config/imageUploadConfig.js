/**
 * Created by raviteja on 16/08/16.
 */
'use strict';

var path = require('path');
var appPath = process.cwd();

function getConfig() {
  return {
    tempConfig: {
      dirname: path.resolve(appPath, 'assets/uploads')
    }
  };
}

module.exports.imageUploadConfig = getConfig();
