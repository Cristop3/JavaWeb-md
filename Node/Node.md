## 模块机制

#### 1.CommonJS模块规范

```js
主要分为模块引用、模块定义、模块标识
1.	模块引用
	通过“require”来引入外部模块 - "require()"
2.	模块定义
	2.1 上下文提供了“exports”对象导出方法或变量，并且它是唯一导出的出口。
    2.2 在模块中，还存在“module”对象，它代表模块自身，而export是module的属性即 -  "module.export"
3.	模块标识
	其实就是指require()的参数，“它必须是小驼峰命名字符串”；或者以.、..开头的相对路径，或者绝对路径，它可以没有文件名后缀.js
```

#### 2.Node的模块实现

```js
1. Node中引入模块需要经历3个步骤
	1.1	路径分析
    1.2 文件定位
    1.3 编译执行
2. Node的模块分类
	2.1	由Node提供，称为“核心模块”
    	它在Node源代码的编译过程中，编译进了二进制执行文件，在Node进程启动时，部分核心模块就直接加载进内存中，它的加载速度是最快的。
    2.2 由用户编写，称为“文件模块”
    	它则是运行时动态加载，需要完整的路径分析，文件定位，编译执行过程，速度慢。
    2.3 不论是核心模块还是文件模块，require()方法对相同模块的二次加载都采用缓存优先方式。

3. Node的路径分析及文件定位
	3.1	核心模块，如http,fs,path
	3.2 .或..开始的相对路径文件模块
	3.3 以/开头的绝对路径文件模块
		以.、..֖和/开始的标识符，在分析路径模块时，require()方法会将路径转为"真实路径"，并以真实路径作为索引。
	3.4 非路径形式的文件模块，如自定义的connect模块
    	针对这种自定义模块的查找，我们需要了解“模块路径”概念，它具体表现为一个路径组成的数组，且生成规则如下：
        3.4.1 当前文件目录下的node_modules目录
        3.4.2 父目录下的node_modules目录
        3.4.3 父目录的父目录下的node_modules目录
        3.4.4 沿路径向上逐渐递归，直到根目录下的node_modules目录。
        
    3.5 文件扩展名分析
    	CommonJS模块规范允许在标识符中不包含文件扩展名，这种情况下，Node会按.js,.json,.node依次查询（这里就解决了我们在业务编码过程中经常不写后缀名也可以执行的原因），若非.js文件，一般建议直接带上文件名，这样会加速分析加载模块
	3.6 目录分析和包
    	在我们业务编码过程中，比如list/index.js 一般我标识符就只写到require('../list')，在这个背后原理也就在接下来的说法中。
        当通过文件扩展名分析后，依然没找到对应的文件，但却得到一个目录，此时Node会将目录当作一个包来分析处理，Node会查找当前目录下是否有package.json，若存在，则取出其中的main属性进行定位，若无扩展名则进入扩展名分析，若不存在main属性或者package.json文件，则Node会将index当作默认文件名，然后再依次查找.js,.json,.node，若还不存在则报错。
        

4. Node模块编译
	4.1	在Node中，每个文件模块都是一个对象，定位到具体的文件后，针对不同的文件扩展名，其载入方法也不同，如：
    	".js文件"：通过fs模块同步独取文件后编译执行
        ".node文件"：这是用C/C++编写的扩展文件，通过dlopen()方法加载最后编译生成文件
        ".json文件"：通过fs模块同步独取文件后，用JSON.parse()解析返回结果
        "其余扩展名文件"：都被当做.js文件载入
		function Module(id,parent){
            this.id = id
            this.exports = {}
            this.parent = parent
            if(parent && parent.children){
                parent.children.push(this)
            }
            this.filename = null
            this.loaded = false
            this.children = []
        }
		每一个成功编译的模块都将其文件路径作为索引缓存在Module._cache上。

	4.2	js模块的编译
		为什么我们能在js文件中，直接使用require()或者exports，module，__filename,__dirname等非自定义变量？
		原因就是，Node在编译的过程中，会对js文件的内容进行头尾包装，将其包裹在内容，如：
        (function(exports,requie,module,__filename,__dirname){
            // 我们写的node内容
        })
		且包装模块会通过vm原生模块的runInThisContext()方法执行（类似eval）
    
    4.3 exports与module.exports区别？
		在初始化的时候，这两个值都指向同一个内存地址，本质上没有区别，可以理解为
        var exports = module.exports
        但是我们在使用require()引入模块时，引入的是module.exports导出的对象模块，不建议直接用exports等于一个值，这样就会切断module.exports的联系，即该导出值不成功。为了方便我们尽量使用module.exports。

	4.4 C/C++模块的编译
    	首先Node调用process.dlopen()方法进行加载和执行,实际上.node模块文件并不需要编译，因为它是编写C/C++模块之后编译生成的。
    
    4.5 JSON文件的编译
    	Node用fs模块独取到json文件后，调用JSON.parse()方法得到对象。
        
5. 核心模块
	核心模块分为“由JS编写部分”和“C/C++编写部分”，其中JS编写部分在源码的lib目录下而C/C++在src目录下。
    5.1	编译JS核心模块
    	Node采用V8工具js2c.py将内置的js代码转换成c++数组，由于当前lib目录下的所有模块没有进行require,module,exports定义，所以同样需要进行头尾包装，源文件通过process.binding('natives')取出。
    5.2 编译C/C++模块
    	由C/C++编写的部分称为“内建模块”，通过get_builtin_module()方法取出。
    
    5.3 require()一个核心模块流程
    	require('os') ->
            NativeModule.require('os') ->
            	process.binding('os') ->
            		get_builtin_module('node_os') -> 
            			NODE_MODULE(node_os,reg_func)
```

