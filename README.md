Seajs 自定义构建实例
==========================

本构建方案适用于 seajs 2.1.1+，基于 Grunt 工具，使用了 grunt-cmd-transport, grunt-sea-hashmap, grunt-contrib-handlebars 等插件任务。所以在阅读本文前，最好了解一下 Grunt。

## 适合的项目特征
从某种程度上来说，本方案比较适合于符合某些特征的中小型项目：如一个页面使用一个主业务模块，业务模块引用一些通用模块；业务模块更新频繁，不适合独立成包。这些看来好像也不算什么特征，具体可以看下b本构建实例，看适不适合自己的构建需求。其实方案基于grunt，关键在于grunt任务的编写和配置，如果能够根据自己项目特征开发对应的任务插件，那么基本上问题就能迎刃而解。

## 构建实例和目录结构说明
Clone项目到本地，到 static目录下执行 `npm install --save-dev`, 然后执行 `grunt connect`，就可运行实例(点击html目录访问首页)。

项目包含3个页面，分别使用3个业务模块，并都引用了base模块。模块代码都很简单，base提供了一个高亮当前导航tab的方法，页面调用了handlebars模板预编译模块，渲染页面内容， page_1 示例了handlebars子模板的调用方法（时钟效果）。虽然模块不多，但基本上涵盖了方案所需的构建场景。

关于handlebars模板模块的构建，不同于seajs官方提供的text插件实现方式，这里使用了 grunt-contrib-handlebars 插件，在开发阶段就先预编译并封装成cmd文件，不像text插件是实时预编译，在transport阶段才构建成模块文件。一个好处是可以使用子模板（不确定text插件能否实现子模板，看了下代码应该是不行的，也没找到实例），另外就是可以合并多个模板为一个模块文件，减少模块碎片。 不过也会带来一些使用成本，包括要使用grunt插件封装cmd模块，以及使用 watch 插件监控文件变更，好在这一切都由grunt自动完成。不可避免的是 Gruntfile 会显的臃肿，如果你的项目里不用handlebars或使用text插件，那可以看一下项目里的 Gruntfile_noHBS.js 这个文件，相对简单清晰，可能会更有助于了解本方案。


目录结构：
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
        ├─handlebars
        └─jquery
    ├─page                    <-- 页面模块源码目录
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
加载代码只要放在主模板里即可，至于页面调用哪个模块，则根据你所使用的后端模板来实现，如定义一个变量指明模块id，然后在主模板里引用，或是通过url判断等方法。本实例的3个页面模块虽然都是完整的html，但还是遵循后端模板的方式，加载代码除了模块id不一样，其他都是一致的。

模块id前的 `(seajs.production ? 'dist/' : '')` 这一判断，是用来区分开发模式和生产模式，并且去缓存机制也跟这个有关，下面会说明。至于如何区分或切换开发、生产模式，不仅限于前端实现，可能还要依赖后端的一些实现，特别是涉及到静态资源服务器的情况，因涉及到不同的后端平台，这里就不展开了。下面是首页加载代码：

````
<script src="/static/seajs/sea.js"></script>
<script src="/static/seajs-config.js"></script>
<script>
    seajs.use((seajs.production ? 'dist/' : '') + 'page/index', function(m) {
        $(function(){m.init()})
    })
</script>
````
## 构建过程

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
    "grunt-contrib-handlebars": "~0.6.0", // handlebars预编译
    "grunt-cmd-handlebars": "~0.1.2",    // 封装handlebars预编译js为 cmd 模块
    "grunt-contrib-clean": "~0.5.0", // 清除文件
    "grunt-contrib-watch": "~0.5.3",  // 文件更改监控 预编译
    "grunt-contrib-connect": "~0.7.1" // web服务 实例演示用
}
````
依赖插件可根据自己项目实际需要进行配置，本方案必要的插件为 grunt-sea-hashmap 和 grunt-cmd-transport.

