// vuex 源码分析
// date：2021-04-01
// 1. Vue.use(Vuex)
// 2.             -> 调用install插件机制安装Vuex 内部调用applyMixin
// 3.             -> Vue2.x以上采用Vue.mixin混入到beforeCreate Vue1.x 重写_init方法并添加到options.init
// 4. new Vuex.Store(options)
// 5.                       -> 初始化Store等内部变量
// 6.                       -> 通过options进行模块收集ModuleCollection
// 7.                       -> 给commit&dispatch包裹一层函数外衣 内部call-store调用
// 8. installModule安装模块（内部递归生成每层module实例且关联到父子级上）
// 9.                                      -> 注册mutations & actions & getter & child
// 10.                                     -> 做每层module的state进行提升到所对应的父级state中
// 11. resetStoreVM重置空vue且操作$$state
// 12.                                  -> 实例化空Vue并且作$$state上挂载当前处理后的state(store严格模式下校验是否外部改变了state异常)
// 13.                                  -> 作computed挂载
// 14. 添加插件 （是个数组格式）
// 15.        -> 官方提供了内置Logger插件
// 16.        -> 一般配合subscribe(订阅mutation),subscribeAction(订阅) 取消订阅 需要执行该方法执行后返回的函数
// 17. 是否启用devtool

