## 2021.11.25

### 原生Context

```js
1. 使用场景
	Context 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。
    需要注意场景是否应该使用Context，因为这样会使用组件复用性变差，或许render props可以解决问题。

2. 如何使用
	2.1
	// context.js
	const ShareContext = React.createContext(defaultValue) // 创建一个Context对象 带一个默认的value 是当我们的子组件订阅了该Context时 就近没找到Provider组件 则使用defaultValue
    export default ShareContext

	2.2
	// app.jsx
	import ShareContext from './context.js'
	import A from './A.jsx'
	// state
    const share = {name:'我是context'}
    // render
    // 返回一个Provider React组件 一般在顶层组件使用 提供了value来共享指定的Context值
    <ShareContext.Provider value={share}>	
    	<A /> 
    </ShareContext.Provider>

	2.3
	// A.jsx
	import ShareContext from './context.js'
	一般我们需要在子组件中引入Context，是为了订阅该Context，这里提供四种方法来订阅
    	2.3.1 class组件中（使用Class.contextType）
		class A extends React.Component{
        }
		A.contextType = ShareContext
		这样设置后，我们将在A的所有生命周期及render使用this.context来访问订阅的Context

		2.3.2 class组件中（使用static关键字）
        class A extends React.Component{
         static contextType =  ShareContext 
        }
		同理，我们将在A的所有生命周期及render使用this.context来访问订阅的Context

		2.3.3 React组件订阅
        <ShareContext.Consumer>
        	{value => {}}    
        </ShareContext.Consumer>
		使用Context的Consumer组件，它是一个render props结构，参数value就是我们在Provider组件上设置的share
        
        2.3.4 Hooks订阅
        const value = useContext(ShareContext)
        
    2.4 如何变更context
    一般情况下我们的共享数据Provider组件的value会在顶层组件中的state声明（若不在state中声明，当是对象数据结构时，当顶层组件re-render时，可能订阅context的子组件会触发更新），同理如果要改变context则传递给子组件一个方法绑定到顶层组件的方法中来改变state以到达改变context目的。   
	
	2.5 订阅多个context
    // app.jsx
    <OneContext.Provider value={oneValue}>
        <TwoContext.Provider value={twoValue}>
            <A />
        </TwoContext.Provider>
    </OneContext.Provider>  
	
	// A.jsx
	<OneContext.Consumer>
        {
            oneValue => {
                <TwoContext.Consumer>
                    {
                        twoValue => { ... }
                    }
                </TwoContext.Consumer>
        	}
        }
    </OneContext.Consumer>

3. Context缺点
	3.1 context相当于全局变量， 难以追溯数据源
    3.2 耦合度高，即不利于组件复用也不利于测试
    3.3 在老版Context(v16.3之前)：当 props 改变或者 setState 被调用，生成新的 context，但是 shouldComponentUpdate 返回的 false 会 block 住 context，导致没有更新。因此新版Context改成了传播不受限制于shouldComponentUpdate，在顶层组件跳过更新时也能更新。
```

### unstated - 解决Class Component下共享数据

