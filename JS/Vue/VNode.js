// 分析VNode节点及虚拟DOM过程
// 下面分析均按下面这个匿名函数分析
// date:2021-01-27
with (this) {
  return _c(
    'div',
    { attrs: { id: 'app' } },
    [
      _c('span', { on: { click: onClick } }, [_v('我是data数据' + _s(message))]),
      _v(' '), // 没整懂 为啥每个中间都夹杂个空VNode（在编译阶段时 遇到同级兄弟节点 会默认生成一个空本文节点）
      _l(dsArr, function (item, index) {
        return _c('p', { key: index }, [_v('我是v-for' + _s(index))]);
      }),
      _v(' '), // 没整懂 为啥每个中间都夹杂个空VNode（在编译阶段时 遇到同级兄弟节点 会默认生成一个空本文节点）
      !!message ? _c('span', [_v('我是v-if')]) : _e(),
      _v(' '), // 没整懂 为啥每个中间都夹杂个空VNode（在编译阶段时 遇到同级兄弟节点 会默认生成一个空本文节点）
      _c('base-show'), //  with(this){return _c('h3',[_v(_s(myMessage))])}
    ],
    2
  );
}

// 1.1 定义_c 源码 3485行
function initRender(vm) {
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null; // v-once cached trees
  var options = vm.$options;
  var parentVnode = (vm.$vnode = options._parentVnode); // the placeholder node in parent tree
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates

  // TODO：这里在实例上面挂载_c和$createElement两个方法 均访问的是createElement函数
  vm._c = function (a, b, c, d) {
    // 但是有点不同的地方是_c这里第6个参数'alwaysNormalize'给的false
    return createElement(vm, a, b, c, d, false);
  };
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = function (a, b, c, d) {
    // 但是有点不同的地方是_c这里第6个参数'alwaysNormalize'给的true
    return createElement(vm, a, b, c, d, true);
  };

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  var parentData = parentVnode && parentVnode.data;

  /* istanbul ignore else */
  // TODO: 在之前分析data响应式时老是有两个属性先设置 就是在这个地方挂载的
  // $attrs和$listeners均只能读取 不能写入
  {
    defineReactive$$1(
      vm,
      '$attrs',
      (parentData && parentData.attrs) || emptyObject,
      function () {
        !isUpdatingChildComponent && warn('$attrs is readonly.', vm);
      },
      true
    );
    defineReactive$$1(
      vm,
      '$listeners',
      options._parentListeners || emptyObject,
      function () {
        !isUpdatingChildComponent && warn('$listeners is readonly.', vm);
      },
      true
    );
  }
}

// 开始下面前 先执行renderMixin(Vue) -> installRenderHelpers(Vue.prototype)
// 给Vue原型上添加各种方法 所以上面能访问_c\_s等等操作 是在这里绑定的
// 源码3519行
function renderMixin(Vue) {
  installRenderHelpers(Vue.prototype);
  // .....
}
// 源码 2940行
function installRenderHelpers(target) {
  target._o = markOnce;
  target._n = toNumber;
  target._s = toString;
  target._l = renderList;
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  target._v = createTextVNode;
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
  target._d = bindDynamicKeys;
  target._p = prependModifier;
}

// 1.1.1（源码 96行） 上面函数首先执行的是内层（基本操作）即:
// _s(message)
// 这个地方还涉及到一个问题就是 当执行_s这个函数时message->this.message(with作用)->触发getter(Object.definedProperty)
// 拿到真实的值
function toString(val) {
  // TODO: 这里值得关注的是JSON.stringify用法
  // JSON.stringify({obj:1,age:2}) => "{"obj":1,"age":2}"
  // JSON.stringify({obj:1,age:2},null,2) => "{
  //                                           "obj": 1,
  //                                           "age": 2
  //                                         }"
  // 表示解析所有属性且解析出来属性前面空格2格
  return val == null ? '' : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString) ? JSON.stringify(val, null, 2) : String(val);
}

// 1.1.2（源码 821行）再执行 即：
// _v('我是data数据test')
function createTextVNode(val) {
  return new VNode(undefined, undefined, undefined, String(val));
}
// VNode终于出来了 （源码 767行）
function VNode(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.fnContext = undefined;
  this.fnOptions = undefined;
  this.fnScopeId = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
  this.asyncFactory = asyncFactory;
  this.asyncMeta = undefined;
  this.isAsyncPlaceholder = false;
}

// 1.1.3 createElement函数 源码 3344行
/**
 *
 * @param {*} context 在initRender里面这个参数就是传的vm实例
 * @param {*} tag 标签 比如div span
 * @param {*} data 这个在ast->element时对应每个标签作了处理 比如上面的就是{on:{click:onClick}}
 * @param {*} children 当前标签下的child
 * @param {*} normalizationType 0:不需要规则化 1：需要简单规划 2：完全需要规划
 * @param {*} alwaysNormalize true&false
 */
function createElement(context, tag, data, children, normalizationType, alwaysNormalize) {
  // TODO: 这里判断data是否为数组结构或者原始数据 如string\number\symbol\boolean
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType);
}

