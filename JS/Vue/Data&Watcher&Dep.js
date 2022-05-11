/**
 *  分析vue响应式数据过程
    date:2021-01-13
 *  
 */

    // 1. 执行initData方法
    // 2.                -> 作“data” & “props” & “methods”属性名称是否重名判断 且调用proxy方法再作this.data proxy代理到 this._data上面
    // 3.                -> 调用observe全局监听函数 准备作响应式处理
    // 4. 执行observe方法
    // 5.               -> 通过__ob__判断是否已经作了监听 (若未进行监听 则实例化Observer来进行监听创建)
    // 6. 执行new Observer() 实例化 （我们可以叫他为大目标者）
    // 7.                         -> 这里需要注意的是这个Observer监听者是针对该组件下整个data进行存储 data -> this.value & this.dep = new Dep() 
    //                               并对该value值(data)上增加__ob__ 指向当前Observer 等于说就是 data上有个__ob__隐藏属性
    // 8. 最后执行Observer大目标者原型上walk方法
    // 9.                                    -> for循环遍历调用defineReactive$$1方法来进行data上每个属性进行响应式设置
    // 10. 给每个属性执行new Dep() 实例化 （我们可以叫他为小监听者或实际目标收集者）若存在嵌套则重复调用observe方法
    //                       -> 其实这个dep才是真正的观察者模式中的叫做依赖收集者或者叫目标 因为dep.subs上会收集相关的监听者
    //                       -> 再使用Object.defineProperty定义每个data里面的key值的getter&setter 这里也利用了闭包特性缓存了每个key所对应的dep对象信息
    //                       -> 当getter时 判断全局下是否有Watcher 若有则调用当前dep.depend -> 再调用Watcher的addDep方法收集当前watcher到Watcher实例上的newDepId&newDep
    //                          针对Set格式的newDepId进行排除重复使用的data数据 比如我在多个地方同时使用data下数据
    //                       -> 当setter时 调用当前dep下的notify方法 再循环执行subs(Watcher)的update方法
    // 11. 将当前Watcher压入queue队列（这里压进队列是为了比如一个数据的修改可能对应多个地方的应用 采用收集完所有的更改变动后 一次性触发每个的生命钩子函数）
    // 12. 调用nextTick
    // 13. 触发‘beforeUpdate’钩子
    // 14. 调用Watcher的run方法
    // 15. 调用Watcher的get方法
    //                        -> 设置当前Watcher实例为全局Target
    //                        -> 调用Wathcer的getter方法 (一般情况下就是updateComponent方法)
    //                        -> 执行vm._update(vm._render(),hydrating)代码
    // 16. 调用render方法 （而这里的render其实就是经过编译过后形成的with包裹的匿名函数）
    // 17. 一旦执行with代码 则会触发属性的getter方法 (获取最新的值) 最后返回最新执行下的vnode (执行render方法后 获得新的vnode)
    // 18. 调用vm._update （这里就是走对比新老vnode 走diff算法 更新DOM）
    // 19. 将全局Target置为空
    // 20. 清空当前Watcher上面的newDepIds&newDep 等待下一次的更新                                           
    // 21. 若存在activedQueue 则触发钩子 'activated' 生命周期钩子函数
    // 22. 执行更新updateQueue队列 则触发每个vm实例下的 ‘update’ 生命周期钩子函数

