#### 1. 工程化发展

```js
npm scripts
	-> Grunt
		-> Gulp
			-> Fis3
				-> webpack(RollUp&vite)
```

#### 2. 起步webpack

```js
1. webpack已经发布到5了，但整体配置思路没变化，新建空文件夹
	"执行npm init -y" 初始化npm info 生成package.json文件
	"npm i webpack webpack-cli -D"
开箱情况下：
	webpack默认入口文件读取当前目录下的src/index.js
	默认打包后生成dist文件夹
    即我们大多数需要自有配置根目录下建webpack.config.js文件，当执行webpack时自动会加载webpack.config.js文件作为配置
	"npx webpack --config webpack.config.js"我们会经常在scripts脚本里面看到有这样的命令，其实就是为了我们多环境打包分别执行某个webpack配置文件
```

```js
2. 搞懂基础配置项
	在webpack.config.js配置中，我们采用CommonJS规范书写代码，比如使用require()加载模块，使用module.exports导出模块
	const path = require('path')
    module.exports = {
        entry:'./src/index.js',
        output:{
            filename:'main.js',
            path:path.resolve(__dirname,'dist')
        }
    }
当我们使用独立配置文件时，按上面的配置也可以到达webpack开箱基础默认配置打包，即入口在src/index.js，出口文件为main.js，路径是当前配置文件目录下的dist目录下。
```

#### 3. 资源管理

```js
1. webpack默认只对js进行解析处理，所以其他资源需要我们来配置管理，比如当我们引入css文件时、引入图片时、引入字体等，这里就引出了loader的概念，loader就是在webpack进行打包时，针对匹配到的文件执行一系列的操作最终打包的结果被浏览器所接受
	
	关于loader的配置项，在module的rules下面，针对每个正则项对象配置,使用test正则匹配文件；使用use来表明所需要的loader集合，同时需要安装开发依赖loader模块
```

```js
npm i style-loader css-loader -D
2. css资源引入
	module.exports = {
        entry:'./src/index.js',
        output:{
            filename:'main.js',
            path:path.resolve(__dirname,'dist')
        },
        module:{
            rules:[
                {
                    test:/\.css$/i,
                    use:['style-loader','css-loader']
                }
            ]
        }
    }
loader配置方式：
	2.1 在早期的版本中，可以给loader使用URL querystring模式传值，比如  use:['style-loader','css-loader?minimize']
	2.2 或者更细致化配置某个loader,比如
	use:['style-loader',{
        loader:'css-loader',
        options:{
            minimize:true
        }
    }]
当然上述的方式具体需要看当前loader是否支持及推荐的配置方式。
```

```js
3. 图片及字体资源
	当我们在css里面使用background-url来加载图片资源时，css-loader会帮我们处理图片资源，此时不需要引入其他配置。但是当我们在js文件中使用import xxx from 'xxx.png'来使用时，此时webpack会不认识.png无法解析，因此我们需要继续配置图片资源
	modules:{
        rules:[
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
        		type: 'asset/resource',
            }
        ]
    }
loader配置方式：
	3.1 在早期的版本中，我们经常使用url-loader处理图片，比如：
		use:[{
            loader:'url-loader',
            options:{
                limit:2048,
                outputPath:'assets/images',
                publicPath:'/assets/images'
            }
        }]

	3.2 而现在webpack5,提出了资源模块概念，它允许使用资源文件（字体，图标）而无需配置额外的loader，之前比如：
	raw-loader: 将文件导入为字符串
    url-loader: 将文件作为data URI内联到bundle中
    file-loader: 将文件发送到输出目录
而现在可以以type为key值的这样设置它的value值，比如：
	"asset/resource" 发送一个单独的文件并导出 URL。之前通过使用 file-loader 实现。
	"asset/inline" 导出一个资源的 data URI。之前通过使用 url-loader 实现。
	"asset/source" 导出资源的源代码。之前通过使用 raw-loader 实现。
	"asset" 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 url-loader，并且配置资源体积限制实现。
	"javascript/auto" 这种使用在我们的老项目中，比如想停止使用url-loader来解析

	3.3	当我们在使用"asset/resource"或者"asset"类型下，想指定输出文件的名字和目录时，可以通过在
    output:{
		assetModuleFilename: 'images/[hash][ext][query]'
    }
	这样或在dist中的images文件夹下输出我们的图片资源，或者配置
    {
        test:/\.html/,
        type: 'asset/resource',
        generator: {
            filename: 'static/[hash][ext][query]'
        }
    }
	这样也会在dist中输出static目录下文件
    
    3.4 早期我们通过url-loader配置limit限制在指定大小下使用base64编码输出data URI；而现在同样可以通过type:'asset/inline'实现，webpack5默认使用base64编码文件内容，比如
    const svgToMiniDataURI = require('mini-svg-data-uri');	
	{
       test: /\.svg/,
       type: 'asset/inline',
       generator: {
         dataUrl: content => {
           content = content.toString();
           return svgToMiniDataURI(content);
         }
       }
    }
	这样就使用三方插件进行编码内容。
    
    3.5 在我们配置为通用资源时，如type:'asset'时同样可以通过配置项来指定到底是使用inline模式还是resource模式，比如
    {
        test: /\.txt/,
        type: 'asset',
        parser: {
            dataUrlCondition: {
                maxSize: 4 * 1024 // 4kb
            }
        }
     }
	这样小于4kb会使用inline输出，大于的输出文件。
```

