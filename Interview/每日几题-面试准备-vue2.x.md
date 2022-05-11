

### 2020.07.19

​			1.**Vue事件机制及源码？**

```js
1.	首先执行initMethods() 来初始化options里面的methods方法配置，并挂载在vue实例上面，通过this.xxx来访问
2.	事件处理也就是在进行模板编译的时候，将template模板进行编译，解析成AST树，再转换成render函数
3.	调用parse() "模板转为AST"
	->	调用parseHTML() "解析模板，有个shouldKeepComment 是否保存注释 其实调用的传入第二个对象中的comment方法"
	->	调用参数对象中的"start" 开始分割字符串 
    ->	执行"preTransforms"方法
    ->	执行"processElement"方法
    ->	执行"processAttrs"方法来解析 模板上配置的属性 我们的事件也在其中处理
    ->	这里处理了是否存在modifiers 再判断了是否属于"v-bind" 是否属于"v-on" 是否属于"一般指令" 是否属于"文字属性"
	->	事件走的是第二个 正则出事件的名称 调用"addHandler"方法
    ->	再次针对modifiers中属性进行判断 如prevent&passive不能同时声明 如是否定义了鼠标的右键 中建 左键 如是否定义了capture once passive native等属性 
    ->	执行"rangeSetItem"方法来获取当前事件的对象详情 如
    {
        dynamic: false
        end: 304
        start: 277
        value: "onTestEventHandler"
    }
	并设置el.plain = false
	->	在genElement中会执行"genData$2"
	->	此时el.events中存在值 则走genHandlers 针对对象中所有绑定的事件执行 for-in遍历 且调genHandler
    -> 	最后生成的code中就是处理过的事件函数字符串 真正开始注册事件不是在处理模板编译里面 而是在patchVnode中
    ->	调用"createElm"
	->	调用"invokeCreateHooks"就是一个模板指令处理的任务，他分别针对不同的指令为真实阶段创建不同的任务，针对事件，这里会调updateDOMListeners对真实的DOM节点注册事件任务
    ->	调用"updateListeners"进行更新监听
    ->	调用"add"方法 执行"target$1.addEventListener"添加事件响应
```



### 2021.07.14

​			1.**简述下Vue自定义指令？原理是什么？多用于哪种场景？**

```js
1.	vue提倡数据驱动视图，但有的时候不可避免需要对普通DOM元素进行底层操作，这个时候就会用到自定义指令。
2.	可以Vue.directive('xxx',{}) || 配置项中{directives:{}}使用

3.	提供5个钩子函数
	"bind"：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
    "inserted"：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
    "update"：“所在组件”的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。
    "componentUpdated"：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
    "unbind"：只调用一次，指令与元素解绑时调用。
4.	以上所有钩子函数参数均一致
	"el"：指令所绑定的元素，可以用来直接操作 DOM。
    "binding":
    	->	"name":指令名，不包括 v- 前缀。
		->	"value":指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2。
        ->	"oldValue":指令绑定的前一个值，仅在 update 和 componentUpdated 钩子中可用。无论值是否改变都可用。
        ->	"expression":字符串形式的指令表达式。例如 v-my-directive="1 + 1" 中，表达式为 "1 + 1"。
        ->	"arg":传给指令的参数，可选。例如 v-my-directive:foo 中，参数为 "foo"。
        ->	"modifiers":一个包含修饰符的对象。例如：v-my-directive.foo.bar 中，修饰符对象为 { foo: true, bar: true }。
     "vnode"
	 "oldVnode"
5.	动态指令参数v-xxx:[arg]=""

6.  源码6565行
	声明directives对象
    ->	执行updateDirectives()若新旧vnode上存在"directives"配置
    ->	执行_update(oldVnode,vnode)
	->	通过normalizeDirectives$1()方法拿到Dirs属性配置
    ->	若不存在oldDir则表明新的 通过callHook$1()触发"bind"钩子
    ->	若存在则通过callHook$1()触发"update"钩子
    ->	通过dirsWithInsert长度通过callHook$1()触发"inserted"
	->	通过dirsWithPostpatch长度callHook$1()触发"componentUpdated"
	->	通过isCreate是否存在 触发"unbind"钩子

7.	使用场景：
	鼠标聚焦
    下拉菜单
    相对时间转换
    滚动动画
    自定义指令实现图片懒加载
	自定义指令集成第三方插件
```

​			2.**如何理解vue中的观察者模式以及依赖与观察者？**

```js
1. 观察者模式
	当对象间存在一对多关系时，则使用观察者模式（Observer Pattern）。比如，当一个对象被修改时，则会自动通知依赖它的对象。观察者模式属于行为型模式。
2.	Vue中的"目标" -》 Dep类（也可以称为依赖收集者）-》 （核心有个观察者集合subs，一个派发通知方法notify）
	Vue中的"观察者" -》 Watcher类

3.	源码分析
	Dep类 716行 （id&subs&target）
	3.1 该类主要有两个属性，一个是每个Dep实例的id，而另一个就是我们的依赖收集集合，是一个数组subs，还有个就是挂载在全局且唯一的变量target，指向的是当前操作的是哪个Watcher实例（一次只能操作一个观察者）
    3.2	Dep原型方法 - addSub() - 添加 依赖收集观察者
		Dep原型方法 - removeSub() - 删除 依赖收集观察者
		Dep原型方法 - depend() - 收集 依赖观察者
		Dep原型方法 - notify() - 派发 通知所有依赖该数据的观察者们
    3.3	执行响应式数据定义时 每次都会生成一个Dep类实例有多少data数据就会生成多少个Dep实例 但注意此时并未在Object.defineProperty使用 这里巧妙的利用了js的闭包特性 每次都是在执行该data属性的getter方法里面再去收集依赖而此时收集时的dep实例 就是最初创建的Dep实例 保留了id，subs等
    
	Watcher类 4419行
    3.4	watcher类的东西就比较多而且复杂了 一般来说watcher我们可以分为"计算属性watcher","用户定义watcher","渲染watcher"
	3.5	假设如下
    data(){
        retrun {
            test:'我是测试watcher'
        }
    }，
    computed:{
        getTest(){
            return this.test + '-computed'
        }
    }，
    watch:{
        test:function(val,oldVal){
            console.log(val,oldVal,'-watch')
        }
    }
当vue执行时
Dep								Watcher
0 -> "$attrs"
1 -> "$listeners"
2 -> "data"
3 -> "data.test"				1 -> "计算Watcher"(在										initComputed()方法里面生成)
								2 -> "用户Watcher"(在										initWatch()方法里面通过										createWatcher()创建)
                                执行到此时会触发"test"的getter方								  法，让Dep:3来收集自己watcher:2,								且自身watcher中收集deps&depsId
此时Dep3中的subs:[watcher2]
								获取计算属性，同时触发getter
此时Dep3中的subs:[watcher2,watcher1]
								3 -> "渲染Watcher"（当执行挂载操作$mount()时 会生成一个渲染dom的watcher）
此时Dep3中的subs:[watcher2,watcher1,watcher3]
	
	3.6	这样依赖就收集完成 当我们去更改test值的时候 相应的触发setter方法 此时dep实例由于闭包特性 此时dep为dep3 接着触发dep.notify()方法
    -> 从dep拿到所有当前依赖subs for循环遍历执行watcher.update()方法
    -> 将当前watcher执行queueWatcher()方法 且压入队列
    -> 首次执行waiting为false 且flushSchedulerQueue压入nextTick中 waiting置为true
    -> event loop后 将之前队列通过id由小到大排列 这样做有个方面
    （1.	组件更新都是从父到子，因为父总是比子先创建）
	（2.	用户自定义的watcher 肯定比渲染watcher创建的早 如上面的2和3）
    （3. 若组件在父组件执行watcher.run时被摧毁 即可跳过该watcher）
    ->	若设置了"before"钩子 则执行
    ->	执行"watcher.run()"方法
    ->	执行"watcher.get()"方法
    ->  设置全局Dep.target为当前watcher
    ->	核心执行"this.getter.call(vm,vm)"
	->	释放全局Dep.target为null
	->	执行当前依赖清理 将newDepIds&newDeps赋值给deps&depsId且重置之前值
	->	执行"activated"钩子
    ->  执行"updated"钩子
    -> 	执行下一次的update()操作
```



### 2021.07.13

​			1.**v-model如何绑定到自定义组件上?**

```js
一个组件上的 v-model 默认会利用名为 value 的 prop 和名为 input 的事件，但是像单选框、复选框等类型的输入控件可能会将 value attribute 用于不同的目的。model 选项可以用来避免这样的冲突。
model：{
    prop:'checked',
    event:'change'
}
```

​			2.**如何给对象添加一个新属性或者操作数组？原理是什么？**

```js
1.	使用$set(target,key,val)来解决
2.	原理：
	2.1	若target是数组array 则直接调用splice来操作返回值
    2.2	若更改的是已声明的对象值 则直接target[key]=val来操作值
	2.3	检查是否操作的根Vue实例
    2.4 以上都不满足 则摆明是新增的 则需要对该属性来一套响应式操作包裹 defineReactive$$1走几，同时执行通知者通知操作

```

​			3.**Vue中封装的数组方法有哪些？其原理是什么？**

```js
1.	由于Object.defineProperty()缺陷，所以vue内部重写了关于数组操作的7种方法
	push,pop,unshfit,shfit,sort,reverse,splice方法
2.	见源码860行起
	def包裹Array对象下的method方法，先使用原生的Array方法来执行，得到result值，根据所用的方法来进行构造参数，调用ob.observeArray，并且通知收集者调用通知方法ob.dep.notify(),最后返回result
```

​			4.**Vue data中某个属性的值改变后，视图会立即同步执行重新渲染吗？**

```js
当值被改变时经历的流程如下：
defineProperty拦截set 
    -> 触发当前依赖dep.notify()方法 
    -> for循环触发每个subs中的监听watcher的update()方法 
    -> 常规情况下会将该watcher压入到监听者队列queueWatcher()方法
	-> 执行flushSchedulerQueue()方法
	-> 对全局queue队列进行id排序后 for循环拿出当前依赖的所有监听watcher 若存在before配置则执行before钩子
    -> 执行watcher.run()方法
    -> 执行watcher.get()方法
    -> 最重要的来了 就是执行this.getter.call(vm,vm)方法 多数情况下它就是updateComponent函数 触发视图的更新
    -> 触发activated生命周期钩子
	-> 触发updated生命周期钩子
```

​			5.**简述下mixins、mixin、extend、extends区别及原理？**

```js
	该"mixins"在组件配置项里面使用，接收一个"混入"对象的数组可以像正常的实例一样包含实例选项，这些选项通过mergeOptions()混入到最终选项中。注意mixins接收的是一个数组对象，可以理解成“多继承”，而且每个mixin都不会被覆盖且按照数组下标位置依次执行。
2.	extends：                              Object | Function
	该"extends"在组件配置项里面使用，接收一个"扩展"对象或者构造函数，主要是为了扩展单文件组件。
3.	Vue.mixin():									Object
	在全局"混入"，影响注册之后创建的每个组件实例，比如在全局混入了一个"beforeRouteLeave"路由钩子函数，则以后每个组件都会调用该钩子方法
4.	Vue.extend():									Object
	使用基础Vue构造器，来创建一个”子类“，多数用法是为了创建可复用的组件
以上4者均调用了核心mergeOptions()方法来根据一定的策略来进行各种属性的合并。

5.	源码：1521行起
	检查是否合并项为一个组件Components 
    -> 规范化三属性normalizeProps\normalizeInject\normalizeDirectives
    -> 检查是否存在"extends"配置项 存在则递归执行mergeOptions()
	-> 检查是否存在"mixins"配置项数组 存在则for循环递归执行mergeOptions()
	-> 策略合并最终options返回出去

6.	执行优先级问题
	Vue.mixin() > extends > mixins > Vue.extend()

```

### 2021.07.12

​			1.**使用Object.defineProperty()来进行数据劫持有什么缺点？**

```js
1.	无法监听数组（vue使用hack来重写Array的7个方法，来保证在vue中使用该些方法时能达到数据响应的及时）
(push,pop,shfit,unshfit,sort,reverse,splice)
2.	若data数据是一个嵌套Object，则需要遍历每层object以达到监听每层值
3.	无法正确的判断array[index] = xxx || array.length = number作响应，对这2种方式无法劫持判断，所以后面增加了$set()方法来曲线救国
```

​			2.**slot是什么？有什么作用？原理是什么？**

```js
1.	vue提供的内容分发功能
	1.1	默认插槽 （无名称name设置 使用default或者父未设置内容 则子可以设置默认值显示）
    1.2	具名插槽 （子(<slot name='xxx'>) && 父(template/v-slot:xxx)）
    1.3	作用域插槽（子(<slot :key="data_value">) && 父(<template v-slot:default="key">{{key.data_value}}</template>)）
2.	模板编译中通过"_t"来解析 调用renderSlot方法
```

​			3.**过滤器的作用？如何使用一个过滤器？原理是什么？**

```js
1.	一般在v-bind后面或者双括号插值的后面使用“管道符号”来使用
2.	通过组件配置中的filter选项配置/全局注册Vue.filter来使用
3.	模板编译中分别在"proessAttr"中的v-bind调用"parseFilter"或者在"parseText"中来处理 通过字符串截取来动态拼接"_f"开头的式子
```

​			4.**常见的事件修饰符及作用？**

