// computed&watch源码分析
// date: 2021-04-06

// 下面我根据一个简单的例子 来重头分析
// <span>{{getMessage}}</span>
// <span>{{otherMessage}}</span>
// {
//   data:{
//     message:'我是初始化值',
//     otherMessage:'我是另一个初始化值'
//   },
//   computed:{
//     getMessage(){
//       return this.message + '_computed'
//     }
//   },
//   watch:{
//     'message':function(val,oldVal){
//       console.log(val,oldVal)
//     }
//   },
//   mounted() {
//     setTimeout(() => {
//       // 1. 改变computed依赖的响应式值 message
//       this.message = '改变computed依赖的响应式值 message'
//       // 2. 改变非computed依赖的响应式值 otherMessage
//       this.otherMessage = '改变非computed依赖的响应式值 otherMessage'
//     },3000)
//   },
// }

// 1. 执行initData 给data下的数据做defineProperty设置
//                                                -> message -> Dep(id:3) -> getter&setter
//                                                -> otherMessage -> Dep(id:4) -> getter&setter

// 2. 执行initComputed
//                   -> 生成vm._computedWatcher = 实例化一个watcher 这里称之为 "计算watcher"(id:1) 
//                   -> 这里“计算watcher”(id:1) 特别需要注意 传入Watcher第二个参数就是 用户所编写的computed函数 -> 则watcher.getter = computed函数
//                   -> “计算watcher”(id:1) 默认lazy:true -> 导致dirty:false -> 表示不再实例watcher时就进行求值 真正求值是当渲染时 执行get方法 调用watcher.getter方法求值
//                   -> 最后将computed的key值如上面的'getMessage'通过defineProperty方法 -> 挂载到实例vm下面 -> 且描述中 getter为“createComputedGetter”函数（当模板中访问该值时会触发该getter）
//                   -> this.value = this.lazy ? undefined : this.get() -> 当前watcher的value为undefined

// 3. 执行initWatch
//                -> 针对组件内watch的几种写法做处理
//                   1. 'key' : function 函数格式，如上 
//                   2. 'key' : name in methods 直接绑定到methods对象里面声明的方法 
//                   3. 'key' : [handler1,handler2,...] 后面跟handler操作数组）
//                   4. 'key' : Object 后面跟个对象 但是对象里面必须包含一个叫'handler'的key的键值对处理函数
//                -> 实例化一个watcher 这里称之为 "监听watcher"(id:2)
//                -> 这里“监听watcher”(id:2) 特别需要注意 传入Watcher第二个参数只是 我们写的监听key值（如上面的'message'）而第三个参数则是用户所编写的回调函数  -> 则watcher.getter = parsePath()其实就是访问实例上的响应式值
//                -> “监听watcher”(id:2) 默认user:true -> 则lazy:false -> dirty:false
//                -> this.value = this.lazy ? undefined : this.get() -> 则立即执行get方法求值value
//                -> 但凡执行get方法 都会操作全局Dep.Target = 当前watcher(“监听watcher”(id:2))
//                -> 执行watcher.getter（parsePath()） -> 一旦拿'message' -> 触发响应式数据的getter函数
//                -> 当前全局栈是 “监听watcher”(id:2) 而当前闭包下 Dep(id:3) 
//                -> 这个时候 就是很关键的依赖收集了 -> 说明“监听watcher”(id:2)依赖Dep(id:3)
//                -> 执行后 此时 Dep(id:3)上的subs里面收集了一个“监听watcher”(id:2) 而“监听watcher”(id:2)上的newDeps收集到了Dep(id:3) 等于说watcher上有dep dep上有watcher
//                -> 再出栈 Dep.Target = undefined
//                -> 将 “监听watcher”(id:2)上的newDeps&newDepsIds赋值到deps&depIds上面 并最后置两者为空 等待下一次update变化