```
4. 其他资源比如JSON,CSV,TSV,XML等
	4.1 默认情况下Node原生支持.json,.node文件，所以不需配置
	4.2 其他类似资源 同样需要loader来解析，如
	npm i xml-loader -D
	{
        test: /\.xml$/i,
        use: ['xml-loader'],
    }
    
    4.3 自定义JSON模块，如toml,yamljs,json5等
    npm install json5 -D
    const json5 = require('json5');
    {
        test: /\.json5$/i,
        type: 'json',
        parser: {
          parse: json5.parse,
        },
    }
    通过parser配置项来配置对应的解析模块
```

变更配置项：

​	针对资源，推荐使用type:'xxx'来配置，以替代早期的loader单独设置

#### 4. 管理输出

```js
1. 自动生成index.html文件
	这点早期也是使用'html-webpack-plugin'插件来自动构建，现在依然推荐使用，这里就引出了plugins的配置项
    npm i html-webpack-plugin -D
	const HtmlWebpackPlugin = require('html-webpack-plugin');
	plugins:[
       new HtmlWebpackPlugin({
      	title:'test'
    	}) 
    ]
	这样我们每次打包都会自动生成title为“test”的index.html，且将我们打包最终bundle.js也自动引入，更多具体配置可以到这个插件的官网查看

2. 自动清理构建文件夹
	这点早期我们使用的是"clean-webpack-plugin"这个插件来实现，每次打包都会清除我们的目的打包文件夹，但现在webpack5直接在output中设置即可
    output:{
        filename:'main.js',
        path:path.resolve(__dirname,'dist'),
        clean:true
    }
```

#### 5. 开发环境

```js
1. source map

2. 开发工具
	每次我们变更了文件，都会手动的进行打包来获取最新的bundle，效率低下，因此我们需要更自动化的工具
	2.1 watch mode（观察&监听）
		通常，我们会在package.json的scripts脚本中增加我们所需要的命令，比如此时就需要加入watch模式
		{
            "watch":"webpack --watch"
        }
	这样设置后，我们允许npm run watch，webpack就会监听我们的依赖，当依赖改变时会自动的给我们打包。
    但是这个工具太局限了，及时更新了bundle但是我们仍需要手动刷新浏览器
    
    2.2 webpack-dev-server
		早期，同样使用该工具来实现本地web server托管
        npm install --save-dev webpack-dev-server
		devServer:{
            static:"./dist"
        }
		{
            "start": "webpack serve --open",
        }
    这里先设置devServer的static是为了指定我们将哪个静态文件托管到本地webServer上面，设置scripts中的命令为了快速开启--open表示启动完自动打开浏览器页签加载我们的静态文件
    
    2.3 webpack-dev-middleware
        早期，同样使用该中间件且配合"express"或者"koa"来更细节的控制我们的本地server
        npm install --save-dev express webpack-dev-middleware
        const app = express();
        const config = require('./webpack.config.js');
        const compiler = webpack(config); 
        app.use(
          webpackDevMiddleware(compiler, {
            publicPath: config.output.publicPath,
          })
        );
        在使用这种模式时，特别需要主要关于输出文件的publicPath配置才能更好的映射到你的express或者koa服务器上。    
```

