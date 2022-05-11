/**
 * 分析vue编译过程
   date:2021-01-29
 */
/// 1. 挂载方法 $mount
// TODO: 在源码中存在3处Vue.prototype.$mount
// 分别在源码9039行、11877行、11878行
// 1.1 最初始定义$mount
Vue.prototype.$mount = function (el, hydrating) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating);
};

// 1.2 将初始化定义赋值给全局变量mount 且覆盖之前声明
var mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (el, hydrating) {
  el = el && query(el);

  /* istanbul ignore if */
  // TODO： 这里作了一手body&html 校验 原因是最后会替换当前标签下面所有
  if (el === document.body || el === document.documentElement) {
    warn('Do not mount Vue to <html> or <body> - mount to normal elements instead.');
    return this;
  }

  var options = this.$options;
  // resolve template/el and convert to render function
  // TODO: 这里判断是否存在render配置 若没有那么取template
  if (!options.render) {
    var template = options.template;
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
          /* istanbul ignore if */
          if (!template) {
            warn('Template element not found or is empty: ' + options.template, this);
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        {
          warn('invalid template option:' + template, this);
        }
        return this;
      }
    } else if (el) {
      // TODO: 若没有设置template 则vue会自动创建一个默认的div
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      if (config.performance && mark) {
        mark('compile');
      }
      // TODO: 这里调用的是ref$1.compileToFunctions -》 而ref$1是1是createCompiler()生成 -》
      // 而createCompiler是createCompilerCreator()生成
      // TODO: 这段逻辑有点复杂 后面来分析 先往下走

      // TODO: 0125 其实这里调compileToFunctions函数 在代码初始化的时候就完成了一系列的操作
      // 这里调compileToFunctions就等同于调1.2.3中的“compileToFunctions” ->
      // 调1.2.4中的“createCompileToFunctionFn” ->
      // 那么最后就是调用的 1.2.4中return 的"compileToFunctions"方法
      var ref = compileToFunctions(
        template,
        {
          outputSourceRange: 'development' !== 'production',
          shouldDecodeNewlines: shouldDecodeNewlines,
          shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments,
        },
        this
      );
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      // TODO： 最关键就是这里挂载了编译过后得render方法处理
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if (config.performance && mark) {
        mark('compile end');
        measure('vue ' + this._name + ' compile', 'compile', 'compile end');
      }
    }
  }
  // TODO: 调用初始化时的Mount
  return mount.call(this, el, hydrating);
};

// 1.3 挂载dom
function mountComponent(vm, el, hydrating) {
  vm.$el = el;
  // TODO: 这里我猜是在1.2里面就完成了render方法挂载
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') || vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
            'compiler is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
          vm
        );
      } else {
        warn('Failed to mount component: template or render function not defined.', vm);
      }
    }
  }
  // TODO：生命周期钩子回调beforeMount
  callHook(vm, 'beforeMount');

  var updateComponent;
  /* istanbul ignore if */
  // TODO：配置项 一般在开发环境可以开启 为了就是在浏览器中追踪组件且显示详细的信息
  if (config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;
      var startTag = 'vue-perf-start:' + id;
      var endTag = 'vue-perf-end:' + id;

      mark(startTag);
      var vnode = vm._render();
      mark(endTag);
      measure('vue ' + name + ' render', startTag, endTag);

      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure('vue ' + name + ' patch', startTag, endTag);
    };
  } else {
    // TODO: 一般情况下 给updateComponent赋值下面方法 在Watcher中可以调用
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined

  // TODO: 生成一个Watcher 我觉得主要就是为了来绑定updateComponent方法
  // 因为watcher内部会调用get get就会触发updateComponent 接到触发_render 然后_update
  // 这个时候 完成了template的替换 dom已更新完成
  new Watcher(
    vm,
    updateComponent,
    noop,
    {
      before: function before() {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, 'beforeUpdate');
        }
      },
    },
    true /* isRenderWatcher */
  );
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  // TODO: Vue 实例的父虚拟 Node 表示当前vue根组件
  if (vm.$vnode == null) {
    vm._isMounted = true; // 是否已挂载标识
    callHook(vm, 'mounted');
  }
  return vm;
}

// 1.2.1 complieToFunctions -> ref$1.compileToFunctions ref$1 = createCompiler(baseOptions)
var ref$1 = createCompiler(baseOptions);
var compile = ref$1.compile;
var compileToFunctions = ref$1.compileToFunctions;

// 1.2.2 createCompiler -> createCompilerCreator(func)
var createCompiler = createCompilerCreator(function baseCompile(template, options) {
  // TODO：下面代码直到1.2.5前均是针对template->转换为ast结构对象
  var ast = parse(template.trim(), options);
  if (options.optimize !== false) {
    optimize(ast, options);
  }
  // TODO: 生成code
  var code = generate(ast, options);
  return {
    ast: ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns,
  };
});

