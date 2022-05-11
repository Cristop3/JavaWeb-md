

### 2021.07.23

​	1.**React Hooks Api怎么理解？**

```jsx
1.	useState(initState[,Function])
	"作数据存储和派发更新" - 返回一个数组 数组的第一个值为state 第二个值为更新state函数
    let [test,setTest] = useState(0)
    let [test,setTest] = useState(() => 0)
    
2.	useEffect(Function[,Array])
	"组件更新副作用钩子" 
	2.1	当组件初次渲染时 useEffect可以充当class组件中的"componentDidMount"
	2.2 若不设置第二个参数 当state或者props变化时 也会触发useEffect执行，此时useEffect充当了"componentDidUpdate"
	2.3	若设置了第二个数组参数 这里充当了限制条件 在新一轮更新的时候 useEffect会拿出之前的记忆值和当前值作对比 确实变化了才进行执行useEffect函数 若没变化则不会触发 
    	若将第二个参数传入一个空数组 那么表示改hooks只会在mount阶段的时候执行 后面update都不会触发了！
    2.4	我们也可以在useEffect函数的最后通过return 一个函数 那么此时充当了"componentWillUnmount" 比如取消dom监听，清除定时器等操作
	2.5 useEffect不能直接使用async await语法糖 若想用 在里面或者外面包裹一层函数
    
3.	useRef(initValue)
	"获取dom元素，缓存数据"
	3.1	通过 xxx = useRef(null) xxx.current来访问值
	3.2	高阶用法 可用作缓存数据 当我们使用useState时 此时触发更新会导致重新取值 若此时我们使用useRef时它会返回上次的值给你 作到了缓存的效果

4.	useContext(context)
	"获取最近父组件Provider设置的value值"
	等于说useContext(context)就是代替了之前<context.Consumer>来获取value值

5.	useReducer(reducer,initData)
	reducer = (state,action) => {}
    "无状态组件中使用类似redux的api"

6.	useMemo(Function,depsArray)
	"功能类似于React.memo"

7.	useCallback()
	"类似于useMemo 作了层函数的缓存 而useMemo返回的是函数运行时的结果缓存"
	一般情况下 useCallback必须配合React.memo或者PureComponent组件来一起使用
	
```

​	2.**React.memo怎么使用？怎么理解?**

```jsx
1.	平时我们在class组件中 由于react每次更新会重新渲染整个子组件 就算某个子组件的props依赖并未变更 也会引发重新渲染 所以我们经常提出要进行性能优化 一般通过"pureComponent"纯组件或者"componentShouldUpdate"钩子函数来避免不必要的更新 当然这两者都是属于"class"组件

2.	而React.memo()就是针对"函数式组件"的"shouldUpdate"是否更新优化高阶组件 等于说就是使用React.memo来包裹函数式组件
	function YourComponent(){return <></>}
	function isEqual(prevProps,nextProps){return true || false}
	React.memo(YourComponent,isEqual)
```

​	3.**React中setState是同步还是异步执行？它与hooks中的setState有什么区别？**

```jsx
1.	结论：
	1.1	进入"react调度流程" -》 常规react代码 -》 "异步执行"
	1.2	没进入"react调度流程" -》 setTimeout * setInterval * 原生事件 -》 "同步执行"

2.	源码：
	scheduleUpdateOnFiber()
	if(executionContext === NoContext){
        flushSyncCallbackQueue();
    }
	其中executionContext代表当前react所处的阶段，若为NoContext则会走同步更新我们的state 若还在react的调度时 它非NoContext则走异步更新state
    
3.	setState与hooks里面的useState 在更新上来说大致相同 最后都是走的scheduleUpdateOnFiber这个函数 但是区别是：
	当我们调用setState时 react会帮我们作一个"合并" 而hooks中给什么值就设置什么值
```



### 2021.07.22

​	1.**React最新的生命周期？**