#### 6. 代码分离

```js
代码分离到不同的bundle中，然后可以按需加载或者并行加载这些文件，获取更小的bundle，常用的分离方式有3种：

1. 入口起点：使用entry配置手动分离代码
	我们经常配置单页面应用的时候，如：
    {
        entry:'./src/index.js'
    }
	当配置多页面或者多入口时
    {
        entry:{
            index:'./src/index.js',
            main:'./src/main.js'
        }，
        output:{
            filename:'[name].bundle.js'
        }
    }
 	这样webpack在打包过后，会生成两个bundle，这样我们就分离了代码。
    但是，这种方式缺点主要有2个：
    	1.1 如果配置的入口文件之间有公共的重复的模块，则这些模块都会同时打到这两个bundle里面
        1.2 方法不灵活，太死板，不能动态分离

2.  防止重复：使用entry其他配置项或者SplitChunksPlugin去重和分离chunk
	2.1 {
        entry:{
            index:{
                import:'./src/index.js',
                dependOn:'shared'
            },
            anther:{
                import:'./src/anther.js',
                dependOn:'shared'
            },
            shared:'loadsh'
        }
    }
	这样webpack会独立打包出loadsh这个公共模块chunk，但是当我们在一个index.html上面使用多入口时，还需要配置一项
	{
      optimization: {
        runtimeChunk: 'single',
      },
    }
    这样还会再打出一个独立的chunk包 runtime
    2.2 使用splitChunksPlugin插件，貌似在早期的时候这个是个独立的插件引入，后面webpack把它内置了，即需要在optimization（中文理解成“优化”）下配置，如：
    optimization: {
     splitChunks: {
       chunks: 'all',
     },
   },
   同时我们也可以分离出css为独立的文件，使用mini-css-extract-plugin插件
 
3. 动态导入 
	根据新版的EsModule我们使用import()返回一个promise来动态运行时导入模块
    
4. 预加载(preload)和预获取(prefetch)
   这里就涉及到我们浏览器方面的功能，将我们打包的文件使用<link>标签引入，同时rel属性表明它是preload还是prefetch来告知浏览器，属于包后优化手段
   preload(预加载)：当前路由下可能需要的资源（与父chunk并行加载，属于当下时刻）
   prefetch(预获取)：将来某个路由下可能需要的资源（父亲chunk下载完后，在浏览器闲置时刻加载，属于未来时刻）
```

#### 7. 缓存

```js
1. 输出文件名
    初衷就是要求浏览器为我们作缓存，比如：
    当文件未变化时，走缓存；当文件变化时，走获取。若按我们之前的设置在输出口使用文件的名称来定义最后的bundle.js名称，那么若服务器没设置好，很可能走缓存，所以一般我们都会设置出口文件,比如：
    {
        filename:'[contenthash].bundle.js'
    }
    使用文件内容作hash，真实变化后，随时都请求最新文件。
 
2. 提取引导模板
	2.1 文档上说若没改变代码，打包bundle.js的hash值会变，原因是有个webpack运行时的代码在变化(runtime引导模板)
   optimization: {
     runtimeChunk: 'single',
   }
   这样就会多打包出一个runtime的bundle.js
    2.2 通过splitChunks也可以做和早期一样的操作，比如将vue,react等这些不改动的库引用模块，单独提取到vendor chunk里面去，这样在你改本地业务文件的时候，打包它不会变化对应到浏览器里面也就会采用缓存机制加载
    splitChunks: {
        cacheGroups: {
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
            },
        },
    },
	但是后期我们基本上不这样搞，从19年使用dll打包这些库，到后面cdn引入都是解决方案，后面再聊。

3. 模块标识符
	moduleIds: 'deterministic'
        
经过实际测试，发现在webpac5.60.0版本中，不存在2中说的runtime引起每次打包变化，3中的vendor死模块在懂了业务引用后引起变化。
```

#### 8. 创建library

```js
其实这步是针对包作者，比如我要开发一个包，同样以npm webpack起手后，最关键的设置在输出口，比如
	output:{
        library:'xxx'
    }
但是我们只能使用<script src="...xxx.js">引入，而且只能使用window.xxx来调用你的包方法，简而言之就是它只能通过被 script 标签引用而发挥作用，它不能运行在 CommonJS、AMD、Node.js 等环境中。即我们需要再配置，如：
	library: {
      name: 'webpackNumbers', // 表示暴露的接口名称
      type: 'umd', // 通用模块规范
    },
```

