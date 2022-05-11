// vue-router 源码分析
// date: 2021-03-26
// 1. import Vue VueRouter 进来
// 2. 使用Vue.use(VueRouter) 来进行router的install
//                                               -> 使用mixin混入每个组件钩子“beforeCreate”&“destroyed”
//                                               -> Object.defineProperty定义拦截“$router”&"$route"
//                                               -> Vue.component注册“router-view” & "router-link"
//                                               -> 挂载组件上钩子函数（守卫）‘beforeRouterEnter’ & ‘beforeRouteLeave’ & ‘beforeRouteUpdate’
// 3. 执行new VueRouter里面逻辑
//                            -> 根据用户定义的routes构建匹配器
//                            -> 根据mode进行不同模式进行初始化
// 4. 若传入了router给实例
//                        -> 则触发组件里面beforeCreated钩子中判断 isDef(this.$options.router)
//                        -> 触发VueRouter的init 初始化方法 且调用transitionTo方法来让路由切换
//                        -> 内部继续调用confirmTransition方法 执行真正切换

/**1. 通过插件方式安装vue-router */
// 源码 src/install.js

// 引入官方组件 router-view router-link
import View from './components/view';
import Link from './components/link';

export let _Vue;

export function install(Vue) {
  // TODO：1. 这里作一次 已经安装过的时候 直接返回
  if (install.installed && _Vue === Vue) return;
  install.installed = true;

  _Vue = Vue;

  const isDef = v => v !== undefined;

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode;
    if (isDef(i) && isDef((i = i.data)) && isDef((i = i.registerRouteInstance))) {
      i(vm, callVal);
    }
  };

  // TODO：2. 这个地方通过插件install方法传入Vue实例
  // 再通过Vue.mixin 混入beforeCreate&destroyed两个钩子函数
  // 这个地方我们需要注意 这里是在我们进行mixin后 那么后面的所有子组件都会有这两个钩子函数 将这两者压入options里面
  Vue.mixin({
    beforeCreate() {
      // 挂载到所有组件中 每次来判断 $options里面是否有router值
      if (isDef(this.$options.router)) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this);
        Vue.util.defineReactive(this, '_route', this._router.history.current);
      } else {
        // 若莫得 若其父级存在 则赋值_routerRoot 若均无 则直接给vue实例
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
      }
      // TODO: 注册实例
      registerInstance(this, this);
    },
    destroyed() {
      registerInstance(this);
    },
  });

  // TODO: 3. 这个地方也很关键 就是在Vue.prototype原型上 设置$router 及$route属性的 getter方法重写
  // 所以我们经常在代码中使用this.$router this.$route 这里就是映射到vue-router的实例属性
  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot._router;
    },
  });

  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot._route;
    },
  });

  // TODO: 4. 这个里面通过Vue全局注册了router-view router-link的组件
  // 所以我们经常在代码中可以随意使用这两个组件
  Vue.component('RouterView', View); // router-view 这个组件是个函数式组件
  Vue.component('RouterLink', Link);

  const strats = Vue.config.optionMergeStrategies;
  // use the same hook merging strategy for route hooks
  // TODO: 5. 这个地方是获取到Vue配置项所有方法 并且将路由的组件钩子挂载到Vue上面
  // 因此 我们经常在代码里面使用 组件内路由钩子函数
  // beforeRouterEnter
  // beforeRouteLeave
  // beforeRouteUpdate
  // 与created 对应的mergeHook一致
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
}

