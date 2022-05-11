## 2021.11.15

### useState

#### 场景：用于生成状态以及改变状态的方法

```jsx
1. 基础用法
	const [count,setCount] = useState(0) // 定义
    setCount(1) // 使用
```

```jsx
2. 使用object&array初始化
	const [count,setCount] = useState({a:1,b:2})	
	const [count,setCount] = useState([{a:1},{b:2}])
	我一般习惯将引用类型的声明放在外面，独立声明，比如：
	const initCount = {
		a:1,
		b:2
	}
	const [countState,setCountState] = useState(initCount)
```

```jsx
3. 使用函数格式化式返回初始值,如需计算或依赖生成
	const [count,setCount] = useState(function test(){
        // 只会初始化执行
		return {a:1,b:2}
	}) 但是：
    function test(){
        return {a:1,b:2}
    }
    const [count,setCount] = useState(test())
    这样写了后，每次组件更新重新渲染都会执行test()函数，引起不必要的性能问题，一般不建议这样写，即：
    function test(){
        return {a:1,b:2}
    }
    const [count,setCount] = useState(() => test()) // 只会初始化执行 
```

```jsx
4. 与类组件中的setState区别
	2.1 类中所有的变量都声明在this.state下面
		---------------------------------------
		而hooks中可以多次声明useState来标榜不同的变量
		
	2.2 类中当我们调用this.setState时，它会自动的为我们合并state值
		如：
		this.state = { a:1, b:2 }
		this.setState({b:3})
		则此时state值为{ a:1, b:3 }
		---------------------------------------
		而hooks中，当我们调用setXXX函数时，它是覆盖
		如：
		const [count,setCount] = useState({a:1,b:2})
		setCount({b:3})
		则此时count值为{b:3}而a被覆盖了，因此在hooks中我们需要自己手动的去合并两次state值，使用方式同setState一致
		setCount(prevState => ({...prevState, b:3}))

	2.3 类中我们使用setState来设置相同的state时，会触发重新渲染
    	--------------------------------------
		而hooks中我们使用setXXX()来设置相同值时，不会触发重新渲染，内部通过Object.is来判断
```

#### 实战-到底该使用单个state变量还是多个state变量

```jsx
1. 将完全不相关的state拆分为多组state
2. 如果某些state是相互关联的，或者需要一起发生改变，就可以把它们合并为一组state
3. 实在state过多时，需要考虑是否使用useReducer来解决问题
```

#### 注意-使用回调改变prevState需注意Object.assign()与展开运算符区别

```jsx
在我们日常中会使用类似setXXX(prevState => {})去操作改变state值，刚好看到个例子，但是自己没反应过来，说明基础薄弱了，所以这里记录下
Object.assign(target,source)
	首先来说该方法是合并对象操作方法，属于浅拷贝；再者返回值是否跟target目标对象相等，取决于我们的target传入什么，如：
    const [XXX,setXXX] = useState({a:1})
    setXXX(prevState = > {
        const obj = Object.assign({},prevState,{a:2})
		console.log(obj === prevState) // false
		对于引用类型比较，会对比它的引用地址变化没有，此处使用的target为一个新object，表示将source源浅拷贝合并成一个新的对象值，因此它跟prevState肯定不同
        
        const obj = Object.assign(prevState,{a:2})
        console.log(obj === prevState) // true
		这里以prevState为目标，将{a:2}与其合并，因此此时obj与prevState一样，同时prevState也被改变了
        
        const obj = {...prevState,a:2}
        console.log(obj === prevState) // false
		这里使用展开操作符，起手obj就是一个新的object，只是将prevState展开与后面的属性进行合并，所以此时obj是一个新对象，它肯定不与prevState相等，同时也不会影响prevState，保持了数据的不可变，推荐使用这种方法来操作
    })
```

### useEffect

#### 场景：用于生成与状态绑定的副作用