// 4. 执行挂载 会触发渲染函数render
//                         -> 会实例化一个watcher 这里称之为 "渲染watcher"(id:3)
//                         -> "渲染watcher"(id:3) 特别需要注意 传入Watcher第二个参数就是 updateComponent函数（vm._update(vm._render())）-> 则watcher.getter = vm._update(vm._render())
//                         -> "渲染watcher"(id:3) 默认lazy:false -> dirty:false
//                         -> this.value = this.lazy ? undefined : this.get() -> 则立即执行get方法求值value
//                         -> 但凡执行get方法 都会操作全局Dep.Target = 当前watcher("渲染watcher"(id:3))  
//                         -> 执行vm.render()方法 -> 则会触发with匿名函数来创建vnode 
//                         -> 则触发data响应式值的getter 或 computed函数的getter
//                         -> 该例子下 先触发computed函数的getter -> 通过之前赋值到_computedWatchers拿到当前的“计算watcher”(id:1) -> “计算watcher”(id:1)dirty为false
//                         -> 则执行“计算watcher”(id:1)的evaluate方法来取值 -> 执行get方法
//                 ****    -> 我们经常谈的计算属性具有缓存特性 这里它的缓存特性就是dirty这个参数的值来决定的 若dirty为true 则重新计算computed函数值 若dirty为false 则拿watcher上的value值
//                         -> 但凡执行get方法 都会操作全局Dep.Target = 当前watcher(“计算watcher”(id:1)) 当前Dep栈里面存在两个watcher [‘"渲染watcher"(id:3)’,‘“计算watcher”(id:1)’]
//                         -> 调用watcher.getter（定义的computed函数）
//                         -> 触发data响应式数据的getter
//                         -> 当前全局栈是 “计算watcher”(id:1) 而当前闭包下 Dep(id:3)     
//                         -> 这个时候 就是很关键的依赖收集了 -> 说明“计算watcher”(id:1)依赖Dep(id:3)
//                         -> 执行后 此时 Dep(id:3)上的subs里面收集了两个[“监听watcher”(id:2), “计算watcher”(id:1)] 而“计算watcher”(id:1)上的newDeps收集到了Dep(id:3) 等于说watcher上有dep dep上有watcher
//                         -> 再出栈 Dep.Target = undefined -> 将 “计算watcher”(id:1)上的newDeps&newDepsIds赋值到deps&depIds上面 并最后置两者为空 等待下一次update变化
//                         -> 出栈后 此时Dep.Target = "渲染watcher"(id:3)
//                 ****    -> 很关键的将“计算watcher”(id:1)上的dirty置为false
//                         -> 继续在computed的getter函数内执行
//                         -> 因为此时Dep.Target = "渲染watcher"(id:3) -> 所以需要将"渲染watcher"(id:3) 收集起来
//                         -> 即当前Dep(id:3)下的subs里面收集了3个watcher [‘"监听watcher"(id:2)’, ‘“计算watcher”(id:1)’, ‘"渲染watcher"(id:3)’]
//                         -> 而每种watcher下也收集了依赖Dep(id:3)    
//                         -> 继续执行with匿名函数
//                         -> 触发data响应式数据otherMsg的getter -> 此时Dep.Target = "渲染watcher"(id:3)
//                         -> 则Dep(id:4)上的subs里面收集这个watcher ['"渲染watcher"(id:3)'] 而"渲染watcher"(id:3)上收集两个依赖 ['Dep(id:3)', 'Dep(id:4)']

// 5. 挂载完毕 回到渲染watcher的get方法
//                                   -> 执行出栈 Dep.Target = undifined 剩余空栈 []

// 6. 若执行 this.message = '改变computed依赖的响应式值 message'
//                                                          -> 闭包特性当前Dep(id:3) 执行notify方法
//                                                          -> 遍历执行Dep(id:3)下的subs里面的所有watcher执行update方法
//                                                          -> 因为改变的是message这个值 它关联了3个watcher 所以分别执行 
//                                                          -> 1. ‘"监听watcher"(id:2)’ : 因为lazy:false -> 将‘"监听watcher"(id:2)’压进queue队列 且压入异步操作队列
//                                                          -> 2. ‘“计算watcher”(id:1)’ ：因为lazy:true -> 将 dirty置为true -> 为了重新计算computed值 因为你依赖变化了 自然需要求新值
//                                                          -> 3. ‘"渲染watcher"(id:3)’ ：因为lazy:false -> 将‘渲染watcher"(id:3)’压进queue队列 
//                                                          -> 此时queue队列里面两个值 [‘"监听watcher"(id:2)’,‘渲染watcher"(id:3)’]
//                                                          -> 异步操作最后执行

// 7. 对queue队列进行id由小到大升序排列
//                                   -> 1. 因为父组件始终先于子组件进行创建 则执行watcher更新也是父组件先更新 子组件后更新
//                                   -> 2. 因为用户自定义的watcher就是watch配置 它比渲染watcher先创建 它在initWatch函数就创建了 先执行它 -> 也就执行用户的回调监听函数了
//                                   -> 3. 若组件被销毁 则会跳过它的watcher更新

// 8. 遍历queue
//            -> 若为‘"渲染watcher"(id:3)’ -> 则触发before钩子 beforeUpdate -> 执行run方法 -> 执行get方法 -> value为undefined
//            -> 若为‘"监听watcher"(id:2)’ -> 则执行run方法 -> 执行get方法 