// 1.2.3 createCompilerCreator形成一个闭包 注意最终返回一个createCompiler函数
function createCompilerCreator(baseCompile) {
  // baseCompile就是在1.2.2 中的函数参数baseCompile
  return function createCompiler(baseOptions) {
    // TODO: createCompiler也形成一个闭包 返回对象包括2个操作属性
    // 而这个baseOptions就是在1.2.1 中传入的baseOptions 而baseOptoins就是一个方法的对象集合
    // 一个是内部compile函数方法
    // 一个是外部定义的createCompileToFunctionFn函数 参数是compile函数
    function compile(template, options) {
      var finalOptions = Object.create(baseOptions);
      var errors = [];
      var tips = [];

      var warn = function (msg, range, tip) {
        (tip ? tips : errors).push(msg);
      };

      if (options) {
        if (options.outputSourceRange) {
          // $flow-disable-line
          var leadingSpaceLength = template.match(/^\s*/)[0].length;

          warn = function (msg, range, tip) {
            var data = { msg: msg };
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength;
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength;
              }
            }
            (tip ? tips : errors).push(data);
          };
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules = (baseOptions.modules || []).concat(options.modules);
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(Object.create(baseOptions.directives || null), options.directives);
        }
        // copy other options
        for (var key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key];
          }
        }
      }

      finalOptions.warn = warn;

      var compiled = baseCompile(template.trim(), finalOptions);
      {
        detectErrors(compiled.ast, warn);
      }
      compiled.errors = errors;
      compiled.tips = tips;
      return compiled;
    }

    // TODO: 其实这里感觉是对这几个方法的封装 是一个公共的东西 只是
    // 通过baseOptions来初始化这两个方法
    // 供1.2.1中 声明变量接收来调用 或许其他地方也会调用这一系列操作
    return {
      compile: compile,
      compileToFunctions: createCompileToFunctionFn(compile),
    };
  };
}

// 1.2.3.1
var baseOptions = {
  expectHTML: true,
  modules: modules$1,
  directives: directives$1,
  isPreTag: isPreTag,
  isUnaryTag: isUnaryTag,
  mustUseProp: mustUseProp,
  canBeLeftOpenTag: canBeLeftOpenTag,
  isReservedTag: isReservedTag,
  getTagNamespace: getTagNamespace,
  staticKeys: genStaticKeys(modules$1),
};

// 1.2.4
function createCompileToFunctionFn(compile) {
  var cache = Object.create(null);

  return function compileToFunctions(template, options, vm) {
    options = extend({}, options);
    var warn$$1 = options.warn || warn;
    delete options.warn;

    /* istanbul ignore if */
    {
      // detect possible CSP restriction
      try {
        new Function('return 1');
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn$$1(
            'It seems you are using the standalone build of Vue.js in an ' +
              'environment with Content Security Policy that prohibits unsafe-eval. ' +
              'The template compiler cannot work in this environment. Consider ' +
              'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
              'templates into render functions.'
          );
        }
      }
    }

    // check cache
    var key = options.delimiters ? String(options.delimiters) + template : template;
    if (cache[key]) {
      return cache[key];
    }

    // compile
    var compiled = compile(template, options);

    // check compilation errors/tips
    {
      if (compiled.errors && compiled.errors.length) {
        if (options.outputSourceRange) {
          compiled.errors.forEach(function (e) {
            warn$$1('Error compiling template:\n\n' + e.msg + '\n\n' + generateCodeFrame(template, e.start, e.end), vm);
          });
        } else {
          warn$$1(
            'Error compiling template:\n\n' +
              template +
              '\n\n' +
              compiled.errors
                .map(function (e) {
                  return '- ' + e;
                })
                .join('\n') +
              '\n',
            vm
          );
        }
      }
      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach(function (e) {
            return tip(e.msg, vm);
          });
        } else {
          compiled.tips.forEach(function (msg) {
            return tip(msg, vm);
          });
        }
      }
    }

    // turn code into functions
    var res = {};
    var fnGenErrors = [];
    // TODO: 0127 终于找到了如何将字符串函数转变成可执行函数
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
      return createFunction(code, fnGenErrors);
    });

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn$$1(
          'Failed to generate render function:\n\n' +
            fnGenErrors
              .map(function (ref) {
                var err = ref.err;
                var code = ref.code;

                return err.toString() + ' in\n\n' + code + '\n';
              })
              .join('\n'),
          vm
        );
      }
    }

    return (cache[key] = res);
  };
}

// TODO: new Function 将字符串函数转变成可执行函数
function createFunction(code, errors) {
  try {
    return new Function(code);
  } catch (err) {
    errors.push({ err: err, code: code });
    return noop;
  }
}