/**1. 通过插件方式安装vuex */
// 源码 src/store.js 539-550 行
var Vue; // bind on install
function install(_Vue) {
  // 若注册过 则不重复注册
  if (Vue && _Vue === Vue) {
    {
      console.error('[vuex] already installed. Vue.use(Vuex) should be called only once.');
    }
    return;
  }
  Vue = _Vue;
  applyMixin(Vue);
}
// 使用mixin添加到beforeCreate钩子
function applyMixin(Vue) {
  var version = Number(Vue.version.split('.')[0]);
  // 这里判断Vue的版本 2.x以上则直接使用mixin混入 ： 同样是beforeCreate钩子上
  if (version >= 2) {
    Vue.mixin({ beforeCreate: vuexInit });
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    var _init = Vue.prototype._init;
    Vue.prototype._init = function (options) {
      if (options === void 0) options = {};

      options.init = options.init ? [vuexInit].concat(options.init) : vuexInit;
      _init.call(this, options);
    };
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */
  // 初始化vuex 这里调用的时候 已经是在beforeCreate钩子里面 此时的this指向vue实例
  // 拿到当前实例化Vue的时候的配置项 里面有store
  // 而store来自于 Vuex.Store({...})
  function vuexInit() {
    var options = this.$options;
    // store injection
    if (options.store) {
      // 这里给vue实例上添加$store方法 等于options中执行store方法 前面我们是es6省略了
      // 相同属性key-value 所以options里面有个store方法 而这个store方法指向Vuex.Store
      this.$store = typeof options.store === 'function' ? options.store() : options.store;
    } else if (options.parent && options.parent.$store) {
      // 这里是 组件树都会被赋值上父级的$store方法 所以不管嵌套多深 都会挂载$store指向父级
      // 初始化时绑定的$store方法
      this.$store = options.parent.$store;
    }
  }
}

/**2. Store */
// 源码 src/store.js
var Store = function Store(options) {
  var this$1 = this;
  if (options === void 0) options = {};

  // Auto install if it is not done yet and `window` has `Vue`.
  // To allow users to avoid auto-installation in some cases,
  // this code should be placed here. See #731

  // 这里也是检查是否存在Vue window下是否有Vue 既是不是window环境
  if (!Vue && typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
  }

  {
    assert(Vue, 'must call Vue.use(Vuex) before creating a store instance.');
    assert(typeof Promise !== 'undefined', 'vuex requires a Promise polyfill in this browser.');
    assert(this instanceof Store, 'store must be called with the new operator.');
  }
  // TODO: 1. 插件
  // 这个选项暴露出每次 mutation 的钩子。Vuex 插件就是一个函数，它接收 store 作为唯一参数
  var plugins = options.plugins;
  if (plugins === void 0) plugins = [];

  // TODO：2. 是否严格模式
  // 在严格模式下，无论何时发生了状态变更且不是由 mutation 函数引起的，将会抛出错误。
  // 这能保证所有的状态变更都能被调试工具跟踪到。
  var strict = options.strict;
  if (strict === void 0) strict = false;

  // store internal state
  this._committing = false; // 是否在进行提交状态标识
  this._actions = Object.create(null);
  this._actionSubscribers = [];
  this._mutations = Object.create(null);
  this._wrappedGetters = Object.create(null);
  // TODO: 这里是对含modules模式处理 后面来看 下面的3. 分析
  this._modules = new ModuleCollection(options);
  this._modulesNamespaceMap = Object.create(null);
  this._subscribers = [];
  this._watcherVM = new Vue(); // Vue 组件用于 watch 监视变化
  this._makeLocalGettersCache = Object.create(null);

  // bind commit and dispatch to self
  var store = this;
  var ref = this;
  // 这里从实例原型上拿到dispatch方法（Store.prototype.dispatch）
  var dispatch = ref.dispatch;
  var commit = ref.commit;
  // 但是这里给实例又添加了dispatch方法 相当于是包裹了一层
  // 这里既不影响原型上的方法 而且包裹了一层 最后还是调的原型方法
  // 做这一步包裹 主要当代码中这样使用时 也满足
  // 如： this.$store.dispatch.call(this,type,payload)
  this.dispatch = function boundDispatch(type, payload) {
    return dispatch.call(store, type, payload);
  };
  this.commit = function boundCommit(type, payload, options) {
    return commit.call(store, type, payload, options);
  };

  // strict mode
  this.strict = strict;

  var state = this._modules.root.state;

  // init root module.
  // this also recursively registers all sub-modules
  // and collects all module getters inside this._wrappedGetters
  installModule(this, state, [], this._modules.root);

  // initialize the store vm, which is responsible for the reactivity
  // (also registers _wrappedGetters as computed properties)
  resetStoreVM(this, state);

  // apply plugins
  plugins.forEach(function (plugin) {
    return plugin(this$1);
  });

  var useDevtools = options.devtools !== undefined ? options.devtools : Vue.config.devtools;
  if (useDevtools) {
    devtoolPlugin(this);
  }
};
// 2.1 执行提交
Store.prototype._withCommit = function _withCommit(fn) {
  var committing = this._committing;
  this._committing = true;
  fn();
  this._committing = committing;
};
// 2.2 执行提交mutations操作
Store.prototype.commit = function commit(_type, _payload, _options) {
  var this$1 = this;

  // check object-style commit
  // TODO：这里检查提交的第一个参数是不是对象格式(但是对象格式的话必须包含'type'的key值)
  // 比如：this.$store.commit('mutations-type',payload)
  // this.$store.commit({type:'mutations-type'},payload)
  var ref = unifyObjectStyle(_type, _payload, _options);
  var type = ref.type;
  var payload = ref.payload;
  var options = ref.options;
  // 组装标准mutation提交格式
  var mutation = { type: type, payload: payload };
  // 从之前组装的_mutations 拿当前type 若没得就报错 退出
  var entry = this._mutations[type];
  if (!entry) {
    {
      console.error('[vuex] unknown mutation type: ' + type);
    }
    return;
  }
  this._withCommit(function () {
    entry.forEach(function commitIterator(handler) {
      handler(payload);
    });
  });
  // TODO: 当每次执行完mutations时 会触发监听subscriber执行 并包含参数mutation和state
  this._subscribers
    .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
    .forEach(function (sub) {
      return sub(mutation, this$1.state);
    });

  if (options && options.silent) {
    console.warn('[vuex] mutation type: ' + type + '. Silent option has been removed. ' + 'Use the filter functionality in the vue-devtools');
  }
};
// 2.3 监听mutations
// 注意：这里返回了一个函数 根据文档中说执行这个函数就可以停止监听
Store.prototype.subscribe = function subscribe(fn, options) {
  return genericSubscribe(fn, this._subscribers, options);
};
// 2.4 监听actions
Store.prototype.subscribeAction = function subscribeAction(fn, options) {
  var subs = typeof fn === 'function' ? { before: fn } : fn;
  return genericSubscribe(subs, this._actionSubscribers, options);
};
// 2.5 处理监听函数
function genericSubscribe(fn, subs, options) {
  // 若当前subs(this._subscribers) 找不到改handler函数 则根据options来
  // 压入头部还是尾部 默认尾部
  if (subs.indexOf(fn) < 0) {
    options && options.prepend ? subs.unshift(fn) : subs.push(fn);
  }
  // 这里运用了函数闭包特性 保存了此时fn-handler函数 方便当我们执行取消时
  // 从数组中删除
  return function () {
    var i = subs.indexOf(fn);
    if (i > -1) {
      subs.splice(i, 1);
    }
  };
}
// 2.6 提交actions
Store.prototype.dispatch = function dispatch(_type, _payload) {
  var this$1 = this;

  // check object-style dispatch
  // TODO: 同理检查type类型
  var ref = unifyObjectStyle(_type, _payload);
  var type = ref.type;
  var payload = ref.payload;

  var action = { type: type, payload: payload };
  var entry = this._actions[type];
  if (!entry) {
    {
      console.error('[vuex] unknown action type: ' + type);
    }
    return;
  }

  // 1. TODO: 这里先看有没得actions操作监听
  // 若配置了 默认为提交处理前 before (可配置after 提交处理后)
  try {
    this._actionSubscribers
      .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
      .filter(function (sub) {
        return sub.before;
      })
      .forEach(function (sub) {
        return sub.before(action, this$1.state);
      });
  } catch (e) {
    {
      console.warn('[vuex] error in before action subscribers: ');
      console.error(e);
    }
  }
  // 2. TODO: 若存在对应的提交actions 且个数大于1则以Promise.all包裹所有的action提交操作
  // 若只有1个 则直接执行
  var result =
    entry.length > 1
      ? Promise.all(
          entry.map(function (handler) {
            return handler(payload);
          })
        )
      : entry[0](payload);
  // 注意：这里返回了Promise 那么我们可以在dispatch后可以执行.then操作        
  return new Promise(function (resolve, reject) {
    // 在前面entry[0](payload)时 我们使用res = Promise.resovle(res) 因此他会走成功回调
    // 这里就很关键 为什么说action操作时异步的 此时执行result.then()
    // 这里就涉及Promise知识了 .then操作是个异步 那么就会执行我们代码dispatch后面的内容
    // 因此说action是异步操作
    result.then(
      function (res) {
        try {
          // 执行监听after钩子
          this$1._actionSubscribers
            .filter(function (sub) {
              return sub.after;
            })
            .forEach(function (sub) {
              return sub.after(action, this$1.state);
            });
        } catch (e) {
          {
            console.warn('[vuex] error in after action subscribers: ');
            console.error(e);
          }
        }
        resolve(res);
      },
      function (error) {
        try {
          this$1._actionSubscribers
            .filter(function (sub) {
              return sub.error;
            })
            .forEach(function (sub) {
              return sub.error(action, this$1.state, error);
            });
        } catch (e) {
          {
            console.warn('[vuex] error in error action subscribers: ');
            console.error(e);
          }
        }
        reject(error);
      }
    );
  });
};

/**3. ModuleCollection 模块收集 */
var ModuleCollection = function ModuleCollection(rawRootModule) {
  // register root module (Vuex.Store options)
  // TODO：这里是初始化时 第一次注册 根store
  this.register([], rawRootModule, false);
};
/**
 *
 * @param {Array} path 模块路径集合 初始化为空数组
 * @param {*} rawModule 当前模块store对象
 * @param {*} runtime
 */
ModuleCollection.prototype.register = function register(path, rawModule, runtime) {
  var this$1 = this;
  if (runtime === void 0) runtime = true;
  // 检查它是不是合法的模块
  {
    assertRawModule(path, rawModule);
  }
  // 根据传入的store配置生成模块
  var newModule = new Module(rawModule, runtime);
  // TODO: 若path为空数组 则证明是一个根Store
  if (path.length === 0) {
    this.root = newModule;
  } else {
    // 若path不为空 则提取path的最开始到倒数第一个 变向说就是排除了最后一个
    var parent = this.get(path.slice(0, -1));
    // 说穿了就是找到各自的父级 将子级添加到父级的_children当中
    parent.addChild(path[path.length - 1], newModule);
  }

  // register nested modules
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function (rawChildModule, key) {
      this$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
};
// 断言推断是否是个module
var assertTypes = {
  getters: functionAssert, // 证明getter中配置项必须是一个函数
  mutations: functionAssert, // 证明mutations中配置项必须是一个函数
  actions: objectAssert, // 证明actions中配置项是一个函数或对象 这个很奇怪 平时基本不用
  // 类似：
  // actions:{
  //   {
  //     handler:function(){
  //       意思这样写 也得行？
  //     }
  //   }
  // }
};
var functionAssert = {
  assert: function (value) {
    return typeof value === 'function';
  },
  expected: 'function',
};
var objectAssert = {
  assert: function (value) {
    return typeof value === 'function' || (typeof value === 'object' && typeof value.handler === 'function');
  },
  expected: 'function or object with "handler" function',
};
function assertRawModule(path, rawModule) {
  Object.keys(assertTypes).forEach(function (key) {
    // 这里若在forEach中使用return 不会跳出循环 且跳过后面类似for -> continue
    if (!rawModule[key]) {
      return;
    }
    var assertOptions = assertTypes[key];
    forEachValue(rawModule[key], function (value, type) {
      assert(assertOptions.assert(value), makeAssertionMessage(path, key, type, value, assertOptions.expected));
    });
  });
}
ModuleCollection.prototype.get = function get(path) {
  // 这里使用一个累加器 将this.root作为第一次参数传入 分别调用获取子级
  // 这里就是变向的一直查找子级的子级 当然前提是path有很多值
  return path.reduce(function (module, key) {
    return module.getChild(key);
  }, this.root);
};
ModuleCollection.prototype.getNamespace = function getNamespace(path) {
  var module = this.root;
  return path.reduce(function (namespace, key) {
    module = module.getChild(key);
    return namespace + (module.namespaced ? key + '/' : '');
  }, '');
};

/**4. Module 模块 */
// Base data struct for store's module, package with some attribute and method
// 这块就是根据每个Store生成模块
var Module = function Module(rawModule, runtime) {
  this.runtime = runtime; // runtime属性
  // Store some children item
  this._children = Object.create(null); // 当前模块的子集
  // Store the origin module object which passed by programmer
  this._rawModule = rawModule; // 当前模块的原始完成Store数据
  var rawState = rawModule.state; // 取出当前模块的state项

  // Store the origin module's state
  // 若state是一个函数 则执行函数(意思state支持函数返回state 平时都是对象) 其余就直接挂载state
  this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};

  // 即每个Module包含 4个属性
  // {
  //   runtime,
  //   _children,
  //   _rawModule,
  //   state
  // }
};
Module.prototype.getChild = function getChild(key) {
  return this._children[key]; // 就是返回子级模块
};
Module.prototype.addChild = function addChild(key, module) {
  this._children[key] = module; // 给当前模块赋值上子级模块
};

/**5. 安装module */
/**
 *
 * @param {*} store
 * @param {*} rootState
 * @param {*} path
 * @param {*} module
 * @param {*} hot
 */
function installModule(store, rootState, path, module, hot) {
  var isRoot = !path.length;
  var namespace = store._modules.getNamespace(path); // 获取当前命名空间 根节点为''

  // register in namespace map
  if (module.namespaced) {
    if (store._modulesNamespaceMap[namespace] && true) {
      console.error('[vuex] duplicate namespace ' + namespace + ' for the namespaced module ' + path.join('/'));
    }
    store._modulesNamespaceMap[namespace] = module;
  }

  // set state
  // 非根节点时及非热更新时
  if (!isRoot && !hot) {
    // 获取当前module的父级state
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    // 做这步操作就是为了构造state树 但是是将当前父级下的所有子级state提升到
    // 父级的state上面 而不是所有都提升到根父级下 这点要注意
    store._withCommit(function () {
      {
        // TODO：这里就是判断当前module的名字是否包含在父级的state里面
        if (moduleName in parentState) {
          console.warn('[vuex] state field "' + moduleName + '" was overridden by a module with the same name at "' + path.join('.') + '"');
        }
      }
      // 这里调用vue的set方法将父级state上增加子级state
      // 但是有个区别 这个时候parentState并没有被Vue处理过 不存在__ob__
      // 所以这里只是做了个简单讲子级添加到父级
      // 搞不懂 为啥要用Vue的方法 这里不该就自己写个方法添加吗？？？
      Vue.set(parentState, moduleName, module.state);
    });
  }

  var local = (module.context = makeLocalContext(store, namespace, path));

  module.forEachMutation(function (mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });

  module.forEachAction(function (action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store, type, handler, local);
  });

  module.forEachGetter(function (getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });

  module.forEachChild(function (child, key) {
    // 这里就是递归执行 去注册所有的子级module
    installModule(store, rootState, path.concat(key), child, hot);
  });
}
/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 */
function makeLocalContext(store, namespace, path) {
  var noNamespace = namespace === '';

  var local = {
    dispatch: noNamespace
      ? store.dispatch
      : function (_type, _payload, _options) {
          var args = unifyObjectStyle(_type, _payload, _options);
          var payload = args.payload;
          var options = args.options;
          var type = args.type;

          if (!options || !options.root) {
            type = namespace + type;
            if (!store._actions[type]) {
              console.error('[vuex] unknown local action type: ' + args.type + ', global type: ' + type);
              return;
            }
          }

          return store.dispatch(type, payload);
        },

    commit: noNamespace
      ? store.commit
      : function (_type, _payload, _options) {
          var args = unifyObjectStyle(_type, _payload, _options);
          var payload = args.payload;
          var options = args.options;
          var type = args.type;

          if (!options || !options.root) {
            type = namespace + type;
            if (!store._mutations[type]) {
              console.error('[vuex] unknown local mutation type: ' + args.type + ', global type: ' + type);
              return;
            }
          }

          store.commit(type, payload, options);
        },
  };

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? function () {
            return store.getters;
          }
        : function () {
            return makeLocalGetters(store, namespace);
          },
    },
    state: {
      get: function () {
        return getNestedState(store.state, path);
      },
    },
  });

  return local;
}
// 5.1 遍历Mutation
Module.prototype.forEachMutation = function forEachMutation(fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn);
  }
};
// 5.1.1 注册Mutation
function registerMutation(store, type, handler, local) {
  var entry = store._mutations[type] || (store._mutations[type] = []);
  // 这里是引用类型 则变相的给当前_mutations的执行函数包裹了一个wrappedMutationHandler
  entry.push(function wrappedMutationHandler(payload) {
    handler.call(store, local.state, payload);
  });
}
// 5.2 遍历Action
Module.prototype.forEachAction = function forEachAction(fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn);
  }
};
// 5.2.1 注册Action
function registerAction(store, type, handler, local) {
  var entry = store._actions[type] || (store._actions[type] = []);
  entry.push(function wrappedActionHandler(payload) {
    
  // 执行到用户编写的action操作时 
  // action接收两个参数xxx_action({commit,dispatch,getters,rootGetters,rootState,state},payload)
    var res = handler.call(
      store,
      {
        dispatch: local.dispatch,
        commit: local.commit,
        getters: local.getters,
        state: local.state,
        rootGetters: store.getters,
        rootState: store.state,
      },
      payload
    );
    // TODO：这点很关键 当我们执行了用户编写的action时 若没有返回值 则直接Promise.resolve该值
    if (!isPromise(res)) {
      // 那么现在res是一个Promise且状态为fulfilled
      res = Promise.resolve(res);
    }
    // 若存在_devtoolHook 则给res<Promise>增加catch方法 通知devTool
    if (store._devtoolHook) {
      return res.catch(function (err) {
        store._devtoolHook.emit('vuex:error', err);
        throw err;
      });
    } else {
      // 没有 那么久直接返回res 他是一个Promsie
      return res;
    }
  });
}
// 5.3 遍历Getter
Module.prototype.forEachGetter = function forEachGetter(fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn);
  }
};
// 5.3.1 注册Getter
function registerGetter(store, type, rawGetter, local) {
  if (store._wrappedGetters[type]) {
    {
      console.error('[vuex] duplicate getter key: ' + type);
    }
    return;
  }
  store._wrappedGetters[type] = function wrappedGetter(store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    );
  };
}
// 遍历子级
Module.prototype.forEachChild = function forEachChild(fn) {
  forEachValue(this._children, fn);
};