### 页面模块去缓存(grunt-sea-hashmap)
页面模块去缓存应该算是本方案的一个特色，在这里首先感谢一下 @edokeh ，从他的 [spm-chaos-build](https://github.com/edokeh/spm-chaos-build) 方案里借鉴了用文件hash映射来去除模块文件缓存的方式，尽管实现细节略有不同。主要原理是每次修改完模块代码后，先对其进行一下校验和，得出MD5，然后在 seajs-config 中生成以下映射表，插入到 seajs.config 的 map 配置列表中，这样当在生产环境下（seajs.production = true），seajs会去加载添加了hash后缀的文件，从而有效的去除文件缓存，而且不需手动指定版本号，省心省力。
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
实现这一步骤主要是用到了 [grunt-sea-hashmap](https://github.com/xsbear/grunt-sea-hashmap) 插件，具体配置参数和使用方法可以参见该项目主页，这里以方案实例为例，列一下配置：
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
关于 `build_dest` 配置：该插件生成一个 hash map 表到 seajs-config.js 中, 并根据新旧map对比，将有改变的模块文件复制到 build_dest 指定的目录中，这样在后续构建中只需构建有更改的模块，不需要全部构建。但这里有个小trick，下面的transport过程会提到。如果出于某些原因想重新构建某个或全部模块，无论是否有更改，只要移除 map 表中一项、修改hash值，或是删除整个map表都可以实现。

#### 注意事项
由于插件需要读取旧的hashmap表，这是通过匹配特定字符得到的，所以 seajs-config.js 中 `/*map start*/` 和 `/*map end*/` 注释字符请不要移除或修改，否则会产生错误。当然你也可以通过 `MAP_BLOCK_RE` 和 `MAP_FILE_RE` 选项来自定义。

### 缺陷
如果看过 seajs 源码的用户可能会意识到 hashmap 去缓存的方式存在一个缺陷，那就是无法使用 seajs-debug 插件进行在线映射本地文件调试，因为 seajs config.map 方法只会对第一个匹配生效，而这里第一个匹配已被 hashmap 占据，所以无法使用本地映射进行调试。目前还没有什么解决方案，如果介意这一点的话，那本方案就不适用了。至少在自己的项目经历中，这个需求还是比较少的，还可以忍受。


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
其中 files 配置里的 `filter` 选项，就是上面所说的小trick。由于在 transport 时会寻找依赖模块，而页面模块一般都有对同级模块的相对引用，所以transport的files配置还是page目录，但通过 filter 选项，用于与 grunt-sea-hashmap 生成的变动模块文件对比，从而只对变动模块文件进行 transport，可以减少构建量。这只是一个小技巧，如果你不介意全量构建，也可以不配置 filter，同时也可省略 grunt-sea-hasmap 的 `build_dest `选项。

### handlebars 模块构建
下面说一下 handlebars 模块的构建，包括开发阶段的预编译，cmd模块封装。

#### 模板预编译
使用 grunt 官方提供的 [grunt-contrib-handlebars](https://github.com/gruntjs/grunt-contrib-handlebars) 插件，可以将多个模板文件编译成一个js文件，并且支持子模板(模板文件名以下划线"_"开头)， 可配置的选项：
* namespace: 预编译模板方法集合对象名
* processName: 可以配置自定义的handlebars模板文件名后缀

````
handlebars: {
  options: {
    namespace: 'HBSTPL',
    processName: function(filePath) {
      return filePath.replace(/^templates\//, '').replace(/\.hbs$/, '');
    }
  },
  all: {
      files: {  // 单个模块引用的模板放在一个目录中，然后编译成单个 js 文件
        "templates/index.js": ["templates/index/*.hbs"],
        "templates/page_1.js": ["templates/page_1/*.hbs"]
      }
  }
}
````

#### cmd 模块封装
handlebars 模板预编译之后不能直接被 seajs 模块使用，还需要封装成 cmd 模块。这里用到另一个插件 [grunt-cmd-handlebars](https://github.com/xsbear/grunt-cmd-handlebars)，配置如下：
````
cmd_handlebars: {
  all: {
    options: {
      handlebars_id: 'handlebars',
      exports: 'this["HBSTPL"]',
    },
    files: {
      src: ['templates/*.js']
    }
  }
}
````
两个选项必须配置：
* handlebars_id: handlebars runtime 模块 id，预编译文件的js方法需要依赖
* exports: cmd 模块输出接口名称， this 内的名称必须与上面`handlebars`任务配置的 `namespace` 选项保持一致

#### 模板文件修改监控
因为是开发阶段就采取预编译，所以需要使用 watch 插件来监控模板文件的变动，并触发 `handlebars` 和 `cmd_handlebars` 任务以实时生成预编译cmd模块。
````
watch: {
  options: {
    atBegin: true // 启动后立即执行触发任务
  },
  handlebars: {
    files: ['templates/*/*.hbs'],
    tasks: ['hbs_dev'] // => grunt.registerTask('hbs_dev', ['handlebars:all', 'cmd_handlebars:all']);
  }
}
````
*开发时，请先执行`grunt:watch`命令，以确保模板改动有效。

### 剩余步骤
构建的最后几个步骤是对文件进行 uglify，具体可以看 Gruntfile 里相关配置，不再展开。不过对于 handlerbars 模块，除了使用 filter 选项进行增量 uglify 外，还需要一个额外步骤，就是需要修改一下模块id，这是因为开发模式与生产模式下模块所在目录不同，id也就不同。在本实例里，将构建后模块放在 dist 目录中，所以需要在 id 前加上`dist/`，这里是通过在 Gruntfile 中定义了一个`disthbs`的任务并调用，原理很简单，无非就是替换字符串。如果你的项目构建后模块放在其他地方，请根据实际情况处理。

至此，对于页面相关模块的构建已经完成了，但还有一件事不要忘了，就是 `seajs.production`。这里向 seajs 借用的一个属性，我们需要在不同模式下进行切换，在开发时，需要将值置为`false`，页面加载的是原始模块；而生产模式下则置为`true`，页面加载的是`dist`目录下的已构建模块，并且启用 hashmap 表映射。对于这个，实例提供了一个任务：`mode`，分别执行
`grunt:dev`和`grunt:prd`可在两个模式下进行切换。不过，光更改 production 值有点大材小用了，这里还加入了一些额外的处理，比如开发模式下，会在页面左上角打上一个水印，用于提示，另外还同时启用了 watch 任务。切换为生产模式，则将水印移除，production 值置为`true`。

在 Gruntfile 里还有一个任务: `hashres`，主要是对html里引用的script css文件加上hash后缀，比较简单的做到了资源文件去缓存，当然不是很全面，比如还可以加上图片等资源文件。这个可以自由扩展，或者使用现成的插件，总之利用 grunt 可以做很多事情。

以上这些小任务是自己在项目中经常用到的，并不限于本方案，读者也可以自行选择是否采用。

## 开发流程
最后简单列一下本方案常规的开发流程：
1. 准备好 seajs lib库 css 等前端文件
2. 创建或从本实例中复制 Gruntfile.js package.json seajs-config.js，并根据项目实际情况进行配置
3. 开始开发，运行`grunt:dev`，如果后续开发，可以只运行`grunt:watch`(如使用了handlebars)，另外实例的 Gruntfile 中最后还配置了几个不同的快捷任务组合，根据需要可以单独运行相关任务
4. 开发完成后，运行默认任务`grunt`，即可完成所有构建步骤；如果项目文件没改动，可以运行`grunt:prd`切换回生产模式。

## 总结
以上就是该自定义构建方案的所有内容，有点多，如果抛开 handlebars 模块，核心的构建过程其实也不多。方案还存在不少缺陷，除了不能在线调试之外，还有针对远程静态文件服务器的调试、部署这一环也没有什么实践方案，还需要完善。至于对方案有什么问题或建议， 请发issue提问。还有方案相关的两个 grunt 插件在这里：
* [grunt-sea-hashmap](https://github.com/xsbear/grunt-sea-hashmap)
* [grunt-cmd-handlebars](https://github.com/xsbear/grunt-cmd-handlebars)