// 1.2.2.1 parse解析template<String>转换为AST
function parse(template, options) {
  warn$2 = options.warn || baseWarn;

  platformIsPreTag = options.isPreTag || no;
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no;
  var isReservedTag = options.isReservedTag || no;
  maybeComponent = function (el) {
    return !!el.component || !isReservedTag(el.tag);
  };

  // TODO: 这里针对modules作了一层遍历加过滤 modules是什么 没搞清楚
  transforms = pluckModuleFunction(options.modules, 'transformNode');
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

  delimiters = options.delimiters;

  var stack = [];
  var preserveWhitespace = options.preserveWhitespace !== false;
  var whitespaceOption = options.whitespace;
  var root;
  var currentParent;
  var inVPre = false;
  var inPre = false;
  var warned = false;

  function warnOnce(msg, range) {
    if (!warned) {
      warned = true;
      warn$2(msg, range);
    }
  }

  function closeElement(element) {
    trimEndingWhitespace(element);
    if (!inVPre && !element.processed) {
      element = processElement(element, options);
    }
    // tree management
    if (!stack.length && element !== root) {
      // allow root elements with v-if, v-else-if and v-else
      if (root.if && (element.elseif || element.else)) {
        {
          checkRootConstraints(element);
        }
        addIfCondition(root, {
          exp: element.elseif,
          block: element,
        });
      } else {
        warnOnce('Component template should contain exactly one root element. ' + 'If you are using v-if on multiple elements, ' + 'use v-else-if to chain them instead.', { start: element.start });
      }
    }
    if (currentParent && !element.forbidden) {
      if (element.elseif || element.else) {
        processIfConditions(element, currentParent);
      } else {
        if (element.slotScope) {
          // scoped slot
          // keep it in the children list so that v-else(-if) conditions can
          // find it as the prev node.
          var name = element.slotTarget || '"default"';
          (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
        }
        currentParent.children.push(element);
        element.parent = currentParent;
      }
    }

    // final children cleanup
    // filter out scoped slots
    element.children = element.children.filter(function (c) {
      return !c.slotScope;
    });
    // remove trailing whitespace node again
    trimEndingWhitespace(element);

    // check pre state
    if (element.pre) {
      inVPre = false;
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false;
    }
    // apply post-transforms
    for (var i = 0; i < postTransforms.length; i++) {
      postTransforms[i](element, options);
    }
  }

  function trimEndingWhitespace(el) {
    // remove trailing whitespace node
    if (!inPre) {
      var lastNode;
      while ((lastNode = el.children[el.children.length - 1]) && lastNode.type === 3 && lastNode.text === ' ') {
        el.children.pop();
      }
    }
  }

  function checkRootConstraints(el) {
    if (el.tag === 'slot' || el.tag === 'template') {
      warnOnce('Cannot use <' + el.tag + '> as component root element because it may ' + 'contain multiple nodes.', { start: el.start });
    }
    if (el.attrsMap.hasOwnProperty('v-for')) {
      warnOnce('Cannot use v-for on stateful component root element because ' + 'it renders multiple elements.', el.rawAttrsMap['v-for']);
    }
  }

  // TODO: 调用pareHTML 全局函数 传了两个参数第一个模板字符串 第二个对象
  parseHTML(template, {
    warn: warn$2,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,
    start: function start(tag, attrs, unary, start$1, end) {
      // check namespace.
      // inherit parent ns if there is one
      var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

      // handle IE svg bug
      /* istanbul ignore if */
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs);
      }

      var element = createASTElement(tag, attrs, currentParent);
      if (ns) {
        element.ns = ns;
      }

      {
        if (options.outputSourceRange) {
          element.start = start$1;
          element.end = end;
          element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) {
            cumulated[attr.name] = attr;
            return cumulated;
          }, {});
        }
        attrs.forEach(function (attr) {
          if (invalidAttributeRE.test(attr.name)) {
            warn$2('Invalid dynamic argument expression: attribute names cannot contain ' + 'spaces, quotes, <, >, / or =.', {
              start: attr.start + attr.name.indexOf('['),
              end: attr.start + attr.name.length,
            });
          }
        });
      }

      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true;
        warn$2(
          'Templates should only be responsible for mapping the state to the ' +
            'UI. Avoid placing tags with side-effects in your templates, such as ' +
            '<' +
            tag +
            '>' +
            ', as they will not be parsed.',
          { start: element.start }
        );
      }

      // apply pre-transforms
      for (var i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element;
      }

      if (!inVPre) {
        processPre(element);
        if (element.pre) {
          inVPre = true;
        }
      }
      if (platformIsPreTag(element.tag)) {
        inPre = true;
      }
      if (inVPre) {
        processRawAttrs(element);
      } else if (!element.processed) {
        // structural directives
        // TODO: 这里解析v-for v-if v-once
        processFor(element);
        processIf(element);
        processOnce(element);
      }

      if (!root) {
        root = element;
        {
          checkRootConstraints(root);
        }
      }

      if (!unary) {
        currentParent = element;
        stack.push(element);
      } else {
        closeElement(element);
      }
    },

    end: function end(tag, start, end$1) {
      var element = stack[stack.length - 1];
      // pop stack
      stack.length -= 1;
      currentParent = stack[stack.length - 1];
      if (options.outputSourceRange) {
        element.end = end$1;
      }
      closeElement(element);
    },
    chars: function chars(text, start, end) {
      if (!currentParent) {
        {
          if (text === template) {
            warnOnce('Component template requires a root element, rather than just text.', { start: start });
          } else if ((text = text.trim())) {
            warnOnce('text "' + text + '" outside root element will be ignored.', { start: start });
          }
        }
        return;
      }
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE && currentParent.tag === 'textarea' && currentParent.attrsMap.placeholder === text) {
        return;
      }
      var children = currentParent.children;
      if (inPre || text.trim()) {
        text = isTextTag(currentParent) ? text : decodeHTMLCached(text);
      } else if (!children.length) {
        // remove the whitespace-only node right after an opening tag
        text = '';
      } else if (whitespaceOption) {
        if (whitespaceOption === 'condense') {
          // in condense mode, remove the whitespace node if it contains
          // line break, otherwise condense to a single space
          text = lineBreakRE.test(text) ? '' : ' ';
        } else {
          text = ' ';
        }
      } else {
        text = preserveWhitespace ? ' ' : '';
      }
      if (text) {
        if (!inPre && whitespaceOption === 'condense') {
          // condense consecutive whitespaces into single space
          text = text.replace(whitespaceRE$1, ' ');
        }
        var res;
        var child;
        // TODO：这里到了关键了 开始解析data绑定值
        if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
          child = {
            type: 2,
            expression: res.expression,
            tokens: res.tokens,
            text: text,
          };
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          // TODO: 这个地方 每次换元素标签的时候 就会创建一个空的对象
          // 导致后面创建vnode的时候 也创建了一个空的vnode对象
          // 这样的话 从children的数组格式上面来看的话 就分层很清晰了
          child = {
            type: 3,
            text: text,
          };
        }
        if (child) {
          if (options.outputSourceRange) {
            child.start = start;
            child.end = end;
          }
          children.push(child);
        }
      }
    },
    comment: function comment(text, start, end) {
      // adding anyting as a sibling to the root node is forbidden
      // comments should still be allowed, but ignored
      if (currentParent) {
        var child = {
          type: 3,
          text: text,
          isComment: true,
        };
        if (options.outputSourceRange) {
          child.start = start;
          child.end = end;
        }
        currentParent.children.push(child);
      }
    },
  });
  /**
   *  再将html字符串转换为类AST树格式后：（简约列举 不止这些属性）
   *  {
   *    start:number, // 字符串中的起始位置
   *    end:number, // 字符串中的结束位置
   *    tag:'div',
   *    type:1,
   *    parent:undefined // 顶层root
   *    children:[ // 标签嵌套结点
   *      {
   *        start:number,
   *        end:number,
   *        tag:'span',
   *        type:1,
   *        parent:{父级信息},
   *        children:[ // 最底层结点
   *          {
   *            start:number,
   *            end:number,
   *            expression:'"aaaaaa"+_s(xxx)', // 喊data绑定值表达式字符串
   *            text:"aaaaaa{{xxx}}" // 原始文本信息,
   *            tokens:[
   *              "aaaaaa",
   *              {@binding:xxx}
   *            ],
   *            type:2
   *          }
   *        ]
   *      }
   *    ]
   *  }
   *
   *
   */
  return root;
}

