### 2021.11.01

#### babel的作用

```
babel是一个工具链，主要将我们业务里面使用的ES6\ES7\ES8等等语法来编写的代码转换为向后兼容的javascript语法，比如转换成ES5
	1. 语法转换
	2. 通过垫片（polyfill）方式在目标环境中添加缺失的特性（比如babel-core负责转换语法部分，但是api未转换，此时我们就需要引入第三方polyfill模块，比如core-js）
	3. 源码转换
通俗点就是比如ES6+的语法转换（如使用箭头函数->普通函数，let,const->var）
比如ES6+的新方法转换（如使用Array.includes等）
```

#### babel7变更

```js
在早期babel6时期，我们经常使用babel-cli这类库（中间使用短线连接），但是到了babel7之后，我们所需要的所有babel模块都是作为独立的npm包发布的，都是以"@babel/xxx"来命名。
```

#### 核心库(@babel/core)

```js
babel这个工具的核心功能包含在"@babel/core"这个模块中，意味着我们必须安装，但不需要最后打包进bundle,只是在开发下帮我们转换，即：
npm install @babel/core -D
```

#### 命令行工具(@babel/cli)

```js
它就是一个能够从终端（命令行）使用的工具，类似webpack-cli等等，一般独立转换需要安装，通常在业务中我们都是搭配webpack来进行执行，所以这个工具对项目来说我理解可安可不安，但是不确定webpack或者其他依赖babel的库是否依赖@babel/cli，官网也建议安装在本地项目中，即：
npm install @babel/cli -D
```

在我们大多数的项目中，经常看到对babel的配置一般可以写在：

1. 写在babel-loader的options中，进行配置

   ```json
   {
   	test:/\.js$/i,
       loader:'babel-loader',
       options:{
           presets:[],
           plugins:[]
       }
   }
   ```

2. 项目范围的配置（project-wide-config）

   ```js
   这是babel7.x新配置方式，推荐使用 babel.config.json(.js,.cjs,.mjs)具体内部根据后缀名的对应方式书写，比如.cjs就是个module.exports,.json就是个json格式等等
   它是项目的根配置，具体看文档描述
   ```

 3. 文件关联配置（file-relative-config）

    ```js
    推荐使用.babelrc(.babelrc.json)\(.js,.cjs,.mjs)
    或者package.json中的bebel关键字配置
    ```

​    具体可以看https://github.com/willson-wang/Blog/issues/100

​    总结来说就是独立项目（非menorepo）下我们在项目根目录下配置一个根目录配置，如babel.config.json(.js,.cjs,.mjs)

​	若是一个lerna menorepo项目，也同样在根目录下babel.config.json(.js,.cjs,.mjs)，子项目可以使用.babelrc指定编译

而这些配置项中，最常见的就是两个配置"preset"&"plugins"

#### preset（预设）- 插件集合

```js
1. 最初我们都是通过安装plugins来解决翻译，比如@babel/plugin-transform-arrow-functions这个插件就是让我们写的箭头函数翻译为普通函数，但是若其中我们使用了let,const等新语法并未给我们转换，babel奉行一个插件做一个事，这样的话，es6+新增的东西太多了，岂不是需要一个一个插件的引用？
2. 因此babel提出了preset（预设）-它是一类插件的集合，等于说安装它一个就不需要安装其他相同类型的插件了
3. 即官网提供了常用了环境一些预设preset，如：
	3.1 @babel/preset-env（转换ES6+的语法，注意是语法！！！）
	3.2 @babel/preset-typescript（转换TS）
	3.3 @babel/preset-react（转换React）
	3.4 @babel/preset-flow（转换Flow）
```

```js
4. 如何设置preset(首先preset是一个数组格式)
	{
        // 4.1 字符串配置（外层数组包裹）
    	"preset":["@babel/preset-env"]
        // 4.2 数组字符串配置（（外层数组包裹））
        "preset":[
            ["@babel/preset-env"]
        ]
        // 4.3 数组第0个参数是插件，第1个是配置项（外层数组包裹）
        "preset":[
            [
                "@babel/preset-env",
                {
                   "modules": false
                }
            ]
        ]
    }
	同时@babel/preset-env 是根据浏览器的不同版本中缺失的功能确定代码转换规则的，在配置的时候我们只用配置需要支持的浏览器版本就好了，@babel/preset-env 会根据目标浏览器生成对应的插件列表然后进行编译，如：
    presets: [
       ["@babel/preset-env", {
         targets: {
           browsers: ["last 10 versions", "ie >= 9"]
         }
       }],
    ],
```

