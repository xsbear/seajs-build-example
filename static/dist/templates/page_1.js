/*! seajs-build-example - v1.0.1 - 2014-04-15 */
define("dist/templates/page_1.js",["handlebars"],function(a){var b=a("handlebars");return this.MMTPL=this.MMTPL||{},b.registerPartial("time",b.template(function(a,b,c,d,e){this.compilerInfo=[4,">= 1.0.0"],c=this.merge(c,a.helpers),e=e||{};var f,g="",h="function",i=this.escapeExpression;return(f=c.hour)?f=f.call(b,{hash:{},data:e}):(f=b&&b.hour,f=typeof f===h?f.call(b,{hash:{},data:e}):f),g+=i(f)+":",(f=c.minute)?f=f.call(b,{hash:{},data:e}):(f=b&&b.minute,f=typeof f===h?f.call(b,{hash:{},data:e}):f),g+=i(f)+":",(f=c.second)?f=f.call(b,{hash:{},data:e}):(f=b&&b.second,f=typeof f===h?f.call(b,{hash:{},data:e}):f),g+=i(f)})),this.MMTPL["page_1/now"]=b.template(function(a,b,c,d,e){this.compilerInfo=[4,">= 1.0.0"],c=this.merge(c,a.helpers),d=this.merge(d,a.partials),e=e||{};var f,g="",h="function",i=this.escapeExpression,j=this;return g+="<p>\n    现在是 ",(f=c.year)?f=f.call(b,{hash:{},data:e}):(f=b&&b.year,f=typeof f===h?f.call(b,{hash:{},data:e}):f),g+=i(f)+"-",(f=c.month)?f=f.call(b,{hash:{},data:e}):(f=b&&b.month,f=typeof f===h?f.call(b,{hash:{},data:e}):f),g+=i(f)+"-",(f=c.date)?f=f.call(b,{hash:{},data:e}):(f=b&&b.date,f=typeof f===h?f.call(b,{hash:{},data:e}):f),g+=i(f)+' <span class="clock">',f=j.invokePartial(d.time,"time",b,c,d,e),(f||0===f)&&(g+=f),g+="</span>\n</p>"}),this.MMTPL});