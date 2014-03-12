/*
 * base module
 */
define(function(require, exports, module) {

    var pub = {};

    pub.navigation = function(url) {
        $('.nav a[href="' + url + '.html"]').addClass('current')
    }

    module.exports = pub;
})