```js
5. preset解析顺序
	preset顺序是从后往前的，如：
    {
        "preset":["@babel/preset-env", "@babel/preset-react"]
    }
将按如下顺序执行： 首先是 @babel/preset-react，然后是 @babel/preset-env。
```

刚刚我们利用了@babel/preset-env解决了ES6+的语法问题，但实际中我们可能需要使用ES6+的新方法，那么此时@babel/preset-env不能解析，它只负责解析语法，因为babel将js语法分为了：

​		syntax（类似箭头函数、let、const、class 等**在 JavaScript 运行时无法重写的部**分，就是 syntax 句法）

​		api（类似 Promise、includes 等**可以通过函数重新覆盖的语法**都可以归类为 api 方法）

因此，针对这种情况，社区提出了使用polyfill垫片解决

##### 实验1（通过@babel/core @babel/preset-env）

```js
npm install @babel/core @babel/preset-env -D
// src/index.js
const fn = () => console.log(1);
fn();
const pro = new Promise()
const isIncludes = [1, 2, 3].includes(2)
// babel.config.json
{
  "plugins":[],
  "presets":[
    "@babel/preset-env"
  ]
}

// bundle.js
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
var fn = function fn() {
  return console.log(1);
};

fn();
var pro = new Promise();
var isIncludes = [1, 2, 3].includes(2);
/******/ })()
;
// 结论
可以看出@babel/preset-env在语法上将const/let -》var，将箭头函数转换成了普通函数，而Promise和includes没转换
```

#### @babel/polyfill

```js
1. 作用：Babel默认只转换新的javascript语法，而不转换新的API，比如 Iterator, Generator, Set, Maps, Proxy, Reflect,Symbol,Promise 等全局对象。以及一些在全局对象上的方法(比如 Object.assign)都不会转码。
比如说，ES6在Array对象上新增了Array.form方法，即当运行环境中并没有实现的一些方法，babel-polyfill会做兼容。

2. 原理：通过向全局对象和内置对象的prototype上添加方法来实现的。比如运行环境中不支持Array.prototype.find 方法。

3. 缺点：就是会造成全局空间污染
```

```js
1. @babel/polyfill由"core-js"和"regenerator-runtime/runtime"两部分组成，其中
	"core-js"：解决 promise 和 includes 相关的垫片
    "regenerator-runtime/runtime"：解决await/async和Generator相关的垫片
2. 依赖安装
	npm i @babel/polyfill -S（需要安装到dependencies）
3. 搭配使用
	3.1 在我们的入口文件中，还必须引入import "@babel/polyfill"（早期）而在babel7.4之后废弃了该直接引入方式，转而必须显式的引入两个依赖库
    import 'core-js'
	import 'regenerator-runtime/runtime'
	3.2 同时需要搭配@babel/preset-env这个preset使用，提供了"corejs"和"useBuiltIns"两个配置项
    	3.2.1 corejs：默认不设置则为corejs2，有些特性并不包含在2中，因此官方推荐设置为3版本
        3.2.2 useBuiltIns：转换方式设置
        	3.2.2.1 false：默认值。不转化 api，只转化 syntax
            3.2.2.2 usage - 转化源码里用到的 api
            3.2.2.3 entry - 转化所有的 api
        根据官方文档中，针对useBuiltIns设置描述，跟我上面3.1有点冲突，设置成"false"时：需要在webpack的entry设置@babel/polyfill独立打包；设置成"usage"时：则不需要在webpack中配置；
   设置成"entry"：则需要显示在入口文件顶部引入polyfill   
 
4. 总结来说@babel/polyfill需要与@babel/preset-env的options搭配使用,常用的配置如下，具体可以看文档：
	{
        "preset":[
            ["@babel/preset-env",{
                corejs:3 // 设置polyfill核心版本 或者"3.8.2"最好指定特定版本 不然设置3就默认为"3.0"
                useBuiltIns:'usage' // 设置转换方式
                target:{
                	browsers: ["last 10 versions", "ie >= 9"]
            	} // 设置目标浏览器以减少兼容代码处理避免过多引入hack代码数量
            	modules: false // 默认是auto，在设置false情况下，可能有利于进行tree shaking
            	shippedProposal:true // 当‘usage’时需要设置该项为true
            }]
        ]
    }
	这里我们指定了corejs@3,那么必须安装依赖
	npm install core-js -S
	npm uninstall @babel/ployfill
	安装完后，我们就可以不需要@babel/polyfill了，也不需要在任何位置引入了，若我们没有对@babel/preset-env设置options时，那么我们想ployfill就只有按上面的显式引入
```