```js
1. 原理
	unstated是基于上文的React.Context来的，做了一层封装。最大的不同我理解就是在原生Context中，我们共享数据提供给Provider的value数据结构有限，例如是一个Object，那么大量的变更逻辑或者初始数据会堆积在顶层组件，若使用unstated可以结合HOC作子组件state状态的解耦。

2. 基本概念
	所有一切是基于const StateContext = React.Context(null)
	2.1 Provider(对标原生Context.Provider) - "明确作用范围"
    	源码中，它实际上是一个"Context.Consumer"订阅组件，但是它的内部作了嵌套处理，返回"原生Provider组件"。通俗来理解就是返回了一个Consumer包裹的Provider组件。也可以通过inject注入初始化数据。
        
    2.2 Subscribe(对标原生Context.Consumer) - "作为RenderProps用法注入Store到视图中，注入的Store实例由参数to接受到的Class实例决定"
		源码中，它实际上是一个基于React类组件且返回一个"Context.Consumer"包裹组件，首先它接受一个Container类参数，关键的方法是创建Container实例，并且通过Container实例方法订阅更新函数onUpdate,最后子组件可以拿到我们的Container实例，同时也就拿到实例上的状态和方法，进行操作。当Container类执行更新后，触发onUpdate方法，调用React类组件的setState方法触发re-render即更新了所有订阅了该Container
        
    2.3 Container（状态容器）- "可以被继承的类，继承它的Class作为Store"
    	它是一个基于class类编写的状态容器，看起来api些跟React差不多，其实是个工具类，内部实现了"setState"方法跟监听器收集取消方法"subscribe"和"unsubscribe"，在执行setState方法时遍历执行在Subscribe中订阅的更新函数"this._listeners.map(listener => listener())"

3. 使用流程
	一般情况下大多数跟原生差不多，如：
    3.1 Provider组件包裹在顶层组件，若存在默认可以通过inject传入。
    3.2 创建Container容器类
    3.3 在需要订阅的子组件中使用Subscribe组件render props渲染，并给Subscribe组件to参数即Container类，则可以在子组件中调用Container类的state数据和使用方法更新数据
```

#### 场景：为什么要使用unstated

```js
将setState从具体的某个UI组件上剥离，形成一个数据对象实体，可以被注入到任何组件中

Provider是解决单例Store的最佳方案
Container成为一个真正状态处理类，只负责存储与操作数据
Subscribe通过to，使用render props模式将store注入到视图中
```

#### 实战：我们在业务中如何使用

```js
远古时期，在使用unstated时，通常搭配class类型组件，我们实际使用的时候，会针对Subscribe组件进行一层封装，再通过装饰器来载入跟业务关联的Container类，这样状态创建会跟视图解耦，最终调用，如：
	// context.js
	import {Container} from 'unstated'
	export default class Context extends Container{
        state = {
            // 共享数据
        }
        onChangeXXX(){
            // 通过继承方法setState 来更新state
        }
    }
	// 子组件
	import Context from './context.js'
	import { inject } from './utils.js'
	@inject({Context})
	class Test extend React.Component{
        state = {
            localState:123
        }
        render(){
            const {Context} = this.props
            const {localState} = this.state
        }
    }
```

### unstated-next：解决Function Component下共享数据

```js
1. 用法
	提供createContainer将自定义Hook封装为一个数据对象，提供"Provider"注入与"useContainer"获取Store这两个方法。
    "Provider"：就是对"value"进行了约束，固化了Hooks返回的value直接作为value传递给"Context.Provider"这个规范
    "useContainer"：就是对"React.useContext(Context)"的封装

2. 原理
	2.1 有一个创建容器的方法，"createContainer"该方法接收一个自定义hooks作为参数，先使用原生React.createContext创建Context对象；
		2.1.1 存在一个"Provider"方法，在其内部执行传递给createContainer的Hooks得到一个value值，内部其实就是Context.Provider的封装。
		2.1.2 存在一个"useContainer"方法，在其内部其实就是使用"useContext"获取当前Context的值，并返回。
    2.2 有一个使用容器的方法，"useContainer"该方法内部其实就是返回我们创建的Container实例所对应的值。

3. 总结
	总的来说，unstated-next就是借用了“hooks”来进行状态的管理，声明state及变更state都是由hooks来做，再利用新版Context配合useContext来作状态管理。
```

#### 场景：为什么要使用unstated-next

```js
在不使用unstated-next库时，我们针对函数式组件，想使用Context的话必然会在子组件中显式的使用"useContext"和"React.createContext.Provider"。

因此，unstated-next要做的就是针对"Provider作固定封装"及针对"useContext”api进行隐藏不显式提供使用而封装的一个库，全代码就40行。
```

#### 不足

```js
当不同子组件引用Container里面的不同的数据时，当更新某个属性时，另一个未使用到组件也会被更新，这个原因是 useContainer 提供的数据流是一个引用整体，部分子节点的更新会引起整个Hook重新执行，因而所有引用它组件也会re-render，不同实现"按需更新"
```

## 2021.11.30