#### 9. 环境变量

```js
可以在webpack命令行 设置--env 参数来传入任意数量的环境变量，如:
webpack --env test=123 --config webpack.config.js
但需要注意 一般情况下我们在配置文件中使用module.exports = {}是直接导出一个对象，为了能使用环境变量，此时需要将其改变为一个函数，来返回一个对象
module.exports = env => {
    return {
        // webpack配置项
    }
}
```

#### 10. 构建性能

```js
1. 通用环境
	1.1 更新webpack node npm等基础工具到最新版本
    1.2 将loader工具应用最小数量块，如：
    	{
            test:/\.js$/i,
            loader:'babel-loader',
            includes:path.resolve(__dirname,'src') // 只解析src目录下的js
        }
		或者exclude设置
	1.3 减少extensions数量，我们经常配置extensions里面配置文件后缀解析顺序，如：
    extensions:['.js','.json','.jsx','.ts']等等操作目的就是为了在我们引入文件时，如果不写后缀则webpack按配置的extensions的后缀来找文件，其实这么来看，从我个人看法，除了第一个我们可以不写后缀，其他尽量写，因为后面的都要去找，岂不是都浪费性能？
    如果不使用npm link或者yarn link，这两个意思就是让我们可以跟依赖包进行调试，并没有必要调试，设置resolve.symlinks:false
	
	1.4 dll包，使用DllPlugin插件指定一些固定库打包一起，比如vue,react,loadsh等等，为了就是不让我们每次修改业务后，webpack来打包这些固定文件，但是我觉得这样没啥用，毕竟第一次是要进行的，19年我们项目组就是使用dll打包，后面在搞vue时，一般我都会设置externals,然后在html里面cdn引入这些库。
	1.5 尽量设置splitChunks来分包
    1.6 webpack默认开发环境设置cache:{type:'memory'}或cache:true
	1.7 官网建议去除ProgressPlugin配置，无太大价值

2. 开发环境
	2.1 增量编译：针对使用webpack原配置watch mode来监听文件改动，当监听很多文件时导致cpu负载，可以设置watchOptions.poll设置
	2.2 尽量使用webpack-dev-server&webpack-hot-middleware&webpack-dev-middleware来编译和serve资源
	2.3 根据实际情况合理的设置devtool获取够用的source map
    2.4 避免使用生产环境的工具在开发环境中，比如压缩js，开发环境压缩个毛
    2.5 合理的减少入口chunks大小，webpack提供再从入口chunks里面再分离出一个runtime chunk包，设置
    	optimization: {
            runtimeChunk: true,
        }
    2.6 输出结果不携带路径信息，设置：
    	 output: {
            pathinfo: false,
         }
    2.7 针对ts-loader的优化配置，设置transpileOnly:true，同时使用ForkTsCheckerWebpackPlugin插件来另起进程来检查类型和eslint插入     
```

#### 11. Tree Shaking

```js
tree shaking从webpack4开始支持，它是描述js上下文中未引用的代码，它必须依赖Es6的模块语法即使用export导出模块使用import来导入模块，这里暂时不深入原理分析，基础原理就是基于import,export的静态分析哪些模块被使用，哪些没有被使用。

根据我实际测试，发现
1. 开发环境下：
	使用"sideEffects"和"usedExports"搭配优化，由于真实的tree shaking是需要js压缩插件搭配使用，才发挥最大作用，由webpack标记出哪些模块需要被优化，再由插件进行删除代码。而在开发环境的时候我们没有必要使用js压缩等工具，但是本地开发时，启动本地server，webapck也会自动打包，因此也有必要进行配置
    1.1 当我们在development下，打包，若未使用的模块也会打包到bundle里面
    1.2 development下 配置优化选项：
    	{
            optimization:{
                usedExports: true,
            }
        }
        此时我们发现webpack虽然也将未使用的xxx模块打包进bundle,但是多了一句注释/* unused harmony export xxx */    
    1.3 development下 增加package.json
        {
            "sideEffects": false
        }
        设置这个后，就是告诉webpack当前这个npm包（我们的工程项目，所有代码都无副作用随便清理），但是，只这样设置了后，我们直接引入的css样式文件会被清除（无效果）如：
        import './index.css',所以额外提供了数组设置了
        {
            "sideEffects": ["*.css","./src/xxx.js"] // 过滤掉css 具体某个xxx.js他们是有副作用的
        }或者可以在rules针对css设置 比如：
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader,'css-loader'],
          include: path.resolve(__dirname, 'src'),
          sideEffects:true
        }

2. 生产环境下：
	生产环境下只需要mode:production 其他不用设置即可达到目的。
```