/**2. 初始化 */
// 源码 src/index.js
var VueRouter = function VueRouter(options) {
  if (options === void 0) options = {};

  this.app = null;
  this.apps = [];
  this.options = options;
  this.beforeHooks = [];
  this.resolveHooks = [];
  this.afterHooks = [];
  // TODO: 这里根据我们传入的routes 路由匹配器 并且在new VueRouter的时候就去做了这件事
  this.matcher = createMatcher(options.routes || [], this);
  // TODO: 这里设置路由模式 默认为hash模式
  var mode = options.mode || 'hash';
  // TODO: 这里当设置为history模式时 但是不支持history.pushState时 根据fallback来决定是否回退到hash模式
  this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false;
  if (this.fallback) {
    mode = 'hash';
  }
  // TODO：如果不是浏览器环境 则直接启用abstract模式路由
  if (!inBrowser) {
    mode = 'abstract';
  }
  this.mode = mode;
  // TODO: 这里会根据mode的不同 去分别创建对应的history模式实例 后面分别来分析下这些类分别做了些啥
  // 这里所有得模式都是基于History基类 下面先了解下History基类
  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base);
      break;
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback);
      break;
    case 'abstract':
      this.history = new AbstractHistory(this, options.base);
      break;
    default: {
      assert(false, 'invalid mode: ' + mode);
    }
  }
};
// 2.1 根据路由配置项 来创建匹配器
// [
//   {
//     path: "/",
//     redirect: "/login"
//   },
//   {
//     path: "/home",
//     component: () => import("Layout/"),
//     redirect: "/",
//     children: [
//       {
//         path: "/",
//         name: "home",
//         component: () => import("Pages/Home/"),
//         meta: {
//           index: 1,
//           title: "xxx",
//           isBackAppRouter: true
//         }
//       }
//     ]
//   }
// ]
function createMatcher(routes, router) {
  var ref = createRouteMap(routes);
  var pathList = ref.pathList;
  var pathMap = ref.pathMap;
  var nameMap = ref.nameMap;

  function addRoutes(routes) {
    createRouteMap(routes, pathList, pathMap, nameMap);
  }

  function addRoute(parentOrRoute, route) {
    var parent = typeof parentOrRoute !== 'object' ? nameMap[parentOrRoute] : undefined;
    // $flow-disable-line
    createRouteMap([route || parentOrRoute], pathList, pathMap, nameMap, parent);

    // add aliases of parent
    if (parent) {
      createRouteMap(
        // $flow-disable-line route is defined if parent is
        parent.alias.map(function (alias) {
          return { path: alias, children: [route] };
        }),
        pathList,
        pathMap,
        nameMap,
        parent
      );
    }
  }

  function getRoutes() {
    return pathList.map(function (path) {
      return pathMap[path];
    });
  }

  function match(raw, currentRoute, redirectedFrom) {
    var location = normalizeLocation(raw, currentRoute, false, router);
    var name = location.name;

    if (name) {
      var record = nameMap[name];
      {
        warn(record, "Route with name '" + name + "' does not exist");
      }
      if (!record) {
        return _createRoute(null, location);
      }
      var paramNames = record.regex.keys
        .filter(function (key) {
          return !key.optional;
        })
        .map(function (key) {
          return key.name;
        });

      if (typeof location.params !== 'object') {
        location.params = {};
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        for (var key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key];
          }
        }
      }

      location.path = fillParams(record.path, location.params, 'named route "' + name + '"');
      return _createRoute(record, location, redirectedFrom);
    } else if (location.path) {
      location.params = {};
      for (var i = 0; i < pathList.length; i++) {
        var path = pathList[i];
        var record$1 = pathMap[path];
        if (matchRoute(record$1.regex, location.path, location.params)) {
          return _createRoute(record$1, location, redirectedFrom);
        }
      }
    }
    // no match
    return _createRoute(null, location);
  }

  function redirect(record, location) {
    var originalRedirect = record.redirect;
    var redirect = typeof originalRedirect === 'function' ? originalRedirect(createRoute(record, location, null, router)) : originalRedirect;

    if (typeof redirect === 'string') {
      redirect = { path: redirect };
    }

    if (!redirect || typeof redirect !== 'object') {
      {
        warn(false, 'invalid redirect option: ' + JSON.stringify(redirect));
      }
      return _createRoute(null, location);
    }

    var re = redirect;
    var name = re.name;
    var path = re.path;
    var query = location.query;
    var hash = location.hash;
    var params = location.params;
    query = re.hasOwnProperty('query') ? re.query : query;
    hash = re.hasOwnProperty('hash') ? re.hash : hash;
    params = re.hasOwnProperty('params') ? re.params : params;

    if (name) {
      // resolved named direct
      var targetRecord = nameMap[name];
      {
        assert(targetRecord, 'redirect failed: named route "' + name + '" not found.');
      }
      return match(
        {
          _normalized: true,
          name: name,
          query: query,
          hash: hash,
          params: params,
        },
        undefined,
        location
      );
    } else if (path) {
      // 1. resolve relative redirect
      var rawPath = resolveRecordPath(path, record);
      // 2. resolve params
      var resolvedPath = fillParams(rawPath, params, 'redirect route with path "' + rawPath + '"');
      // 3. rematch with existing query and hash
      return match(
        {
          _normalized: true,
          path: resolvedPath,
          query: query,
          hash: hash,
        },
        undefined,
        location
      );
    } else {
      {
        warn(false, 'invalid redirect option: ' + JSON.stringify(redirect));
      }
      return _createRoute(null, location);
    }
  }

  function alias(record, location, matchAs) {
    var aliasedPath = fillParams(matchAs, location.params, 'aliased route with path "' + matchAs + '"');
    var aliasedMatch = match({
      _normalized: true,
      path: aliasedPath,
    });
    if (aliasedMatch) {
      var matched = aliasedMatch.matched;
      var aliasedRecord = matched[matched.length - 1];
      location.params = aliasedMatch.params;
      return _createRoute(aliasedRecord, location);
    }
    return _createRoute(null, location);
  }

  function _createRoute(record, location, redirectedFrom) {
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location);
    }
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs);
    }
    return createRoute(record, location, redirectedFrom, router);
  }

  return {
    match: match,
    addRoute: addRoute,
    getRoutes: getRoutes,
    addRoutes: addRoutes,
  };
}
// 2.1.1 创建路由map
function createRouteMap(routes, oldPathList, oldPathMap, oldNameMap, parentRoute) {
  // the path list is used to control path matching priority
  var pathList = oldPathList || [];
  // $flow-disable-line
  var pathMap = oldPathMap || Object.create(null);
  // $flow-disable-line
  var nameMap = oldNameMap || Object.create(null);

  routes.forEach(function (route) {
    addRouteRecord(pathList, pathMap, nameMap, route, parentRoute);
  });

  // ensure wildcard routes are always at the end
  for (var i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0]);
      l--;
      i--;
    }
  }

  {
    // warn if routes do not include leading slashes
    var found = pathList
      // check for missing leading slash
      .filter(function (path) {
        return path && path.charAt(0) !== '*' && path.charAt(0) !== '/';
      });

    if (found.length > 0) {
      var pathNames = found
        .map(function (path) {
          return '- ' + path;
        })
        .join('\n');
      warn(false, 'Non-nested routes must include a leading slash character. Fix the following routes: \n' + pathNames);
    }
  }
  // TODO: 这里就是根据我们设置的routes 生成路径的list 路径的map 名称的map
  return {
    pathList: pathList,
    pathMap: pathMap,
    nameMap: nameMap,
  };
}
// 2.1.1.1 添加路由参数
// interface RouteConfig = {
//   path: string,
//   component?: Component,
//   name?: string, // 命名路由
//   components?: { [name: string]: Component }, // 命名视图组件
//   redirect?: string | Location | Function,
//   props?: boolean | Object | Function,
//   alias?: string | Array<string>,
//   children?: Array<RouteConfig>, // 嵌套路由
//   beforeEnter?: (to: Route, from: Route, next: Function) => void,
//   meta?: any,