#### 3.异步I/O

```js
1. 异步I/O方案
	操作系统内核对于I/O只有两种方式：阻塞与非阻塞
	其中阻塞I/O造成CPU等待I/O,浪费等待时间，CPU处理能力不能充分利用，而非阻塞I/O区别就是调用之后会立即返回，但是需要多增加一个"轮询"方案去判断是否已完成I/O操作。
	而其中轮询的方案有如下几种：
    	a.	read（重复调用检查I/O是否已完成，此时CPU一直耗在等待状态上）
		b.	select（通过文件描述符的事件状态来判断，采用数组结构存储状态，但有个1024长度限制）
		c.	poll（采用链表方式避免数组长度的限制）
		d.	epoll（Linux系统下I/O机制，若没有检查到I/O事件则进行休眠，直到事件发生,然后唤醒）
		e.  kqueue（FreeBSD系统下）
	AIO（Linux系统下，通过信号或回调来传递数据）
	IOCP（windows系统下，内部是线程池原理，直接由系统内核接手管理）

2. Node的异步I/O
	利用单线程，远离多线程死锁、状态同步等问题，利用异步I/O，让单线程远离阻塞，以更好的利用CPU。
	
	一个完整的异步I/O环节需要由"事件循环"、"观察者"、"请求对象"、"I/O线程池"
	2.1	"事件循环"
		2.1.1 进程启动时，Node会创建一个类似于while(true)的循环，没执行依次循环体的过程我们叫做"Tick"
		2.1.2 每个Tick过程就是查询是否有事件等待处理，若有，则取出事件及相关的回调函数，执行它们
        2.1.3 然后继续进入下个循环，如果不再有事件处理，则退出进程
    2.2	"观察者"
		2.2.1 每个事件循环中有1个或者多个观察者，而判断是否有事件要处理的过程就是向这些观察者询问是否有待处理事件。
        2.2.2 在Node中，事件主要源于网络请求，文件I/O，这些事件对应的观察者有“文件I/O观察者”、“网络I/O观察者”
		2.2.3 windows下，这个循环基于"IOCP"创建，而*nix下基于"多线程"创建
    2.3 "请求对象"
		Node中经典调用方法：从JS调用Node的核心模块 -> 核心模块调用C++内建模块 -> 内建模块通过libuv层进行系统调用，其中我们从JS层传入的参数和当前方法都被封装在这个所谓的“请求对象”中，而我们的回调函数则被设置在这个对象的oncomplete_sym属性上
	2.4 "I/O线程池"
		2.4.1 当组装好的请求对象，送入I/O线程池等待执行
		2.4.2 在线程池中，会执行请求对象中的I/O操作，将执行完成的结果放在请求对象中，并通知IOCP调用完成，其中还是动用了"事件循环"的I/O观察者，它会调用IOCP相关方法检查线程池中是否有执行完的请求，如果存在，会将请求对象放入I/O观察者队列中，然后将其当事件处理。

3. 非I/O的异步API
	Node中也存在一些与I/O无关的异步API，如"setTimeout()"、"setInterval()"、"setImmediate()"、"process.nextTick()"
	3.1 setTimeout()\setInterval()
		这两个定时器与浏览器中的API一致，当调用它们时创建的定时器会被插入到定时器观察者内部的一个红黑树中，每次Tick执行时，会从该红黑树中迭代取出定时器对象，检查是否超过定时时间，如果超过则形成一个事件它的回调函数立即执行。定时器的问题在于，它并非是非常精确的。
    3.2 process.nextTick()
		每次调用process.nextTick()方法时，只会将回调函数放入队列中，在下一轮Tick时取出执行。
    3.3 setImmediate()
		该方法的作用与process.nextTick()，都是将回调函数延迟执行，但是它们之间有优先级，其结果是
        process.nextTick() > setImmediate()
		原因是："事件循环对观察者的检查是有先后顺序的，process.nextTick()属于idle观察者，setImmediate()属于check观察者"而在每一轮循环检查中，idle观察者先于I/O观察者，I/O观察者先于check观察者
		更深层次的原因："process.nextTick()的回调函数保存在一个数组中，而setImmediate()的结果则是保存在链表中，在行为上，process.nextTick()在每轮循环中会将数组中的回调函数全部执行完成，而setImmediate()在每轮循环中只会执行链表中的一个回调函数"
```

