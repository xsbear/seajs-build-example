seajs-build-example
==========================

Seajs Custom Build Example, which use grunt-sea-hashmap, grunt-cmd-transport,
grunt-contrib-handlebars etc. plugins.

本构建方案适用于 seajs 2.1.1+，基于 Grunt 工具，使用了 grunt-cmd-transport, grunt-sea-hashmap, grunt-contrib-handlebars 等插件任务。所以在阅读本文前，最好了解一下 Grunt，社区里也有一些教程资料可参考。
## 理想的构建方案
使用 seajs 快有一年，经历了几个版本的更替，跟很多社区里的伙伴一样，对构建这一环始终充满困惑，而对于 spm 想说爱你不容易，最后还是选择了自定义构建这条路。随着对 grunt的学习，以及根据实际项目所需，逐渐形成了一套适合自身需求的构建方案，虽然还不是很理想，也存在不少缺陷，但基本上较好地满足了目前的构建需求，所以在此分享出来，也希望能让部分seajs用户有所帮助。而我认为理想的构建方案应该符合以下这些特征：
* 对于更新频繁、独立的业务模块，无须各自成包，只要按需构建
* 都于非独立打包的模块，有一套可靠的去缓存机制
* 如没有独立静态资源服务器combo支持，则要尽量减少模块的碎片化
* 构建后的生产模块方便测试、发布

这些只是从部分角度阐述了自己对于理想构建方案的诉求，不同产品类型、项目规模和开发协作方式，肯定会有不同的诉求，这里不再展开。

## 适合的项目特征
从某种程度上来说，本方案比较适合于符合某些特征的中小型项目：如一个页面使用一个主业务模块，业务模块引用一些通用模块；业务模块更新频繁，不适合独立成包。这些看来好像也不算什么特征，大家具体可以看下面的构建实例，看适不适合自己的构建需求。其实方案基于grunt，关键在于grunt任务的编写和配置，如果能够根据自己项目特征开发对应的任务插件，那么基本上问题就能迎刃而解，而我这个方案也算是抛砖引玉吧。