// 1.2.2.1.1
function pluckModuleFunction(modules, key) {
  return modules
    ? modules
        .map(function (m) {
          return m[key];
        })
        .filter(function (_) {
          return _;
        })
    : [];
}

// 1.2.2.2
function parseHTML(html, options) {
  var stack = [];
  var expectHTML = options.expectHTML;
  var isUnaryTag$$1 = options.isUnaryTag || no;
  var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
  var index = 0;
  var last, lastTag;
  // TODO: 这里拿到template字符串 从第一个字符开始遍历
  while (html) {
    last = html;
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // TODO: 这里针对我们在template里面写的注释进行处理
        // Comment:
        if (comment.test(html)) {
          var commentEnd = html.indexOf('-->');

          if (commentEnd >= 0) {
            // TODO: 这里可以配置 是否删除掉html里面的注释
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
            }
            advance(commentEnd + 3);
            continue;
          }
        }

        // TODO: 针对另一种格式注释 作处理
        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          var conditionalEnd = html.indexOf(']>');

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2);
            continue;
          }
        }

        // TODO: 针对html中的声明头 作处理
        // Doctype:
        var doctypeMatch = html.match(doctype);
        if (doctypeMatch) {
          advance(doctypeMatch[0].length);
          continue;
        }

        // TODO: 匹配</xxx>结尾
        // End tag:
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          var curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[1], curIndex, index);
          continue;
        }

        // TODO：匹配 >
        // Start tag:
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          handleStartTag(startTagMatch);
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1);
          }
          continue;
        }
      }

      // TODO: 这里给void关键字后面作表达式求值 但是返回的是undefined 所以下面三者均为undefined
      var text = void 0,
        rest = void 0,
        next = void 0;
      if (textEnd >= 0) {
        rest = html.slice(textEnd);
        while (!endTag.test(rest) && !startTagOpen.test(rest) && !comment.test(rest) && !conditionalComment.test(rest)) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1);
          if (next < 0) {
            break;
          }
          textEnd += next;
          rest = html.slice(textEnd);
        }
        text = html.substring(0, textEnd);
      }

      if (textEnd < 0) {
        text = html;
      }

      if (text) {
        advance(text.length);
      }

      if (options.chars && text) {
        options.chars(text, index - text.length, index);
      }
    } else {
      var endTagLength = 0;
      var stackedTag = lastTag.toLowerCase();
      var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
      var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length;
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1);
        }
        if (options.chars) {
          options.chars(text);
        }
        return '';
      });
      index += html.length - rest$1.length;
      html = rest$1;
      parseEndTag(stackedTag, index - endTagLength, index);
    }

    if (html === last) {
      options.chars && options.chars(html);
      if (!stack.length && options.warn) {
        options.warn('Mal-formatted tag at end of template: "' + html + '"', { start: index + html.length });
      }
      break;
    }
  }

  // Clean up any remaining tags
  parseEndTag();

  function advance(n) {
    index += n;
    html = html.substring(n);
  }

  function parseStartTag() {
    var start = html.match(startTagOpen);
    if (start) {
      var match = {
        tagName: start[1],
        attrs: [],
        start: index,
      };
      advance(start[0].length);
      var end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
        attr.start = index;
        advance(attr[0].length);
        attr.end = index;
        match.attrs.push(attr);
      }
      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match;
      }
    }
  }

  function handleStartTag(match) {
    var tagName = match.tagName;
    var unarySlash = match.unarySlash;

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag);
      }
      if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
        parseEndTag(tagName);
      }
    }

    var unary = isUnaryTag$$1(tagName) || !!unarySlash;

    var l = match.attrs.length;
    var attrs = new Array(l);
    for (var i = 0; i < l; i++) {
      var args = match.attrs[i];
      var value = args[3] || args[4] || args[5] || '';
      var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href' ? options.shouldDecodeNewlinesForHref : options.shouldDecodeNewlines;
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines),
      };
      if (options.outputSourceRange) {
        attrs[i].start = args.start + args[0].match(/^\s*/).length;
        attrs[i].end = args.end;
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
      lastTag = tagName;
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

  function parseEndTag(tagName, start, end) {
    var pos, lowerCasedTagName;
    if (start == null) {
      start = index;
    }
    if (end == null) {
      end = index;
    }

    // Find the closest opened tag of the same type
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase();
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break;
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0;
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) {
        if (i > pos || (!tagName && options.warn)) {
          options.warn('tag <' + stack[i].tag + '> has no matching end tag.', { start: stack[i].start, end: stack[i].end });
        }
        if (options.end) {
          options.end(stack[i].tag, start, end);
        }
      }

      // Remove the open elements from the stack
      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end);
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end);
      }
      if (options.end) {
        options.end(tagName, start, end);
      }
    }
  }
}