/**6. 重置store的vm */
/**
 *
 * @param {*} store store实例
 * @param {*} state 经过处理提升过后的state
 * @param {*} hot 是否热更新
 */
function resetStoreVM(store, state, hot) {
  var oldVm = store._vm;

  // bind store public getters
  store.getters = {};
  // reset local getters cache
  store._makeLocalGettersCache = Object.create(null);
  var wrappedGetters = store._wrappedGetters;
  var computed = {};
  forEachValue(wrappedGetters, function (fn, key) {
    // use computed to leverage its lazy-caching mechanism
    // direct inline function use will lead to closure preserving oldVm.
    // using partial to return function with only arguments preserved in closure environment.
    computed[key] = partial(fn, store);
    Object.defineProperty(store.getters, key, {
      get: function () {
        return store._vm[key];
      },
      enumerable: true, // for local getters
    });
  });

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins

  // TODO: 这里很巧妙实例化了一个空的vue 上面来装载“$$state”挂载state和computed!!!
  var silent = Vue.config.silent;
  Vue.config.silent = true;
  store._vm = new Vue({
    data: {
      $$state: state,
    },
    computed: computed,
  });
  Vue.config.silent = silent;

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store);
  }

  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(function () {
        oldVm._data.$$state = null;
      });
    }
    Vue.nextTick(function () {
      return oldVm.$destroy();
    });
  }
}
// 6.1 当为Store严格模式的时候 给$$state添加监听
// 因为在前面我们实例化了一个vue
// 并且利用data初始化了$$state
// 当我们手动去修改$$state时 比如this.$store.state.xxx = 1
// 由于引用类型 会触发修改$$state 此时也就触发了$$state的setter函数
// 而setter会noticfy通知watcher者 watcher也就执行了cb 也就是下面的断言报错
function enableStrictMode(store) {
  store._vm.$watch(
    function () {
      return this._data.$$state;
    },
    function () {
      {
        assert(store._committing, 'do not mutate vuex store state outside mutation handlers.');
      }
    },
    { deep: true, sync: true }
  );
}

/**7. devtool 模块*/
function devtoolPlugin(store) {
  if (!devtoolHook) {
    return;
  }

  store._devtoolHook = devtoolHook;
  // 初始化 devtool
  devtoolHook.emit('vuex:init', store);
  // 注册空间旅行
  devtoolHook.on('vuex:travel-to-state', function (targetState) {
    store.replaceState(targetState);
  });
  // 监听mutations
  store.subscribe(
    function (mutation, state) {
      devtoolHook.emit('vuex:mutation', mutation, state);
    },
    { prepend: true }
  );
  // 监听actions
  store.subscribeAction(
    function (action, state) {
      devtoolHook.emit('vuex:action', action, state);
    },
    { prepend: true }
  );
}
