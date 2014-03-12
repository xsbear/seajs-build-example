/*
 * page_1 module
 */
define(function(require, exports, module) {

    var bs = require('./base');

    var Handlebars = require('handlebars');
    var tplNow = require('../templates/page_1.js')["page_1/now"]

    var pub = {};

    pub.init = function() {
        bs.navigation('page_1');
        pub.showNow();
    }

    pub.showNow = function(){
        var now = new Date();
        $('.now').append(
            tplNow({
                'year': now.getFullYear(),
                'month': now.getMonth() + 1,
                'date': now.getDate(),
                'hour': now.getHours(),
                'minute': now.getMinutes(),
                'second': now.getSeconds()
            })
        )
        var clock = $('.clock');
        setInterval(function(){
            var time = new Date();
            clock.text(
                Handlebars.partials['time']({
                    'hour': time.getHours(),
                    'minute': time.getMinutes(),
                    'second': time.getSeconds()
                })
            )
        }, 1000)
    }

    module.exports = pub;
})