// 0. 基于data来分析
function initState(vm) {
  vm._watchers = [];
  var opts = vm.$options;
  // TODO：vue先处理props -> methods -> data -> computed -> watch
  if (opts.props) {
    initProps(vm, opts.props);
  }
  if (opts.methods) {
    initMethods(vm, opts.methods);
  }
  if (opts.data) {
    // TODO：开始初始化data 传入vue实例
    initData(vm);
  } else {
    // TODO: 万一没设置 一般根点没设置data数据 这里容错处理赋值了个空{}
    // 后面来看这个oberve函数到底做了哪些事情
    observe((vm._data = {}), true /* asRootData */);
  }
  if (opts.computed) {
    initComputed(vm, opts.computed);
  }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
// 0.1 初始化data
function initData(vm) {
  var data = vm.$options.data;
  // TODO: 这里来一个判断 根结点data可以是一个对象
  // 而子组件data为函数 而且调用了全局getData 入参data及vue实例 来看0.2 getData意义
  // 这里在执行getData后 将我们声明的数据对象赋值给了vm实例中的_data属性及局部data变量
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};
  if (!isPlainObject(data)) {
    data = {};
    warn('data functions should return an object:\n' + 'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function', vm);
  }
  // proxy data on instance
  // TODO：拿到声明data的key值
  var keys = Object.keys(data);
  // TODO: 这里拿的props及methods都是初始化数据未修饰
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  // TODO: 发现挺多处使用while循环  学到了 嘻嘻
  while (i--) {
    var key = keys[i];
    // TODO: 这里就是作一个data跟props及methods是否重名判断
    // 为什么只判断这2个 我觉得是在0处 执行的顺序相关 先处理prop再methods 再data
    {
      if (methods && hasOwn(methods, key)) {
        warn('Method "' + key + '" has already been defined as a data property.', vm);
      }
    }
    if (props && hasOwn(props, key)) {
      warn('The data property "' + key + '" is already declared as a prop. ' + 'Use prop default value instead.', vm);
      // TODO：这里再判断下key 见0.1.1解析
    } else if (!isReserved(key)) {
      // TODO: 这里开始作一层_data的代理
      proxy(vm, '_data', key);
    }
  }
  // observe data
  // TODO: 这里调用全局observe函数 开始监听data
  observe(data, true /* asRootData */);
}
// 0.1.1 判断是否使用以特殊字符开头的变量 比如$ 或者_开头
function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5f;
}
// 0.1.2 作一层_data的代理
function proxy(target, sourceKey, key) {
  // TODO: 这里就是第一次见开始使用Object.defineProperty 来重新定义vm里面data数据
  // 意味着我们每次访问this.xxx属性 都会去访问this._data.xxx属性
  // 因为在0.1里面我们将data函数里面的值赋值给了_data
  // 好 这里意思搞清楚后 我们回到0.1
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
// 0.1.3 定义分享属性对象
var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop,
};
// 0.1.4 空函数 很多地方使用了
function noop(a, b, c) {}

// 0.2 获取data
function getData(data, vm) {
  // #7573 disable dep collection when invoking data getters
  // TODO：这里跟之前分析computed在Watcher的原型方法get中调用了pushTarget
  // 唯一的区别就是在那里传了this（Watcher实例）而这里没传值过去
  pushTarget();
  try {
    // TODO：这里以vm实例调用data 即我们在data函数里 this指向vm实例
    // 这里就是作了执行data() 返回我们声明的data值对象{}
    return data.call(vm, vm);
  } catch (e) {
    handleError(e, vm, 'data()');
    return {};
  } finally {
    popTarget();
  }
}

//////////////////////////////////////////////////////////////////////////////////////
// 2. Watcher构造函数（观察者&订阅者）
var uid$2 = 0;
var Watcher = function Watcher(vm, expOrFn, cb, options, isRenderWatcher) {
  this.vm = vm;
  if (isRenderWatcher) {
    vm._watcher = this;
  }
  // TODO: 将当前this指向的Watcher实例压进vue实例下私有属性_watchers
  vm._watchers.push(this);
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
    this.before = options.before;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  // TODO: 这里判断是否支持Set不支持就模拟Set(并提供has&add&clear内部方法)
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  // TODO: 这里将方法字符串化
  this.expression = expOrFn.toString();
  if (typeof expOrFn === 'function') {
    // TODO: 这里将执行方法挂载到Watcher实例的getter属性上
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = noop;
      warn('Failed watching path: "' + expOrFn + '" ' + 'Watcher only accepts simple dot-delimited paths. ' + 'For full control, use a function instead.', vm);
    }
  }
  // TODO: 初始化是当前value值均为undefined 后面调用Watcher实例的get()方法
  this.value = this.lazy ? undefined : this.get();
};