##### 实验2(加入@babel/polyfill)

```js
npm install @babel/polyfill -S
// src/index.js
import 'core-js';
import 'regenerator-runtime/runtime';
import './b'
const fn = () => console.log(1);
fn();
const pro = new Promise();
const isIncludes = [1, 2, 3].includes(2);
class A {}
// src/b.js
export default class B {}

// bundle.js
引入core-js 导入了./node_modules/core-js/modules/全量包（没用到也导入）；
引入regenerator-runtime/runtime 导入了很多没使用的runtime代码；
针对_classCallCheck这个hack函数分别在两个模块里面都声明了，造成浪费，并未提为公共。

// 结论
重复引入；全量引入，造成Bundle过大
```

##### 实验3(卸载@babel/polyfill，加入core-js更改preset-env配置)

```js
npm uninstall @babel/polyfill
npm install core-js -S
// babel.config.json
{
  "plugins":[],
  "presets":[
    [
      "@babel/preset-env",{
        "useBuiltIns":"usage",
        "corejs":"3.19.0",
        "targets": {
          "browsers": ["last 10 versions", "ie >= 9"]
        }
      }
    ]
  ]
}
// bundle.js
发现跟polyfill方式差不多，效果不理想
// 结论
但是省去了我们手动在入口文件引入
```

基于polyfill的弊端，社区又推出了@babel/runtime插件

#### @babel/runtime配合babel-plugin-transform-runtime

```js
1. @babel/runtime：它是将es6编译成es5去执行。我们使用es6的语法来编写，最终会通过babel-runtime编译成es5.也就是说，不管浏览器是否支持ES6，只要是ES6的语法，它都会进行转码成ES5.所以就有很多冗余的代码。它不会污染全局对象和内置对象的原型，比如说我们需要Promise，我们只需要import Promise from 'babel-runtime/core-js/promise'即可，这样不仅避免污染全局对象，而且可以减少不必要的代码。
2. babel-plugin-transform-runtime：它就可以帮助我们去避免手动引入 import的痛苦，并且它还做了公用方法的抽离。比如说我们有100个模块都使用promise，但是promise的polyfill仅仅存在1份。
```

```js
注意：@babel/runtime是为了替换@babel/polyfill 全量引入及全局变量覆盖引入，即需要安装-S
	 babel-plugin-transform-runtime插件是为了提取公共部分的runtime代码，编译阶段-D
npm install @babel/runtime -S
npm install babel-plugin-transform-runtime -D
```

##### 实验4(安装@babel/runtime及babel-plugin-transform-runtime)