#### 12. 生产环境

```js
1. 合理的配置
	一般将环境分为：通用环境（common）、开发环境（dev）、测试环境（stag）、生产环境（prod）意味着我们可以用4个配置文件分别对应每个环境进行webpack处理，以common为基础，其余在其上进行更多配置项。在这里需要用到webpack-merge这个插件进行扩展:
    webpack.common.js
	webpack.dev.js
	webpack.stag.js
	webpack.prod.js
2. Npm scripts
	为了更好的在每个命令背后加载对应的配置js，也需要我们在命令里面指定配置，比如：
    "dev":"webpack serve --config webpack.dev.js --open"
	"build-stag":"webpack --config webpack.stag.js"
	"build":"webpack --config webpack.prod.js"
3. 指定mode
	同时需要在每个环境下指定mode，这样我们在代码里面使用process.env.NODE_ENV才会对等我们设置的mode，这里测试环境有点特殊，因为mode只有：development&production选项，所以需要具体针对测试环境看怎么具体配置
4. 压缩
	webpack默认生产环境下启动了"TerserPlugin"插件来压缩
5. source map
	针对每个环节设置不通的source map
```

#### 13. 垫片 - Shimming 预置依赖

```js
垫片的概念主要是为了解决有些不规范的库或加载polyfills，个别需要配合ProvidePlugin插件来实现，具体可以参考文档。
```

### webpack编译原理及工作流程