```js
1.	事件修饰符：.stop/.prevent/.capture/.self/.once/.passive
2.	按键修饰符：.enter/.tab/.delete/.esc/.space/.up/.down/.left/.right
3.	系统修饰符：.ctrl/.alt/.shfit/.meta/.exact
4.	鼠标修饰符：.left/.right/.middle
5.	.sync修饰符：需要对一个prop值进行“双向绑定”，按一般的写法过于复杂，但v-model只能绑定一个值，此时.sync就有作用了，其实是个语法糖，是:key="value" @xxx="(v)=>value=v"的缩写
6.	源码中通过"modifiers"来处理每一种情况
```

​			5.**v-if/v-show/v-html原理？**

```js
1.	v-if在模板编译中：就是个“三目表达式”
2.	v-show在模板编译中：_c('h4',{directives:[{name:\"show\",rawName:\"v-show\",value:(testShow),expression:\"testShow\"}]},[_v(\"我是v-show\")]),_v(\" \") 实质上是操作了el.style.display
3.	v-html在模板编译中：_c('h4',{domProps:{\"innerHTML\":_s(vHtml)}})])
```



### 2021.04.07-computed和watch

1. **如何理解computed和watch？**

   ```js
   computed&watch源码分析
   date: 2021-04-06
   
   下面我根据一个简单的例子 来重头分析
   <span>{{getMessage}}</span>
   <span>{{otherMessage}}</span>
   {
     data:{
       message:'我是初始化值',
       otherMessage:'我是另一个初始化值'
     },
     computed:{
       getMessage(){
         return this.message + '_computed'
       }
     },
     watch:{
       'message':function(val,oldVal){
         console.log(val,oldVal)
       }
     },
     mounted() {
       setTimeout(() => {
         // 1. 改变computed依赖的响应式值 message
         this.message = '改变computed依赖的响应式值 message'
         // 2. 改变非computed依赖的响应式值 otherMessage
         this.otherMessage = '改变非computed依赖的响应式值 otherMessage'
       },3000)
     },
   }
   ```

   ```js
   1. 执行initData 给data下的数据做defineProperty设置
                                                  -> message -> Dep(id:3) -> getter&setter
                                                  -> otherMessage -> Dep(id:4) -> getter&setter
   
   2. 执行initComputed
                     -> 生成vm._computedWatcher = 实例化一个watcher 这里称之为 "计算watcher"(id:1) 
                     -> 这里“计算watcher”(id:1) 特别需要注意 传入Watcher第二个参数就是 用户所编写的computed函数 -> 则watcher.getter = computed函数
                     -> “计算watcher”(id:1) 默认lazy:true -> 导致dirty:false -> 表示不再实例watcher时就进行求值 真正求值是当渲染时 执行get方法 调用watcher.getter方法求值
                     -> 最后将computed的key值如上面的'getMessage'通过defineProperty方法 -> 挂载到实例vm下面 -> 且描述中 getter为“createComputedGetter”函数（当模板中访问该值时会触发该getter）
                     -> this.value = this.lazy ? undefined : this.get() -> 当前watcher的value为undefined
   
   3. 执行initWatch
                  -> 针对组件内watch的几种写法做处理
                     1. 'key' : function 函数格式，如上 
                     2. 'key' : name in methods 直接绑定到methods对象里面声明的方法 
                     3. 'key' : [handler1,handler2,...] 后面跟handler操作数组）
                     4. 'key' : Object 后面跟个对象 但是对象里面必须包含一个叫'handler'的key的键值对处理函数
                  -> 实例化一个watcher 这里称之为 "监听watcher"(id:2)
                  -> 这里“监听watcher”(id:2) 特别需要注意 传入Watcher第二个参数只是 我们写的监听key值（如上面的'message'）而第三个参数则是用户所编写的回调函数  -> 则watcher.getter = parsePath()其实就是访问实例上的响应式值
                  -> “监听watcher”(id:2) 默认user:true -> 则lazy:false -> dirty:false
                  -> this.value = this.lazy ? undefined : this.get() -> 则立即执行get方法求值value
                  -> 但凡执行get方法 都会操作全局Dep.Target = 当前watcher(“监听watcher”(id:2))
                  -> 执行watcher.getter（parsePath()） -> 一旦拿'message' -> 触发响应式数据的getter函数
                  -> 当前全局栈是 “监听watcher”(id:2) 而当前闭包下 Dep(id:3) 
                  -> 这个时候 就是很关键的依赖收集了 -> 说明“监听watcher”(id:2)依赖Dep(id:3)
                  -> 执行后 此时 Dep(id:3)上的subs里面收集了一个“监听watcher”(id:2) 而“监听watcher”(id:2)上的newDeps收集到了Dep(id:3) 等于说watcher上有dep dep上有watcher
                  -> 再出栈 Dep.Target = undefined
                  -> 将 “监听watcher”(id:2)上的newDeps&newDepsIds赋值到deps&depIds上面 并最后置两者为空 等待下一次update变化
   
   4. 执行挂载 会触发渲染函数render
                           -> 会实例化一个watcher 这里称之为 "渲染watcher"(id:3)
                           -> "渲染watcher"(id:3) 特别需要注意 传入Watcher第二个参数就是 updateComponent函数（vm._update(vm._render())）-> 则watcher.getter = vm._update(vm._render())
                           -> "渲染watcher"(id:3) 默认lazy:false -> dirty:false
                           -> this.value = this.lazy ? undefined : this.get() -> 则立即执行get方法求值value
                           -> 但凡执行get方法 都会操作全局Dep.Target = 当前watcher("渲染watcher"(id:3))  
                           -> 执行vm.render()方法 -> 则会触发with匿名函数来创建vnode 
                           -> 则触发data响应式值的getter 或 computed函数的getter
                           -> 该例子下 先触发computed函数的getter -> 通过之前赋值到_computedWatchers拿到当前的“计算watcher”(id:1) -> “计算watcher”(id:1)dirty为false
                           -> 则执行“计算watcher”(id:1)的evaluate方法来取值 -> 执行get方法
                   ****    -> 我们经常谈的计算属性具有缓存特性 这里它的缓存特性就是dirty这个参数的值来决定的 若dirty为true 则重新计算computed函数值 若dirty为false 则拿watcher上的value值
                           -> 但凡执行get方法 都会操作全局Dep.Target = 当前watcher(“计算watcher”(id:1)) 当前Dep栈里面存在两个watcher [‘"渲染watcher"(id:3)’,‘“计算watcher”(id:1)’]
                           -> 调用watcher.getter（定义的computed函数）
                           -> 触发data响应式数据的getter
                           -> 当前全局栈是 “计算watcher”(id:1) 而当前闭包下 Dep(id:3)     
                           -> 这个时候 就是很关键的依赖收集了 -> 说明“计算watcher”(id:1)依赖Dep(id:3)
                           -> 执行后 此时 Dep(id:3)上的subs里面收集了两个[“监听watcher”(id:2), “计算watcher”(id:1)] 而“计算watcher”(id:1)上的newDeps收集到了Dep(id:3) 等于说watcher上有dep dep上有watcher
                           -> 再出栈 Dep.Target = undefined -> 将 “计算watcher”(id:1)上的newDeps&newDepsIds赋值到deps&depIds上面 并最后置两者为空 等待下一次update变化
                           -> 出栈后 此时Dep.Target = "渲染watcher"(id:3)
                   ****    -> 很关键的将“计算watcher”(id:1)上的dirty置为false
                           -> 继续在computed的getter函数内执行
                           -> 因为此时Dep.Target = "渲染watcher"(id:3) -> 所以需要将"渲染watcher"(id:3) 收集起来
                           -> 即当前Dep(id:3)下的subs里面收集了3个watcher [‘"监听watcher"(id:2)’, ‘“计算watcher”(id:1)’, ‘"渲染watcher"(id:3)’]
                           -> 而每种watcher下也收集了依赖Dep(id:3)    
                           -> 继续执行with匿名函数
                           -> 触发data响应式数据otherMsg的getter -> 此时Dep.Target = "渲染watcher"(id:3)
                           -> 则Dep(id:4)上的subs里面收集这个watcher ['"渲染watcher"(id:3)'] 而"渲染watcher"(id:3)上收集两个依赖 ['Dep(id:3)', 'Dep(id:4)']
   
   5. 挂载完毕 回到渲染watcher的get方法
                                     -> 执行出栈 Dep.Target = undifined 剩余空栈 []
   
   6. 若执行 this.message = '改变computed依赖的响应式值 message'
                                                            -> 闭包特性当前Dep(id:3) 执行notify方法
                                                            -> 遍历执行Dep(id:3)下的subs里面的所有watcher执行update方法
                                                            -> 因为改变的是message这个值 它关联了3个watcher 所以分别执行 
                                                            -> 1. ‘"监听watcher"(id:2)’ : 因为lazy:false -> 将‘"监听watcher"(id:2)’压进queue队列 且压入异步操作队列
                                                            -> 2. ‘“计算watcher”(id:1)’ ：因为lazy:true -> 将 dirty置为true -> 为了重新计算computed值 因为你依赖变化了 自然需要求新值
                                                            -> 3. ‘"渲染watcher"(id:3)’ ：因为lazy:false -> 将‘渲染watcher"(id:3)’压进queue队列 
                                                            -> 此时queue队列里面两个值 [‘"监听watcher"(id:2)’,‘渲染watcher"(id:3)’]
                                                            -> 异步操作最后执行
   
   7. 对queue队列进行id由小到大升序排列
                                     -> 1. 因为父组件始终先于子组件进行创建 则执行watcher更新也是父组件先更新 子组件后更新
                                     -> 2. 因为用户自定义的watcher就是watch配置 它比渲染watcher先创建 它在initWatch函数就创建了 先执行它 -> 也就执行用户的回调监听函数了
                                     -> 3. 若组件被销毁 则会跳过它的watcher更新
   
   8. 遍历queue
              -> 若为‘"渲染watcher"(id:3)’ -> 则触发before钩子 beforeUpdate -> 执行run方法 -> 执行get方法 -> value为undefined
              -> 若为‘"监听watcher"(id:2)’ -> 则执行run方法 -> 执行get方法 
   
   若执行 this.otherMessage = '改变非computed依赖的响应式值 otherMessage'
                                                                      -> 闭包特性当前Dep(id:4) 执行notify方法
                                                                      -> 遍历执行Dep(id:4)下的subs里面的所有watcher执行update方法
                                                                      -> 因为改变的是otherMessage这个值 它只关联了1个watcher 也就是渲染watcher
                                                                      -> 因此区别就来了 当渲染模板访问计算属性值时 此时因为没改变依赖值 所以dirty为false 所以返回缓存值 其他逻辑差不多
   ```

   ```js
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
   ```

   ```js
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
   ```

   ```js
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
   ```

   

### 2021.04.06-vuex源码

1. **如何理解vuex源码？**

   ```js
   // vuex 源码分析
   // date：2021-04-01
   1. Vue.use(Vuex)
   2.             -> 调用install插件机制安装Vuex 内部调用applyMixin
   3.             -> Vue2.x以上采用Vue.mixin混入到beforeCreate Vue1.x 重写_init方法并添加到options.init
   4. new Vuex.Store(options)
   5.                       -> 初始化Store等内部变量
   6.                       -> 通过options进行模块收集ModuleCollection
   7.                       -> 给commit&dispatch包裹一层函数外衣 内部call-store调用
   8. installModule安装模块（内部递归生成每层module实例且关联到父子级上）
   9.                                      -> 注册mutations & actions & getter & child
   10.                                     -> 做每层module的state进行提升到所对应的父级state中
   11. resetStoreVM重置空vue且操作$$state
   12.                                  -> 实例化空Vue并且作$$state上挂载当前处理后的state(store严格模式下校验是否外部改变了state异常)
   13.                                  -> 作computed挂载
   14. 添加插件 （是个数组格式）
   15.        -> 官方提供了内置Logger插件
   16.        -> 一般配合subscribe(订阅mutation),subscribeAction(订阅) 取消订阅 需要执行该方法执行后返回的函数
   17. 是否启用devtool
   ```

   ```js
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
   ```

   ```js
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
   ```

   ```js
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
   ```

   ```js
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
   ```

   ```js
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
   ```

   ```js
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
   ```

   ```js
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
   ```

   

### 2021.03.31-vue-router源码

1. **如何理解vue-router源码？**

   ```js
   vue-router 源码分析
   date: 2021-03-26
   1. import Vue VueRouter 进来
   2. 使用Vue.use(VueRouter) 来进行router的install
                                                 -> 使用mixin混入每个组件钩子“beforeCreate”&“destroyed”
                                                 -> Object.defineProperty定义拦截“$router”&"$route"
                                                 -> Vue.component注册“router-view” & "router-link"
                                                 -> 挂载组件上钩子函数（守卫）‘beforeRouterEnter’ & ‘beforeRouteLeave’ & ‘beforeRouteUpdate’
   3. 执行new VueRouter里面逻辑
                              -> 根据用户定义的routes构建匹配器
                              -> 根据mode进行不同模式进行初始化
   4. 若传入了router给实例
                          -> 则触发组件里面beforeCreated钩子中判断 isDef(this.$options.router)
                          -> 触发VueRouter的init 初始化方法 且调用transitionTo方法来让路由切换
                          -> 内部继续调用confirmTransition方法 执行真正切换
   ```

   ```js
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
   ```

   ```js
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
   ```

   ```js
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
   ```

   ```js
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
   ```

   ```js
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
   ```

   