//   // 2.6.0+
//   caseSensitive?: boolean, // 匹配规则是否大小写敏感？(默认值：false)
//   pathToRegexpOptions?: Object // 编译正则的选项
// }
function addRouteRecord(pathList, pathMap, nameMap, route, parent, matchAs) {
  var path = route.path; // 获取每项配置的path属性
  var name = route.name; // 获取每项配置的name属性
  {
    assert(path != null, '"path" is required in a route configuration.');
    assert(typeof route.component !== 'string', 'route config "component" for path: ' + String(path || name) + ' cannot be a ' + 'string id. Use an actual component instead.');

    warn(
      // eslint-disable-next-line no-control-regex
      !/[^\u0000-\u007F]+/.test(path),
      'Route with path "' +
        path +
        '" contains unencoded characters, make sure ' +
        'your path is correctly encoded before passing it to the router. Use ' +
        'encodeURI to encode static segments of your path.'
    );
  }

  var pathToRegexpOptions = route.pathToRegexpOptions || {}; // 编译正则的选项
  var normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict);

  if (typeof route.caseSensitive === 'boolean') {
    pathToRegexpOptions.sensitive = route.caseSensitive;
  }

  var record = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    alias: route.alias ? (typeof route.alias === 'string' ? [route.alias] : route.alias) : [],
    instances: {},
    enteredCbs: {},
    name: name,
    parent: parent,
    matchAs: matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props: route.props == null ? {} : route.components ? route.props : { default: route.props },
  };

  // 若存在嵌套路由
  if (route.children) {
    // Warn if route is named, does not redirect and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    {
      if (
        route.name &&
        !route.redirect &&
        route.children.some(function (child) {
          return /^\/?$/.test(child.path);
        })
      ) {
        warn(
          false,
          "Named Route '" +
            route.name +
            "' has a default child route. " +
            'When navigating to this named route (:to="{name: \'' +
            route.name +
            '\'"), ' +
            'the default child route will not be rendered. Remove the name from ' +
            'this route and use the name of the default child route for named ' +
            'links instead.'
        );
      }
    }
    route.children.forEach(function (child) {
      var childMatchAs = matchAs ? cleanPath(matchAs + '/' + child.path) : undefined;
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
    });
  }

  // 若在pathMap中找不到当前path规则 则将当前path压入pathList 且pathMap中构建以path为key value值为record的map格式
  if (!pathMap[record.path]) {
    pathList.push(record.path);
    pathMap[record.path] = record;
  }

  if (route.alias !== undefined) {
    var aliases = Array.isArray(route.alias) ? route.alias : [route.alias];
    for (var i = 0; i < aliases.length; ++i) {
      var alias = aliases[i];
      if (alias === path) {
        warn(false, 'Found an alias with the same value as the path: "' + path + '". You have to remove that alias. It will be ignored in development.');
        // skip in dev to make it work
        continue;
      }

      var aliasRoute = {
        path: alias,
        children: route.children,
      };
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/' // matchAs
      );
    }
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record;
    } else if (!matchAs) {
      warn(false, 'Duplicate named routes definition: ' + '{ name: "' + name + '", path: "' + record.path + '" }');
    }
  }
}
// 针对每项的path进行处理
function normalizePath(path, parent, strict) {
  // TODO：若没设置 正则匹配 则将执行替换 将只是单个/ 匹配替换为'' 如/ -> '' /home -> /home
  if (!strict) {
    path = path.replace(/\/$/, '');
  }
  // TODO：若存在正常的path 这里是通过字符串的第一个位置判断是否等于/ 来返回path 比如 /home path[0]==='/'
  if (path[0] === '/') {
    return path;
  }
  if (parent == null) {
    return path;
  }
  return cleanPath(parent.path + '/' + path);
}
function cleanPath(path) {
  return path.replace(/\/\//g, '/');
}
// 2.2 VueRouter init原型方法
VueRouter.prototype.init = function init(app /* Vue component instance */) {
  var this$1 = this;

  assert(install.installed, 'not installed. Make sure to call `Vue.use(VueRouter)` ' + 'before creating root instance.');

  // 将当前Vue实例压入apps
  this.apps.push(app);

  // TODO: 并且给当前vue注册一次钩子函数操作
  // set up app destroyed handler
  // https://github.com/vuejs/vue-router/issues/2639
  app.$once('hook:destroyed', function () {
    // clean out app from this.apps array once destroyed
    var index = this$1.apps.indexOf(app);
    if (index > -1) {
      this$1.apps.splice(index, 1);
    }
    // ensure we still have a main app or null if no apps
    // we do not release the router so it can be reused
    if (this$1.app === app) {
      this$1.app = this$1.apps[0] || null;
    }

    if (!this$1.app) {
      this$1.history.teardown();
    }
  });

  // main app previously initialized
  // return as we don't need to set up new history listener
  if (this.app) {
    return;
  }
  // TODO: 赋值当前router实例上得app 为当前vue实例
  this.app = app;

  var history = this.history;

  // TODO：这里判断history属于HTML5History&HashHistory
  if (history instanceof HTML5History || history instanceof HashHistory) {
    var handleInitialScroll = function (routeOrError) {
      var from = history.current;
      var expectScroll = this$1.options.scrollBehavior;
      var supportsScroll = supportsPushState && expectScroll;

      if (supportsScroll && 'fullPath' in routeOrError) {
        handleScroll(this$1, routeOrError, from, false);
      }
    };
    var setupListeners = function (routeOrError) {
      // TODO：这里很关键 执行了history的setupListeners方法
      // 这里基类History没有实现 靠继承的3种子类分别实现（不知道可以理解为方法的重载不）
      history.setupListeners();

      handleInitialScroll(routeOrError);
    };
    // TODO: 这里调用transitionTo方法
    // 参数1：首先获取当前的路径
    // 参数2：setupListeners
    // 参数3：setupListeners
    history.transitionTo(history.getCurrentLocation(), setupListeners, setupListeners);
  }

  // TODO：且调用listen方法
  history.listen(function (route) {
    this$1.apps.forEach(function (app) {
      app._route = route;
    });
  });
};
// 2.3 VueRouter match原型方法
VueRouter.prototype.match = function match(raw, current, redirectedFrom) {
  // 这里又调用之前createMatcher里面返回的match方法 前面193行
  return this.matcher.match(raw, current, redirectedFrom);
};
// 2.3.1 处理location
function normalizeLocation(raw, current, append, router) {
  var next = typeof raw === 'string' ? { path: raw } : raw;
  // named target
  if (next._normalized) {
    return next;
  } else if (next.name) {
    next = extend({}, raw);
    var params = next.params;
    if (params && typeof params === 'object') {
      next.params = extend({}, params);
    }
    return next;
  }

  // relative params
  if (!next.path && next.params && current) {
    next = extend({}, next);
    next._normalized = true;
    var params$1 = extend(extend({}, current.params), next.params);
    if (current.name) {
      next.name = current.name;
      next.params = params$1;
    } else if (current.matched.length) {
      var rawPath = current.matched[current.matched.length - 1].path;
      next.path = fillParams(rawPath, params$1, 'path ' + current.path);
    } else {
      warn(false, 'relative params navigation requires a current route.');
    }
    return next;
  }

  var parsedPath = parsePath(next.path || '');
  var basePath = (current && current.path) || '/';
  var path = parsedPath.path ? resolvePath(parsedPath.path, basePath, append || next.append) : basePath;

  var query = resolveQuery(parsedPath.query, next.query, router && router.options.parseQuery);

  var hash = next.hash || parsedPath.hash;
  if (hash && hash.charAt(0) !== '#') {
    hash = '#' + hash;
  }

  return {
    _normalized: true,
    path: path,
    query: query,
    hash: hash,
  };
}

/**3. History 基类 */
// 源码 src/history/base.js
var History = function History(router, base) {
  this.router = router;
  this.base = normalizeBase(base);
  // start with a route object that stands for "nowhere"
  this.current = START; // 创建了一个以/的默认路由配置
  this.pending = null;
  this.ready = false;
  this.readyCbs = [];
  this.readyErrorCbs = [];
  this.errorCbs = [];
  this.listeners = [];
};

History.prototype.listen = function listen(cb) {
  this.cb = cb;
};

History.prototype.onReady = function onReady(cb, errorCb) {
  if (this.ready) {
    cb();
  } else {
    this.readyCbs.push(cb);
    if (errorCb) {
      this.readyErrorCbs.push(errorCb);
    }
  }
};

History.prototype.onError = function onError(errorCb) {
  this.errorCbs.push(errorCb);
};

History.prototype.transitionTo = function transitionTo(location, onComplete, onAbort) {
  var this$1 = this;

  var route;
  // catch redirect option https://github.com/vuejs/vue-router/issues/3201
  try {
    route = this.router.match(location, this.current);
  } catch (e) {
    this.errorCbs.forEach(function (cb) {
      cb(e);
    });
    // Exception should still be thrown
    throw e;
  }
  var prev = this.current;
  this.confirmTransition(
    route,
    function () {
      // TODO: 1. 这里将route赋值current 进行当前路由更新
      this$1.updateRoute(route);
      // TODO: 2. 这里添加执行setupListeners 中添加'popState'监听 并将removeEvent添加到listens
      // 这么做的意义在于 当我们点击浏览器的返回或前进是 会触发
      onComplete && onComplete(route);
      // TODO: 3. 执行浏览器url的替换操作
      this$1.ensureURL();
      // TODO：4. 执行router全局afterEach钩子函数
      this$1.router.afterHooks.forEach(function (hook) {
        hook && hook(route, prev); // TODO：这里需要注意afterEach钩子里面只有两个参数
        // 一个route(to) 一个prev(from)
      });

      // fire ready cbs once
      if (!this$1.ready) {
        this$1.ready = true;
        this$1.readyCbs.forEach(function (cb) {
          cb(route);
        });
      }
    },
    function (err) {
      if (onAbort) {
        onAbort(err);
      }
      if (err && !this$1.ready) {
        // Initial redirection should not mark the history as ready yet
        // because it's triggered by the redirection instead
        // https://github.com/vuejs/vue-router/issues/3225
        // https://github.com/vuejs/vue-router/issues/3331
        if (!isNavigationFailure(err, NavigationFailureType.redirected) || prev !== START) {
          this$1.ready = true;
          this$1.readyErrorCbs.forEach(function (cb) {
            cb(err);
          });
        }
      }
    }
  );
};
// TODO: 做真正的切换路径操作
History.prototype.confirmTransition = function confirmTransition(route, onComplete, onAbort) {
  var this$1 = this;

  var current = this.current;
  this.pending = route;
  var abort = function (err) {
    // changed after adding errors with
    // https://github.com/vuejs/vue-router/pull/3047 before that change,
    // redirect and aborted navigation would produce an err == null
    if (!isNavigationFailure(err) && isError(err)) {
      if (this$1.errorCbs.length) {
        this$1.errorCbs.forEach(function (cb) {
          cb(err);
        });
      } else {
        warn(false, 'uncaught error during route navigation:');
        console.error(err);
      }
    }
    onAbort && onAbort(err);
  };
  var lastRouteIndex = route.matched.length - 1;
  var lastCurrentIndex = current.matched.length - 1;
  // TODO: 若当前路径与解析后的route一致 则进行ensureURL操作
  if (
    isSameRoute(route, current) &&
    // in the case the route map has been dynamically appended to
    lastRouteIndex === lastCurrentIndex &&
    route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
  ) {
    this.ensureURL();
    return abort(createNavigationDuplicatedError(current, route));
  }

  // TODO: 根据当前的matched 与 解析后的route的matched 生成3个队列
  var ref = resolveQueue(this.current.matched, route.matched);
  var updated = ref.updated;
  var deactivated = ref.deactivated;
  var activated = ref.activated;

  // TODO: 这里肯定就是作各种钩子函数的合并 这个地方就显示出我们经常在使用
  // router里面各种钩子函数的执行生命周期
  // 1. 构造失活组件内的“beforeRouteLeave”钩子函数 ->
  // 2. 构造全局“beforeEach”钩子（定义在VueRouter上面的钩子函数 router.beforeEach）->
  // 3. 构造组件内“beforeRouteUpdate”钩子函数（若当前组件存在被复用的话 执行）->
  // 4. 构造我们即将响应的路由配置项里面的独有“beforeEnter”钩子函数 ->
  // 5. 根据即将响应的路由配置中的component选项中的异步组件 ->

  var queue = [].concat(
    // in-component leave guards
    extractLeaveGuards(deactivated), // TODO: 组件内的leave 守卫
    // global before hooks
    this.router.beforeHooks, // TODO：全局before钩子
    // in-component update hooks
    extractUpdateHooks(updated), // TODO: 组件内的update 守卫
    // in-config enter guards
    activated.map(function (m) {
      // TODO：在routes中的beforeEnter 守卫
      return m.beforeEnter;
    }),
    // async components
    resolveAsyncComponents(activated) // TODO: 解析 异步组件
  );

  var iterator = function (hook, next) {
    if (this$1.pending !== route) {
      return abort(createNavigationCancelledError(current, route));
    }
    try {
      // TODO: 这里传入route也就是to current也就是from function也就是next
      // 也可以看出 这里执行的钩子函数都是3个参数
      // 而且next可以传参'to' 平时我们用最多next() 其实是可以根据参数来判断
      // 而且很重要的一点就是必须执行next()去resolveRouter 才会调用下一个路由
      // 原因看runQueue函数 默认会执行回调来使step++ 执行下一个
      hook(route, current, function (to) {
        // TODO: 来看下next里面可以传哪些参数

        // 1. false -> 修改浏览器地址 -> 取消函数
        if (to === false) {
          // next(false) -> abort navigation, ensure current URL
          // 首先修改浏览器地址 push进浏览器栈
          this$1.ensureURL(true);
          // 调用取消函数
          abort(createNavigationAbortedError(current, route));
        }
        // 2. 参数to有错误 -> 修改浏览器地址 -> 取消函数
        else if (isError(to)) {
          this$1.ensureURL(true);
          abort(to);
        }
        // 3. 参数to是个字符串 或者是个对象 但是对象里面必须包含path||name
        else if (typeof to === 'string' || (typeof to === 'object' && (typeof to.path === 'string' || typeof to.name === 'string'))) {
          // next('/') or next({ path: '/' }) -> redirect
          // 这里需要先取消当前匹配的route（原计划进行的）结果中途next强行改变了路由 所以要先取消
          abort(createNavigationRedirectedError(current, route));
          // 这个地方可以看出 也可以传递replace 如：next({replact:true,path:'/xxx'}) 则执行replace
          if (typeof to === 'object' && to.replace) {
            this$1.replace(to);
          } else {
            // 默认执行push操作
            this$1.push(to);
          }
        }
        // 4. 无参数to -> next() -> 直接执行匹配到得route进行路由切换
        else {
          // confirm transition and pass on the value
          next(to);
        }
      });
    } catch (e) {
      abort(e);
    }
  };
  // TODO：第一个执行队列函数（针对即将离开的组件 所执行钩子函数）
  runQueue(queue, iterator, function () {
    // wait until async components are resolved before
    // extracting in-component enter guards

    // 6. 构造即将响应路由所对应的组件内'beforeRouteEnter' ->
    // 这个地方很关键 到代码执行到这个时候 即将响应的组件并未解析成功也就是没出来
    // 所以这个钩子的时候 是获取不到vue 实例this
    var enterGuards = extractEnterGuards(activated);
    // 7. 继续构造全局路由钩子函数"beforeResolve" ->
    var queue = enterGuards.concat(this$1.router.resolveHooks);

    // TODO: 第二个执行队列函数（针对即将激活的组件 所执行的钩子函数）
    runQueue(queue, iterator, function () {
      if (this$1.pending !== route) {
        return abort(createNavigationCancelledError(current, route));
      }
      // TODO：在执行完beforeRouteEnter和beforeResolve后
      this$1.pending = null;
      onComplete(route);
      if (this$1.router.app) {
        // TODO: 这里很巧妙 使用nextTick压入异步队列 等待组件生成且渲染完毕后 再调用
        this$1.router.app.$nextTick(function () {
          handleRouteEntered(route);
        });
      }
    });
  });
};
// TODO: 待组件渲染完成 若之前在beforeRouteEnter中 在next函数里面使用了回调函数
function handleRouteEntered(route) {
  for (var i = 0; i < route.matched.length; i++) {
    var record = route.matched[i];
    for (var name in record.instances) {
      var instance = record.instances[name];
      var cbs = record.enteredCbs[name];
      if (!instance || !cbs) {
        continue;
      }
      delete record.enteredCbs[name];
      for (var i$1 = 0; i$1 < cbs.length; i$1++) {
        if (!instance._isBeingDestroyed) {
          cbs[i$1](instance); // 这个地方就是为啥在回调里面能拿到vm
        }
      }
    }
  }
}

History.prototype.updateRoute = function updateRoute(route) {
  this.current = route;
  this.cb && this.cb(route);
};

History.prototype.setupListeners = function setupListeners() {
  // Default implementation is empty
};

History.prototype.teardown = function teardown() {
  // clean up event listeners
  // https://github.com/vuejs/vue-router/issues/2341
  this.listeners.forEach(function (cleanupListener) {
    cleanupListener();
  });
  this.listeners = [];

  // reset current history route
  // https://github.com/vuejs/vue-router/issues/3294
  this.current = START;
  this.pending = null;
};
// TODO: 3.1 处理router配置base路由前缀
function normalizeBase(base) {
  if (!base) {
    if (inBrowser) {
      // respect <base> tag
      var baseEl = document.querySelector('base');
      base = (baseEl && baseEl.getAttribute('href')) || '/';
      // strip full URL origin
      base = base.replace(/^https?:\/\/[^\/]+/, '');
    } else {
      base = '/';
    }
  }
  // make sure there's the starting slash
  // 若只是单纯的base名称 则手动匹配上 如:base:'xxx' 则处理过后的base为 '/xxx'
  if (base.charAt(0) !== '/') {
    base = '/' + base;
  }
  // remove trailing slash
  // 若base:'/' 配置 则base处理为 ''
  return base.replace(/\/$/, '');
}
// TODO: 3.2 这里有个常量 通过createRoute来创建
var START = createRoute(null, {
  path: '/',
});
// TODO: 3.3 createRoute 创建一个默认的冻结对象
function createRoute(record, location, redirectedFrom, router) {
  var stringifyQuery = router && router.options.stringifyQuery;

  var query = location.query || {};
  try {
    query = clone(query);
  } catch (e) {}

  var route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query: query,
    params: location.params || {},
    fullPath: getFullPath(location, stringifyQuery),
    matched: record ? formatMatch(record) : [],
  };
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery);
  }
  return Object.freeze(route);
}
// TODO: 3.4 针对3种状态解析出各自的队列数据
function resolveQueue(current, next) {
  var i;
  var max = Math.max(current.length, next.length);
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break;
    }
  }
  // route.matched 是一个 RouteRecord 的数组，
  // 由于路径是由 current 变向 route，
  // 那么就遍历对比 2 边的 RouteRecord，找到一个不一样的位置 i，
  // 那么 next 中从 0 到 i 的 RouteRecord 是两边都一样，则为 updated 的部分；
  // 从 i 到最后的 RouteRecord 是 next 独有的，为 activated 的部分；
  // 而 current 中从 i 到最后的 RouteRecord 则没有了，为 deactivated 的部分。
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i),
  };
}
// TODO: 3.6 提取守卫
/**
 *
 * @param {*} records 当前需要执行的路由集合
 * @param {*} name 需要执行钩子函数的名称
 * @param {*} bind 钩子回调绑定方法
 * @param {*} reverse 是否需要转换
 * @returns
 */