```js
1. 基本概念
	1.1 "enty"：入口，一切从入口开始，比如入口中引用了A.js，A.js中引用了B.js等等，构成了一个完整的依赖关系
	1.2 "module"：一切皆为模块，一个模块对应一个文件，从入口开始“递归”找出所有依赖
    1.3 "chunk"：一个Chunk由多个模块组成，用于代码分割和合并
    1.4 "loader"：将模块内容按照要求转换成新内容
    1.5 "plugin"：webpack构建流程中的特定时机会广播对应的事件，插件可以监听这些事件的发生，在特定时间做对应的事情
    
2. 流出概括
	webpack的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：
    2.1 "初始化参数"：从配置文件(webpack.config.js)和npm scripts（shell）语句中读取与合并的参数，得出最终的参数
    2.2 "开始编译"：用上一步得到的参数初始化Compiler对象，加载所有配置的插件，同故宫执行对象的run方法开始执行编译
    2.3 "确定入口"：根据配置中的entry找出所有的入口文件
    2.4 "编译模块"：从入口文件出发，调用所有配置的loader对模块进行翻译，再找出该模块依赖的模块，再递归本步直到所有入口文件都经过了本步骤的处理
    2.5	"完成模块编译"：在经过上一步使用loader翻译完所有模块后，得到每个模块被翻译后的最终内容及他们之间的依赖关系
    2.6 "输出资源"：根据入口和模块之间的依赖关系，组成一个个包含多个模块的Chunk，再将每个Chunk转换成一个单独的文件加入输出列表中，这步是可以修改输出内容的最后机会
    2.7 "输出完成"：在确定好输出内容后，根据配置确定输出的路径和文件名，将文件的内容写入文件系统中
    在以上的过程中，webpack会在特定的时间点广播特定的事件，插件在监听指定的事件后会执行插件内部的逻辑，并且还可以使用webpack提供的API改变webpack的运行结果

3. 构建过程三大阶段
	3.1 "初始化"：启动构建，读取与合并配置参数，加载plugin，实例化Compiler
    3.2 "编译"：从entry出发，针对每个module串行调用对应的loader去翻译文件的内容，再找到该Module依赖的module，递归的进行编译处理
    3.3 "输出"：将编译后的module组成chunk,再将chunk转换成文件，输出到文件系统中

4. 每个阶段对应的事件
	4.1 初始化：
    	4.1.1 "初始化参数"：从配置文件或者shell语句中读取与合并参数，得出最终的参数，在这个过程中还会执行配置文件中的插件实例化语句new Plugin()
		4.1.2 "实例化Compiler"：用上一步得到的参数初始化Compiler实例，compiler负责文件监听和启动编译，在Compiler实例中包含了完整的webpack配置，全局只有一个compiler实例
        4.1.3 "加载插件"：依次调用插件的apply方法，让插件可以监听后续的所有事件节点，同时向插件传入compiler实例的引用，以方便插件通过compiler调用webpack提供的API
        4.1.4 "environment"：开始应用node.js风格的文件系统到compiler对象，以方便后续的文件寻找和读取
		4.1.5 "entry-option"：读取配置的entrys,为每个entry实例化一个对应的entryPlugin，为后面该entry的递归解析工作做准备
		4.1.6 "after-plugins"：调用完所有内置和配置的插件的apply方法
        4.1.7 "after-resolvers"：根据配置初始化resolver,resolver负责在文件系统中寻找指定路径的文件
	
	4.2 编译阶段：
    	4.2.1 "run" 启动一次新的编译
        4.2.2 "watch-run"：和run类似，区别在于它是在监听模式下启动编译，在这个事件中可以获取是哪些文件发生了变化从而导致重新启动一次新的编译
        4.2.3 "compile"：该事件是为了告诉插件一次新的编译将要启动，同时会给插件带上compiler对象
        4.2.4 "compilation"：当webpack以开发模式运行时，每当检测到文件的变化，便有一次新的Compilation会被创建，一个compilation对象包含了当前的模块资源、编译生成资源、变化的文件。compilation对象也提供了很多事件回调给插件进行扩展
        4.2.5 "make"：一个新的Compilation创建完毕，即将从entry开始读取文件，根据文件的类型和配置的loader对文件进行编译，比那一完后再找出该文件依赖的文件，递归的编译和解析
        4.2.6 "after-compile"：一次Compilation执行完成
        4.2.7 "invalid"：当遇到文件不存在，文件编译错误等异常时会触发该事件，注意该事件不会导致webpack退出
        
        在编译阶段最重要的事件就是compilation，同时在compilation会发生很多小事件，即在4.2.4到4.2.6之间还会发生：
        "build-module"：使用对应的loader去转换一个模块
        "normal-module-loader"：在用loader转换完一个模块后，使用acorn解析转换后的内容，输出对应的AST，以方便webpack在后面对代码进行分析
        "program"：从配置的入口模块开始，分析其AST，当遇到require等导入启动模块的语句时，便将其加入依赖的模块列表中，同时对新找出的依赖模块递归分析，最终找出所有的模块间的依赖关系
        "seal"：所有模块及其一阿里的模块都通过loader转换完成，根据依赖关系开始生成chunk
   
   4.3 输出阶段：
   		4.3.1 "should-emit"：所有需要输出的文件已经生成，询问插件有哪些文件需要输出，有哪些不需要输出
        4.3.2 "emit"：确定好要输出哪些文件后，执行文件输出，可以在这里获取和修改输出的内容
        4.3.3 "after-emit"：文件输出完毕
        4.3.4 "done"：成功完成一次完整的编译和输出流程
        4.3.4 "failed"：如果在编译和输出的流程中遇到异常，导致webpack退出，就会跳转到本步骤，插件可以在本事件中获取具体的错误原因
```

### webpack打包结果分析

```js
// ./src/index.js
import {func1} from '../utils/helper'
function test(){
    console.log(123)
}
test()
console.log(func1(3))
// ./utils/helper.js
export function func1(x){
    return x * x
}
export function func2(x){
    return x * x * x
}
当我们不使用babel来处理js时，就用原生的webpack看下webpack打包出来是什么内容：
	1. 首先它是一个IIFE（立即执行函数）
    2. 有一个__webpack_modules__对象
    	2.1 里面key值是我们文件路径如：这也就是moduleId
            "./src/index.js":...
            "./utils/helper.js":...（注意这里跟我们import的路径不一样都是根目录下的位置）
		2.2 里面value值是一个匿名函数
        	参数（__unused_webpack_module，__webpack_exports__，__webpack_require__）
            函数体是一个eval函数 里面的代码就是我们实际业务代码
    3. 有一个__webpack_module_cache__对象
    4. 有个__webpack_require__(moduleId)函数 这个函数很关键，在浏览器模式下使用了我们在源码中的引入模块等操作
    5. 有一些webpack运行时的IIFE方法（这些代码的作用就是让webpack打包出来的包能完整的执行，里面定义了一些特定的基于__webpack_require__的方法，比如.d/.o/.r/.e）
    6. 最后一个就是启动函数
    	使用__webpack_require__而模块Id就是我们的entry	
```