### 2021.03.25-diff算法

   1. **如何理解vue中的diff算法?**

      ```js
      // 1. 初始化 源码 8434行
      var platformModules = [attrs, klass, events, domProps, style, transition];
      // 源码 6680行
      var baseModules = [ref, directives];
      // 源码 8447行
      var modules = platformModules.concat(baseModules);
      var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });
      // 源码 9036行 将声明的patch 给到实例__path__上面
      Vue.prototype.__patch__ = inBrowser ? patch : noop;
      
      ```

      ```js
      // 2. createPatchFunction
      var hooks = ['create', 'activate', 'update', 'remove', 'destroy']; // 生命周期大定义
      function createPatchFunction(backend) {
          var i, j;
          var cbs = {};
      
          var modules = backend.modules;
          var nodeOps = backend.nodeOps; // 这是真实操作dom的方法
      
          for (i = 0; i < hooks.length; ++i) {
              cbs[hooks[i]] = [];
              for (j = 0; j < modules.length; ++j) {
                  if (isDef(modules[j][hooks[i]])) {
                      cbs[hooks[i]].push(modules[j][hooks[i]]);
                  }
              }
          }
      
          function emptyNodeAt(elm) {
              return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
          }
      
          function createRmCb(childElm, listeners) {
              function remove$$1() {
                  if (--remove$$1.listeners === 0) {
                      removeNode(childElm);
                  }
              }
              remove$$1.listeners = listeners;
              return remove$$1;
          }
      
          function removeNode(el) {
              var parent = nodeOps.parentNode(el);
              // element may have already been removed due to v-html / v-text
              if (isDef(parent)) {
                  nodeOps.removeChild(parent, el);
              }
          }
      
          function isUnknownElement$$1(vnode, inVPre) {
              return (
                  !inVPre &&
                  !vnode.ns &&
                  !(
                      config.ignoredElements.length &&
                      config.ignoredElements.some(function (ignore) {
                          return isRegExp(ignore) ? ignore.test(vnode.tag) : ignore === vnode.tag;
                      })
                  ) &&
                  config.isUnknownElement(vnode.tag)
              );
          }
      
          var creatingElmInVPre = 0;
      
          // TODO: 当前函数  我理解是 通过vnode 来创建真实的dom 且挂载到vnode.elm上面
          // 1. 先判断是否需要创建组件
          // 2. 当前tag标签名是否存在 若存在则创建一个当前vnode的真实dom
          // 3. 若当前vnode有scoped等设置
          // 4. 再创建子级 这里可以形成一个递归调用
          // 5. 若是注释 则创建注释
          // 6. 最后就是文本节点创建
          // 7. 从最底层的文本Insert到当前父级 递归向上一直insert到对应的父级dom当中
          // 8. 若遇到组件 则开始组件的生命周期内程一套 包括处理成匿名with函数 然后一样的触发update
          // 一样的执行patch函数来转化vnode到真实dom
          function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
              if (isDef(vnode.elm) && isDef(ownerArray)) {
                  // This vnode was used in a previous render!
                  // now it's used as a new node, overwriting its elm would cause
                  // potential patch errors down the road when it's used as an insertion
                  // reference node. Instead, we clone the node on-demand before creating
                  // associated DOM element for it.
                  vnode = ownerArray[index] = cloneVNode(vnode);
              }
      
              vnode.isRootInsert = !nested; // for transition enter check
              // TODO: 这里当我们是一个组件时 处理完后并不需要管理后代children因为压根儿就没得child所以
              // return了
              if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
                  return;
              }
      
              var data = vnode.data;
              var children = vnode.children;
              var tag = vnode.tag;
              if (isDef(tag)) {
                  {
                      if (data && data.pre) {
                          creatingElmInVPre++;
                      }
                      if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
                          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.', vnode.context);
                      }
                  }
      
                  vnode.elm = vnode.ns ? nodeOps.createElementNS(vnode.ns, tag) : nodeOps.createElement(tag, vnode);
                  setScope(vnode);
      
                  /* istanbul ignore if */
                  {
                      createChildren(vnode, children, insertedVnodeQueue);
                      if (isDef(data)) {
                          invokeCreateHooks(vnode, insertedVnodeQueue);
                      }
                      // TODO：将子级dom操作压入父级dom
                      // 比如第一次初始化得时候 就是将虚拟dom构建的真实dom压入body下面
                      // 此时 我们的dom上将会存在两个<div id='app'></div>
                      // 第一个是我们手动编写的真实dom
                      // 第二个是根据虚拟dom vue编译构建的真实dom
                      // 因此后续vue会删除原来的手动编写的dom
                      insert(parentElm, vnode.elm, refElm);
                  }
      
                  if (data && data.pre) {
                      creatingElmInVPre--;
                  }
              } else if (isTrue(vnode.isComment)) {
                  vnode.elm = nodeOps.createComment(vnode.text);
                  insert(parentElm, vnode.elm, refElm);
              } else {
                  vnode.elm = nodeOps.createTextNode(vnode.text);
                  insert(parentElm, vnode.elm, refElm);
              }
          }
      
          function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
              var i = vnode.data;
              if (isDef(i)) {
                  var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
                  if (isDef((i = i.hook)) && isDef((i = i.init))) {
                      i(vnode, false /* hydrating */);
                  }
                  // after calling the init hook, if the vnode is a child component
                  // it should've created a child instance and mounted it. the child
                  // component also has set the placeholder vnode's elm.
                  // in that case we can just return the element and be done.
                  if (isDef(vnode.componentInstance)) {
                      initComponent(vnode, insertedVnodeQueue);
                      insert(parentElm, vnode.elm, refElm);
                      if (isTrue(isReactivated)) {
                          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
                      }
                      return true;
                  }
              }
          }
      
          function initComponent(vnode, insertedVnodeQueue) {
              if (isDef(vnode.data.pendingInsert)) {
                  insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
                  vnode.data.pendingInsert = null;
              }
              vnode.elm = vnode.componentInstance.$el;
              if (isPatchable(vnode)) {
                  invokeCreateHooks(vnode, insertedVnodeQueue);
                  setScope(vnode);
              } else {
                  // empty component root.
                  // skip all element-related modules except for ref (#3455)
                  registerRef(vnode);
                  // make sure to invoke the insert hook
                  insertedVnodeQueue.push(vnode);
              }
          }
      
          function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
              var i;
              // hack for #4339: a reactivated component with inner transition
              // does not trigger because the inner node's created hooks are not called
              // again. It's not ideal to involve module-specific logic in here but
              // there doesn't seem to be a better way to do it.
              var innerNode = vnode;
              while (innerNode.componentInstance) {
                  innerNode = innerNode.componentInstance._vnode;
                  if (isDef((i = innerNode.data)) && isDef((i = i.transition))) {
                      for (i = 0; i < cbs.activate.length; ++i) {
                          cbs.activate[i](emptyNode, innerNode);
                      }
                      insertedVnodeQueue.push(innerNode);
                      break;
                  }
              }
              // unlike a newly created component,
              // a reactivated keep-alive component doesn't insert itself
              insert(parentElm, vnode.elm, refElm);
          }
      
          function insert(parent, elm, ref$$1) {
              if (isDef(parent)) {
                  if (isDef(ref$$1)) {
                      if (nodeOps.parentNode(ref$$1) === parent) {
                          nodeOps.insertBefore(parent, elm, ref$$1);
                      }
                  } else {
                      nodeOps.appendChild(parent, elm);
                  }
              }
          }
      
          function createChildren(vnode, children, insertedVnodeQueue) {
              if (Array.isArray(children)) {
                  // TODO: 遍历children 是否key值有效
                  {
                      checkDuplicateKeys(children);
                  }
                  for (var i = 0; i < children.length; ++i) {
                      createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
                  }
              } else if (isPrimitive(vnode.text)) {
                  nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
              }
          }
      
          function isPatchable(vnode) {
              while (vnode.componentInstance) {
                  vnode = vnode.componentInstance._vnode;
              }
              return isDef(vnode.tag);
          }
      
          function invokeCreateHooks(vnode, insertedVnodeQueue) {
              for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                  cbs.create[i$1](emptyNode, vnode);
              }
              i = vnode.data.hook; // Reuse variable
              if (isDef(i)) {
                  if (isDef(i.create)) {
                      i.create(emptyNode, vnode);
                  }
                  if (isDef(i.insert)) {
                      insertedVnodeQueue.push(vnode);
                  }
              }
          }
      
          // set scope id attribute for scoped CSS.
          // this is implemented as a special case to avoid the overhead
          // of going through the normal attribute patching process.
          function setScope(vnode) {
              var i;
              if (isDef((i = vnode.fnScopeId))) {
                  nodeOps.setStyleScope(vnode.elm, i);
              } else {
                  var ancestor = vnode;
                  while (ancestor) {
                      if (isDef((i = ancestor.context)) && isDef((i = i.$options._scopeId))) {
                          nodeOps.setStyleScope(vnode.elm, i);
                      }
                      ancestor = ancestor.parent;
                  }
              }
              // for slot content they should also get the scopeId from the host instance.
              if (isDef((i = activeInstance)) && i !== vnode.context && i !== vnode.fnContext && isDef((i = i.$options._scopeId))) {
                  nodeOps.setStyleScope(vnode.elm, i);
              }
          }
      
          function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
              // 若式子 不成立 则表示新旧节点一致 不需要改变原dom树结构 可达复用节点
              for (; startIdx <= endIdx; ++startIdx) {
                  createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
              }
          }
      
          function invokeDestroyHook(vnode) {
              var i, j;
              var data = vnode.data;
              if (isDef(data)) {
                  if (isDef((i = data.hook)) && isDef((i = i.destroy))) {
                      i(vnode);
                  }
                  for (i = 0; i < cbs.destroy.length; ++i) {
                      cbs.destroy[i](vnode);
                  }
              }
              if (isDef((i = vnode.children))) {
                  for (j = 0; j < vnode.children.length; ++j) {
                      invokeDestroyHook(vnode.children[j]);
                  }
              }
          }
      
          function removeVnodes(vnodes, startIdx, endIdx) {
              for (; startIdx <= endIdx; ++startIdx) {
                  var ch = vnodes[startIdx];
                  if (isDef(ch)) {
                      if (isDef(ch.tag)) {
                          removeAndInvokeRemoveHook(ch);
                          invokeDestroyHook(ch);
                      } else {
                          // Text node
                          removeNode(ch.elm);
                      }
                  }
              }
          }
      
          function removeAndInvokeRemoveHook(vnode, rm) {
              if (isDef(rm) || isDef(vnode.data)) {
                  var i;
                  var listeners = cbs.remove.length + 1;
                  if (isDef(rm)) {
                      // we have a recursively passed down rm callback
                      // increase the listeners count
                      rm.listeners += listeners;
                  } else {
                      // directly removing
                      rm = createRmCb(vnode.elm, listeners);
                  }
                  // recursively invoke hooks on child component root node
                  if (isDef((i = vnode.componentInstance)) && isDef((i = i._vnode)) && isDef(i.data)) {
                      removeAndInvokeRemoveHook(i, rm);
                  }
                  for (i = 0; i < cbs.remove.length; ++i) {
                      cbs.remove[i](vnode, rm);
                  }
                  if (isDef((i = vnode.data.hook)) && isDef((i = i.remove))) {
                      i(vnode, rm);
                  } else {
                      rm();
                  }
              } else {
                  removeNode(vnode.elm);
              }
          }
      
          function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
              var oldStartIdx = 0;
              var newStartIdx = 0;
              var oldEndIdx = oldCh.length - 1;
              var oldStartVnode = oldCh[0];
              var oldEndVnode = oldCh[oldEndIdx];
              var newEndIdx = newCh.length - 1;
              var newStartVnode = newCh[0];
              var newEndVnode = newCh[newEndIdx];
              var oldKeyToIdx, idxInOld, vnodeToMove, refElm;
      
              // removeOnly is a special flag used only by <transition-group>
              // to ensure removed elements stay in correct relative positions
              // during leaving transitions
              var canMove = !removeOnly;
      
              {
                  checkDuplicateKeys(newCh); // 校验新vnode keys值
              }
              /**
           *
           *  diff 思想就是：
           *                1. 第一考虑： 不移动DOM
           *                2. 第二考虑： 移动DOM
           *                3. 第三考虑： 新建/删除 DOM
           *                4. 能不移动，尽量不移动；不行就移动，实在不行就新建
           *
           *  所以衍生了下面5种比较逻辑
           *                1. 旧头 ?= 新头 （++ newStartIdx， ++ oldStartIdx）
           *                2. 旧尾 ?= 新尾 （-- newEndIdx， -- oldEndIdx）
           *                3. 旧头 ?= 新尾 （++ oldStartIdx，-- newEndIdx）
           *                4. 旧尾 ?= 新头 （-- oldEndIdx，++ newStartIdx]）
           *                5. 单个查找 （将新节点拿到旧节点里面挨个对比）（++ newStartIdx）
           *
           */
              while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                  // TODO: 1. 首先判断老vnode 第一个节点是否存在
                  if (isUndef(oldStartVnode)) {
                      // 若不存在 则将第二个值给oldStartVnode
                      oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
                  }
      
                  // TODO: 2. 判断老vnode 最后一个节点是否存在
                  else if (isUndef(oldEndVnode)) {
                      // 若不存在 则将倒数第二个值给oldEndVnode
                      oldEndVnode = oldCh[--oldEndIdx];
                  }
      
                  // TODO：3. 判断老vnode第一个节点与新vnode第一个节点是否一致
                  // ************（“旧头” 与 “新头” 比较）************
                  else if (sameVnode(oldStartVnode, newStartVnode)) {
                      // 若一致 则调用patchVnode
                      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                      // 新头旧头比较到最后一层text节点后 让老子节点++当前 让新子节点++当前
                      oldStartVnode = oldCh[++oldStartIdx]; // ++ 比较旧vnode后一个vnode
                      newStartVnode = newCh[++newStartIdx]; // ++ 比较新vnode后一个vnode
                  }
      
                  // TODO: 4. 判断老vnode最后节点与新vnode最后节点是否一致
                  // ************（“旧尾” 与 “新尾” 比较）************
                  else if (sameVnode(oldEndVnode, newEndVnode)) {
                      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
                      oldEndVnode = oldCh[--oldEndIdx];
                      newEndVnode = newCh[--newEndIdx];
                  }
      
                  // TODO: 5. 判断老vnode第一个节点与新vnode最后节点是否一致
                  // ************（“旧头” 与 “新尾” 比较）************
                  else if (sameVnode(oldStartVnode, newEndVnode)) {
                      // Vnode moved right
                      // TODO：5.1 头移动到尾 右移
                      // 当旧头等于新尾时 表示需要将原dom的头节点移动到原dom的最尾部
                      // 因为原生并没有提供插入dom到某节点后面方法 所以只有使用insertBefore方法
                      // 这里很巧妙的使用了当前最后节点的下一个兄弟节点表示插入到它的前面处理
                      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
                      canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
                      oldStartVnode = oldCh[++oldStartIdx];
                      newEndVnode = newCh[--newEndIdx];
                  }
      
                  // TODO: 6. 判断老vnode最后节点与新vnode第一个节点是否一致
                  // ************（“旧尾” 与 “新头” 比较）************
                  else if (sameVnode(oldEndVnode, newStartVnode)) {
                      // Vnode moved left
                      // TODO：6.1 尾移动到头 左移动
                      // 当旧尾等于新头时 表示需要将原dom的尾节点移动到原dom的最头部
                      // 这里直接使用insertBefore方法即可
                      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                      canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                      oldEndVnode = oldCh[--oldEndIdx];
                      newStartVnode = newCh[++newStartIdx];
                  }
      
                  // TODO：7. 单个查找
                  else {
                      // TODO：7.1 动态生成以key值及顺序值 构成的key唯一对象 这里很巧妙 当前得olStartIdx&oldEndIdx已经经历了前面的遍历
                      // 所以这个时候 这两个值并不是初始化的最大值 因此创建处理的个数并不等于数组的个数
                      if (isUndef(oldKeyToIdx)) {
                          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                      }
      
                      // TODO: 7.2 拿新节点的key 到上面生成的旧key对象中查询
                      // 若存在 则返回当前在旧子级中的位置
                      // 若不存在 则执行findIdxInOld方法 遍历旧节点所有并与当前新节点比较 若找到相同值 则返回当前索引
                      idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
      
                      // TODO: 7.3 若既没有在旧key对象中找到 也没在旧节点中遍历找到 则认为 当前新节点为 纯新 需要 新建DOM
                      if (isUndef(idxInOld)) {
                          // New element
                          // 新的节点 -> 新建 -> 插入的位置默认在当前老节点的前面
                          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                      } 
      
                      // TODO: 7.4 若在旧节点中找到了
                      // 如果走key中找到 我们还没比较过sameVnode (遍历对比过 为了兼容这里再次作一次对比)
                      else {
                          vnodeToMove = oldCh[idxInOld];
                          // 若对比后 相同节点 则对比其子节点
                          if (sameVnode(vnodeToMove, newStartVnode)) {
                              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                              oldCh[idxInOld] = undefined;
                              // 当canMove为true时 才移动该旧节点到首位节点的前面 这块没看懂 可能与transition-group的特殊情况时
                              canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
                          } 
                          // 一样的key但是不同的元素 则处理成新的元素
                          else {
                              // same key but different element. treat as new element
                              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                          }
                      }
      
                      // 这步也很关键 当单个查找 结束后 新节点索引++
                      newStartVnode = newCh[++newStartIdx];
                  }
              }
      
              // TODO：8. 在updateChildren 中，比较完新旧两个数组之后，可能某个数组会剩下部分节点没有被处理过 
              // 处理剩下的节点
              // 比如新节点长度 < 旧节点 那么必然新节点先遍历完 则表示旧节点中需要删除多余节点
              // 比如新节点长度 > 旧节点 那么必然旧节点先遍历完 则表示旧节点中需要增加新节点中多余的节点
              if (oldStartIdx > oldEndIdx) {
                  // 这里还有个问题就是 当插入时 插入到哪个地方的处理 也就是下面的refElm定义
                  // refElm 获取的是 newEndIdx 后一位的节点,当前没有处理的节点是 newEndIdx
                  // 也就是说 newEndIdx+1 的节点如果存在的话，肯定被处理过了
                  // 如果 newEndIdx 没有移动过，一直是最后一位，那么就不存在 newCh[newEndIdx + 1]
                  // 那么 refElm 就是空，那么剩余的新节点 就全部添加进 父节点孩子的末尾
                  // 如果 newEndIdx 移动过，那么就逐个添加在 refElm 的前面x`
                  refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
                  addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
              }
      
              // TODO：9. 说明新节点比对完了，老节点可能还有，需要删除剩余的老节点
              // 而删除老节点位置 就是老节点的头到老节点的尾
              else if (newStartIdx > newEndIdx) {
                  removeVnodes(oldCh, oldStartIdx, oldEndIdx);
              }
          }
      
          function checkDuplicateKeys(children) {
              // TODO：这里针对当前组件下有使用key的vNode进行 key值是否唯一判断
              var seenKeys = {};
              for (var i = 0; i < children.length; i++) {
                  var vnode = children[i];
                  var key = vnode.key;
                  // 是否有key
                  if (isDef(key)) {
                      // 当前key值 是否有对应的value值 为true
                      // 若有则表示当前key已被之前使用了 抛出异常 这个是我们经常会遇到的
                      if (seenKeys[key]) {
                          warn("Duplicate keys detected: '" + key + "'. This may cause an update error.", vnode.context);
                      } else {
                          // 当前key值没找到 则置为true
                          seenKeys[key] = true;
                      }
                  }
              }
          }
      
          function findIdxInOld(node, oldCh, start, end) {
              for (var i = start; i < end; i++) {
                  var c = oldCh[i];
                  if (isDef(c) && sameVnode(node, c)) {
                      return i;
                  }
              }
          }
      
          // 比较两个Vnode 的子节点
          function patchVnode(oldVnode, vnode, insertedVnodeQueue, ownerArray, index, removeOnly) {
              // TODO：若新老vnode没的变化 完全一样 则退出
              if (oldVnode === vnode) {
                  return;
              }
      
              if (isDef(vnode.elm) && isDef(ownerArray)) {
                  // clone reused vnode
                  vnode = ownerArray[index] = cloneVNode(vnode);
              }
              // 将老的真实dom赋值给新的
              var elm = (vnode.elm = oldVnode.elm);
      
              if (isTrue(oldVnode.isAsyncPlaceholder)) {
                  if (isDef(vnode.asyncFactory.resolved)) {
                      hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
                  } else {
                      vnode.isAsyncPlaceholder = true;
                  }
                  return;
              }
      
              // reuse element for static trees.
              // note we only do this if the vnode is cloned -
              // if the new node is not cloned it means the render functions have been
              // reset by the hot-reload-api and we need to do a proper re-render.
              if (isTrue(vnode.isStatic) && isTrue(oldVnode.isStatic) && vnode.key === oldVnode.key && (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
                  vnode.componentInstance = oldVnode.componentInstance;
                  return;
              }
      
              // 这里是对比当当前vnode是一个组件时 首先data里面自带了hook
              // destroy
              // init
              // insert
              // prepatch
              var i;
              var data = vnode.data;
              if (isDef(data) && isDef((i = data.hook)) && isDef((i = i.prepatch))) {
                  // 判断是否存在data -> 是否存在hook并赋值给i -> 是否存在hook.prepatch且赋值给i
                  // 到最后 i赋值尾hook.prepatch(oldVnode, vnode)
                  // 跳到源码3129 行
                  i(oldVnode, vnode);
              }
      
              // 拿出老vnode的子级
              var oldCh = oldVnode.children;
              // 拿出新vnode的子级
              var ch = vnode.children;
              if (isDef(data) && isPatchable(vnode)) {
                  for (i = 0; i < cbs.update.length; ++i) {
                      // 这个地方是根据新老vnode 分别更新
                      // 1. updateAttrs
                      // 2. updateClass
                      // 3. updateDOMListeners
                      // 4. updateDOMProps
                      // 5. updateStyle
                      // 6. update
                      // 7. updateDirectives
                      cbs.update[i](oldVnode, vnode);
                  }
                  if (isDef((i = data.hook)) && isDef((i = i.update))) {
                      i(oldVnode, vnode);
                  }
              }
              // TODO: 1. 判断是否存在text文本节点（意思就是是否到最底层节点）
              if (isUndef(vnode.text)) {
                  // TODO: 1.1 是否同时存在新子节点和老子节点 且还不一样 则对比子级
                  if (isDef(oldCh) && isDef(ch)) {
                      if (oldCh !== ch) {
                          // TODO: 1.1.1 这里很关键了 当判断出老vnode子级跟新vnode子级不一样时 执行
                          // 更新子级操作 diff算法关键来了
                          updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
                      }
                  } else if (isDef(ch)) {
                      // TODO：1.2 若只存在新子节点 不存在老子节点 则再检查下key值是否异常
                      {
                          checkDuplicateKeys(ch);
                      }
                      if (isDef(oldVnode.text)) {
                          // 新子节点不存在 则重置老子节点文本
                          nodeOps.setTextContent(elm, '');
                      }
                      // TODO：1.2.1 则当前的新子节点 全部重建新dom
                      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
                  } else if (isDef(oldCh)) {
                      // TODO: 若只存在老子节点 则老子节点全部删除
                      removeVnodes(oldCh, 0, oldCh.length - 1);
                  } else if (isDef(oldVnode.text)) {
                      nodeOps.setTextContent(elm, '');
                  }
              } else if (oldVnode.text !== vnode.text) {
                  // TODO：2. 若存在 则判断新老文本节点是否一样 不一样就更新dom的文本内容
                  nodeOps.setTextContent(elm, vnode.text);
              }
              if (isDef(data)) {
                  if (isDef((i = data.hook)) && isDef((i = i.postpatch))) {
                      i(oldVnode, vnode);
                  }
              }
          }
      
          function invokeInsertHook(vnode, queue, initial) {
              // delay insert hooks for component root nodes, invoke them after the
              // element is really inserted
              if (isTrue(initial) && isDef(vnode.parent)) {
                  vnode.parent.data.pendingInsert = queue;
              } else {
                  for (var i = 0; i < queue.length; ++i) {
                      queue[i].data.hook.insert(queue[i]);
                  }
              }
          }
      
          var hydrationBailed = false;
          // list of modules that can skip create hook during hydration because they
          // are already rendered on the client or has no need for initialization
          // Note: style is excluded because it relies on initial clone for future
          // deep updates (#7063).
          var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');
      
          // Note: this is a browser-only function so we can assume elms are DOM nodes.
          function hydrate(elm, vnode, insertedVnodeQueue, inVPre) {
              var i;
              var tag = vnode.tag;
              var data = vnode.data;
              var children = vnode.children;
              inVPre = inVPre || (data && data.pre);
              vnode.elm = elm;
      
              if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
                  vnode.isAsyncPlaceholder = true;
                  return true;
              }
              // assert node match
              {
                  if (!assertNodeMatch(elm, vnode, inVPre)) {
                      return false;
                  }
              }
              if (isDef(data)) {
                  if (isDef((i = data.hook)) && isDef((i = i.init))) {
                      i(vnode, true /* hydrating */);
                  }
                  if (isDef((i = vnode.componentInstance))) {
                      // child component. it should have hydrated its own tree.
                      initComponent(vnode, insertedVnodeQueue);
                      return true;
                  }
              }
              if (isDef(tag)) {
                  if (isDef(children)) {
                      // empty element, allow client to pick up and populate children
                      if (!elm.hasChildNodes()) {
                          createChildren(vnode, children, insertedVnodeQueue);
                      } else {
                          // v-html and domProps: innerHTML
                          if (isDef((i = data)) && isDef((i = i.domProps)) && isDef((i = i.innerHTML))) {
                              if (i !== elm.innerHTML) {
                                  /* istanbul ignore if */
                                  if (typeof console !== 'undefined' && !hydrationBailed) {
                                      hydrationBailed = true;
                                      console.warn('Parent: ', elm);
                                      console.warn('server innerHTML: ', i);
                                      console.warn('client innerHTML: ', elm.innerHTML);
                                  }
                                  return false;
                              }
                          } else {
                              // iterate and compare children lists
                              var childrenMatch = true;
                              var childNode = elm.firstChild;
                              for (var i$1 = 0; i$1 < children.length; i$1++) {
                                  if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                                      childrenMatch = false;
                                      break;
                                  }
                                  childNode = childNode.nextSibling;
                              }
                              // if childNode is not null, it means the actual childNodes list is
                              // longer than the virtual children list.
                              if (!childrenMatch || childNode) {
                                  /* istanbul ignore if */
                                  if (typeof console !== 'undefined' && !hydrationBailed) {
                                      hydrationBailed = true;
                                      console.warn('Parent: ', elm);
                                      console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                                  }
                                  return false;
                              }
                          }
                      }
                  }
                  if (isDef(data)) {
                      var fullInvoke = false;
                      for (var key in data) {
                          if (!isRenderedModule(key)) {
                              fullInvoke = true;
                              invokeCreateHooks(vnode, insertedVnodeQueue);
                              break;
                          }
                      }
                      if (!fullInvoke && data['class']) {
                          // ensure collecting deps for deep class bindings for future updates
                          traverse(data['class']);
                      }
                  }
              } else if (elm.data !== vnode.text) {
                  elm.data = vnode.text;
              }
              return true;
          }
      
          function assertNodeMatch(node, vnode, inVPre) {
              if (isDef(vnode.tag)) {
                  return vnode.tag.indexOf('vue-component') === 0 || (!isUnknownElement$$1(vnode, inVPre) && vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase()));
              } else {
                  return node.nodeType === (vnode.isComment ? 8 : 3);
              }
          }
      
          return function patch(oldVnode, vnode, hydrating, removeOnly) {
              // TODO：判断是否不存在新的vnode
              if (isUndef(vnode)) {
                  if (isDef(oldVnode)) {
                      // 是否存在旧的vnode - oldVnode
                      invokeDestroyHook(oldVnode); // 有旧无新 则走destroy钩子
                  }
                  return;
              }
      
              var isInitialPatch = false;
              var insertedVnodeQueue = [];
              // 是否不存在旧的vnode
              if (isUndef(oldVnode)) {
                  // empty mount (likely as component), create new root element
                  isInitialPatch = true;
                  createElm(vnode, insertedVnodeQueue);
              } else {
                  // 判断是否为一个node节点
                  var isRealElement = isDef(oldVnode.nodeType);
                  // 当数据变化时 oldVnode除第一次外肯定不是一个真实的dom元素
                  if (!isRealElement && sameVnode(oldVnode, vnode)) {
                      // patch existing root node
                      patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
                  } else {
                      if (isRealElement) {
                          // mounting to a real element
                          // check if this is server-rendered content and if we can perform
                          // a successful hydration.
                          // 这部分 主要判断是否是SSR
                          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                              oldVnode.removeAttribute(SSR_ATTR);
                              hydrating = true;
                          }
                          if (isTrue(hydrating)) {
                              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                                  invokeInsertHook(vnode, insertedVnodeQueue, true);
                                  return oldVnode;
                              } else {
                                  warn(
                                      'The client-side rendered virtual DOM tree is not matching ' +
                                      'server-rendered content. This is likely caused by incorrect ' +
                                      'HTML markup, for example nesting block-level elements inside ' +
                                      '<p>, or missing <tbody>. Bailing hydration and performing ' +
                                      'full client-side render.'
                                  );
                              }
                          }
                          // either not server-rendered, or hydration failed.
                          // create an empty node and replace it
      
                          // TODO：当第一次渲染得时候 oldVnode 指向<div id="app"></div>真实dom
                          // 需要转换为虚拟vNode结构数据
                          oldVnode = emptyNodeAt(oldVnode);
                      }
      
                      // replacing existing element
                      var oldElm = oldVnode.elm; // 真实根dom赋值
                      var parentElm = nodeOps.parentNode(oldElm); // 操作真实dom 找到body
      
                      // create new node
                      createElm(
                          vnode,
                          insertedVnodeQueue,
                          // extremely rare edge case: do not insert if old element is in a
                          // leaving transition. Only happens when combining transition +
                          // keep-alive + HOCs. (#4590)
                          oldElm._leaveCb ? null : parentElm,
                          nodeOps.nextSibling(oldElm)
                      );
      
                      // update parent placeholder node element, recursively
                      if (isDef(vnode.parent)) {
                          var ancestor = vnode.parent;
                          var patchable = isPatchable(vnode);
                          while (ancestor) {
                              for (var i = 0; i < cbs.destroy.length; ++i) {
                                  cbs.destroy[i](ancestor);
                              }
                              ancestor.elm = vnode.elm;
                              if (patchable) {
                                  for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                                      cbs.create[i$1](emptyNode, ancestor);
                                  }
                                  // #6513
                                  // invoke insert hooks that may have been merged by create hooks.
                                  // e.g. for directives that uses the "inserted" hook.
                                  var insert = ancestor.data.hook.insert;
                                  if (insert.merged) {
                                      // start at index 1 to avoid re-invoking component mounted hook
                                      for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                                          insert.fns[i$2]();
                                      }
                                  }
                              } else {
                                  registerRef(ancestor);
                              }
                              ancestor = ancestor.parent;
                          }
                      }
      
                      // destroy old node
                      if (isDef(parentElm)) {
                          removeVnodes([oldVnode], 0, 0);
                      } else if (isDef(oldVnode.tag)) {
                          invokeDestroyHook(oldVnode);
                      }
                  }
              }
      
              invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
              return vnode.elm;
          };
      }
      ```

      ```js
      // 2.1 判断是否为同一个vnode 源码 5810行
      function sameVnode(a, b) {
          return (
              a.key === b.key &&
              ((a.tag === b.tag && a.isComment === b.isComment && isDef(a.data) === isDef(b.data) && sameInputType(a, b)) ||
               (isTrue(a.isAsyncPlaceholder) && a.asyncFactory === b.asyncFactory && isUndef(b.asyncFactory.error)))
          );
      }
      // 源码 5827行
      function sameInputType(a, b) {
          if (a.tag !== 'input') {
              return true;
          }
          var i;
          var typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type;
          var typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type;
          return typeA === typeB || (isTextInputType(typeA) && isTextInputType(typeB));
      }
      ```

      ```js
      // 3. patchVnode函数中 对比两个新老节点时 会进行一系列update操作
      // 因为我们在updateChildren中只是去操作了dom的新建 删除 移动
      // 但是每个dom上面的属性呀 事件这些都没有去操作复用 所以额外执行一系列的update操作
      
      // 3.1 更新属性
      function updateAttrs(oldVnode, vnode) {
          var opts = vnode.componentOptions;
          if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
              return;
          }
          // 如果新老节点都没得attrs 就返回 不用比较了
          if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
              return;
          }
          var key, cur, old;
          var elm = vnode.elm;
          var oldAttrs = oldVnode.data.attrs || {};
          var attrs = vnode.data.attrs || {};
          // clone observed objects, as the user probably wants to mutate it
          if (isDef(attrs.__ob__)) {
              attrs = vnode.data.attrs = extend({}, attrs);
          }
      
          for (key in attrs) {
              cur = attrs[key];
              old = oldAttrs[key];
              if (old !== cur) {
                  setAttr(elm, key, cur);
              }
          }
          // #4391: in IE9, setting type can reset value for input[type=radio]
          // #6666: IE/Edge forces progress value down to 1 before setting a max
          /* istanbul ignore if */
          if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
              setAttr(elm, 'value', attrs.value);
          }
          for (key in oldAttrs) {
              if (isUndef(attrs[key])) {
                  if (isXlink(key)) {
                      elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
                  } else if (!isEnumeratedAttr(key)) {
                      elm.removeAttribute(key);
                  }
              }
          }
      }
      
      // 3.2 更新css类
      function updateClass(oldVnode, vnode) {
          var el = vnode.elm;
          var data = vnode.data;
          var oldData = oldVnode.data;
          if (isUndef(data.staticClass) && isUndef(data.class) && (isUndef(oldData) || (isUndef(oldData.staticClass) && isUndef(oldData.class)))) {
              return;
          }
      
          var cls = genClassForVnode(vnode);
      
          // handle transition classes
          var transitionClass = el._transitionClasses;
          if (isDef(transitionClass)) {
              cls = concat(cls, stringifyClass(transitionClass));
          }
      
          // set the class
          if (cls !== el._prevClass) {
              el.setAttribute('class', cls);
              el._prevClass = cls;
          }
      }
      
      // 3.3 更新dom事件监听
      function updateDOMListeners(oldVnode, vnode) {
          // 若新老均没有事件绑定 则返回
          if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
              return;
          }
          var on = vnode.data.on || {};
          var oldOn = oldVnode.data.on || {};
          target$1 = vnode.elm;
          normalizeEvents(on);
          updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
          target$1 = undefined;
      }
      // 3.3.1
      // normalize v-model event tokens that can only be determined at runtime.
      // it's important to place the event as the first in the array because
      // the whole point is ensuring the v-model callback gets called before
      // user-attached handlers.
      function normalizeEvents(on) {
          /* istanbul ignore if */
          if (isDef(on[RANGE_TOKEN])) {
              // IE input[type=range] only supports `change` event
              var event = isIE ? 'change' : 'input';
              on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
              delete on[RANGE_TOKEN];
          }
          // This was originally intended to fix #4521 but no longer necessary
          // after 2.5. Keeping it for backwards compat with generated code from < 2.4
          /* istanbul ignore if */
          if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
              on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
              delete on[CHECKBOX_RADIO_TOKEN];
          }
      }
      // 3.3.2
      function updateListeners(on, oldOn, add, remove$$1, createOnceHandler, vm) {
          var name, def$$1, cur, old, event;
          for (name in on) {
              def$$1 = cur = on[name];
              old = oldOn[name];
              event = normalizeEvent(name);
              if (isUndef(cur)) {
                  warn('Invalid handler for event "' + event.name + '": got ' + String(cur), vm);
              } else if (isUndef(old)) {
                  if (isUndef(cur.fns)) {
                      cur = on[name] = createFnInvoker(cur, vm);
                  }
                  if (isTrue(event.once)) {
                      cur = on[name] = createOnceHandler(event.name, cur, event.capture);
                  }
                  add(event.name, cur, event.capture, event.passive, event.params);
              } else if (cur !== old) {
                  old.fns = cur;
                  on[name] = old;
              }
          }
          for (name in oldOn) {
              if (isUndef(on[name])) {
                  event = normalizeEvent(name);
                  remove$$1(event.name, oldOn[name], event.capture);
              }
          }
      }
      
      // 3.4 更新dom Props
      function updateDOMProps(oldVnode, vnode) {
          if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
              return;
          }
          var key, cur;
          var elm = vnode.elm;
          var oldProps = oldVnode.data.domProps || {};
          var props = vnode.data.domProps || {};
          // clone observed objects, as the user probably wants to mutate it
          if (isDef(props.__ob__)) {
              props = vnode.data.domProps = extend({}, props);
          }
      
          for (key in oldProps) {
              if (!(key in props)) {
                  elm[key] = '';
              }
          }
      
          for (key in props) {
              cur = props[key];
              // ignore children if the node has textContent or innerHTML,
              // as these will throw away existing DOM nodes and cause removal errors
              // on subsequent patches (#3360)
              if (key === 'textContent' || key === 'innerHTML') {
                  if (vnode.children) {
                      vnode.children.length = 0;
                  }
                  if (cur === oldProps[key]) {
                      continue;
                  }
                  // #6601 work around Chrome version <= 55 bug where single textNode
                  // replaced by innerHTML/textContent retains its parentNode property
                  if (elm.childNodes.length === 1) {
                      elm.removeChild(elm.childNodes[0]);
                  }
              }
      
              if (key === 'value' && elm.tagName !== 'PROGRESS') {
                  // store value as _value as well since
                  // non-string values will be stringified
                  elm._value = cur;
                  // avoid resetting cursor position when value is the same
                  var strCur = isUndef(cur) ? '' : String(cur);
                  if (shouldUpdateValue(elm, strCur)) {
                      elm.value = strCur;
                  }
              } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
                  // IE doesn't support innerHTML for SVG elements
                  svgContainer = svgContainer || document.createElement('div');
                  svgContainer.innerHTML = '<svg>' + cur + '</svg>';
                  var svg = svgContainer.firstChild;
                  while (elm.firstChild) {
                      elm.removeChild(elm.firstChild);
                  }
                  while (svg.firstChild) {
                      elm.appendChild(svg.firstChild);
                  }
              } else if (
                  // skip the update if old and new VDOM state is the same.
                  // `value` is handled separately because the DOM value may be temporarily
                  // out of sync with VDOM state due to focus, composition and modifiers.
                  // This  #4521 by skipping the unnecesarry `checked` update.
                  cur !== oldProps[key]
              ) {
                  // some property updates can throw
                  // e.g. `value` on <progress> w/ non-finite value
                  try {
                      elm[key] = cur;
                  } catch (e) {}
              }
          }
      }
      
      // 3.5 更新style
      function updateStyle(oldVnode, vnode) {
          var data = vnode.data;
          var oldData = oldVnode.data;
      
          if (isUndef(data.staticStyle) && isUndef(data.style) && isUndef(oldData.staticStyle) && isUndef(oldData.style)) {
              return;
          }
      
          var cur, name;
          var el = vnode.elm;
          var oldStaticStyle = oldData.staticStyle;
          var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};
      
          // if static style exists, stylebinding already merged into it when doing normalizeStyleData
          var oldStyle = oldStaticStyle || oldStyleBinding;
      
          var style = normalizeStyleBinding(vnode.data.style) || {};
      
          // store normalized style under a different key for next diff
          // make sure to clone it if it's reactive, since the user likely wants
          // to mutate it.
          vnode.data.normalizedStyle = isDef(style.__ob__) ? extend({}, style) : style;
      
          var newStyle = getStyle(vnode, true);
      
          for (name in oldStyle) {
              if (isUndef(newStyle[name])) {
                  setProp(el, name, '');
              }
          }
          for (name in newStyle) {
              cur = newStyle[name];
              if (cur !== oldStyle[name]) {
                  // ie9 setting to null has no effect, must use empty string
                  setProp(el, name, cur == null ? '' : cur);
              }
          }
      }
      
      // 3.6 更新ref
      var ref = {
          create: function create(_, vnode) {
              registerRef(vnode);
          },
          update: function update(oldVnode, vnode) {
              // 当新老ref 不一致 需要注册且更新ref
              if (oldVnode.data.ref !== vnode.data.ref) {
                  registerRef(oldVnode, true);
                  registerRef(vnode);
              }
          },
          destroy: function destroy(vnode) {
              registerRef(vnode, true);
          },
      };
      // 3.6.1 注册ref
      function registerRef(vnode, isRemoval) {
          var key = vnode.data.ref;
          if (!isDef(key)) {
              return;
          }
      
          var vm = vnode.context;
          var ref = vnode.componentInstance || vnode.elm;
          var refs = vm.$refs;
          if (isRemoval) {
              if (Array.isArray(refs[key])) {
                  remove(refs[key], ref);
              } else if (refs[key] === ref) {
                  refs[key] = undefined;
              }
          } else {
              if (vnode.data.refInFor) {
                  if (!Array.isArray(refs[key])) {
                      refs[key] = [ref];
                  } else if (refs[key].indexOf(ref) < 0) {
                      // $flow-disable-line
                      refs[key].push(ref);
                  }
              } else {
                  refs[key] = ref;
              }
          }
      }
      
      // 3.7 更新指令
      function updateDirectives(oldVnode, vnode) {
          if (oldVnode.data.directives || vnode.data.directives) {
              _update(oldVnode, vnode);
          }
      }
      // 3.7.1 内部更新指令逻辑
      function _update(oldVnode, vnode) {
          var isCreate = oldVnode === emptyNode;
          var isDestroy = vnode === emptyNode;
          var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
          var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);
      
          var dirsWithInsert = [];
          var dirsWithPostpatch = [];
      
          var key, oldDir, dir;
          for (key in newDirs) {
              oldDir = oldDirs[key];
              dir = newDirs[key];
              if (!oldDir) {
                  // new directive, bind
                  callHook$1(dir, 'bind', vnode, oldVnode);
                  if (dir.def && dir.def.inserted) {
                      dirsWithInsert.push(dir);
                  }
              } else {
                  // existing directive, update
                  dir.oldValue = oldDir.value;
                  dir.oldArg = oldDir.arg;
                  callHook$1(dir, 'update', vnode, oldVnode);
                  if (dir.def && dir.def.componentUpdated) {
                      dirsWithPostpatch.push(dir);
                  }
              }
          }
      
          if (dirsWithInsert.length) {
              var callInsert = function () {
                  for (var i = 0; i < dirsWithInsert.length; i++) {
                      callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
                  }
              };
              if (isCreate) {
                  mergeVNodeHook(vnode, 'insert', callInsert);
              } else {
                  callInsert();
              }
          }
      
          if (dirsWithPostpatch.length) {
              mergeVNodeHook(vnode, 'postpatch', function () {
                  for (var i = 0; i < dirsWithPostpatch.length; i++) {
                      callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
                  }
              });
          }
      
          if (!isCreate) {
              for (key in oldDirs) {
                  if (!newDirs[key]) {
                      // no longer present, unbind
                      callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
                  }
              }
          }
      }
      ```

      ```js
      // 4. diff中 根据key生成类map格式数据（其实就是以key值为k 然后遍历顺序index为v）
      // 如 key:'i am key 1' key:'i am key2' 
      // {'i am key 1':1,'i am key2':2}
      // 所以这里看出来了 在某些式子中key值唯一性的重要性 就是为了diff比较
      function createKeyToOldIdx(children, beginIdx, endIdx) {
          var i, key;
          var map = {};
          for (i = beginIdx; i <= endIdx; ++i) {
              key = children[i].key;
              if (isDef(key)) {
                  map[key] = i;
              }
          }
          return map;
      }
      ```

      

### 2021.01.27-vnode虚拟dom

   1. **如何理解vue中的vnode虚拟dom?**

      ```js
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
            _v(' '), // 没整懂 为啥每个中间都夹杂个空VNode（在编译阶段时 遇到同级兄弟节点 会默认生成一个空文节点）
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
      ```

      



### 2021.01.26-vue2.x中的编译

1. **如何理解vue2.x中的编译?**

   拿到html模板字符串 -> 进行一系列的正则截取字符串并根据当前属性来构造children类型 -> 每个标签同级变换时都会额外的构造一个空的文本节点 -> 生成以with包裹的函数处理匿名函数

   
   
   在19号那天我们分析了如何作响应式数据，继续下去如何编译?在平常的开始中我们一般在mouted生命钩子函数里面作业务逻辑处理，是因为在mouted钩子回调时当前页面下我们已完成模板的绑定页面dom已根据vue完全生成真实dom
   
   ```js
   源码9039行
   // 1.1 最初始定义$mount
   Vue.prototype.$mount = function (el, hydrating) {
     el = el && inBrowser ? query(el) : undefined;
     return mountComponent(this, el, hydrating);
   };
   
   源码11877行
   // 1.2 将初始化定义赋值给全局变量mount 且覆盖之前声明
   var mount = Vue.prototype.$mount;
   
   源码11878行
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
   
   ```
   
   ```js
   源码4018行
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
   ```
   
   ```js
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
         // TODO: 0127 终于找到了如何将字符串函数转变成可执行函数 在之前通过ast转换为字符串函数是说在后面咋个执行的 结果是在这里给render转换为可执行函数
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
   function createFunction (code, errors) {
     try {
       return new Function(code)
     } catch (err) {
       errors.push({ err: err, code: code });
       return noop
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
   ```
   
   总结来说（调用$mouted时）：
   
   **拿到template字符串** --------->
   
   ​	**parse解析为AST抽象树结构**(针对v-for v-once v-if等等template上面的指令分别解析，**通过多种正则来匹配 默认去掉注释**) -------->
   
   ```js
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
   ```
   
   ​		**再用解析的ast去生成代码字符串使用with包裹并挂载到render方法上**（针对v-for v-if component分别递归生成）**最重要的就是通过new Function来将with语句及后面的字符串转换为可执行函数**
   
   ```js
   with(this){ 
       return 
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
   }
   ```
   
   ```js
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
     } else if (modifiers.middle) { // TODO: 鼠标滚动中间事件修饰
       if (dynamic) {
         name = '(' + name + ")==='click'?'mouseup':(" + name + ')';
       } else if (name === 'click') {
         name = 'mouseup';
       }
     }
   
     // check capture modifier
     if (modifiers.capture) { // TODO：处理事件捕获修饰
       delete modifiers.capture;
       name = prependModifierMarker('!', name, dynamic);
     }
     if (modifiers.once) { // TODO: 处理绑定一次修饰符
       delete modifiers.once;
       name = prependModifierMarker('~', name, dynamic);
     }
     /* istanbul ignore if */
     if (modifiers.passive) { // TODO: 一般配合滚动使用
       delete modifiers.passive;
       name = prependModifierMarker('&', name, dynamic);
     }
   
     var events;
     if (modifiers.native) { // TODO：绑定监听原生事件 
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
   ```
   
   

### 2021.01.19-响应式数据

1. **如何理解vue2.x中的响应式数据？**

   要讲响应式我们只有从data上入手 先本地起一个简易vue

   ```vue
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Document</title>
     <style>
       #app span{
         color:red;
       }
     </style>
   </head>
   <body>
     <div id="app">
       <span>我是data数据{{message}}</span>
       <!-- <span>我是data数据{{list.name}}</span> -->
       <!-- <base-show /> -->
       <!-- <span>我是一模一样的data数据{{message}}</span> -->
       <p>我是数据依赖message{{`${message}依赖数据`}}</p>
     </div>
   </body>
   <script src="./vue.dist.js"></script>
   <script>
     const vm = new Vue({
       data:{
         message:'test',
       },
       // computed:{
       //   getDep(){
       //     return this.message + '依赖数据'
       //   }
       // }
     })
     // 改变data值测试
     setTimeout(function(){
       vm.message = '2秒后变值'
     },2000)
     // 注册组件测试
     // Vue.component('base-show',{
     //   name:'baseShow',
     //   template:`<h3>{{myMessage}}</h3>`,
     //   data(){
     //     return {
     //       myMessage:'我是baseShow组件'
     //     }
     //   }
     // })
     vm.$mount('#app')
   </script>
   </html>
   ```

   ```js
   源码4998行 生命周期钩子第一个“beforeCreate”
   源码5000行 执行initState(vm) 说明在beforeCreate钩子里面时拿不到被处理过的data
   源码4635行 按顺序处理props -> methods -> data -> computed -> watch
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
   ```

   ```js
   源码4699行 初始化data数据 其实此时这个时候的data已被处理
   源码4983行 mergeOptions 把非组件类属性进行进一步处理
   data = function mergedInstanceDataFn () {
       // instance merge
       var instanceData = typeof childVal === 'function'
       ? childVal.call(vm, vm)
       : childVal;
       var defaultData = typeof parentVal === 'function'
       ? parentVal.call(vm, vm)
       : parentVal;
       if (instanceData) {
           return mergeData(instanceData, defaultData)
       } else {
           return defaultData
       }
   }
   // 0.1 初始化data
   function initData(vm) {
       var data = vm.$options.data;
       // TODO: 这里来一个判断 根结点data可以是一个对象
       // 而子组件data为函数 而且调用了全局getData 入参data及vue实例 来看0.1.5 getData意义
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
   // 0.1.5 获取data
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
   源码4738行 执行observe(data,true) 此时这个data为根结点数据 添加为响应 见下面
   ```

   ```js
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
           // TODO: 为值创建响应式  这个很关键
           ob = new Observer(value);
       }
       if (asRootData && ob) {
           ob.vmCount++;
       }
       return ob;
   }
   var Observer = function Observer(value) {
     this.value = value;
     // TODO：new 一个收集者
     this.dep = new Dep();
     this.vmCount = 0;
     // TODO: 定义value里面的__ob__绑定一个监测类实例 但是不能枚举出来 隐式属性
     def(value, '__ob__', this);
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
       this.walk(value);
     }
   };
   //  给value定义一个隐藏属性__ob__ 值为监测类实例
   function def(obj, key, val, enumerable) {
     Object.defineProperty(obj, key, {
       value: val,
       enumerable: !!enumerable,
       writable: true,
       configurable: true,
     });
   }
   // Observer原型上walk方法
   Observer.prototype.walk = function walk(obj) {
     var keys = Object.keys(obj);
     for (var i = 0; i < keys.length; i++) {
         // 定义每个属性的响应式
       defineReactive$$1(obj, keys[i]);
     }
   };
   // 对一个对象 定义一系列响应式属性
   function defineReactive$$1(obj, key, val, customSetter, shallow) {
     // TODO: 这里new一个收集者
     var dep = new Dep();
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
           // 在访问该属性时 这里有闭包的特性 此时的val还是之前的值 包括dep也是第一次初始化的对象
         var value = getter ? getter.call(obj) : val;
         if (Dep.target) {
             // 收集依赖
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
           // 通知 发布-订阅模式 关键-》发布
         dep.notify();
       },
     });
   }
   ```

   ```js
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
   ```

   

   ```js
   依赖收集中间站(发布者)
   var uid = 0;
   /**
    * A dep is an observable that can have multiple
    * directives subscribing to it.
    */
   // TODO: 声明全局Dep构造函数也就是全局对象 （发布者）
   var Dep = function Dep() {
     this.id = uid++;
     // TODO： 构造函数上挂载subs属性为数组集合 里面存的是每个订阅者也就是watcher
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
         // 关键的步骤 执行订阅者的update 
       subs[i].update();
     }
   };
   ```

   ```js
   （观察者&订阅者）
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
   
   ```

   ```js
   watcher队列处理
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
   ```

   以上就是vue响应式核心部分（设计模式：**发布-订阅模式**）

    1. data（作一层proxy代理访问_data）

    2. observe（为data主动构建监测数据）

    3. new Observer() （主动绑定`__ob__`属性 调用walk方法 ）

    4. 遍历每个Object对象 （为对象属性进行defineReactive$$1方法）

    5. Object.defineProperty （每个属性生成一次收集者且会判断是否多层对象嵌套再次调用b步骤直到每个属性均可响应式；定义属性get（利用函数闭包特性 **收集当前依赖项**）定义属性set（判断值是否完全变化，且给新值再次添加b步骤响应式属性 最后**发布依赖**））

    6. 手动调用挂载方法vm.$mount('#app') （执行mountComponent方法->触发beforeMount钩子函数->生成updateComponent方法->`vm._update(vm._render(),hydrating)` ）

    7. 创建观察者Watcher（加入brefore->钩子回调触发beforeUpdate钩子函数->绑定getter方法为updateComponent方法）

    8. 触发Watcher get方法（pushTarget置全局依赖标识Dep.target为当前watcher实例）

    9. 调用步骤g中的getter方法（就是调用`vm._update(vm._render(),hydrating)`）

       ////////// **次部分代码涉及关于VNode等渲染问题 是另一个值得研究的问题**

    10. 调用vm._render() （其实就是执行以with包括的方法体）

    11. 调用vm._update()

    12. 触发拿值属性步骤e中的get （收集依赖）

    13. 虚拟dom到真实dom渲染完毕

        //////////

    14. 调用popTarget （置当前全局依赖标识Dep.target为undefined）

    15. 调用当前观察者watcher清除依赖方法（将newDepIds、newDeps赋值给depIds、deps后再置为空以便接收下一次更新）

    16. 触发生命周期钩子“mounted”

        <img src="https://i.loli.net/2021/01/19/OeXjnh4iH5AS93g.png" alt="1.png"  />

   2.**说说在什么时候使用vm.$set和Vue.set？Vue.observable？**

   ​	a.  在第一个问题中 我们了解了vue是如何给data数据构造成响应式数据的，它都是在初始化的时候就做了每个对象中的每个属性变为响应式 所以当我们后面在代码里面手动给data数据添加新的属性时 会发现该属性并不是响应式数据 所以vue提供vm.$set(target,key,val)来使我们后面添加的数据变为响应式不过也可以作用在之前已变为响应式数据的修改

   ​	b. 其实在源码中vm.$set和Vue.set都绑定的同一个函数

   ```js
    /**
      * Set a property on an object. Adds the new property and
      * triggers change notification if the property doesn't
      * already exist.
      */
   function set (target, key, val) {
       // TODO: 判断target是否为undefined或者必须为Array&Object数据结构
       if (isUndef(target) || isPrimitive(target)
          ) {
           warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
       }
       // TODO: 若target为数组
       if (Array.isArray(target) && isValidArrayIndex(key)) {
           target.length = Math.max(target.length, key);
           target.splice(key, 1, val);
           return val
       }
       // TODO: 若target为Object 并且当前Key值是存在的 等于说就是修改的初始化已作了响应式的属性
       if (key in target && !(key in Object.prototype)) {
           // TOOD: 一旦改变 必然触发该属性的set方法 -> 通知依赖中间 -> update... 就是那套逻辑
           target[key] = val;
           return val
       }
       var ob = (target).__ob__;
       // TOOD: 根结点不允许修改
       if (target._isVue || (ob && ob.vmCount)) {
           warn(
               'Avoid adding reactive properties to a Vue instance or its root $data ' +
               'at runtime - declare it upfront in the data option.'
           );
           return val
       }
       // TODO： 若ob不存在 则直接改变 这里不太明白 什么情况下ob会不存在
       if (!ob) {
           target[key] = val;
           return val
       }
       // TODO: 只剩最后一种情况 就是我们新增的属性 那么重新给当前key，val作一次响应式处理
       defineReactive$$1(ob.value, key, val);
       // TODO: 执行当前发布者通知
       ob.dep.notify();
       return val
   }
   ```

   c.	Vue.observable(obj)其实内部执行的是observe()函数使一个对象变为可响应式但是不会触发其他东西 仅仅是让该对象变为响应式 

### 2021.01.12-静态资源

1. **vue中如何图片等静态资源如何引入代码中？如何解决打包后部署js,css文件404？静态资源图片路径找不到？publicPath设置原理？**

   ① 静态资源如何引入代码中（分为src/assets & public）

   首先说说这两个文件夹区别：当放在public中时是不经过webpack打包编译 原样输出到dist里面 而src/assets中会经过webpack处理比如base64等等

   ```vue
   <template>
     <div id="app">
       <strong>均在src下assets文件操作图片</strong>
       <h4>1.第一种方式：html里面--assets下面的相对路径-直接赋值src</h4>
       <img alt="Vue logo" src="./assets/logo.png" />
   
       <h4>2.第二种方式（错误）：html里面-v-bind-data里面变量值为url string类型-assets下面的相对路径</h4>
       <img alt="Vue logo" :src="img" />
   
       <h4>3.第二种方式改版1（正确）：html里面-v-bind-data里面变量值为require(url)-assets下面的相对路径</h4>
       <img alt="Vue logo" :src="img2" />
   
       <h4>4.第二种方式改版2（正确）：import引入assets下面的相对路径-对应data中声明变量</h4>
       <img alt="Vue logo" :src="img3" />
   
       <h4>5.第三种方式：css类样式中-background引入-assets下面的相对路径</h4>
       <div class="test"></div>
   
       <h4>6.第四种方式（错误）：style样式中-background引入-assets下面的相对路径</h4>
       <div style="width:100px;height:100px;background:url('./assets/test3.png');border:1px solid blue;margin:0 auto;"></div>
   
       <h4>7.第四种方式（正确）：动态style样式中-url拼接data变量-如上面例子3 4</h4>
       <div :style="`width:100px;height:100px;background:url(${img2});border:1px solid blue;margin:0 auto;`"></div>
   
       <hr />
       <strong>均操作public/static下图片（默认为根目录路径 若实际不是则需要设置publicPath来指定路径前缀）</strong>
       <h4>1.第一种方式（本地生效 打包后不生效）：html里面--public下面的绝对路径(绝对路径会自动指向public文件)--直接赋值src</h4>
       <img alt="Vue logo" src="/static/test.png" />
       <img alt="Vue logo" src="/test4.png" />
       <h4>2.第二种方式：html里面--public下面的相对路径--直接赋值src</h4>
       <img alt="Vue logo" src="../public/static/test.png" />
       <img alt="Vue logo" src="../public/test4.png" />
       <h4>3.第三种方式：html里面--v-bind-data里面变量值为绝对路径</h4>
       <img alt="Vue logo" :src="item.img" v-for="(item,index) in ds" :key="index"/>
     </div>
   </template>
   <script>
   import img3 from './assets/test3.png'
   export default {
     name: "App",
     data(){
       return {
         img:'./assets/test.png',
         img2:require('./assets/test.png'),
         img3,
         // v-bind 
         staticImg:'/test4.png',
         staticImg2:require('../public/test4.png'),
         ds:[{img:'/test4.png'}]
       }
     }
   };
   </script>
   <style>
   #app {
     font-family: Avenir, Helvetica, Arial, sans-serif;
     -webkit-font-smoothing: antialiased;
     -moz-osx-font-smoothing: grayscale;
     text-align: center;
     color: #2c3e50;
   }
   .test{
     background:url('./assets/test2.png');
     width:100px;
     height:100px;
     margin:0 auto;
   }
   </style>
   本地启动 除了错误示范 其他均能找到图片
   ```

   <img src="https://i.loli.net/2021/01/13/fT8dVIilkqU59pB.png" alt="4.png" style="zoom:50%;" />

   <img src="https://i.loli.net/2021/01/13/FJE9qxKHebGVRQu.png" alt="1.png" style="zoom:50%;" />

   <img src="https://i.loli.net/2021/01/13/VBQ8cEslSjW9eOu.png" alt="2.png" style="zoom:50%;" />

   <img src="https://i.loli.net/2021/01/13/SDbidOv1Qf3cCWT.png" alt="3.png" style="zoom:50%;" />

   ```js
   当我们打包部署服务器时 这里有区别就是若我们项目在根目录下时 之前我们在代码里面写的绝对路径下访问public静态资源没问题 若我们项目部署的不是根目录 则以绝对路径引入的public会找不到 而以相对路径引入的public文件能找到 其他方案除错误实例外均能找到图片
   
   接下来就牵出了 如何配置nginx 我在本地下载安装了nginx 找到配置文件nginx.conf 此时nginx默认的静态资源目录在html目录下 这里也就牵出了为生命部署后js,css找不到及publicPath如何设置了
   ```

   ```
   a. 当我们配置 publicPath:'/'且dist文件下级内容全部放在html文件下面 
   
   此时的nginx配置项为:
   location /test {
       index index.html index.htm;
       try_files $uri $uri/ /index.html last;
   }
   // 因为默认路径以html为根路径 所以这里只需设置找到当前目录下的index.html
   ```

   <img src="https://i.loli.net/2021/01/13/TDrQU64bHms3WFh.png" alt="5.png" style="zoom:50%;" />

   ​			经过打包部署后发现 除了上面错误实例外 其他不管assets还是Public(相对路径&绝对路径)均成功显示

   ```
   b.当我们将dist文件夹下级内容全部放在html文件叫xxx文件下面 由于我们打包出来的文件并没有放在根目录下面而是根目录下面xxx路径下面 所以这个时候publicPath配置就显得很重要了 它得配置就是为了我们文件在根目录下怎么去找对应得js,css等等资源由于放在了xxx下面 即我们需要给publicPath:'/xxx'配置
   
   此时的nginx配置项为:
   location /test {
       root html/xxx; // 这里的root指当我们访问/test路由时 会替换成去找服务器下地址了html/xxx
       index index.html index.htm;
       try_files $uri $uri/ /index.html last;
   }
   // 这里我觉得我们平时在部署前端项目时 需要关注的
   第一个点就是先怎么配置路由去找到我们指定的静态文件 比如一般前端打包后都以index.html为入口 所以我们需要改写nginx配置来首先满足找到index.html 
   第二个点就是检查我们前端打包后需要访问的js,css等文件是否能访问 也就是基于我们的静态文件到底是丢在相对于根目录的哪个路径下 需要根据这个来配置我们的publicPath
   总结来说就是 首页路由配置 -> nginx配置
              应用文件路径 -> 相对根目录来配置
   
   除了root改写路径匹配 还有一种方式就是使用alias别名 它与root的区别就是root是在你请求前面拼接上root（此时不用管斜杠多一个也好少一个也好）
   而alias是匹配并替换（个别情况需要关心斜杠的问题）
   location /test {
       alias html/xxx
       index index.html index.htm;
       try_files $uri $uri/ /index.html last;
   }
   这里它会将/test 匹配成html/xxx由于我们这里静态资源并没有跟/test有关 所以它的作用就跟root一样了
   具体root跟alias区别参考这篇文章 https://www.jianshu.com/p/4be0d5882ec5
   ```

   <img src="https://i.loli.net/2021/01/13/GANpQSzmP279hiy.png" alt="6.png" style="zoom:50%;" />

   ​	    经过打包部署后发现 除了上面错误实例外 还存在我们使用绝对路径访问public文件也显示不出来但是public相对路径能访问 原因就是我们现在的静态文件并不在根目录了 而是在xxx下面 所以我们需要在前端代码里面去动态的绑定这个前缀比如:src=`${process.env.BASE_URL}/static/test.png`

   ```
   c. 若此时我们的静态文件并没有放在html根目录文件下 而是放在了跟html同级的www文件夹下的test文件夹里面 按照b方案的思路 我们来配置下 首先定位到index.html身上
   location /new {
       root www/test
       index index.html index.htm;
       try_files $uri $uri/ /index.html last;
   }
   此时我们访问应用 结果index.html能访问 但是js,css却找不到 通过nginx的error.log我们可以发现 它始终都在匹配html下的js,css 但是我们文件却在www/test下面 故我们可以让其他静态文件也定位到www/test下面所以需要再添加一组location匹配
   location /new { // 这个满足找到入口文件
       root www/test
       index index.html index.htm;
       try_files $uri $uri/ /index.html last;
   }
   location ~* \.(css|gif|ico|jpg|js|png|ttf|woff)$ { // 这个满足应用找静态文件路径
       root www/test;
       index index.html index.htm;
       try_files $uri $uri/ /index.html last;
   }
   那么所有都可以定位到www/test 故此时我们的publicPath:'/'即可
   ```

   <img src="https://i.loli.net/2021/01/13/LzfmBFQEivRwWjl.png" alt="7.png" style="zoom:50%;" />

   ```
   d. 既然我们的静态资源路径变了 那有没有直接改变nginx访问路径的配置 我目前想到的就是如下
   location / { // 这个满足应用找静态文件路径js，css等
       root www/test;
       index index.html index.htm;
       try_files $uri $uri/ /index.html last;
   }
   location /new { // 这个满足找到入口文件
       root www/test;
       index index.html index.htm;
       try_files $uri $uri/ /index.html last;
   }
   publicPath:'/'即可
   ```

   

2. **vue中如何做到局部style不污染全局样式？说说它的原理？**

   ① 在一般的开发过程中 我们使用scoped来标识当前组件的局部样式

   ② scoped属性是HTML5中的新属性 属性值是一个布尔属性 若使用该属性 则样式仅仅应用到style元素的父元素及其子元素 **但是目前就只有firefox支持这个特性 其他浏览器都不支持**

```html
<div>
    <style type="text/css" scoped>
        h1{color:red}
        p{color:blue}
    </style>
    <h1>我是红色字体h1</h1>
    <p>我是蓝色字体p</p>