function extractGuards(records, name, bind, reverse) {
  // TODO: 这里执行flatMapComponents 针对route中的组件集合进行拍平操作
  // def -> 路由所对应的组件
  // instance -> 实例
  // match -> matched里面的route
  // key表示 当前组件key 默认为default
  var guards = flatMapComponents(records, function (def, instance, match, key) {
    var guard = extractGuard(def, name);
    // 若当前钩子函数存在 则遍历执行当前钩子函数中每个钩子函数定义
    if (guard) {
      return Array.isArray(guard)
        ? guard.map(function (guard) {
            return bind(guard, instance, match, key);
          })
        : bind(guard, instance, match, key);
    }
  });
  return flatten(reverse ? guards.reverse() : guards);
}
function flatMapComponents(matched, fn) {
  return flatten(
    matched.map(function (m) {
      return Object.keys(m.components).map(function (key) {
        return fn(m.components[key], m.instances[key], m, key);
      });
    })
  );
}
function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}
// TODO: 这里拿到def也就是我们路由配置的组件 调用_Vue实例上的extend方法 进行父子级的扩展
// 获取到已扩展为vue组件的子级实例 且返回当前实例的 钩子函数路由名称 函数
function extractGuard(def, key) {
  // TODO：这里的def 指的是我们在routes里面配置的component项
  // 同步加载组件时 这个时候def 是一个Object对象 描述的是组件信息
  // 异步加载组件时 这个时候def 是一个function包裹
  // 所以这里判断当def不是异步组件的时候 就直接使用Vue.extend方法来生成Sub子级 并返回带Vue实例init
  // 初始化的方法函数 等待被调用进行子组件生成
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    def = _Vue.extend(def);
  }
  // 并且返回当前钩子函数 待执行状态
  return def.options[key];
}
// TODO: 3.5 提取离开的守卫
/**
 *
 * @param {*} deactivated 需要参数：过期路由 -》 来触发current路由离开（leave）钩子
 *                        beforeRouteLeave
 * @returns extractGuards
 */