#### 4.异步编程

```js

```

#### 5.内存控制

```js
1. v8限制
	1.1 在一般的后端开发语言中，在基本的内存使用上没有什么限制，然而在Node中通过JS操作的内存时只能使用部分内存（64位系统1.4GB\32位系统0.7GB）
    1.2	造成这种原因是因为"我们在Node上使用JS都是在V8引擎下使用的，而内存这块都是由V8自己的方式来分配和管理"。
    1.3 在V8中，所有JS对象都是通过堆来进行分配的，在Node中我们可以使用process.memoryUsage()来查看当前内存信息。

2. 如何突破限制
	在前端的工程中，在启动命令的时候经常会看到"--max-old-space-size=4096"或者"--max-new-space-size=1024"这是什么操作呢？
    其实这个就是v8提供了选项给我自己定义更多的内存：（但是这些参数在V8初始化时生效，一旦生效就不能动态改变）
    "--max-old-space-size=4096" - 单位为MB - 分配老生代堆内存大小
	"--max-new-space-size=1024" - 单位为KB - 分配新生代堆内存大小

3. v8垃圾回收机制
	1. v8内存分代（v8堆整体大小 = 新生代内存空间 + 老生代内存空间）
    	主要将内存分为"新生代"（其中的对象存活时间较短）和"老生代"（其中的对象存活时间较长或常驻内存的对象）
    
    2. 新生代 - "Scavenge算法" - "主要采用了Cheney算法"
		2.1	Cheney算法采用复制的方式实现垃圾回收算法
        2.2 将新生代堆内存空间分为两个区域，每部分空间称为"semispace"（一半是对象区域-使用中，一半是空闲区域-闲置）
		2.3 处于使用状态的空间称为"From空间"，而处于空闲状态的空间称为"To空间"
		2.4 当执行垃圾回收时：会检查From空间中存活的对象，并将存活对象复制到To空间，而此时From空间中非存活的对象将会进行回收，完成复制后，From空间和To空间角色对换，From空间变成空闲空间，To空间变成使用空间，然后执行相同的操作，经过两次垃圾回收还存活的对象将会被移动到老生代中。这个过程也叫做"晋升"
        2.5 但晋升需要条件，主要有"对象是否经历过Scavenge算法回收"，二个"To空间的内存占用比超过限制的25%"
	
	3. 老生代 - "Mark-Sweep算法 & Mark-Compact算法" - 优化"Incremental Marking算法"
		3.1	从一组根元素开始，遍历堆中的所有对象，并标记活着的对象，而后清除没有被标记的对象
        3.2 当经过"标记-清除"后，唯一的不足之处就是"在内存空间上产生了不连续的状态"，这样不处理的话，就会对后面的对象存储带来不方便。
        3.3	因此针对这种"内存碎片化"，"标记-整理"算法来了，从一组根元素开始，遍历所有对象，让存活的对象都向内存的一端移动，并清理掉端边界以外的内存。
        3.4 但是这两个过程都需要将js应用逻辑暂停下来，当垃圾足够的大时，会产生等待太久，造成停顿。
        3.5 因此提出了"增量-标记"方案：核心就是将整体拆分为小步，交替执行。

4. 堆外内存
	将那些不是通过V8分配内存的称为"堆外内存"，比如将操作Array的改成操作Buffer。

5. 内存泄漏
	5.1 缓存
    5.2 队列消费不及时
    5.3 作用域未释放
```