// 若执行 this.otherMessage = '改变非computed依赖的响应式值 otherMessage'
//                                                                    -> 闭包特性当前Dep(id:4) 执行notify方法
//                                                                    -> 遍历执行Dep(id:4)下的subs里面的所有watcher执行update方法
//                                                                    -> 因为改变的是otherMessage这个值 它只关联了1个watcher 也就是渲染watcher
//                                                                    -> 因此区别就来了 当渲染模板访问计算属性值时 此时因为没改变依赖值 所以dirty为false 所以返回缓存值 其他逻辑差不多


/**1. 初始化state 源码：4635行*/
function initState(vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) {
    initProps(vm, opts.props);
  }
  if (opts.methods) {
    initMethods(vm, opts.methods);
  }
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  if (opts.computed) {
    initComputed(vm, opts.computed);
  }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

/**2. initComputed 源码：4756行*/
var computedWatcherOptions = { lazy: true }; // 注意默认computed配置了lazy属性 表示不马上执行get()取值
function initComputed(vm, computed) {
  // $flow-disable-line
  var watchers = (vm._computedWatchers = Object.create(null));
  // computed properties are just getters during SSR
  var isSSR = isServerRendering();

  for (var key in computed) {
    var userDef = computed[key];
    // TODO: 1. 这里可以看出computed的两种写法
    // 一种直接使用函数
    // 一种使用对象但是需要配置get或set
    // 2. 这里的getter也就是我们之前看到的‘updateComponent’
    var getter = typeof userDef === 'function' ? userDef : userDef.get;
    if (getter == null) {
      warn('Getter is missing for computed property "' + key + '".', vm);
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      // TODO: 3. 这里创建了一个computed属性所对应的Watcher监听
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else {
      if (key in vm.$data) {
        warn('The computed property "' + key + '" is already defined in data.', vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn('The computed property "' + key + '" is already defined as a prop.', vm);
      }
    }
  }
}
// 2.1 定义computed 源码4797 行
/**
 * 
 * @param {*} target vm
 * @param {*} key 我们定义的computed的key值
 * @param {*} userDef 我们用户自定义的computed函数
 */
 var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};
function defineComputed (
  target,
  key,
  userDef
) {
  // TODO：1. 是否需要缓存 若是ssr模式则不缓存
  var shouldCache = !isServerRendering();

  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  if (sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        ("Computed property \"" + key + "\" was assigned to but it has no setter."),
        this
      );
    };
  }
  // TODO: 2. 在vm实例上面定义computed的key 描述项为经过处理getter或者setter后
  // 的sharedPropertyDefinition对象 
  // 比如设置computed xxx属性  则我们在this.xxx会访问指向 -> sharedPropertyDefinition的getter -> 指向createComputedGetter方法
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
// 2.2 创建计算属性的getter 源码：4827 行
// 这里闭包缓存了key值 等待下次调用
function createComputedGetter (key) {
  return function computedGetter () {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value
    }
  }
}

/**3. initWatch 源码： 4876 行 */
function initWatch (vm, watch) {
  for (var key in watch) {
    // 获取当前watch配置
    var handler = watch[key];
    // TODO：1. 这里需要注意watch配置项的几种写法 有包含数组项 它将会逐一调用数组
    // 中的每一项handler函数 实际就是针对每个handler创建watcher
    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}
// 3.1 创建watcher
/**
 * 
 * @param {*} vm vm
 * @param {*} expOrFn watch配置中的key值或者函数
 * @param {*} handler 用户配置的watcher-handler函数
 * @param {*} options 配置项
 * @returns 
 */
function createWatcher (
  vm,
  expOrFn,
  handler,
  options
) {
  // TODO：1. 这里当watch配置项为对象是 则需要固定写上handler响应函数
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  // TODO: 2. 若watch配置项为字符串 则表示直接调用实例的methods里面的方法 vm[handler]
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  // TODO: 3. 剩下就是配置了一个函数
  return vm.$watch(expOrFn, handler, options)
}
// 3.2 原型方法$watch方法
Vue.prototype.$watch = function (
  expOrFn,
  cb,
  options
) {
  var vm = this;
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options)
  }
  options = options || {};
  options.user = true; // 注意这里watch给了个默认配置user
  // 注意这里跟computed创建Watcher参数区别 这里expOrFn是key值 cb是用户handler
  var watcher = new Watcher(vm, expOrFn, cb, options);
  // TODO: 这里配置项immediate 为true时 表示 立即执行我们设置的watch监听 回调函数
  if (options.immediate) {
    try {
      cb.call(vm, watcher.value);
    } catch (error) {
      handleError(error, vm, ("callback for immediate watcher \"" + (watcher.expression) + "\""));
    }
  }
  // TODO: 返回一个取消函数 可以执行 则内部调用teardown方法
  return function unwatchFn () {
    watcher.teardown();
  }
};