</div>
<div>
    <h1>我是默认颜色h1</h1>
    <p>我是默认颜色p</p>
</div>
```

​		 	 ③ 在vue中使用原理：

```js
其实这个属性一般我们在使用单文件.vue组件进行开发时使用 也就是说下面这种模式
<template></template>
<script><script>
<style lang='scss' scoped></style>
那就说明其实不是vue给我们作了scoped局部样式的处理 而是插件"vue-loader"作的处理

源码vue-loader/lib/loaders/stylePostLoader.js中 我们可以到最终渲染在dom上的自定义属性data-v-xxx 由vue-loader操作生成scopeId最后在vue源码中使用

同理style中的lang属性 来指定我们使用什么预处理css 如：scss sass less stylus等等均在vue-loader中处理lang字段最后在动态require引入指定的预处理css loader插件
```

​			④ 深度作用选择器

```css
通常情况下：
<style scoped>
.a >>> .b {
    color:red;
}
</style>
若使用类似于sass这类预处理无法解析>>>
<style scoped>
// scss
/deep/ .a .b{
    color:blue;
} 
// sass
.a .b::v-deep{
    color:yellow;
}
</style>
```

 		⑤ 除了scoped生成局部样式还有什么方式来实现样式作用域？

​			vue-loader还提供了css modules模式来进行设置局部样式 具体可以看配置项

​		 ⑥ 关于热重载

最关键的就是状态保留：（配合webpack插件webpack-dev-server --hot使用热更新）

​	编辑组件<template> ---  组件实例就地重新渲染 --- 模板被编译成了新的无副作用的render函数

​	编辑组件<script> --- 实例就地销毁且重新创建（组件状态保留是因为script中包含带有副作用生命钩子，若关联了全局副作用则整个页面重新reload）

​	编辑组件<style> --- 会通过vue-style-loader自行热加载 不影响组件状态

<img src="https://i.loli.net/2021/01/12/vkpPfhwXFAgsGLZ.png" alt="image-20210112103257270.png" style="zoom: 80%;" />

<img src="https://i.loli.net/2021/01/12/1ExktIgRfr85ybH.png" alt="image-20210112103428941.png" style="zoom:80%;" />

<img src="https://i.loli.net/2021/01/12/xbU56W97hFyOsZC.png" alt="image-20210112103540452.png" style="zoom:80%;" />

3. **vue中watch的属性或者methods的方法能使用箭头函数来定义吗？为什么？**

   不能 因为不管在watch或methods的方法中我们都想以vue的实例来操作 若一旦我们使用箭头函数 则在非严格模式下 this绑定的是父级作用域window  而在严格模式下this是undefined

   

### 2021.01.08-this.$nextTick

1. **this.$nextTick平时怎么使用的？说说它的原理？**

   ① vue的DOM更新是异步更新的（为什么设计成异步更新？因为比如我们在created钩子函数里面100次循环设置this.xxx=i，若不是异步那岂不是需要触发100次响应dom更新，这里也是优化方案之一），比如我们在执行了this.xxx=1，这个时候去拿dom上的xxx值结果还是原来的值而非刚刚设置的1，此时我们需要使用this.$nextTick在callback中拿就没问题了

   ② 原理：

   ```js
   源码1905行~源码2007行
   源码1984行 执行nextTick后会将cb全部Push进callbacks全局数组收集任务起来
   源码1999行 这里执行了一个timerFunc函数 这个声明过程在源码1930行到1982行 这里作了
   		  1.是否支持Promise         浏览器方法兼容
             2.是否支持MutaionObserver DOM监听方案 
             3.是否支持setImmediate 	Node环境 
             4.最后使用setTimeout(flushCallbacks,0) 做了这么多判断其实是利用了js事件循		   			   环（event loop）机制来将当前需要执行的cb放到事件任务队列中 在下一次事件循环中再执行             后面会记录下事件循环相关东西
   源码1910行 这里使用for循环分别来执行之前push进来的函数(也就是我们cb回调)          
   ```

   ```js
      js事件循环Event Loop是基于js是单线程操作 同一时间只能执行一个任务 而js主线程拥有一个“执行栈”以及一个“任务队列” 参考网上说法：js执行主线程任务 遇到需要执行异步任务时会将此刻的异步任务推进“任务队列”，当主线程执行完毕后会“清空当前执行栈”，按照先入先出的顺序来执行任务队列里面的任务
      异步任务分为：宏任务(macrotasks)和微任务(microtasks)
   	 宏任务（macrotasks）一般包含：
        	1.I/O操作                浏览器支持      node支持
           2.setTimeout            浏览器支持      node支持
           3.setInterval           浏览器支持      node支持
           4.setImmediate          浏览器不支持     node支持
           5.requestAnimationFrame 浏览器支持      node不支持
        微任务（microtasks）一般包含：
           1.process.nextTick      浏览器不支持    node支持
           2.MutationObserver      浏览器支持      node不支持
           3.Promise.then catch finally 浏览器支持 node支持
           4.async await           浏览器支持      node支持
   例如1：
   console.log('script start');
   setTimeout(function() {
     console.log('setTimeout');
   }, 0);
   Promise.resolve().then(function() {
     console.log('promise1');
   }).then(function() {
     console.log('promise2');
   });
   console.log('script end');
   
   我的理解是这4句代码整体是一个js主线程 从上往下执行
   第一句：打印出"script start"
   第二句：遇到异步任务且setTimeout属于宏任务 压入异步任务宏队列(若存在多个则按先入先出)
   第三句：遇到异步任务且Promise属于微任务 压入异步任务微队列(若存在多个则按先入先出)
   第四句：打印出"script end"
   至此js主线程上task执行完毕 那么需要执行异步任务 而异步任务中微任务先于宏任务执行
   	   打印出"promise1"
          打印出"promise2"
   最后执行宏任务 打印出"setTimeout"
   例如2：
   console.log('script start');
   setTimeout(function() {
     console.log('setTimeout1');
   }, 0);
   setTimeout(function() {
     console.log('setTimeout2');
   }, 0);
   Promise.resolve().then(function() {
     console.log('promise1');
     Promise.resolve().then(function(){
         console.log('promise内部')
     })  
   }).then(function() {
     console.log('promise2');
   }).then(function(){
     console.log('promise3')
   });
   console.log('script end');
   // script start
   // script end
   // promise1
   // promise内部
   // promise2
   // promise3
   // setTimeout1
   // setTimeout2
   例如3：
   new Promise(resolve => {
    resolve();
   })
    .then(() => { // 4行
        new Promise(resolve => {
        	resolve();
        })
        .then(() => {
        	console.log(777); // 9行
        })
        .then(() => {
        	console.log(888); // 12行
        });
    })
    .then(() => {
    	console.log(666); // 16行
    });
   这种嵌套promise可以这样理解 程序先执行第一个promise.then即第4行（压入队列16行） 接到遇到promise.then该分支没的其他主代码执行 则执行promise.then即第9行（压入队列12行） 执行完后又返回来执行promise.then的第二个即16行 然后再执行内部的第二个promise.then即12行
   // 777
   // 666
   // 888**vue中怎么重置data数据？**
   ```

   

2. **vue中如何重置data数据？**

```js
其实这里需要理解this.$data与this.$options.data() 我们在之前讲过vue上的data函数返回数据被vm.xxx映射了 访问的是vm._data.xxx 从源码中可以看见第一次进来获取了vm.$options.data但是后面使用getData()函数重赋值了data及vm._data后面的操作都是操作vm._data所以vm.$options.data()返回的是初始化的值未更改
1. Object.assign(this.$data,this.$options.data())
2. {...this.$data,...this.$options.data()}
3. this.xxx = this.$options.data().xxx
```

3. **vue中use有什么作用？原理？如何使用？**

   ```js
   ① 最主要的作用就是安装插件 方便其他功能或组件能自定义插件快速服务于vue
   
   ② 源码5089行~源码5107行
   function initUse (Vue) {
       Vue.use = function (plugin) {
           var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
           // TODO：校验插件是否已安装 重复安装无效
           if (installedPlugins.indexOf(plugin) > -1) {
               return this
           }
           // TODO：这句作arguments参数处理 取从第1个参数后的参数
           // TODO：若es6处理[...arguments].slice(1)
           var args = toArray(arguments, 1);
           // TODO: 这里往参数集合里面首处压了个vm实例过去
           args.unshift(this);
           
           if (typeof plugin.install === 'function') {
               // TODO：给plugin.install方法绑定plugin来执行插件逻辑
               // TODO：这里args参数就很关键了 响应了上面为什么在首处压了个Vue实例过去
               // TODO：因此我们在写插件的时候install方法的第一个参数必然为Vue实例，第二个参数为				options插件配置项
               /*
               	好比：
               	function install(Vue,options){
               		// 插件业务逻辑代码
               	}
               */
               plugin.install.apply(plugin, args);
           } else if (typeof plugin === 'function') {
               // TODO：若插件不为函数则以window.plugin(Vue,options)来执行安装
               plugin.apply(null, args);
           }
           // TODO：压入集合
           installedPlugins.push(plugin);
           return this
       };
   }
   /*es5 处理arguments类数组转为数组集合
   function toArray (list, start) {
       start = start || 0;
       var i = list.length - start;
       var ret = new Array(i);
       while (i--) {
           ret[i] = list[i + start];
       }
       return ret
   }*/
   
   ③ 简易插件实例
   const install = (Vue,options) => {
       console.log('第一参数为Vue实例',Vue)
       console.log('第二参数为配置项',options)
       Vue.prototype.$testPlugin = function(){
           console.log('我是插件逻辑')
       }
   }
   export default {
       install
   }
   ```

   

### 2021.01.07-是什么时候我们操作this.xxx会映射到this._data.xxx身上

1. **vue中是什么时候我们操作this.xxx会映射到this._data.xxx身上？**

   ```js
   源码4998行 声明周期函数beforeCreate被调用 也证实了在这个周期里面我们拿不到options所有相关的东西
   源码5000行 initState(vm) 开始初始化options 
   
   源码4635行 按props->methods->data->computed->watch顺序进行每项的初始化init
   源码4699行 这里拿到data赋值给了vm._data，遍历每个data里面声明的key值，判断是否与props、methods存在重名的字段 也证实了vue中data的属性可以和methods中的方法不能同名
   
   源码4734行 遍历中执行proxy(vm,'_data',key)方法 -- 关键就是这个方法 原理就是给vm（this）定义每一个key值的getter/setter 设置获取都操作的是vm._data[key] 这里使用的是Object.defineProperty()
   ```

   <img src="https://i.loli.net/2021/01/12/psqL9bXHTE8oOF2.png" alt="proxyData.png" style="zoom:80%;" />

### 2021.01.06-data为啥是函数

1. **data在什么时候可定义对象什么时候必须定义为函数返回对象？**

    ① 定义为对象可在操作Vue对象时定义为对象

   ```js
   const app = new Vue({
   	el:'#app',
   	data:{message:'卧室'}
   })
   ```

   ② 在定义组件的时候data必须定义为函数返回对象（**因为组件存在复用的情况，若定义为对象那么复用的组件其中一个改变其他组件值也跟到变化了，所以需要每个组件拥有一套对象独立的拷贝。存在对象的引用地址一样，改变一处其他也改变了**）

   ```vue
   <template>
   	<div>
           {{message}}
       </div>
   </template>
   <script>
   export default {
       data(){
           return {
               message:'局部组件定义为函数返回对象'
           }
       }
   }
   </script>
   ```

   ③ 改为函数返回对象了，这个时候如何处理将函数的对象挂载到实例vm身上？

### 2021.01.05-v-model

1. **v-model原理？**

   ①是个一般作用于“表单元素”及“组件”上面指令，来创建双向数据绑定；

   ②说穿了就是v-bind:xxx及v-on:xxx的快捷语法糖（等价于动态增加prop+dom绑定事件）；

   ```html
   <p>{{inputValue}}</p>
   <input v-model="inputValue"/>
   改版：
   <p>{{inputValue}}</p>
   <input v-bind:value=”inputValue” v-on:input=”v => inputValue=v”/>
   简易版：
   <input type="text" :value="name" @input="name = $event.target.value">
   ```

   ③其他表单元素改写使用的属性和事件：
   
   ```html
   Text\textarea – value – input
   checkbox\radio – checked – change
   Select – value – change
   ```

   ④自定义组件的v-model绑定：一般在自定义组件vue会默认使用名为value的prop属性及名为input的事件进行绑定；但是在其他业务场景下往往不全面，所以也提供了model属性对象配置：
   
   ```js
   Model:{
      Prop:‘checked’,
      Event:‘change’
   }
   ```

   这样设置了后还是仍需要在子组件内部声明props即来绑定自定义的prop值。

   表现就是在子组件内部使用v-bind:checked=”propsChecked”(v-bind后面的值来自于model设置的prop;后面赋值项为父传子props下来的属性值)使用v-on:change=”$emit(‘change’,$event.target.checked)”(v-on后面的值来自model设置的event;后面事件响应到父组件监听的change事件，payload传值为当前checked状态)

   ⑤相关修饰符：
   
   ```js
   v-model.number(简易版验证数字输入)；
   v-model.lazy（希望双向数据响应不同步而是在change事件的时候如光标离开后进行同步）;
   v-model.trim（前后空格清除）
   ```

   ⑥**源码体现**：
   
   ```js
   // src/platforms/web/compiler/directives/model.js
   这里我猜想通过模板编译得到‘v-model’指令及修饰符’.lazy’’.number’’.trim’ ASTModifiers
   const { lazy, number, trim } = modifiers || {}再分别根据这些写逻辑
   最后调用addProp()\addHandler()两个方法来实现添加属性及dom事件
   ```

<img src="https://i.loli.net/2021/01/12/MhDXViJWA6glSI9.jpg" alt="clip_image002.jpg"  />

![clip_image004.jpg](https://i.loli.net/2021/01/12/guLCTqixKshE5AN.jpg)