```js
// webpack.config.js
rules:[
	{
		test:/\.js$/,
		use:'babel-loader',
		exclude:'/node_modules/' // 注意此处
	}
]
// src/index.js
const fn = () => console.log(1);
fn();
Promise.resolve().then(() => {
  console.log(123123)
})
const isIncludes = [1, 2, 3].includes(2);
console.log(isIncludes)
class A {}
// babel.config.json
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime"
    ]
  ],
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "shippedProposals": true,
        "corejs": {
          "version": "3.19.0",
          "proposals": true
        },
        "targets": {
          "browsers": ["ie >= 9", "android >= 4", "ios >= 9", "and_uc >= 10"]
        },
        "modules": false
      }
    ]
  ]
}

// 打包后 
在vendor.js中明显的看到引入了很多core-js里面的东西，在作polyfill
源文件中的let -》 var, 箭头函数 -》普通函数 ，class类 -》_classCallCheck()，Promise跟includes没变化
但是加载报错：ES Modules may not assign module.exports or exports.*, Use ESM export syntax
// 结论
看起来像是esmodule跟commonjs不兼容的问题，也是找了很久发现有人提出了在我们的babel-loader配置exclude时，大多数我们都是
exclude:'/node_modules/'这样配置，需要改成：

// webpack.config.js
rules:[
	{
		test:/\.js$/,
		use:'babel-loader',
		exclude:'/node_modules[\\\/]core-js/' // 注意此处
	}
]
改成这样后，打包成功在google下面跑起来了，但是当我放到IE里面时，居然报错，跑不起来，明明我们设置了browsers ie9兼容，此时我还是以为是babel没处理好编译，结果一直搜索babel转译的问题，直到我想起来我是webpack5最新版本，然后就去了webpack官网配置项查看，终于还是发现了target这个选项，不设置的话，默认webpack5转换成'web'我认为它是现代浏览器适合的Bundle，所以更改了:
// webpack.config.js
module:{
    rules:[
        {
            test:/\.js$/,
            use:'babel-loader',
            exclude:'/node_modules[\\\/]core-js/' // 注意此处
        }
    ]
},
target:['web','es5']
意思就是让webpack根据我们的target最终打包的目标环境，这里多了个es5，意思打包成web和es5相互结合，具体看文档。最终打包后的包同时跑在google和Ie9上面了，嘻嘻嘻！
```

##### 实验5(使用@babel/runtime-corejs3及babel-plugin-transform-runtime)

```js
在查找上一个实验过程中，顺便也看到了另一种关于加载polyfill的方式，此时我们
npm uninstall @babel/runtime
npm install @babel/runtime-corejs3
// babel.config.json
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",{
          "corejs":{
              "version":3,
          		"proposals": true
          }
      }
    ]
  ],
  "presets": [
    [
      "@babel/preset-env",
      {
        // "useBuiltIns": "usage",
        // "shippedProposals": true,
        // "corejs": {
        //  "version": "3.19.0",
        //  "proposals": true
        // },
        "targets": {
          "browsers": ["ie >= 9", "android >= 4", "ios >= 9", "and_uc >= 10"]
        },
        "modules": false
      }
    ]
  ]
}
// webpack.config.js
module:{
    rules:[
        {
            test:/\.js$/,
            use:'babel-loader',
            exclude:'/node_modules[\\\/]core-js/' // 注意此处
        }
    ]
},
target:['web','es5']

// 结论
能同时跑起两个浏览器，但是我发现polyfill的包比实验4中的包大，因此更推荐上面的配置方式
```

#### 最终完整配置（时刻关注babel和webpack官网最新细节，有时真很影响！！）

```js
// package.json
npm i @babel-core @babel-cli @babel/plugin-transform-runtime @babel/preset-env babel-loader -D
npm i @babel/runtime core-js -S
```

```js
// babel.config.json
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime"
    ]
  ],
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "shippedProposals": true,
        "corejs": {
          "version": "3.19.0",
          "proposals": true
        },
        "targets": {
          "browsers": ["ie >= 9", "android >= 4", "ios >= 9", "and_uc >= 10"]
        },
        "modules": false
      }
    ]
  ]
}
其中的target可以分离出来到package.json或者.browserslistrc中或者babel-loader的options中
```

```js
// webpack.config.js
module:{
    rules:[
        {
            test:/\.js$/,
            use:'babel-loader',
            exclude:'/node_modules[\\\/]core-js/' // 注意此处
        }
    ]
},
target:['web','es5']
```

##### 参考连接

[1]: https://juejin.cn/post/6844904132294213639#heading-14
[2]: https://www.cnblogs.com/ranyonsue/p/14685993.html
[3]: https://juejin.cn/post/6946024729526403108#heading-0

### 2021.11.02完结
