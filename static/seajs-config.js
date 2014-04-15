/*map start*/
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
	[
		"page/page_1.js",
		"page/page_1.js?8ef48fa79941f1f7446bf1c82da74bbf"
	],
	[
		"templates/index.js",
		"templates/index.js?163de5709bd1d5dfda7f45552c337f0b"
	],
	[
		"templates/page_1.js",
		"templates/page_1.js?2c3d9a17222a42716ae0a23edf13b914"
	],
	[
		"page/page_2.js",
		"page/page_2.js?40f1239c3f4deafe05b1560619da7be8"
	]
]
    });
}
/*map end*/
seajs.config({
  // Configure alias
  alias: {
    'es5-safe': 'lib/es5-safe.js',
    'json': 'lib/json2.js',
    'jquery': 'lib/jquery/1.8.3/jquery.min',
    'handlebars': 'lib/handlebars/1.3.1/runtime'
  },

  preload: [
    Function.prototype.bind ? '' : 'es5-safe',
    this.JSON ? '' : 'json',
    'jquery',
  ]
});