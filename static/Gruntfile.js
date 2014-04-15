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
      all: {
        options: {
            build_dest: '.build'
        },
        files: [
          {
            expand: false,
            cwd: '',
            src: ['page/*.js', 'templates/*.js'],
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
            return grunt.file.exists('.build/' + filepath);
          },
          dest: '.build/page'
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
          cwd: '.build/page',
          src: '*.js',
          dest: 'dist/page'
        }]
      },
      handlebars: {
          files: [{
            expand: true,
            cwd: 'templates',
            src: '*.js',
            filter: function(filepath){
              return grunt.file.exists('.build/' + filepath);
            },
            dest: '.build/templates'
          }]
      }
    },
    handlebars: {
      options: {
        namespace: 'MMTPL',
        processName: function(filePath) {
          return filePath.replace(/^templates\//, '').replace(/\.hbs$/, '');
        }
      },
      all: {
          files: {
            "templates/index.js": ["templates/index/*.hbs"],
            "templates/page_1.js": ["templates/page_1/*.hbs"]
          }
      }
    },
    cmd_handlebars: {
      all: {
        options: {
          handlebars_id: 'handlebars',
          exports: 'this["MMTPL"]',
        },
        files: {
          src: ['templates/*.js']
        }
      }
    },
    disthbs: {
      all: {
        files: [{
          src: ['.build/templates/*.js'],
          dest: 'dist/templates/'
        }]
      }
    },
    watch: {
      options: {
        atBegin: true
      },
      handlebars: {
        files: ['templates/*/*.hbs'],
        tasks: ['hbs_dev']
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

  // Distribute handlebars modules
  grunt.registerMultiTask('disthbs', 'Distribute handlebars modules', function() {
    this.files.forEach(function(f) {
      var src = f.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });

      src.forEach(function(filepath) {
          var code = grunt.file.read(filepath);
          var dist_code = code.replace('define("', 'define("dist/');
          var basename = path.basename(filepath)
          grunt.file.write(f.dest + basename, dist_code)
          grunt.log.oklns('Distribute handlebars module: "' + basename + '" OK.');
      });
    });
  })

  // Append hash to script, link(css), in order to burst cahce.
  grunt.registerTask("hashres", "Hashes js and css files in base.html.", function() {
    var crypto = require('crypto');
    var fs = require('fs');

    var src = ['../html/index.html', '../html/page_1.html', '../html/page_2.html'];
    src.forEach(function(filepath) {
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

    var WATERMARK = '<div style="position:fixed;top:0;left:0;z-index:99999;width:100px;height:30px;color:#fff;background-color:rgba(4, 79, 239, 0.3);font-size:18px;text-align:center">开发模式</div>';
    var src = ['../html/index.html', '../html/page_1.html', '../html/page_2.html'];
    src.forEach(function(filepath) {
      code = grunt.file.read(filepath);
      if(mode === 'dev'){
        code = code.replace('</body>', WATERMARK + '</body>');
      } else {
        code = code.replace(WATERMARK + '</body>', '</body>');
      }
      grunt.file.write(filepath, code);
    })
    grunt.log.oklns('Now ' + (mode === 'dev' ? 'DEVELOPMENT' : 'PRODUCTION') + ' mode.')
  })

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-sea-hashmap');
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-cmd-handlebars');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('page', ['hashmap:all', 'transport:page', 'uglify:page']);
  grunt.registerTask('hbs_dev', ['handlebars:all', 'cmd_handlebars:all']);
  grunt.registerTask('hbs_dist', ['uglify:handlebars', 'disthbs:all']);
  grunt.registerTask('dev', ['mode:dev', 'watch']);
  grunt.registerTask('prd', ['mode:prd']);
  // Default task.
  grunt.registerTask('default', ['page', 'hbs_dist', 'clean', 'prd', 'hashres']);
}