function extractLeaveGuards(deactivated) {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true);
}
// TODO: 3.7 提取卫针对复用组件中的beforeRouteUpdate 守卫
function extractUpdateHooks(updated) {
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard);
}
function bindGuard(guard, instance) {
  if (instance) {
    return function boundRouteGuard() {
      return guard.apply(instance, arguments);
    };
  }
}
// TODO: 3.8 解析激将路由所包含的异步组件
function resolveAsyncComponents(matched) {
  return function (to, from, next) {
    var hasAsync = false;
    var pending = 0;
    var error = null;

    flatMapComponents(matched, function (def, _, match, key) {
      // if it's a function and doesn't have cid attached,
      // assume it's an async component resolve function.
      // we are not using Vue's default async resolving mechanism because
      // we want to halt the navigation until the incoming component has been
      // resolved.

      // TODO：同理 这个地方也是判断def 是不是一个function包裹的异步组件
      if (typeof def === 'function' && def.cid === undefined) {
        hasAsync = true;
        pending++;

        var resolve = once(function (resolvedDef) {
          if (isESModule(resolvedDef)) {
            resolvedDef = resolvedDef.default;
          }
          // save resolved on async factory in case it's used elsewhere
          
          // 这里同理 也是判断resolvedDef当前是否
          def.resolved = typeof resolvedDef === 'function' ? resolvedDef : _Vue.extend(resolvedDef);
          match.components[key] = resolvedDef;
          pending--;
          if (pending <= 0) {
            next();
          }
        });

        var reject = once(function (reason) {
          var msg = 'Failed to resolve async component ' + key + ': ' + reason;
          warn(false, msg);
          if (!error) {
            error = isError(reason) ? reason : new Error(msg);
            next(error);
          }
        });

        var res;
        try {
          // TODO: 若为异步组件加载 本来我们使用import组件
          // webpack编译后变成类似如下：
          // ƒ component() {
          //   return __webpack_require__.e(/*! import() | about */ "about").then(__webpack_require__.bind(null, /*! ../views/About.vue */ "./src/views/About.vue"));
          // }
          // 他返回的是一个Promise 所以在上面我们构造出了resolve和reject函数
          res = def(resolve, reject); // 执行完后 res变成了'pending'状态的Promise
        } catch (e) {
          reject(e);
        }
        if (res) {
          if (typeof res.then === 'function') {
            res.then(resolve, reject);
          } else {
            // new syntax in Vue 2.3
            var comp = res.component;
            if (comp && typeof comp.then === 'function') {
              comp.then(resolve, reject);
            }
          }
        }
      }
    });
    // 若是异步组件 则不立即执行next 
    if (!hasAsync) {
      next();
    }
  };
}
// in Webpack 2, require.ensure now also returns a Promise
// so the resolve/reject functions may get called an extra time
// if the user uses an arrow function shorthand that happens to
// return that Promise.
function once(fn) {
  var called = false;
  return function () {
    var args = [],
      len = arguments.length;
    while (len--) args[len] = arguments[len];

    if (called) {
      return;
    }
    called = true;
    return fn.apply(this, args);
  };
}
// TODO: 3.9 执行队列
// 这是一个非常经典的异步函数队列化执行的模式
function runQueue(queue, fn, cb) {
  var step = function (index) {
    if (index >= queue.length) {
      cb();
    } else {
      if (queue[index]) {
        fn(queue[index], function () {
          step(index + 1);
        });
      } else {
        step(index + 1);
      }
    }
  };
  step(0);
}
// TODO: 3.10 提取组件中'beforeRouteEnter'钩子函数
function extractEnterGuards(activated) {
  return extractGuards(activated, 'beforeRouteEnter', function (guard, _, match, key) {
    return bindEnterGuard(guard, match, key);
  });
}

