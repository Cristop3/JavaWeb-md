### 2021.11.24

### 什么是AST

```js
AST 是一种源代码的抽象语法结构的树形表示。树中的每个节点都表示源代码中出现的一个构造。
```

### AST如何生成及流程

```js
1. 首先我们要清楚AST并不是唯一的，生成哪种AST是由哪种编译器（解析器）来决定的，比如在我们日常的前端开发中，使用最多的就是babel

2. 再者我们需要清楚使用AST流程
	2.1	解析（parse）
    	这个过程由编译器实现，会经过"词法分析过程和语法分析过程及语义分析"，从而生成AST
    2.2 遍历（traverse）
    	深度优先遍历AST，访问树上各个节点的信息
    2.3 转换（transform）
    	在遍历的过程中可对节点信息进行修改，生成新的AST
    2.4	输出（generate）
    	在初始AST进行转换后，根据不同的场景，既可以直接输出新的AST，也可以转译成新的代码块
```

### AST如何编译

```js
1. 词法分析（分词）
	将整个的代码字符串，分割成语法单元数组(token)。而这个单元是能解析的最小单元：
    1.1	"标识符"
		没有被括号括起来的连续字符，比如var let const return function等关键字
	1.2 "数字"
		十六进制，十进制，八进制以及科学表达式
    1.3 "运算符"
		+\-\*\/
	1.4 "注释"
	1.5 "空格"
	1.6 "标点符号"
	1.7	"关键字"
通过这词法分析后，会得到一个数组，里面包含了每个最小单元的词法对象说明。
而这部分主要由"词法分析器（lexical analyzer）"来扫描处理，分析器会逐个独取字符，按照对应编程语言规则和关键字，来切分为token数组，并区分出对应的token类型。

2. 语法分析
	2.1 这步也叫做syntactic analysis，根据某种特定的形式文法由单词序列构成输入文本进行分析并确定语法结构，例如：
    2.2 我们每种编程语言都有它自己的语法规则，如js中，使用if条件语句，使用var let const声明变量，使用function关键字标识函数等
    2.3 因此基于这种特定的规则，可以在这步分析代码所存在的语法问题，一般遇到该SyntaxError会在语法分析这步抛出来，中断整个编译过程
    2.4 在确认语法没问题后，编译器按照语法规则将扁平的token数组，组合成一个个声明语句节点、表达式节点，最终形成嵌套结构的语法树，很多多余的token被替换成节点类型说明对应代码的含义

3. 语义分析
	对于编程语言来说，语义分析一般有类型检查、作用域分析等等。 多数静态语言 如java、c等都会有这一步检查； javascript作为一种动态解释型语言，没有类型检查，在语法分析阶段一般能够获取完整的AST
```

### AST实际场景

#### babel转译ES5

```js
	1.1 使用编译器babylon -> AST
	1.2 使用babel-traverse plugin对AST进行深度优先遍历，遇到需要转换的，就直接在AST对象上对节点进行添加、更新以及移除操作 -> 新AST
	1.3 使用babel-generator将新的AST转换成es5代码
```

#### 实际：如何编写一个babel插件

```js
AST Explorer：在线 AST 转换工具，集成了多种语言和解析器
@babel/parser ：将 JS 代码解析成对应的 AST
@babel/traverse：对 AST 节点进行递归遍历
@babel/types：集成了一些快速生成、修改、删除 AST Node的方法
@babel/generator ：根据修改过后的 AST 生成新的 js 代码

babel在parse的过程中，提供了一个名为"访问者模式"，它是一个visitor对象，在该对象上定义了对各种类型节点的访问方法，这样就可以针对不同的节点做出不同的处理。例如，编写 Babel 插件其实就是在构造一个 visitor 实例来处理各个节点信息，从而生成想要的结果。

大概过程：
1. 
	ast = parse(code)
2. 
	const visitor = {
            CallExpression(path) {
            }
                FunctionDeclaration(path) {
                }   
        ImportDeclaration(path) {
        }
    }
3. 
	traverse.default(ast, visitor)
4. 
	const newCode = generator.default(ast, {}, code).code
```

#### Vue2.x模板编译

```js
	在之前看Vue2.x模板编译源码，就有看到一些关于ast的解析，生成，输出等操作。
	2.1	ast = parse(template.trim())
	这步主要针对我们.vue中的<template>标签进行字符串话，然后通过vue自定的解析规则，比如使用正则匹配开始标签，结束标签，文本，注释等等操作得到初始AST
	2.2	if (options.optimize !== false) {
    optimize(ast, options);
  }
	这步主要是针对模板中的静态节点进行标记，并不是所有数据都是响应式的，方便后面更新视图触发diff时更好的对比，它会对整个AST树中的每个AST元素标记static和staticRoot标记为false或者true
    2.3 var code = generate(ast, options);
	基于上面的优化后的ast生成render函数，进行一系列如v-for v-if template component等模板语法转换成_c、_s、_l等方法函数，且在最后返回一个使用with语法块包裹的code字符串'with(this){return ' + code + '}'
```

#### webpack清除死代码或者环境变量注入

```js
同理也是通过AST解析过程中，删除指定的代码比如console\注释等以及我们经常使用process.env.NODE_ENV根据环境的不同得到的值不同
```

#### 小程序等跨端框架

```js
也是基于AST将同一份代码编译成不同的端适宜的代码
```