// 1.2.2.3 创建AST元素
/**
 *
 * @param {*} tag  div
 * @param {*} attrs [{end: 13,name: "id",start: 5,value: "app"}]
 * @param {*} parent
 */
function createASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag: tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs), // 返回一个类map格式 也就是对象 拿到name值如 {id:'app'}
    rawAttrsMap: {},
    parent: parent,
    children: [],
  };
}

// 1.2.2.4 解析文本（从上面看出这里解析出data绑定值）
function parseText(text, delimiters) {
  var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return;
  }
  var tokens = [];
  var rawTokens = [];
  var lastIndex = (tagRE.lastIndex = 0);
  var match, index, tokenValue;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      rawTokens.push((tokenValue = text.slice(lastIndex, index)));
      tokens.push(JSON.stringify(tokenValue));
    }
    // tag token
    var exp = parseFilters(match[1].trim());
    tokens.push('_s(' + exp + ')'); // expression中以_s(xxx)合并
    rawTokens.push({ '@binding': exp }); // tokens数组中带data绑定值的为map格式以{'@binding'：xxx}
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    rawTokens.push((tokenValue = text.slice(lastIndex)));
    tokens.push(JSON.stringify(tokenValue));
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens,
  };
}

// 1.2.2.5 检查是否存在v-for指令
function processFor(el) {
  var exp;
  // TODO: 这里有个公共函数 可以根据第二个参数拿到当前指令后面的表达式
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    // TODO: 这里才是关键的解析v-for后面的内容
    var res = parseFor(exp);
    if (res) {
      // TODO: 这里调用全局函数 混入属性 如 将res属性混入el中
      extend(el, res);
    } else {
      warn$2('Invalid v-for expression: ' + exp, el.rawAttrsMap['v-for']);
    }
  }
}
function getAndRemoveAttr(el, name, removeFromMap) {
  var val;
  if ((val = el.attrsMap[name]) != null) {
    var list = el.attrsList;
    for (var i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break;
      }
    }
  }
  if (removeFromMap) {
    delete el.attrsMap[name];
  }
  return val; // TODO: 拿到当前指令后面的表达式
}

// 1.2.2.6 根据v-for后面的表达式 来解析v-for
function parseFor(exp) {
  // TODO: 正则匹配v-for后面内容
  // forAliasRE：/([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
  // 从这里我们就看出来v-for中使用in或者of 均可以
  var inMatch = exp.match(forAliasRE);
  if (!inMatch) {
    return;
  }
  var res = {};
  // TODO: 提取循环几次的number值或者其他数组变量如(item,index) in 6 -> 6
  res.for = inMatch[2].trim();
  // TODO: 替换掉左右括号 拿到变量如： (item.index) -> item,index
  // stripParensRE: /^\(|\)$/g
  var alias = inMatch[1].trim().replace(stripParensRE, '');
  // forIteratorRE： /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
  // 拿到 item,index -> ,index
  var iteratorMatch = alias.match(forIteratorRE);
  // TODO: 若存在 则表示这个为迭代器索引 还要继续往前找
  if (iteratorMatch) {
    // 这里直接过滤出 item,index -> item值
    res.alias = alias.replace(forIteratorRE, '').trim();
    // TODO：这里拿到index
    res.iterator1 = iteratorMatch[1].trim();
    if (iteratorMatch[2]) {
      res.iterator2 = iteratorMatch[2].trim();
    }
  } else {
    // TODO: 没设置迭代索引值 则直接赋值
    res.alias = alias;
  }
  // TODO：以v-for="(item,index) in 6"为例
  /**
   *  res：{
   *    alias: "item"
        for: "6"
        iterator1: "index"
   *  }
   * 
   */
  return res;
}