function bindEnterGuard(guard, match, key) {
  return function routeEnterGuard(to, from, next) {
    return guard(to, from, function (cb) {
      // TODO: 这个地方有说法
      // 判断当这个cb是一个回调函数时 比如我们在beforeRouteEnter里面访问不到组件实例this
      // 文档里面建议next(vm => {// 这个时候访问实例vm})
      if (typeof cb === 'function') {
        if (!match.enteredCbs[key]) {
          match.enteredCbs[key] = [];
        }
        match.enteredCbs[key].push(cb); // 将当前回调操作压入match.enteredCbs 等待后面实例生成使用
      }
      next(cb);
    });
  };
}

/**4. history模式 */
// 这里利用了立即执行函数 将History当作参数参数匿名函数
// 则从874行开始执行 挂载到HTML5History的原型对象上挂载History
// return HTML5History
// 则进入871行 调用History函数 参数传入router base
var HTML5History = /*@__PURE__*/ (function (History) {
  function HTML5History(router, base) {
    History.call(this, router, base);

    this._startLocation = getLocation(this.base);
  }

  if (History) HTML5History.__proto__ = History;
  // TODO: 这里很关键 又是一个js 继承 采用“原型链”+“构造函数”的组合继承方式
  HTML5History.prototype = Object.create(History && History.prototype);
  HTML5History.prototype.constructor = HTML5History;

  HTML5History.prototype.setupListeners = function setupListeners() {
    var this$1 = this;

    if (this.listeners.length > 0) {
      return;
    }

    var router = this.router;
    var expectScroll = router.options.scrollBehavior;
    var supportsScroll = supportsPushState && expectScroll;

    if (supportsScroll) {
      this.listeners.push(setupScroll());
    }
    // TODO: 这里也很关键 这个地方声明了个浏览器'popstate'监听函数
    // 当我们操作浏览器路由时 会响应当前函数 而当前里面会调用'transitionTo'这个关键
    // 切换路由及响应函数
    var handleRoutingEvent = function () {
      var current = this$1.current;

      // Avoiding first `popstate` event dispatched in some browsers but first
      // history route not updated since async guard at the same time.
      var location = getLocation(this$1.base);
      if (this$1.current === START && location === this$1._startLocation) {
        return;
      }

      this$1.transitionTo(location, function (route) {
        if (supportsScroll) {
          handleScroll(router, route, current, true);
        }
      });
    };
    window.addEventListener('popstate', handleRoutingEvent);
    this.listeners.push(function () {
      window.removeEventListener('popstate', handleRoutingEvent);
    });
  };

  HTML5History.prototype.go = function go(n) {
    window.history.go(n);
  };

  HTML5History.prototype.push = function push(location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(
      location,
      function (route) {
        pushState(cleanPath(this$1.base + route.fullPath));
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      },
      onAbort
    );
  };

  HTML5History.prototype.replace = function replace(location, onComplete, onAbort) {
    var this$1 = this;

    var ref = this;
    var fromRoute = ref.current;
    this.transitionTo(
      location,
      function (route) {
        replaceState(cleanPath(this$1.base + route.fullPath));
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      },
      onAbort
    );
  };

  HTML5History.prototype.ensureURL = function ensureURL(push) {
    if (getLocation(this.base) !== this.current.fullPath) {
      var current = cleanPath(this.base + this.current.fullPath);
      push ? pushState(current) : replaceState(current);
    }
  };
  // push操作 最后映射到浏览器路径上面操作
  function pushState(url, replace) {
    saveScrollPosition();
    // try...catch the pushState call to get around Safari
    // DOM Exception 18 where it limits to 100 pushState calls
    var history = window.history;
    try {
      if (replace) {
        // preserve existing history state as it could be overriden by the user
        var stateCopy = extend({}, history.state);
        stateCopy.key = getStateKey();
        history.replaceState(stateCopy, '', url);
      } else {
        history.pushState({ key: setStateKey(genStateKey()) }, '', url);
      }
    } catch (e) {
      window.location[replace ? 'replace' : 'assign'](url);
    }
  }
  // repalce操作 只是操作不一样
  function replaceState(url) {
    pushState(url, true);
  }

  HTML5History.prototype.getCurrentLocation = function getCurrentLocation() {
    return getLocation(this.base);
  };

  return HTML5History;
})(History);
// 4.1 getLocation
function getLocation(base) {
  // 获取当前浏览器地址
  var path = window.location.pathname;
  // 若base存在 且当前path中包含了base 则将path截取出来返回纯path
  // 比如base:'/xxx' path:'/xxx/login'
  // 则path 处理后变成 '/login'
  if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
    path = path.slice(base.length);
  }
  // 返回一个path加上当前的search参数（问号?后面参数） 加上hash（井号#后面参数）
  return (path || '/') + window.location.search + window.location.hash;
}