// 1.1.3.1
function _createElement(context, tag, data, children, normalizationType) {
  if (isDef(data) && isDef(data.__ob__)) {
    warn('Avoid using observed data object as vnode data: ' + JSON.stringify(data) + '\n' + 'Always create fresh vnode data objects in each render!', context);
    return createEmptyVNode();
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode();
  }
  // warn against non-primitive key
  if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
    {
      warn('Avoid using non-primitive value as key, ' + 'use string/number value instead.', context);
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) && typeof children[0] === 'function') {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode, ns;
  if (typeof tag === 'string') {
    var Ctor;
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (isDef(data) && isDef(data.nativeOn)) {
        warn('The .native modifier for v-on is only valid on components but it was used on <' + tag + '>.', context);
      }
      vnode = new VNode(config.parsePlatformTagName(tag), data, children, undefined, undefined, context);
    } else if ((!data || !data.pre) && isDef((Ctor = resolveAsset(context.$options, 'components', tag)))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(tag, data, children, undefined, undefined, context);
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (Array.isArray(vnode)) {
    return vnode;
  } else if (isDef(vnode)) {
    if (isDef(ns)) {
      applyNS(vnode, ns);
    }
    if (isDef(data)) {
      registerDeepBindings(data);
    }
    return vnode;
  } else {
    return createEmptyVNode();
  }
}

// 1.1.3.1 type为2时 拍平树状为一维数组 比如里面嵌套有v-for时需要将v-for生成的Vnode集合拍平
// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren(children) {
  return isPrimitive(children) ? [createTextVNode(children)] : Array.isArray(children) ? normalizeArrayChildren(children) : undefined;
}

// 1.1.3.2 type为1时 简易拍平树状为一维数组
// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
function simpleNormalizeChildren(children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children);
    }
  }
  return children;
}

// 1.1.3.3
function normalizeArrayChildren(children, nestedIndex) {
  var res = [];
  var i, c, lastIndex, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    // TODO: 1. 判断当前vnode是否存在或者是一个布尔值 即不再执行
    if (isUndef(c) || typeof c === 'boolean') {
      continue;
    }
    lastIndex = res.length - 1;
    last = res[lastIndex];
    //  nested
    // TODO: 2. 判断当前元素是否是一个数组 比如v-for生成的数据
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, (nestedIndex || '') + '_' + i);
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + c[0].text);
          c.shift();
        }
        // TODO: 2.1 这里就将比如v-for生成的数组的节点vnode 压入了一维数组后面 将二维数组变成一维数组
        res.push.apply(res, c);
      }
    } 

    // TODO：3. 判断当前元素是否一个原始值
    else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } 
    
    // TODO：4. 排除前面的情况
    else {
      // TODO: 4.1 是否当前节点是一个文本节点并且res的最后一个也是文本节点
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text);
      } 
      // TODO: 4.2 则为正常节点 直接push进res
      else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) && isDef(c.tag) && isUndef(c.key) && isDef(nestedIndex)) {
          // 这个地方 我觉得是兼容了当我们写v-for的时候 没有绑定key值 这里默认生成了一个key
          c.key = '__vlist' + nestedIndex + '_' + i + '__';
        }
        res.push(c);
      }
    }
  }
  return res;
}

// 1.1.4 （源码 2629行）再执行 即： v-for原理
// _l(dsArr, function (item, index) {return _c('p', { key: index }, [_v('我是v-for' + _s(index))]);})
function renderList(val, render) {
  var ret, i, l, keys, key;
  // TODO：1. 若in&of 后面跟的是数组或者字符串 则对应创建数组或字符串个数的对应个数的空数组
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      // 这里将数组每一项传入匿名函数 所以我们经常使用item.xxx访问每一项的值
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    // TODO：2. 若in&of 后面跟的是数字 则创建对应数字的对应个数的空数组
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    // TODO：3. 若in&of 后面跟的是对象 这种模式我们一般使用的很少

    // TODO： 3.1判断是否数据结构是symbol格式
    if (hasSymbol && val[Symbol.iterator]) {
      ret = [];
      var iterator = val[Symbol.iterator]();
      var result = iterator.next();
      while (!result.done) {
        ret.push(render(result.value, ret.length));
        result = iterator.next();
      }
    } else {
      // TODO：3.2若一般的格式 就获取key及key对应的value
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
  }
  // 若前面都不是 则作一层容错处理 置ret为空数组
  if (!isDef(ret)) {
    ret = [];
  }
  // 标识当前数组最后一项属性为_isVList为true
  ret._isVList = true;
  return ret;
}

// 1.1.5 （源码 812行）这里先执行this.message -> getter拿到真实值 -> 执行三目 -> 执行_c
// 这里分析下_e 当false时执行_e()
// !!message ? _c('span', [_v('我是v-if')]) : _e(),
function createEmptyVNode(text) {
  // TODO：等于说就创建个空的VNode
  if (text === void 0) text = '';
  var node = new VNode();
  node.text = text; // text等于空字符串
  node.isComment = true; // 并且这里改成了true
  return node;
}

// 1.1.6 （源码 3176行）再执行 即:
// _c('base-show') 这里遇到需要创建组件 组件名字为base-show
function createComponent(Ctor, data, context, children, tag) {
  if (isUndef(Ctor)) {
    return;
  }

  var baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    {
      warn('Invalid Component definition: ' + String(Ctor), context);
    }
    return;
  }

  // TODO: 1. 处理异步组件
  // async component
  var asyncFactory;
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(asyncFactory, data, context, children, tag);
    }
  }

  data = data || {};

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  // TODO：2. 转化在组件上得v-model绑定
  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // TODO：3. 处理组件上的props绑定
  // extract props
  var propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // TODO: 4. 处理函数式组件
  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children);
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    var slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }

  // install component management hooks onto the placeholder node
  installComponentHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    'vue-component-' + Ctor.cid + (name ? '-' + name : ''),
    data,
    undefined,
    undefined,
    undefined,
    context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
    asyncFactory
  );

  return vnode;
}
