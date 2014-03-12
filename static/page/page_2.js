/*
 * page_2 module
 */
define(function(require, exports, module) {

    var bs = require('./base');
    var pub = {};

    pub.init = function() {
        bs.navigation('page_2');
    }

    module.exports = pub;
})