/**5. router-view分析  */
// 在前面1-4都是进行了初始化并未开始运作 真正的router体现在router-view下映射到组件
// 下面就分析下router-view这个组件
// 但是突然发现源码中的View声明就是一个对象Object 这里先要分析下Vue.component
// Vue如何注册一个组件 先看该方法 再看View组件

// 5.1 Vue.component方法 属于vue源码
// 最开始还没有找到Vue.component这个方法 结果发现它与directive&filter是单独生成
var ASSET_TYPES = ['component', 'directive', 'filter'];
// 初始化全局API
function initGlobalAPI(Vue) {
  // config
  var configDef = {};
  configDef.get = function () {
    return config;
  };
  {
    configDef.set = function () {
      warn('Do not replace the Vue.config object, set individual fields instead.');
    };
  }
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive$$1,
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  // 2.6 explicit observable API
  Vue.observable = function (obj) {
    observe(obj);
    return obj;
  };

  Vue.options = Object.create(null);
  // TODO: 这里作了一层包裹 将component & directive & filter也赋值在
  // Vue.options上面 并给与一个空对象
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;
  // TODO：这个地方将默认加装上keep-alive组件到Vue上面 因此我们经常在代码中
  // 可以使用keep-alive组件
  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue); // component & directive & filter注册
}
initGlobalAPI();
// 初始化'component', 'directive', 'filter'
function initAssetRegisters(Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function (type) {
    Vue[type] = function (id, definition) {
      // 这里传入id 和定义两个参数
      if (!definition) {
        // TODO：若无定义 则返回当前默认数据中的该id值所对应的
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if (type === 'component') {
          // TODO: 这里作了一层关于组件的名称校验
          validateComponentName(id);
        }
        // TODO: 若为组件模式 则需要判断传入的第二参数是不是一个对象
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          // 这里this.options._base指向的是Vue实例 实则调用Vue.extend方法
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });
}
// 初始化Vue.extend方法 实现
function initExtend(Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this; // TODO: 父类 指向的是Vue实例
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId];
    }

    var name = extendOptions.name || Super.options.name;
    if (name) {
      validateComponentName(name);
    }
    // TODO：定义子类
    var Sub = function VueComponent(options) {
      this._init(options);
    };
    // TODO: 这里很关键使用了“原型链”+“构造函数”的组合继承方式 来使
    // Sub子类继承父类Vue实例
    // 以Super对象为原型，生成了Sub对象。Sub继承了Super的所有属性和方法
    Sub.prototype = Object.create(Super.prototype);
    // 并且需要将Sub子类构造指向自己 即Sub 至此完成子类继承父类
    Sub.prototype.constructor = Sub;

    Sub.cid = cid++;
    // TODO: 这里执行merge操作 将父级与子级 合并 返回合并后的options
    // 源码 1521行-mergeOptions
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps$1(Sub);
    }
    if (Sub.options.computed) {
      initComputed$1(Sub);
    }

    // TODO: 继承父级extend & mixin & use方法
    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub;
  };
}