```jsx
1.	分为3个阶段
	装载阶段（Mount）: 组件第一次在DOM树中被渲染的过程
    更新过程（Update）: 组件状态发生变化 重新更新渲染的过程
    卸载过程（Unmount）: 组件从DOM树中被移除的过程

2.  Mount:
	2.1	constructor 
        - 需主动"super(props)"

    2.2	static getDerivedStateFromProps(props,state) 
        - "有两个参数 props 和 state，分别指接收到的新参数和当前组件的 state 对象，这个函数会返回一个对象用来更新当前的 state 对象，如果不需要更新可以返回 null。"

    2.3	render 
        - "它会根据状态 state 和属性 props 渲染组件。这个函数只做一件事，就是返回需要渲染的内容，所以不要在这个函数内做其他业务逻辑"

    2.4 componentDidMount 
        - "执行依赖于DOM的操作；发送网络请求；（官方建议）添加订阅消息（会在componentWillUnmount取消订阅）；"

3.	Update
	3.1	static getDerivedStateFromProps(props,state)

    3.2	shouldComponentUpdate(nextProps,nextState)
		- "可以比较 this.props 和 nextProps ，this.state 和 nextState 值是否变化，来确认返回 true 或者 false。当返回 false 时，组件的更新过程停止，后续的 render、componentDidUpdate 也不会被调用。"

    3.3	render
    
    3.4	getSnapshotBeforeUpdate(prevProps,prevState)
		- "有两个参数 prevProps 和 prevState，表示更新之前的 props 和 state，这个函数必须要和 componentDidUpdate 一起使用，并且要有一个返回值，默认是 null，这个返回值作为第三个参数传给 componentDidUpdate"

    3.5	componentDidUpdate(prevProps, prevState, snapshot)
4.	Unmount:
	4.1	componentWillUnmount
5.	Error:
	5.1	componentDidCatch(error,info)
```

​	2.**React组件通讯？**

```jsx
1. 父组件向子组件通信："props"
2. 子组件向父组件通信："props+回调" 等于说就是父组件将方法props下去

3. 嵌套父->子->子通信：
	"笨办法 -》 每层透传props"
	"使用context"
4. 兄弟组件通信：
	"找到公用父节点转发信息 类似第3点"
5. 跨层级通信：
	"context"
	"Redux&Mobx"
```



### 2021.07.21

​	1.**如何理解高阶组件HOC**

```jsx
1.	几种包装强化组件的方式
	1.1	mixin模式
    早期react提供React.createClass和mixin属性来进行包装组件，用法类似于vue中的mixins配置 但后来废弃了createClass 原因有3：第一（mixin引入了隐式依赖关系）第二（不同的mixins之间可能有先后顺序甚至代码冲突覆盖问题）第三（mixin代码导致滚雪球式的复杂性）
    1.2 mixin衍生方式
    通过包装函数 利用for-in将组件原型链上赋值上mixin内容
	1.3	extends继承模式
    有个基础组件<Base> -> 有个<Second>继承<Base> -> 有个<Third>继承<Second>这种意味着对基础组件相当熟悉
	1.4	HOC模式
    1.5 Hooks模式

2.	高阶组件产生初衷
	2.1	"复用逻辑"
	2.2	"强化props" - (劫持上一层props混入当前state 组成新的props)
	2.3 "赋能组件" - (额外生命周期&额外事件)
	2.4 "控制渲染" - (如条件渲染、如节流渲染、如懒加载 代表例子有redux中的connect和dva中的dynamic组件懒加载)

3.	如何创建和使用
	3.1	对于有状态组件 可使用装饰器模式 注意下顺序越靠近的组件就是越内层的HOC
    3.2	函数嵌套模式

4.	两种不同的高阶组件
	4.1	"正向属性代理" 
    (与业务子组件零耦合，控制子组件渲染及传递额外props 适合开源项目的HOC)
	(一般无法直接获取业务组件，若需要则需要ref获取组件实例；无法直接继承静态属性 需要引入第三方库)
	4.2	"反向继承"
	(可直接获取组件内部状态； 无需处理静态属性)
	(但是带来了强耦合；多个反向继承hoc嵌套可能会状态覆盖)
    	
```

2.**React.component和React.pureComponent的区别？**

