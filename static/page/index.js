/*
 * index module
 */
define(function(require, exports, module) {

    var bs = require('./base');

    var tplTitle = require('../templates/index.js')["index/title"]
    var tplDescription = require('../templates/index.js')["index/description"]

    var pub = {};

    pub.init = function() {
        bs.navigation('index');
        pub.showPageInfo();
    }

    pub.showPageInfo = function(){
        $('.page-info').append(tplTitle({title: '首页'})).append(tplDescription({desc: '这是一个 seajs 模块化加载自定义构建的简单例子'}))
    }

    module.exports = pub;
})