#### 6.Buffer理解

```js
1. 什么是Buffer
	Buffer是一个像Array的对象，它主要用于操作字节；它的元素为16进制的两位数，即0-255的数值。
```

#### 7.网络编程

```js
1.	Node提供的网络模块
	1.1	net - 处理TCP
	1.2 dgrm - 处理UDP
	1.3 http - 处理HTTP
	1.4 https - 处理HTTPS
	1.5 http2 - 处理HTTP2

2. TCP服务（net模块）
    2.1 服务端
        const net = require('net')
        // 方式1
        // const server = new net.Server(sockets => {
        //   console.log('有客户端连接接入')
        //   sockets.write('向客户端发送消息')
        // })
        // 方式2
        // const server = net.createServer(sockets => {
        //   console.log('有客户端连接接入')
        //   sockets.write('向客户端发送消息')
        // })
        // 方式3
        const server = net.createServer()
        server.on('connection', socket => {
            console.log('client has connectioned')
            // 直接向客户端发送消息	
            // socket.write('server send data to client')
            // 或者监听客户端发送消息
            socket.on('data',data => {
                console.log('server has received from client data ', data)
                socket.write('hello i am server')
                socket.pipe(socket)  
            })  
        })
        server.on('listening',() => {
            console.log('listening')
        })
        server.on('close', () => {
            console.log('server is closing')
        })
        server.on('error',err => {
            console.log(err)
        })
        server.listen(8088,() => {
            console.log('TCP服务启动')
        })
    2.2 客户端
        const net = require('net')
        // 方式1
        // const client = new net.Socket()
        // client.on('connect',() => {
        //   console.log('client is connected server')
        // })
        // client.connect({
        //   port:8088
        // })
        // 方式2
        // const client = net.createConnection({port:8088},() => {
        //   console.log('client is connected server')
        // })
        // 方式3
        const client = net.connect({
            port:8088
        },() => {
            console.log('client is connected server')
        })
        client.on('connect', () => {
            console.log('client has connect to server')
            // 连接成功后 向服务端发送消息
            client.write('client send data to server')
        })
        client.on('error',err => {
            console.log('client err',err)
        })
        client.on('data',data => {
            // 接收服务端发送的消息 并关闭连接  
            console.log('client received from server data:',data)
            client.end()
        })
        client.on('end', () => {
            console.log('client has disconnect server')
        })
    2.3 TCP针对网络中小数据包执行了一定的优化策略："Nagle算法"（如果每次只发送一个字节，算法会要求缓存区的数据到达一定数量后才将其发出，以此来优化网络）

3. UDP服务（dgram模块）
	3.1 服务端
    	const dgram = require('dgram')
        // 方式1
        // const UDPServer = new dgram.Socket({
        //   type:'udp4'
        // })
        // 方式2
        const UDPServer = dgram.createSocket('udp4')

        UDPServer.on('listening',() => {
          console.log('UDPServer is listening ')
        })
        UDPServer.on('connect',() => {
          console.log('UDPServer is listening ')
        })
        UDPServer.on('message',(data,rinfo) => {
          console.log('UDPServer is message ',data.toString('utf8'),rinfo.address, rinfo.port)
          UDPServer.send('this msg from server',rinfo.port)
        })
        UDPServer.on('close',() => {
          console.log('UDPServer is close ')
        })
        UDPServer.on('err',err => {
          console.log('UDPServer is error ', err)
        })

        UDPServer.bind(8088)
	3.2 客户端
        const dgram = require('dgram')
        // const client = new dgram.Socket('udp4')
        const client = dgram.createSocket('udp4')
        client.send('this msg from client',8088,() => {
          console.log('client msg has sended')
        })
        client.on('message', (data,rinfo) => {
          console.log('client has received from server data ', data, rinfo.address, rinfo.port)
          client.close()
        })
        client.on('close',() => {
          console.log('client is close ')
        })
```