### 如何自定义loader

```js
1. loader的职责是单一，只需完成既定的转换功能即可
2. 存在多个loader转换一个文件，即需要支持链式顺序执行（从后到前执行），如：
	use:[a-loader,b-loader,c-loader]从c-loader开始解析我们匹配的文件内容，处理完后将"处理结果"传入到下一个loader即b-loader，同理b-loader处理完后传递给a-loader，最后a-loader处理结束将结果返回给webpack
3. 所以在自定义loader编写时，我们只需关心输入和输出即可

4. loader一般都发布到Npm模块即它是一个commonjs规范函数即：
	module.exports = function(source,sourceMap,meta){
        // source：是输入的内容。
		// sourceMap：是可选的。
		// meta：是模块的元数据，也是可选的。 
        // 注意这里必须使用function函数，不可使用箭头函数，因为过程中会用this来访问
        console.log(source)
    }
	
	首先起手一个基本的结构：
    // loaders下面
    	loader-by-self.js
	// src
		index.js
			console.log('hello loader!')
	webpack配置：
    {
        module:{
            rules:[
                {
                    test: /\.js$/,
                    use: "loader-by-self",
                },
            ]
        }，
        resolveLoader: {
            modules: ["./node_modules", "./loaders"], 
        },
    }
    由于我们是在本地情况下调试我们的loader，所以需要额外的配置一个resolveLoader指定找寻loader按node_modules中找，找不到然后到loaders文件夹下找，如果我们发布成了npm包即安装到了node_modules即不需要配置这项
    module.exports = function(source){
        return source.replace(/loader/g,'resolved by loader')
    }
    当我们最后打包的结果里面，console.log就变成了"hello resolved by loader"
    当我们打印source的内容时候 我发现它就是我们文件的String字符串模板，当然可能也是上一个传递过来的Buffer；若我们在index.js里面引用了其他的.js，当前loader会触发2次（具体看实际情况触发次数）

5. 由于loader运行在Nodejs中，所以可以安装各种包来完成你的loader,我们在使用别人的loader时，会发现需要传入一个options配置项，那么如何在我们的loader里面处理options，如：
    当不确定时，我们可以直接打印this，看下有什么具体的东西，其中网上很多资料都表示需要loader-utils依赖包，通过它提供的loaderUtils.getOptions(this)来访问我们配置在options里面的参数
    但是我实际测试发现：
    loader-utils 3.1.0版本中不再有getOptioins的方法，2.1.0中支持该方法，通过我打印this发现使用"this.loaders[0]['options']"能访问配置项，但是这个太死了万一有多个loader而且你不知道用户到底放在第几个上面，继续看官方文档发现现在改成了this.query来访问options，若无options配置则表示以query字符串作为参数

6. loader返回其他结果
	通过this.callback(null,source,sourceMap)
7. 同步异步loader
	当我们的loader需要异步操作时，可以使用this.async()方法来支持
8. 之前我们拿到的source是一个String类型数据，当我们需要二进制数据时，可以在导出loader函数同时设置raw = true 即：
	module.exports.raw = true

具体可以参考webpack中文文档loader部分
https://www.webpackjs.com/contribute/writing-a-loader/
及loader 的api
https://www.webpackjs.com/api/loaders/
```

### 如何自定义Plugins

```js
1. 其中主要涉及"compiler" 钩子
	对象代表了完整的 webpack 环境配置。这个对象在启动 webpack 时被一次性建立，并配置好所有可操作的设置，包括 options，loader 和 plugin。当在 webpack 环境中应用一个插件时，插件将收到此 compiler 对象的引用。可以使用它来访问 webpack 的主环境。
    及"compilation" 钩子
    对象代表了一次资源版本构建。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，就会创建一个新的 compilation，从而生成一组新的编译资源。一个 compilation 对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息。compilation 对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用。
    
2. 如何编写plugins
https://www.webpackjs.com/contribute/writing-a-plugin/
及plugins 的api
https://www.webpackjs.com/api/plugins/
```