// 5.2 View 源码 src/components/view.js
var View = {
  name: 'RouterView',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default',
    },
  },
  render: function render(_, ref) {
    var props = ref.props;
    var children = ref.children;
    var parent = ref.parent;
    var data = ref.data;

    // used by devtools to display a router-view badge
    data.routerView = true;

    // directly use parent context's createElement() function
    // so that components rendered by router-view can resolve named slots
    var h = parent.$createElement;
    var name = props.name;
    var route = parent.$route;
    var cache = parent._routerViewCache || (parent._routerViewCache = {});

    // determine current view depth, also check to see if the tree
    // has been toggled inactive but kept-alive.
    var depth = 0;
    var inactive = false;
    while (parent && parent._routerRoot !== parent) {
      var vnodeData = parent.$vnode ? parent.$vnode.data : {};
      if (vnodeData.routerView) {
        depth++;
      }
      if (vnodeData.keepAlive && parent._directInactive && parent._inactive) {
        inactive = true;
      }
      parent = parent.$parent;
    }
    data.routerViewDepth = depth;

    // render previous view if the tree is inactive and kept-alive
    if (inactive) {
      var cachedData = cache[name];
      var cachedComponent = cachedData && cachedData.component;
      if (cachedComponent) {
        // #2301
        // pass props
        if (cachedData.configProps) {
          fillPropsinData(cachedComponent, data, cachedData.route, cachedData.configProps);
        }
        return h(cachedComponent, data, children);
      } else {
        // render previous empty view
        return h();
      }
    }
    // TODO：当我们切换了路由时 会触发vue更新 则重新render router-view下面的组件
    // 此时这个route就是最新的Route
    // 那么也就拿的到当前路由的component 
    // 执行h->render 就完事了
    var matched = route.matched[depth];
    var component = matched && matched.components[name];

    // render empty node if no matched route or no config component
    if (!matched || !component) {
      cache[name] = null;
      return h();
    }

    // cache component
    cache[name] = { component: component };

    // attach instance registration hook
    // this will be called in the instance's injected lifecycle hooks
    data.registerRouteInstance = function (vm, val) {
      // val could be undefined for unregistration
      var current = matched.instances[name];
      if ((val && current !== vm) || (!val && current === vm)) {
        matched.instances[name] = val;
      }
    };

    // also register instance in prepatch hook
    // in case the same component instance is reused across different routes
    (data.hook || (data.hook = {})).prepatch = function (_, vnode) {
      matched.instances[name] = vnode.componentInstance;
    };

    // register instance in init hook
    // in case kept-alive component be actived when routes changed
    data.hook.init = function (vnode) {
      if (vnode.data.keepAlive && vnode.componentInstance && vnode.componentInstance !== matched.instances[name]) {
        matched.instances[name] = vnode.componentInstance;
      }

      // if the route transition has already been confirmed then we weren't
      // able to call the cbs during confirmation as the component was not
      // registered yet, so we call it here.
      
      // 这个地方调用了beforeRouteEnter 回调
      handleRouteEntered(route);
    };

    var configProps = matched.props && matched.props[name];
    // save route and configProps in cache
    if (configProps) {
      extend(cache[name], {
        route: route,
        configProps: configProps,
      });
      fillPropsinData(component, data, route, configProps);
    }

    return h(component, data, children);
  },
};