// 1.2.5 接到回到了1.2.3中 拿到了ast结构数来进行生成
function generate(ast, options) {
  var state = new CodegenState(options);
  /**
   *  TODO 0126: 这里若ast数结构存在 则开始构建元素 若不存在作一手默认构建div
   *  调用genElement函数 这里面针对v-once、v-for、v-if、template、slot、component、根元素
   *  分别进行生成
   *  最后的code 是一系列以如_c、_s、_l的方法简写表示的 （具体可见下面的每个方法绑定的方法及意义）
   *  code:
        _c(
            'div',
            { attrs: { id: 'app' } }, // 根节点 <div id="app"></div>
            [
              _c('span', [_v('我是data数据' + _s(message))]), // span静态绑定data数据
              _v(' '), // 空？
              _l(dsArr, function (item, index) {
                return _c('p', { key: index }, [_v('我是v-for' + _s(index))]);
              }), // v-for
              _v(' '), // 空？
              !!message ? _c('span', [_v('我是v-if')]) : _e(), // v-if 三目表达式
              _v(' '), // 空？
              _c('base-show'), // 组件<base-show /> 证明第一次没管组件的渲染 也说明先处理
                                // 父组件再处理子组件
            ],
            2
          );
   *  
   *  最后再通过with(this){return code}包裹 形成逻辑代码字符串
   *  这里提一下with用途及为什么使用with
   *  with语法：扩展一个语句的作用域链。这里就是code里面跟this绑定
   *  利：with语句可以在不造成性能损失的情況下，减少变量的长度。其造成的附加计算量很少。
   *     使用'with'可以减少不必要的指针路径解析运算。需要注意的是，很多情況下，也可以不使用with语句，
   *      而是使用一个临时变量来保存指针，来达到同样的效果。

      弊：with语句使得程序在查找变量值时，都是先在指定的对象中查找。
      所以那些本来不是这个对象的属性的变量，查找起来将会很慢。
      如果是在对性能要求较高的场合，'with'下面的statement语句中的变量，只应该包含这个指定对象的属性。


      =======================================================================================
      若不使用with的话 我们再生成ast时针对里面的变量都会作一层this的绑定比如上面的message
      它就是绑定的this.message而this指代我们的vm实例 访问this.message -> this._data['message']
      使用了width那么最后的render函数里面的变量都会找this下面
   *
   *
   * */
  var code = ast ? genElement(ast, state) : '_c("div")';
  return {
    // TODO: 挂载到render方法上面 供后面调用
    render: 'with(this){return ' + code + '}',
    staticRenderFns: state.staticRenderFns,
  };
}
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
}
// 1.2.5.1 处理options且包裹上其他对象信息
var CodegenState = function CodegenState(options) {
  this.options = options;
  this.warn = options.warn || baseWarn;
  this.transforms = pluckModuleFunction(options.modules, 'transformCode');
  this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
  this.directives = extend(extend({}, baseDirectives), options.directives);
  var isReservedTag = options.isReservedTag || no;
  this.maybeComponent = function (el) {
    return !!el.component || !isReservedTag(el.tag);
  };
  this.onceId = 0;
  this.staticRenderFns = [];
  this.pre = false;
};
// 1.2.5.2 生成元素 后面针对
// 静态绑定、v-once、v-for、v-if、template、slot、component、根元素作处理
// 每个里面又来调genElement形成递归 处理所有情况
function genElement(el, state) {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre;
  }

  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state);
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state);
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state);
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state);
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
    return genChildren(el, state) || 'void 0';
  } else if (el.tag === 'slot') {
    return genSlot(el, state);
  } else {
    // component or element
    var code;
    if (el.component) {
      code = genComponent(el.component, el, state);
    } else {
      var data;
      if (!el.plain || (el.pre && state.maybeComponent(el))) {
        // TODO: 这里处理单元素或者根元素啥子都没绑定的情况下 调用genData$2
        data = genData$2(el, state);
      }

      var children = el.inlineTemplate ? null : genChildren(el, state, true);
      code = "_c('" + el.tag + "'" + (data ? ',' + data : '') + (children ? ',' + children : '') + ')';
    }
    // module transforms
    for (var i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code);
    }
    return code;
  }
}
// 1.2.5.2.1 处理最顶层元素情况<div id="app"></div>
function genData$2(el, state) {
  var data = '{';

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  var dirs = genDirectives(el, state);
  if (dirs) {
    data += dirs + ',';
  }

  // key
  if (el.key) {
    data += 'key:' + el.key + ',';
  }
  // ref
  if (el.ref) {
    data += 'ref:' + el.ref + ',';
  }
  if (el.refInFor) {
    data += 'refInFor:true,';
  }
  // pre
  if (el.pre) {
    data += 'pre:true,';
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += 'tag:"' + el.tag + '",';
  }
  // module data generation functions
  for (var i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el);
  }
  // attributes
  if (el.attrs) {
    data += 'attrs:' + genProps(el.attrs) + ',';
  }
  // DOM props
  if (el.props) {
    data += 'domProps:' + genProps(el.props) + ',';
  }
  // event handlers
  if (el.events) {
    data += genHandlers(el.events, false) + ',';
  }
  if (el.nativeEvents) {
    data += genHandlers(el.nativeEvents, true) + ',';
  }
  // slot target
  // only for non-scoped slots
  if (el.slotTarget && !el.slotScope) {
    data += 'slot:' + el.slotTarget + ',';
  }
  // scoped slots
  if (el.scopedSlots) {
    data += genScopedSlots(el, el.scopedSlots, state) + ',';
  }
  // component v-model
  if (el.model) {
    data += 'model:{value:' + el.model.value + ',callback:' + el.model.callback + ',expression:' + el.model.expression + '},';
  }
  // inline-template
  if (el.inlineTemplate) {
    var inlineTemplate = genInlineTemplate(el, state);
    if (inlineTemplate) {
      data += inlineTemplate + ',';
    }
  }
  data = data.replace(/,$/, '') + '}';
  // v-bind dynamic argument wrap
  // v-bind with dynamic arguments must be applied using the same v-bind object
  // merge helper so that class/style/mustUseProp attrs are handled correctly.
  if (el.dynamicAttrs) {
    data = '_b(' + data + ',"' + el.tag + '",' + genProps(el.dynamicAttrs) + ')';
  }
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data);
  }
  // v-on data wrap
  if (el.wrapListeners) {
    data = el.wrapListeners(data);
  }
  return data;
}
// 1.2.5.2.1.1 生成指令
function genDirectives(el, state) {
  var dirs = el.directives;
  if (!dirs) {
    return;
  }
  var res = 'directives:[';
  var hasRuntime = false;
  var i, l, dir, needRuntime;
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i];
    needRuntime = true;
    var gen = state.directives[dir.name];
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn);
    }
    if (needRuntime) {
      hasRuntime = true;
      res +=
        '{name:"' +
        dir.name +
        '",rawName:"' +
        dir.rawName +
        '"' +
        (dir.value ? ',value:(' + dir.value + '),expression:' + JSON.stringify(dir.value) : '') +
        (dir.arg ? ',arg:' + (dir.isDynamicArg ? dir.arg : '"' + dir.arg + '"') : '') +
        (dir.modifiers ? ',modifiers:' + JSON.stringify(dir.modifiers) : '') +
        '},';
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']';
  }
}

