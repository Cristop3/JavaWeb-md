### 2021.09.08

了解Vue3新特性

```js
1. 组合式API ---- （类比React Hooks!!!）

	1.1	新增了setup配置选项 
    （在组件被创建之前，一旦props被解析，作为组合式API的入口）
    （此时data & computed & methods无法在setup中获取）
	（我们将 setup 返回的所有内容都暴露给组件的其余部分 (计算属性、方法、生命周期钩子等等) 以及组件的模板）
    
    1.2	setup
    （setup(props,context){}）|| 
        setup(props,{attrs,slots,emit})
    此处的第一个参数props它是响应式的，所以在setup内部我们不能直接使用es6解构，这样会消除prop的响应式
    所以，我们需要给props包裹一层toRef来进行解构，如
    const {test}=toRef(props)
    此处的第二个参数是个context对象 由三部分组成，有
    // Attribute (非响应式对象) context.attrs
    // 插槽（非响应式对象）context.slots
    // 触发事件（方法）context.emit
    针对attrs和slots他们会跟随组件本身更新而更新，避免对他们进行解构
    （setup返回的对象与模板的集合，此时可以在模板中直接使用，如props的值，返回对象的refs引用是被自动浅解包，可以不在模板中使用.value）
	（setup中this 不是该活跃实例的引用，它跟其他配置项中的含义不一样）
    
    1.3	生命周期
    在setup里面可操作的生命周期基本在选项式api的周期钩子函数前面加个'on'，而因为setup是围绕beforeCreate&created所以不需要定义他们

	1.4 provide/inject
	import {provide,inject} from 'vue'
	provide(name<String>,value)
	inject(name<String>,默认值)
	为了增加provide和inject之间的响应式，我们可以在provide值时使用ref或者reactive来让值变得响应式 如
    import {provide,inject,ref,reactive} from 'vue'
	此时我们需要尽可能将响应式属性修改控制在其定义的provide组件内部，若需要在inject组件对provide的值进行修改，此时也建议在provide的时候，声明一个修改方法，在inject组件内部调用，在provide里面改变。
    （最后，我们要确保provide传递下去的数据不被inject组件更改，建议对provide属性进行readonly包裹）
    import {readonly} from 'vue'

2. Teleport ---- （类比React Portal!!!）
	2.1	新增的内置组件<teleport>（提供了一种干净的方法，允许我们控制在 DOM 中哪个父节点下渲染了 HTML，而不必求助于全局状态或将其拆分为两个组件）
    2.2	接收两个prop（to<String> & disabled<Boolean>）
		to<String>（必须是有效的查询选择器或 HTMLElement (如果在浏览器环境中使用)。指定将在其中移动 <teleport> 内容的目标元素）
		disabled<Boolean>（这意味着其插槽内容将不会移动到任何位置，而是在你在周围父组件中指定了 <teleport> 的位置渲染）
	2.3	（多个 <teleport> 组件可以将其内容挂载到同一个目标元素。顺序将是一个简单的追加——稍后挂载将位于目标元素中较早的挂载之后。）

3. 片段 ---- （类比React.Fragments）
	
	3.1 可以在子组件中不再多包裹一层无用当前子组件的根元素

4. 触发组件选项
	
	4.1 等于说在vue2.x基础上多了一个叫做"emits"的配置项
    4.2	emits:['xxxEvent1','xxxEvent2']
	4.3	emits:{xxxEvent1:null,xxxEvent2:(...args)=>{return Boolean}} （跟Props基本一致 可以数组配置，也可以对象配置，同时也可以设置一个接收$emit调用的参数，并返回一个布尔值来指示当前事件是否有效）
    
5. 单文件组件组合式API语法糖<script setup>
    
6. 单文件组件状态驱动的css变量（style中的v-bind）
	
	6.1	在script中的变量值 可以与style样式中的css相关联

7. 针对SFC中的<style scoped>现在可以包括全局规则或只针对插槽内容的规则

	7.1	增加了:deep()作“深度”选择
    		 :slotted()作“插槽内容”选择
             :global()作“全局”选择

8. Suspense ---- （类比React.Suspense）
    	
```

```js
1.	新增一个全局API:createApp({})
	（之前2.x中的全局api 大多数变成3.x中的实例下的api）
	（变化最大的api就是之前我们常用的绑定到实例上的自定义数据 比如
     Vue.prototype.xxx 现在方式改为app.config.globalProperties）

2.	全局Api支持tree-shaking
	import {nextTick,reactive,version,compile,set,delete} from 'vue'

3.	组件上的v-model用法改变来替换v-bind.sync
	
	3.1	在自定义组件时，v-model的prop和事件默认名称改变
		prop:value -> modelValue
		event:input -> update:modelValue
    3.2	自定义同一个组件上现在可以使用多个v-model进行双向绑定
	3.3 增加自定义v-model修饰符

4.	<template>与v-for搭配使用时 在2.x我们的key不能设置在<template>上，现在3.x需要设置在<template>上

5. 2.x中 v-for优先级大于v-if 而3.x中v-if优先级大于v-for

6. v-on中的.native修饰符移除 因为在3.x中我们会在组件中通过emits选项显式声明出所有的事件监听器，若未声明，3.x会将他们作为原生事件监听器添加到子组件的根元素中

7. v-for中的ref数组不再由Vue来处理并通过$refs来获取 3.x中需要自己构建yourRefs数组通过函数来壮大自己的数组并在onBeforeUpdate中清空yourRefs数组
```

```js
1.	异步组件
	3.x中 import {defineAsyncComponent} from 'vue'
	defineAsyncComponent(() => import('xxx.vue'))
	defineAsyncComponent({
        loader:()=>import('xxx.vue')
        ,xxx:'xx'
    })

2.	destroyed生命周期 -> unmounted
	breforeDestroy生命周期 -> beforeUnmount
```