```jsx
1.	React.component会比React.pureComponent多一个显式的"shouldComponentUpdate"方法 默认情况下返回的true 意味着当我们的依赖state或者props改变 则会默认重新渲染当前的所有组件 这样就会导致比如我们子组件1依赖state.name 子组件2依赖state.age 一旦只改变state.name 但是实际也会引发子组件2的重新渲染

2.	React.pureComponent会主动的通过对prop和state一层"浅比较"(shallowEqual) 但是改方法只会比较最外层是否一致 若一致则跳过render 这样同样也会遇到当我们的state或者props是一个Object&Array时改变某一项浅比较不出来 则不会引发render

3.	React.pureComponent优缺点
	3.1 优点就是：当state&props为单层时不需要人工再去在shouldComponentUpdate方法里面去进行比较
	3.2	缺点就是：由于只是比较了一层 导致当state&props是Object&Array时会导致得不到更新

4.	什么情况下适合使用pureComponent?
    4.1	props&state是不可变对象
	4.2	props&state是单一层数据结构
	4.3	如果数据改变无法反应到浅拷贝上，则用使用forceUpdate来更新
	4.4	一个PureComponent父组件的子组件也应该是PureComponent

```

3.**React.Fragment的理解？**

```jsx
1.	React 中的一个常见模式是一个组件返回多个元素。Fragments 允许你将子列表分组，而无需向 DOM 添加额外节点。
2.	<React.Fragment>                        <>
    	<ChildA />							<ChildA />
    	<ChildB />           或者直接省略     <ChildB />
    	<ChildC />                          <ChildC />
    </React.Fragment>						</>

3.	我理解就是解决了vue组件中必须使用一个root父级来包裹 但是不会渲染到真实dom中            
```

4.**哪些情况下会触发React重新渲染？重新渲染render会做些什么？**

```jsx
1.	主动调用setState()方法
2.	当继承React.component时 此时父组件重新render了，即使传入子组件的props未发生变化，那么子组件也会重新render

3.	会对新旧 VNode 进行对比，也就是我们所说的Diff算法。
	对新旧两棵树进行一个深度优先遍历，这样每一个节点都会一个标记，在到深度遍历的时候，每遍历到一和个节点，就把该节点和新的节点树进行对比，如果有差异就放到一个对象里面
	遍历差异对象，根据差异的类型，根据对应对规则更新VNode

```

5.**React中可以在render里面访问refs吗？为什么？**

```jsx
1.	不可以 因为render的时候 并未生成DOM 此时无法获取到DOM 而可以获取DOM的时候是在"pre-commit"和"commit"阶段
```

6.**React中的插槽(portal)如何理解？使用场景？**

```jsx
1.	Portal 提供了一种将子节点渲染到存在于父组件以外的 DOM 节点的优秀的方案
2.	ReactDOM.createPortal(child, container);
3.	当父组件具有overflow: hidden或者z-index的样式设置时，组件有可能被其他元素遮挡，这时就可以考虑要不要使用Portal使组件的挂载脱离父组件。例如：对话框，模态窗。
```

7.**React中如何避免不必要的render?**

```jsx
1.	shouldComponentUpdate&PureComponent合理使用
2.	利用高阶组件(在函数组件中没有shouldComponentUpdate钩子 封装一个PureComponent功能)
3.	使用React.memo来缓存组件的渲染
```



### 2021.07.20

​	1. **React事件机制**

```jsx
1.	react自己实现了一套事件机制，动机如下
	1.1	抹平浏览器间的兼容性差异
    1.2	事件自定义
    1.3	跨平台事件机制
    1.4	所有事件被代理到document上 而不是dom节点本身减少内存开销
    1.5	Fiber架构下 react通过干预事件的分发优化体验
2.	React事件注册：document注册&存储事件回调
3.	由于自定义事件机制 则return false失效 防止事件冒泡e.stopPropagation也失效 必须明确e.preventDefault()

4.	源码分析后面来补充
```

  2.**React的事件和普通HTML事件有什么不同？**

```jsx
1.	对于事件名称命名方式，原生事件为全小写，react 事件采用小驼峰；
2.	对于事件函数处理语法，原生事件为字符串，react 事件为函数；
3.	react 事件不能采用 return false 的方式来阻止浏览器的默认行为，而必须要地明确地调用preventDefault()来阻止默认行为。
```

