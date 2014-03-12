/*global module:false*/
module.exports = function(grunt) {

  var path = require('path');

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */\n',
    // Task configuration.
    hashmap: {
      page: {
        options: {
            build_dest: '.build'
        },
        files: [
          {
            expand: false,
            cwd: 'page',
            src: '*.js',
            dest: 'seajs-config.js'
          }
        ]
      }
    },
    transport: {
      options: {
        debug: false,
        paths: ['']
      },
      page: {
        options: {
          idleading: 'dist/page/',
          alias: {
            'es5-safe': 'es5-safe',
            'json': 'json',
            'jquery': 'jquery',
            'handlebars': 'handlebars'
          }
        },
        files: [{
          expand: true,
          cwd: 'page',
          src: '*.js',
          filter: function(filepath){
            return grunt.file.exists('.build/' + filepath.substr(5));
          },
          dest: '.build'
        }]
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      page: {
        files: [{
          expand: true,
          cwd: '.build',
          src: '*.js',
          dest: 'dist/page'
        }]
      }
    },
    clean: {
      build: ['.build']
    },
    connect: {
      server: {
        options: {
          keepalive: true,
          hostname: 'localhost',
          port: 8001,
          base: '../'
        }
      }
    }
  });

  // Append hash to script, link(css), in order to burst cahce.
  grunt.registerTask("hashres", "Hashes js and css files in base.html.", function() {
    var crypto = require('crypto');
    var fs = require('fs');
    // 主模板 layout
    filepath = '../layout.html';

    var RES_RE = /<(?:script|link)[\s\w="]+?(?:href|src)="\/static\/([^"]+?)(?:\?\w+)?"/gm
    var code = grunt.file.read(filepath);
    var match;
    while (match = RES_RE.exec(code)) {
      var res = match[1];
      var shasum = crypto.createHash('md5');
      shasum.update(fs.readFileSync(res, 'utf8'));
      var d = shasum.digest('hex');
      var reStr = res + "(?:\\?\\w+)?";
      var RE = new RegExp(reStr);
      code = code.replace(RE, res + '?' + d);
    }
    grunt.file.write(filepath, code)
    grunt.log.oklns("Resource files in " + filepath +" hashed.")

  })

  // Switch mode between development and production , add or remove a 'development' watermark on page.
  grunt.registerTask("mode", "Set to development mode.", function(mode) {
    var filepath = "seajs-config.js";
    var code = grunt.file.read(filepath);
    if(mode === 'dev'){
      code = code.replace('seajs.production = true;', 'seajs.production = false;');
    } else {
      code = code.replace('seajs.production = false;', 'seajs.production = true;');
    }
    grunt.file.write(filepath, code);

    // 主模板 layout
    filepath = '../layout.html';
    var WATERMARK = '<div style="position:fixed;top:0;left:0;z-index:99999;width:100px;height:30px;color:#fff;background-color:rgba(4, 79, 239, 0.3);font-size:18px;text-align:center">开发模式</div>';
    code = grunt.file.read(filepath);
    if(mode === 'dev'){
      code = code.replace('</body>', WATERMARK + '</body>');
    } else {
      code = code.replace(WATERMARK + '</body>', '</body>');
    }
    grunt.file.write(filepath, code);

    grunt.log.oklns('Now ' + (mode === 'dev' ? 'DEVELOPMENT' : 'PRODUCTION') + ' mode.')
  })

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-sea-hashmap');
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('page', ['hashmap:page', 'transport:page', 'uglify:page', 'clean']);
  grunt.registerTask('dev', ['mode:dev']);
  grunt.registerTask('prd', ['mode:prd']);
  // Default task.
  grunt.registerTask('default', ['page', 'prd', 'hashres']);
}