```jsx
1. 基础用法
	useEffect(() => {
        console.log('我被调用了')
    })
	这样每次组件再重新渲染的时候，都会调用useEffect的回调函数
```

```jsx
2. 模拟componentDidMount生命周期
	useEffect(() => {
		console.log('我只会第一次组件渲染被调用')
	}, []) // 第二个参数依赖项数组为空
```

```jsx
3. 模拟componentDidUpdate生命周期
	useEffect(() => {
        console.log('我在第一次组件渲染时被调用')
        console.log('我在依赖项count改变时也被调用')
    }, [count])
	这种方式，effect回调函数会在第一次渲染时执行，同时在count改变的时候也会执行，当我们只想非第一次渲染执行我们的update逻辑时，即只有count改变才执行时，需要借助另一个关键hooks，即useRef,如：
	const firstRender = useRef(true)
    useEffect(() => {
        if(firstRender.current){
            firstRender.current = false
        }else{
            // 真正的componentDidUpdate 逻辑
        }
    },[count])
	这样的方式 就会跳过第一次render的逻辑
```

```jsx
4. 模拟componentWillUnmount生命周期
	多数情况下当我们使用useEffect时，都是用来处理副作用，比如监听事件，定时器等，需要在组件销毁的时候同时处理掉监听或者定时器，以免内存泄漏，即
    useEffect(() => {
        // 监听窗口变化
        const handleResize = () => {
            console.log('窗口变化了')
        }
        // 1
        window.addEventListener('resize', handleResize, false)
        return () => {
        // 2
        window.removeEventListener('resize', handleResize, false)
        }
    },[])
	即，我们需要在Effect回调函数中return一个函数，而函数体中去执行卸载监听等事件
    需要注意的是：
    这个return 函数并不是等组件销毁的时候才会去执行，而是在下一次更新时，会先执行return函数，再执行effect函数又再次重新监听，即按上面的1，2标注常规情况下会这样执行：
    初次渲染 执行 1
	state更新渲染 执行2 再执行1
```

```jsx
5. 若依赖项是个引用类型
	5.1 函数
	当我们的useEffect依赖项是一个函数时，我们可以使用useCallback来配合使用，如：
	const getFetch = useCallback(() => {
		....
	},[query])
    useEffect(() => {
        getFetch()
    },[getFetch])

	5.2 数组
    当我们依赖项是一个数组时，此时我们可以使用JSON.stringify(arr)来字符串化我们的数组，这样只有当数组变化时，才会回调
    const [count,setCount] = useState([{a:1}])
    useEffect(() => {
        // 执行逻辑
    },[JSON.stringify(count)])

	5.3 对象
    当我的依赖项是一个对象时，分了几种情况：
    	5.3.1 当依赖的对象某个字段是个基础类型时，我们可以直接指明具体的依赖项
        const [count,setCount] = useState({a:1})
        useEffect(() => {
           // a变化才回调 
        },[count.a])
		这种方式eslint会警告，而且只适用于少量字段依赖
        
        5.3.2 缓存某个字段
        const {a,b} = query // props 传过来
        const payload = useMemo(() => (create(a,b))，[a,b])
        useEffect(() => {
            // 变化逻辑
        },[payload])

		5.3.3 使用三方库"use-deep-compare-effect"
		之所以之前的种种方式，就是因为对象或者数组是引用地址类型，比如var a={},b={}; console.log(a===b) // false 
		console.log([] === []) // false
		而Reac每次渲染都会产生新的对象地址，新的数组地址,那么在依赖项中比较则会永远false，永远执行回调函数。
		因此当我们使用use-deep-compare-effect去替代useEffect，依赖项给数组或者对象，它会深层次的比较，最终返回true或者false
		const [count,setCount] = useState({a:1,b:2})
        useDeepCompareEffect(() => {
            // 只有当count对象里面值变化了 才会调用
        },[count])
```