//////////////////////////////////////////////////////////////////////////////////////
// 3. Watcher原型上的get方法
Watcher.prototype.get = function get() {
  // TODO: 调用了全局函数pushTarget 这里跟另一个模块Dep有关了
  // 顺势找到Dep分析下这个响应式
  pushTarget(this);
  // TODO：执行这步的意义何在
  // 就是为了给全局对象Dep的target属性挂载上当前的Watcher实例
  var value;
  var vm = this.vm;
  try {
    // TODO: 执行前端编写的函数 内部this指向vue实例 传参vue实例
    // TODO: 0118 这个地方的getter还不是这么简单的理解
    // 多数情况下他是一个updateComponent函数
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, 'getter for watcher "' + this.expression + '"');
    } else {
      throw e;
    }
  } finally {
    if (this.deep) {
      traverse(value);
    }
    // TODO: 每次执行完this.getter后 释放全局变量targetStack 且置
    // Dep.target为null 这里就是每次作update时保持一个watcher执行
    popTarget();
    this.cleanupDeps();
  }
  return value;
};
// 3.1 清理依赖
Watcher.prototype.cleanupDeps = function cleanupDeps () {
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

//////////////////////////////////////////////////////////////////////////////////////
// 4. 全局函数pushTarget&popTarget&全局变量targetStack
// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;
var targetStack = [];
function pushTarget(target) {
  // TODO: 在前面的3中调用了pushTarget 这里将从3中的this(Watcher实例)压进targetStack
  targetStack.push(target);
  // TODO: 给Dep的属性target挂载Watcher实例 接下来分析下Dep
  Dep.target = target;
}
function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}

//////////////////////////////////////////////////////////////////////////////////////
// 5. Dep函数
var uid = 0;
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
// TODO: 声明全局Dep构造函数也就是全局对象 （发布者）
var Dep = function Dep() {
  this.id = uid++;
  // TODO： 构造函数上挂载subs属性为数组集合 现在还不知道这个subs有什么作用
  this.subs = [];
};
// TODO：压入subs方法
Dep.prototype.addSub = function addSub(sub) {
  this.subs.push(sub);
};
// TODO：清除sub方法
Dep.prototype.removeSub = function removeSub(sub) {
  // TODO: 这里调用了个全局工具方法 清除数组指定项
  /**
   *   function remove (arr, item) {
          if (arr.length) {
            var index = arr.indexOf(item);
            if (index > -1) {
              return arr.splice(index, 1)
            }
          }
        }
   * 
   */
  remove(this.subs, sub);
};
// TODO：建立“依赖”方法
Dep.prototype.depend = function depend() {
  // TODO: 这里在初始化的时候 Dep.target值为null
  // 但是我们在前面的3中调用了pushTarget方法 而pushTarget方法中将Dep.target
  // 设置为了那个时间段的Watcher实例
  if (Dep.target) {
    // TODO: 这里又切调用了Watcher实例的addDep方法 接下来分析下Watcher上面的addDep方法
    // 并传入了Dep这个当前实例（上面挂载了id和subs集合）
    Dep.target.addDep(this);
  }
};
// TODO: 建立“通知”方法
Dep.prototype.notify = function notify() {
  // stabilize the subscriber list first
  var subs = this.subs.slice();
  if (!config.async) {
    // subs aren't sorted in scheduler if not running async
    // we need to sort them now to make sure they fire in correct
    // order
    subs.sort(function (a, b) {
      return a.id - b.id;
    });
  }
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

//////////////////////////////////////////////////////////////////////////////////////
// 6. Watcher原型上的addDep方法
Watcher.prototype.addDep = function addDep(dep) {
  var id = dep.id;
  // TODO: 判断当前id是否已在Watcher实例的newDepIds属性里面
  // 这里的newDepIds是一个Set数据结构属性
  if (!this.newDepIds.has(id)) {
    // TODO: 没得就add进去
    this.newDepIds.add(id);
    // TODO: 这里newDeps是数组结构 将当前dep push进去
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      // TODO：同理这里调用的是当前dep实例上的addSub 也就是将当前的Watcher实例
      // 压进dep的subs数组里面
      dep.addSub(this);
    }
  }
  // TODO：这步完了后 又回到了3里面的pushTarget后续逻辑
};