## 构建实例和目录结构说明
具体构建实例请看 [seajs-build-example](https://github.com/xsbear/seajs-build-example)，
可以clone下来，到 static目录下执行 npm install --save-dev, 然后执行 grunt connect，就可运行实例(点击html目录访问首页)。

项目包含3个页面，分别使用3个业务模块，并都引用了base模块。模块代码都很简单，base提供了一个高亮当前导航tab的方法，页面调用了handlebars模板预编译模块，渲染页面内容， page_1 示例了handlebars子模板的调用方法。虽然模块不多，但基本上涵盖了方案所需的构建场景。

关于handlebars模板模块的构建，不同于seajs官方提供的text插件实现方式，这里使用了 grunt-contrib-handlebars 插件，在开发阶段就先预编译并封装成cmd文件，不像text插件是实时预编译，在transport阶段才构建成模块文件。一个好处是可以使用子模板（不确定text插件能否实现子模板，看了下代码应该是不行的，也没找到实例），另外就是可以合并多个模板为一个模块文件，减少模块碎片。 不过也会带来一些使用成本，包括要写封装cmd模块的grunt任务，以及使用 watch 插件监控文件变更，好在这一切都由grunt自动完成。不可避免的是 Gruntfile 会显的臃肿，如果你的项目里不用handlebars或使用text插件，那可以看一下实例项目里的 Gruntfile_noHBS.js 这个文件，相对简单清晰，可能会更有助于了解本方案。


项目目录结构说明：
````
html                          <-- html文件存放目录，可能是后端的某种模板文件目录
    ├─index.html
    ├─page_1.html
    └─page_2.html
static                        <-- 前端源码文件存放目录，是seajs的base目录，也是gruntfile所在目录
    ├─css
        └─style.css
    ├─dist                    <-- 构建后文件存放目录，如果有独立静态文件服务器，可以不需要此目录
    ├─lib                     <-- 依赖的通用模块库，需要封装成cmd模块
    ├─page                    <-- 页面/业务模块源码目录
        ├─base.js
        ├─index.js
        ├─page_1.js
        └─page_2.js
    ├─seajs                   <-- seajs
    ├─templates               <-- handlebars 模板目录
        ├─index               <-- 单个页面模块所使用的模板存放目录
            ├─description.hbs
            └─title.hbs
        ├─page_1
            ├─_time.hbs       <-- handlebars 子模板
            └─now.hbs
        ├─index.js            <-- 已预编译的 handlebars cmd 模块
        └─page_1.js
    ├─Gruntfile.js            <-- gruntfile
    ├─package.json
    └─seajs-config.js         <-- seajs config，包含去缓存的 hash map 信息
````

## 页面模块加载
如果项目没有使用后端模板语言，则可以根据自己的需求在各html文件里加载启动模块。如使用后端模板，则可以遵守一些约定，比如每个模块都有一个 init 方法，供启动代码调用。
加载代码只要放在主模板里即可，至于页面调用哪个模块，则根据你所使用的后端模板来实现，如定义一个变量指明模块id，然后在主模板里引用，或是通过url判断等方法。本实例的3个页面模块虽然都是完整的html，但还是遵循
后端模板的方式，加载代码除了模块id不一样，其他都是一致的。

模块id前的 `(seajs.production ? 'dist/' : '')` 这一判断，是用来区分开发模式和生产模式，并且去缓存机制也跟这个有关，下面会说明。至于如何区分或切换开发、生产模式，不仅限于前端实现，可能还要依赖后端的一些实现，特别是涉及到静态资源服务器的情况，因不同项目情况不同，这里就不展开了。下面是首页加载代码：

````
<script src="/static/seajs/sea.js"></script>
<script src="/static/seajs-config.js"></script>
<script>
    seajs.use((seajs.production ? 'dist/' : '') + 'page/index', function(m) {
        $(function(){m.init()})
    })
</script>
````
##构建过程

构建基于 grunt，主要是 Gruntfile.js 文件的配置，下面会就主要的构建配置作说明。

### packages.json
依赖的grunt插件：
````
"devDependencies": {
    "grunt": "~0.4.2",
    "grunt-sea-hashmap": "~0.2.0",    // 为seajs模块添加hash映射，用于去缓存
    "grunt-cmd-transport": "~0.4.1",  // cmd 模块构建
    "grunt-cmd-concat": "~0.2.5",    // cmd 依赖模块合并
    "grunt-contrib-uglify": "~0.2.7", // 压缩
    "grunt-contrib-handlebars": "~0.6.0", // handlebars 预编译
    "grunt-contrib-clean": "~0.5.0", // 清除文件
    "grunt-contrib-watch": "~0.5.3",  // 文件更改监控 预编译
    "grunt-contrib-connect": "~0.7.1" // web服务 实例演示用
}
````
依赖插件可根据自己项目实际需要进行配置，本方案必要的插件为 grunt-sea-hashmap 和 grunt-cmd-transport.

### 页面模块去缓存(grunt-sea-hashmap)
页面模块去缓存应该算是本方案的一个特色，在这里首先感谢一下 @edokeh ，从他的 [spm-chaos-build](https://github.com/edokeh/spm-chaos-build) 方案里
借鉴了用文件hash映射来去除模块文件缓存的方式，尽管实现细节略有不同。主要原理是每次修改完模块代码后，先对其进行一下校验和，得出MD5，然后在 seajs-config 中生成以下
映射表，既插入到 seajs.config 的 map 列表中，这样当在生产环境下（seajs.production = true），seajs会去加载添加hash后缀的文件，从而有效的去除文件缓存，而且不需手动指定
版本号，省心省力。
````
seajs.production = true;
if(seajs.production){
    seajs.config({
        map: [
            [
                "page/base.js",
                "page/base.js?d3d2a4e353bdffbc50ff918314e8ef1a"
            ],
            [
                "page/index.js",
                "page/index.js?ebb7910773e6449af29f789bd73bddf4"
            ],
            ...,
        ]
    });
}
````
实现这一步骤主要是用到了 [grunt-sea-hashmap](https://github.com/xsbear/grunt-sea-hashmap) 插件，具体配置参数和使用方法可以参见该项目主页，
这里以方案实例为例，列一下配置：
````
hashmap: {
  all: {
    options: {
        build_dest: '.build'
    },
    files: [
      {
        expand: false,
        cwd: '',
        src: ['page/*.js', 'templates/*.js'], // 指定 page 和 handlebars 文件夹下的模块文件
        dest: 'seajs-config.js'
      }
    ]
  }
}
````
关于 build_dest 配置：该插件生成一个 hash map 表到 seajs-config.js 中, 并根据新旧map对比，将有改变的模块文件复制到 build_dest 指定的目录中，这样在后续构建中
只需构建有更改的模块，不需要全部构建。但这里有个小trick，下面的transport过程会提到。如果出于某些原因想重新构建某个或全部模块，无论是否有更改，只要将移除 map 表中一项、修改hash值，或是删除整个map表都可以实现。

### 页面模块 transport
这里使用官方提供的 grunt-cmd-transport 插件对业务模块进行id，dependencies 提取：

````
transport: {
  options: {
    debug: false,
    paths: ['']
  },
  page: {
    options: {
      idleading: 'dist/page/',  // 构建后id前缀，根据实际情况指定
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
}
````
其中 files 配置里的filter选项，就是上面所说的小trick。由于在 transport 时，会去寻找依赖模块，而页面模块一般都有对同级模块的相对引用，所以transport时，files配置还是在page目录下，但这里用了filter选项，用于与 grunt-sea-hashmap 生成的变动模块文件对比，从而只对变动模块文件进行transport，减少了构建量。这只是一个小技巧，是否采用自行决定。

### handlebars 模块构建
下面主要说明一下 handlebars 模板模块的构建配置
````
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
}
````