// 1.2.5.3 生成children
function genChildren(el, state, checkSkip, altGenElement, altGenNode) {
  var children = el.children;
  if (children.length) {
    var el$1 = children[0];
    // optimize single v-for
    if (children.length === 1 && el$1.for && el$1.tag !== 'template' && el$1.tag !== 'slot') {
      var normalizationType = checkSkip ? (state.maybeComponent(el$1) ? ',1' : ',0') : '';
      return '' + (altGenElement || genElement)(el$1, state) + normalizationType;
    }
    var normalizationType$1 = checkSkip ? getNormalizationType(children, state.maybeComponent) : 0;
    var gen = altGenNode || genNode;
    return (
      '[' +
      children
        .map(function (c) {
          return gen(c, state);
        })
        .join(',') +
      ']' +
      (normalizationType$1 ? ',' + normalizationType$1 : '')
    );
  }
}

/////////////////////////////////////////////////////////////
// 2. TODO：事件绑定流程 在start&end方法中均会调用到该函数“关闭元素”
function closeElement(element) {
  trimEndingWhitespace(element);
  if (!inVPre && !element.processed) {
    // TODO: 关键处理元素
    element = processElement(element, options);
  }
  // tree management
  if (!stack.length && element !== root) {
    // allow root elements with v-if, v-else-if and v-else
    if (root.if && (element.elseif || element.else)) {
      {
        checkRootConstraints(element);
      }
      addIfCondition(root, {
        exp: element.elseif,
        block: element,
      });
    } else {
      warnOnce('Component template should contain exactly one root element. ' + 'If you are using v-if on multiple elements, ' + 'use v-else-if to chain them instead.', { start: element.start });
    }
  }
  if (currentParent && !element.forbidden) {
    if (element.elseif || element.else) {
      processIfConditions(element, currentParent);
    } else {
      if (element.slotScope) {
        // scoped slot
        // keep it in the children list so that v-else(-if) conditions can
        // find it as the prev node.
        var name = element.slotTarget || '"default"';
        (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
      }
      currentParent.children.push(element);
      element.parent = currentParent;
    }
  }

  // final children cleanup
  // filter out scoped slots
  element.children = element.children.filter(function (c) {
    return !c.slotScope;
  });
  // remove trailing whitespace node again
  trimEndingWhitespace(element);

  // check pre state
  if (element.pre) {
    inVPre = false;
  }
  if (platformIsPreTag(element.tag)) {
    inPre = false;
  }
  // apply post-transforms
  for (var i = 0; i < postTransforms.length; i++) {
    postTransforms[i](element, options);
  }
}
// 2.1 处理元素
function processElement(element, options) {
  // 处理绑定得key
  processKey(element);

  // determine whether this is a plain element after
  // removing structural attributes
  element.plain = !element.key && !element.scopedSlots && !element.attrsList.length;
  // 处理ref绑定
  processRef(element);
  processSlotContent(element);
  processSlotOutlet(element);
  processComponent(element);
  for (var i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element;
  }
  // 处理其他属性 比如v-bind v-on所绑定的 下面着重分析下
  processAttrs(element);
  return element;
}
function processKey(el) {
  var exp = getBindingAttr(el, 'key');
  if (exp) {
    {
      if (el.tag === 'template') {
        warn$2('<template> cannot be keyed. Place the key on real elements instead.', getRawBindingAttr(el, 'key'));
      }
      if (el.for) {
        var iterator = el.iterator2 || el.iterator1;
        var parent = el.parent;
        if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
          warn$2('Do not use v-for index as key on <transition-group> children, ' + 'this is the same as not using keys.', getRawBindingAttr(el, 'key'), true /* tip */);
        }
      }
    }
    el.key = exp;
  }
}
function processRef(el) {
  var ref = getBindingAttr(el, 'ref');
  if (ref) {
    el.ref = ref;
    el.refInFor = checkInFor(el);
  }
}
// 2.1.1 处理其他属性
function processAttrs(el) {
  // 在前面我们已经将每个标签上的attrs作了处理
  var list = el.attrsList;
  var i, l, name, rawName, value, modifiers, syncGen, isDynamic;
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name;
    value = list[i].value;
    // var dirRE = /^v-|^@|^:|^#/;
    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true;
      // modifiers
      // TODO: 这里解析出当前属性的属性符集合
      modifiers = parseModifiers(name.replace(dirRE, ''));
      // support .foo shorthand syntax for the .prop modifier
      if (modifiers) {
        // TODO: 这里把属性的修饰符替换掉 为了后面判断这个属性究竟是什么
        name = name.replace(modifierRE, '');
      }
      //  var bindRE = /^:|^\.|^v-bind:/;
      // 1. TODO：首先判断是否是v-bind :xxx属性绑定
      if (bindRE.test(name)) {
        // v-bind
        name = name.replace(bindRE, '');
        value = parseFilters(value);
        isDynamic = dynamicArgRE.test(name);
        if (isDynamic) {
          name = name.slice(1, -1);
        }
        if (value.trim().length === 0) {
          warn$2('The value for a v-bind expression cannot be empty. Found in "v-bind:' + name + '"');
        }
        if (modifiers) {
          if (modifiers.prop && !isDynamic) {
            name = camelize(name);
            if (name === 'innerHtml') {
              name = 'innerHTML';
            }
          }
          if (modifiers.camel && !isDynamic) {
            name = camelize(name);
          }
          if (modifiers.sync) {
            syncGen = genAssignmentCode(value, '$event');
            if (!isDynamic) {
              addHandler(el, 'update:' + camelize(name), syncGen, null, false, warn$2, list[i]);
              if (hyphenate(name) !== camelize(name)) {
                addHandler(el, 'update:' + hyphenate(name), syncGen, null, false, warn$2, list[i]);
              }
            } else {
              // handler w/ dynamic event name
              addHandler(
                el,
                '"update:"+(' + name + ')',
                syncGen,
                null,
                false,
                warn$2,
                list[i],
                true // dynamic
              );
            }
          }
        }
        if ((modifiers && modifiers.prop) || (!el.component && platformMustUseProp(el.tag, el.attrsMap.type, name))) {
          addProp(el, name, value, list[i], isDynamic);
        } else {
          addAttr(el, name, value, list[i], isDynamic);
        }
      } else if (onRE.test(name)) {
        // var onRE = /^@|^v-on:/;
        // 2. TODO: 再判断是否是v-on @ 事件绑定
        // v-on
        name = name.replace(onRE, ''); // 这种替换字符串的写法学习下
        isDynamic = dynamicArgRE.test(name);
        if (isDynamic) {
          name = name.slice(1, -1);
        }
        addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic);
      } else {
        // 3. TODO：若既不是属性绑定又不是事件绑定 那么就是自定义指令绑定
        // normal directives
        name = name.replace(dirRE, '');
        // parse arg
        var argMatch = name.match(argRE);
        var arg = argMatch && argMatch[1];
        isDynamic = false;
        if (arg) {
          name = name.slice(0, -(arg.length + 1));
          if (dynamicArgRE.test(arg)) {
            arg = arg.slice(1, -1);
            isDynamic = true;
          }
        }
        addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
        if (name === 'model') {
          checkForAliasModel(el, value);
        }
      }
    } else {
      // literal attribute
      {
        var res = parseText(value, delimiters);
        if (res) {
          warn$2(
            name +
              '="' +
              value +
              '": ' +
              'Interpolation inside attributes has been removed. ' +
              'Use v-bind or the colon shorthand instead. For example, ' +
              'instead of <div id="{{ val }}">, use <div :id="val">.',
            list[i]
          );
        }
      }
      addAttr(el, name, JSON.stringify(value), list[i]);
      // #6887 firefox doesn't update muted state if set via attribute
      // even immediately after element creation
      if (!el.component && name === 'muted' && platformMustUseProp(el.tag, el.attrsMap.type, name)) {
        addProp(el, name, 'true', list[i]);
      }
    }
  }
}
// 2.1.2 添加事件操作
function addHandler(el, name, value, modifiers, important, warn, range, dynamic) {
  // TODO: 拿到事件修饰符
  modifiers = modifiers || emptyObject;
  // warn prevent and passive modifier
  /* istanbul ignore if */

  // TODO: 这里vue文档里面也说明了 preveent与passive不能同时使用
  if (warn && modifiers.prevent && modifiers.passive) {
    warn("passive and prevent can't be used together. " + "Passive handler can't prevent default event.", range);
  }

  // normalize click.right and click.middle since they don't actually fire
  // this is technically browser-specific, but at least for now browsers are
  // the only target envs that have right/middle clicks.
  // TODO：鼠标右键事件修饰
  if (modifiers.right) {
    if (dynamic) {
      name = '(' + name + ")==='click'?'contextmenu':(" + name + ')';
    } else if (name === 'click') {
      name = 'contextmenu';
      delete modifiers.right;
    }
  } else if (modifiers.middle) {
    // TODO: 鼠标滚动中间事件修饰
    if (dynamic) {
      name = '(' + name + ")==='click'?'mouseup':(" + name + ')';
    } else if (name === 'click') {
      name = 'mouseup';
    }
  }

  // check capture modifier
  if (modifiers.capture) {
    // TODO：处理事件捕获修饰
    delete modifiers.capture;
    name = prependModifierMarker('!', name, dynamic);
  }
  if (modifiers.once) {
    // TODO: 处理绑定一次修饰符
    delete modifiers.once;
    name = prependModifierMarker('~', name, dynamic);
  }
  /* istanbul ignore if */
  if (modifiers.passive) {
    // TODO: 一般配合滚动使用
    delete modifiers.passive;
    name = prependModifierMarker('&', name, dynamic);
  }

  var events;
  if (modifiers.native) {
    // TODO：绑定监听原生事件
    delete modifiers.native;
    events = el.nativeEvents || (el.nativeEvents = {});
  } else {
    events = el.events || (el.events = {});
  }

  var newHandler = rangeSetItem({ value: value.trim(), dynamic: dynamic }, range);
  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers;
  }

  var handlers = events[name];
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
  } else {
    events[name] = newHandler;
  }

  el.plain = false;
}