```jsx
6. 如何在useEffect中使用异步调接口
	useEffect(() => {
        (async ()=> {
            const res = await fetchApi()
            ....
        })()
    })或者
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetchApi()
        }
        fetchData()
    })
	有时我们可能会遇到在该响应回来之前，我们操作组件摧毁了，此时React会报一个警告，那么如何来解决呢？ 需要加入一个标识符来判断是否应该来设置state，如：
    useEffect(() => {
        let isUnmounted = false
        (async ()=> {
            const res = await fetchApi()
            if(!isUnmounted){
                setCount() // 等等操作state的函数
            }
        })()
        return () => {
            isUnmounted = true
        }
    },[])
```

### useMemo

#### 场景：用于生成与状态绑定的组件或计算结果

```jsx
1. 基础用法
	const memoValue = useMemo(() => computedFunction,[])
    返回一个memoized记忆值，只会在其中的依赖项改变时重新计算memoized值
```

```jsx
2. 常用的使用场景
	2.1 向子组件传递“引用类型”属性，如：向子组件传递props的值，并且子组件需要进行优化时，需要对属性进行useMemo包裹
    2.2 引用类型值，作为其他hooks的依赖项时，需要使用useMemo包裹
    2.3 需要进行大量或者复杂运算时，为了提高性能，可以使用useMemo进行数据缓存，节约计算成本
```

```jsx
3. useMemo与React.memo不同
	"useMemo"是针对组件内部的一些数据进行优化和缓存，惰性处理，而
    "React.memo"是对函数组件进行包裹，对组件内部的state,props进行浅比较，判断是否需要进行渲染    
```

#### 16.14源码解析

```jsx
大体上跟useCallback差不多，唯一的区别就是
 // mount阶段,hook声明
  HooksDispatcherOnMountInDEV = {
    useMemo: function (create, deps) {
      //...
      try {
        return mountMemo(create, deps);
      } finally {
        //...
      }
    },
    //....
  };

  function mountMemo(nextCreate, deps) {
    var hook = mountWorkInProgressHook();
    var nextDeps = deps === undefined ? null : deps;
    // 把传入的callback执行的结果返回
    var nextValue = nextCreate();
    hook.memoizedState = [nextValue, nextDeps];
    return nextValue;
  }

每次useMemo都是将回调函数执行，缓存的是执行的结果，而useCallback是直接缓存的函数，并未计算
```



### useCallback

#### 场景：用于生成与状态绑定的回调函数

```jsx
1. 基础用法
	const memoFunc = useCallback(fn,[...relativeState])
```

```jsx
2. 常用的使用场景
	2.1 向子组件传递函数书信给，并且子组件需要进行优化时，需要对函数属性进行useCallback包裹
    2.2 函数作为其他hooks的依赖项时，需要对函数进行useCallback包裹
```

```jsx
3. useMemo与useCallback不同
	3.1	useMemo的返回值是一个值，可以是"属性"，可以是"函数"，也可以是"组件"
	3.2 useCallback的返回值只能是"函数"
	3.3 useCallback(fn, deps) => useMemo(() => fn, deps)
```

### 实战-业务中如何正确的使用useMemo、useCallback、React.memo