//////////////////////////////////////////////////////////////////////////////////////
// 7. 监测类
var Observer = function Observer(value) {
  this.value = value;
  // TODO：new 一个收集者
  this.dep = new Dep();
  this.vmCount = 0;
  // TODO: 定义value里面的__ob__绑定一个监测类实例 但是不能枚举出来 隐式属性
  def(value, '__ob__', this); // TODO：0406 这里可以知晓我们属性__ob__ 指向的是一个Observer监测者对象
  // TODO: 判断当前value是否为数组
  if (Array.isArray(value)) {
    if (hasProto) {
      protoAugment(value, arrayMethods);
    } else {
      copyAugment(value, arrayMethods, arrayKeys);
    }
    this.observeArray(value);
  } else {
    // TODO: 我们一般的data函数返回对象 走walk方法 
    // TODO: 0406 走walk方法 就是为了 定义没层属性进行响应式 设置
    this.walk(value);
  }
};
// 7.1 给value定义一个隐藏属性__ob__ 值为监测类实例
function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}
// 7.2 Observer原型上walk方法
Observer.prototype.walk = function walk(obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i]);
  }
};
// 7.2.1 对一个对象 定义一系列响应式属性
function defineReactive$$1(obj, key, val, customSetter, shallow) {
  // TODO: 这里new一个收集者
  var  dep    = new Dep();
  // TODO：这里拿到当前data的自有属性描述符 比如value&configurable&get&set等等
  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }
  // cater for pre-defined getter/setters
  // TODO: 去拿data函数中设置的数据值的get set
  var getter = property && property.get;
  var setter = property && property.set;
  // TODO: 这里很有趣了 我们在初始化得时候 正常设置data值时 是没得get set方法的
  // 而且在7.2中初始化调用defineReactive$$1方法 入参就是2个 所以进入这个判断
  if ((!getter || setter) && arguments.length === 2) {
    // TODO：将当前当前data中key值给给val
    val = obj[key];
  }
  // TODO: 初始化 这个childOb为undefined
  // TODO：0118 这个childOb 其实就是当我们的data数据为对象时
  /**
   *    比如：data(){
   *        return {
   *          message:'test',
   *          list:{
   *            xxx:'msg'
   *          }
   * 
   *        }    
   *    }
   *    这种在给getter的时候会触发childOb的依赖收集
   */
  var childOb = !shallow && observe(val);
  // TODO：响应式核心来了 为每个data的数据进行defineProperty设置 get&set
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      // TODO: 这里判断一手值是否变化
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      /* eslint-enable no-self-compare */
      if (customSetter) {
        customSetter();
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    },
  });
}
// 7.2.1.1
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe(value, asRootData) {
  // TODO: 这里给值创建一个监听 若已到了最后一层 则返回
  // 比如 return {
  //    name:'test',
  //    list:{
  //      xxx:"data"
  //    }
  // } 初始化进来是第一层 则继续执行
  // 当到了name的时候 已经为最后一层 则return
  // 当到了list还未停止 继续 直到xxx
  if (!isObject(value) || value instanceof VNode) {
    return;
  }
  var ob;
  // TODO: __ob__ 这个属性是在Observer里面才创建的 创建过的就不需要创建了
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (shouldObserve && !isServerRendering() && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    // TODO: 为值创建监听
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}

//////////////////////////////////////////////////////////////////////////////////////
// 8. 监听者update更新
/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update() {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};
// 8.1 将当前监听者压进队列中
/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;

      if (!config.async) {
        flushSchedulerQueue();
        return;
      }
      nextTick(flushSchedulerQueue);
    }
  }
}
// 8.1.1 遍历watcher队列分别执行
/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue() {
  currentFlushTimestamp = getNow();
  flushing = true;
  var watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) {
    return a.id - b.id;
  });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    if (watcher.before) {
      watcher.before();
    }
    id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn('You may have an infinite update loop ' + (watcher.user ? 'in watcher with expression "' + watcher.expression + '"' : 'in a component render function.'), watcher.vm);
        break;
      }
    }
  }

  // keep copies of post queues before resetting state
  var activatedQueue = activatedChildren.slice();
  var updatedQueue = queue.slice();

  resetSchedulerState();

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}
// 8.1.2 watcher执行
/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run() {
  if (this.active) {
    var value = this.get();
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          handleError(e, this.vm, 'callback for watcher "' + this.expression + '"');
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};