```jsx
1. React.memo
	一般在我们的业务代码编写中，一般子组件可能都会是很重大复杂的组件，故如何优化子组件的渲染很关键
    在函数组件中，我们一般使用React.memo()高阶组件来生成一个具有对子组件内部的state\props一个浅对比，来决定是否进行更新子组件；类比在类组件中，我们继承pureComponent组件
    在hooks以前，我们可能使用React.memo()包裹我们的无状态子组件，大概就可以不用管了，只有当props变化时才会触发子组件渲染，如下代码：

// 1.1 老版本使用
    // 子组件
    const Child = React.memo(props => {
        console.log('子组件渲染')
        return <div onClick={props.childClick}>child</div>
    })
    // 父组件
    class Parent extends PureComponent{
        state = {count:0}
        propsChildClick(){console.log('子组件click')}
        render(){
            console.log('父组件渲染')
            let {count} = this.state
            return (
            	{count}
                <button
                  onClick={() => {
                    this.setState((prevState) => ({ ...prevState, count: ++count }));
                  }}
                >
                  test
                </button>
        		<Child childClick={this.propsChildClick} />
            )
        }
    }
	此时，子组件会在第一次渲染加载，而后面无论我们在父组件中操作按钮改变父组件的state但是不会引起子组件的渲染，因为父组件每次setState时只会触发render()方法重新渲染，而传递给子组件的props始终指向实例的propsChildClick方法并未更改，即不会触发子组件更新。

// 1.2 父组件改成函数式hooks组件
    // 子组件
    const Child = React.memo(props => {
        console.log('子组件渲染')
        return <div onClick={props.childClick}>child</div>
    })
    // 父组件
    const Parent = () => {
        let [count, setCount] = useState(0);
        const propsChildClick = () => {
            console.log("子组件click");
        };
        return (
            <div>
                {count}
                <button
                    onClick={() => {
                        setCount(++count);
                    }}
                    >
                    test
                </button>
                <Child childClick={propsChildClick} />
            </div>
        );
    }
    此时，当我们改变父组件中的按钮时，会发现子组件也在重新渲染，这时会产生疑问我们不是已经对子组件使用了React.memo包裹吗，怎么还会渲染？我们再更改下代码，不传方法给子组件，而是传递一个title字符串，伪代码如：
	const title = '我是props title'
    <Child title={title} />
    此时，我们再改变，发现子组件不会跟随渲染了，说明React.memo起作用了，我们再更改下代码，将字符串改为一个对象包裹传入子组件，伪代码如：
	const title = {x:'我是props title'}
    <Child title={title} />
	此时，我们再改变，发现子组件又会跟随父组件改变而重新渲染
    
    即，我们在hooks中，当传递子组件一个函数或者引用类型的属性时，即使子组件使用React.memo包裹了，但是由于hooks每次setXXX更新是执行整个父组件函数，此时我们的函数我们的引用属性都会是一个新地址，因此走入了[]!==[]\{}!=={}比较都是false，因此会触发子组件渲染。因此针对这两种形式，就需要我们使用useMemo()和useCallback()来解决
    
//  1.3 针对子组件优化 React.memo\useMemo\useCallback配合
    // 子组件
    const Child = memo((props) => {
      console.log("子组件渲染");
      return <div onClick={props.childClick}>{props.title.a}</div>;
    });
 	// 父组件
	const Parent = () => {
      let [count, setCount] = useState(0);
      // const test = { a: "123" };
      const test = useMemo(() => {
        console.log("执行useMemo");
        return { a: "123" };
      }, []); // 无依赖项 只执行一次
        
      // const propsChildClick = () => {
      //   console.log("子组件click");
      // };
      const propsChildClick = useCallback(() => {
        console.log("子组件click");
      }, []); // 无依赖项 只执行一次
      // 使用useMemo替换useCallback 无非就是返回一个函数而已 easy
      const propsChildClick = useMemo(() => {
        return () => {
          console.log("子组件click");
        };
      }, []);  
        
      return (
        <div>
          {count}
          <button
            onClick={() => {
              setCount(++count);
            }}
          >
            test
          </button>
          {/* <Child childClick={propsChildClick} /> */}
          {/* <Child title={test} /> */}
          <Child title={test} childClick={propsChildClick} />
        </div>
      );
    };
	特别注意：useMemo()、useCallback()均需要配合子组件使用React.memo包裹才有效果，不然只使用useMemo\useCallback是没有效果的，我个人习惯写法：
    const propsChild = useMemo(
        () => ({
            title: { a: "123" },
            childClick: () => {
                console.log("子组件click");
            }
        }),
        []
    );
	<Child {...propsChild} />
```

```jsx
2. 因此在写hooks中，我们不能盲目的去一味的写useMemo\useCallback因为虽然看起来有了缓存的表现，其实内部也每次进行了对比，产生了性能问题。因此正确的判断何时使用是很关键的：
	useCallback():
    	2.1 当传递给子组件是一个函数时，且需要对子组件进行性能优化时，即使用"useCallback包裹函数，且使用React.memo包裹子组件"
		2.2 当函数或者方法，是其他hooks的依赖项时，需要使用"useCallback包裹函数"，这样每次渲染不会产生新函数从而不会影响其他hooks的依赖项变化而执行回调
        
    useMemo():
    	2.1 当传递给子组件是一个引用类型（非基本类型）或函数，或组件时，且需要对子组件进行性能优化时，即使用"useMemo包裹，且使用React.memo包裹子组件"
		2.2 当需要作为其他hooks的依赖项时，针对非基本类型的数据，需要使用"useMemo包裹"
		2.3 需要进行大量或者复杂运算时，为了提高性能，可以使用"useMemo缓存"
```

#### 16.14源码解析

```jsx
1. 定义  
// mount阶段
  HooksDispatcherOnMountInDEV = {
    useCallback: function (callback, deps) {
      currentHookNameInDev = 'useCallback';
      //...
      return mountCallback(callback, deps);
    },
    //....
  };
  // update阶段
  HooksDispatcherOnUpdateInDEV = {
    useCallback: function (callback, deps) {
      currentHookNameInDev = 'useCallback';
      //....
      return updateCallback(callback, deps);
    },
  }

2. 初次渲染 mount阶段: mountCallback
// 入参：callback：内联函数， deps：依赖变更项
function mountCallback(callback, deps) {
  // 创建hook对象拼接在链表上
  var hook = mountWorkInProgressHook();
  // 获取更新依赖
  var nextDeps = deps === undefined ? null : deps;
  // 通过将传入函数和依赖存入memoizedState缓存中
  hook.memoizedState = [callback, nextDeps];
  // 返回callback
  return callback;
}
// 创建hook链表
function mountWorkInProgressHook() {
  var hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  if (workInProgressHook === null) {
    currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}

3. 更新阶段 updata阶段： updateMemo
function updateCallback(callback, deps) {
  // 也是创建对应的hook对象
  var hook = updateWorkInProgressHook();
  // 获取更新依赖
  var nextDeps = deps === undefined ? null : deps;
  // 获取上一次的数组值
  var prevState = hook.memoizedState;
  if (prevState !== null) {
    // 依赖不为空，则浅比较，无变化返回上一次的值
    if (nextDeps !== null) {
      var prevDeps = prevState[1];

      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  // 无上一次状态直接存入缓存
  hook.memoizedState = [callback, nextDeps];
  return callback;
}
// 浅比较
function areHookInputsEqual(nextDeps, prevDeps) {
  // ...
  for (var i = 0; i < prevDeps.length &amp;&amp; i < nextDeps.length; i++) {
    // Object.is()
    if (objectIs(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```

```jsx
从源码中我们可以分析得出：
	初次渲染 -> 创建hooks链表 -> 获取callback回调和deps依赖存入hook.memoizedState 中 -> 并返回传入的callback
	更新阶段 -> 获取当前的deps依赖和上次存在hook.memoizedState的依赖项 -> 若上次存在依赖项且当前依赖项存在 -> 则for循环使用Object.is前对比每个位置的依赖项是否相等 -> 若相等则直接返回上次缓存的callback -> 若无依赖项或者依赖项变化则将本次存入hook.memoizedState -> 返回新的callback

可以看出每次渲染，实际上React内部进行了上一个依赖跟当前依赖的对比，或者总返回新的callback，其中存在的计算过程，因此不能盲目使用。
```

