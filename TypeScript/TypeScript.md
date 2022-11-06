## 2022.11.05

#### TS基础类型

```tsx
// boolean类型
const hasDone: boolean = false

// number类型
const num: number = 123

// string类型
const str: string = "string"

// Symbol类型
const sym = Symbol()
const obj = {
    [sym]: "symbol"
}

// Array类型
const arr: number[] = [1,2,3,4]
const arrT: Array<number> = [1,2,3,4] // 泛型number数组
const arrR: ReadonlyArray<number> = [1,2,3,4] // 只读的number类型数组

// enum类型
enum ColorType{
    Red, // 0
    Green, // 1
    Yellow // 2
}
1. 默认值
const ct: ColorType = ColorType.Red // 0
默认情况下，Red初始值为【0】，其余走【1】自动增长

2. 设置初始值
若设置Red初始值为【5】，则其余走【6】开始
enum ColorType{
    Red = 5, 
    Green, // 6
    Yellow // 7
}
const ct: ColorType = ColorType.Yellow // 7

1\2数字枚举情况下，支持【值访问成员名】【名访问成员值】
const value = ColorType[0] // Red
const value = ColorType["Red"] // 0

3. 字符串枚举值 (每个成员都必须⽤字符串字⾯量)
enum ColorType{
    Red = "Red", 
    Green = "Green", 
    Yellow = "Yellow" 
}
const ct: ColorType = ColorType.v // Green

4. 常量枚举
const enum ColorType{
    RED,
    GREEN,
    YELLOW
}
let x:ColorType = ColorType.GREEN // 1

5. 异构枚举 （数字和字符串得混合）
enum Enum{
    A,
    B,
    C = "1",
    D = "D",
    E = 9,
    F
}
const x:Enum = Enum.B // 1
const x:Enum = Enum.C // "1"
const x:Enum = Enum.F // 10
const x:Enum = Enum[0] // A

// any类型 (任何类型都可以被归为 any 类型)
const anyway: any = 1 // number
anyway = "1" // string
anyway = true // boolean

// unknown类型（任何类型都可以被归为 unknown 类型）
const unknownway: unknown = 1
unknownway = "1" // string
unknownway = true // boolean

// any与unknown区别
any类型可赋值给任意类型，而unknown类型只能赋值给any类型和自己;
any类型可执行任意操作，而unknown不行
const x:string = anyway
const x:number = anyway
x.obj.a

const y:any = unknownway
const y:unknown = unknownway
const y:string = unknownway // error
y.obj.a // error

// tuple类型
工作方式类似于数组，可定义具有有限数量得未命名属性的类型，每个属性都关联一个类型。而在TS中的数组是由同种类型的值组成。
let x:[string,number,boolean]
x = ["1",1,true]
需赋值每个位置属性相同的类型，且个数一致

// void类型
void类型与any类型相反，表示没有任何类型，一般多用于函数返回类型定义
function x():void{
    console.log("void")
}

// null类型与undefined类型
const x: undefined = undefined
const x: null = null

// object类型
表示非原始类型 如{} \ []
const x:object = {}
const y:object = []

// Object类型
表示所有Object类的实例的类型，在js中所有引用类型的顶层对象都是Object
const z:Object = {}
const w:Object = []

// {}类型
表示一个没有成员变量的对象，若访问对象任意属性，会报错
const obj = {}
obj.x = 1 // Property 'x' does not exist on type '{}'.

// never类型
表示永不存在的值的类型，一般用于"抛出异常"、"while循环函数"
function x():never{ // 此处never类型写不写都可，ts会自动推到出是never类型
    while(true){}
}
const x = () => { throw new Error("never") } // const x: () => never
```

#### TS断言

```tsx
1. 类型断言
    1.1 自己很清楚此时应该使用某个更确切的类型
    1.2 类似Java中的强制类型转换

    // 写法
    const x: any = "1111"
    const xL: number = (x as string).length

    // 尖括号写法
    const x: any = "1111"
    // const xl: number = (<string>x).length;
               
2. 非空断言
	使用【!】后缀表达式操作符来断言操作的对象是非undefined和非null的，多用于带联合类型包括有undefined或null时，确定真实类型
    const x: string | undefined = undefined
    const y: string = x // 直接将undefiend赋值会 Type 'undefined' is not assignable to type 'string'
    const y：string = x! // 排除undefined
          
3. 确定赋值断言
	允许在实例属性和变量声明后面放置一个[!]操作符，告诉TS该属性或变量会被明确的赋值
    // let x:number;
    let x!:number;  // 添加!后 正确使用  
    init()
    console.log(x) // Error
    function init(){
        x = 1
    }
	在ts中，会报 Variable 'x' is used before being assigned，按道理说走init方法会肯定赋值，因此需要确定赋值断言
```

#### TS类型守卫

```tsx
类型保护是可执⾏运⾏时检查的⼀种表达式，⽤于确保该类型在⼀定的范围内,其主要思想是尝试检测属性、⽅法或原型，以确定如何处理值。

1. in
2. typeof
3. instanceof
4. 自定义类型谓词
```

#### TS联合类型和类型别名

```tsx
1. 联合类型
使用[ | ]来使用多种类型中任意一个即可，通常与null、undefined一起使用
let x: string | number | undefined = 1
x = "2"

// 字面量类型，来约束取值只能是某几个值中一个   
const colorType: 'red' | 'yellow' = 'red'
const whichWay: 1 | 2 = 2
   
2. 可辨识联合类型
多用于多组类型在联合时，每组类型中含相同属性的定义
   
3. 类型别名
type colorType = string | number
let c:colorType = "red"
let c:colorType = 1
```

#### TS交叉类型

```tsx
通过&运算符，将多个类型合并为一个类型
type colorType = {x:number} & {y:string}
const c:colorType = {x:1,y:'red'}

1. 同名基础类型属性的合并
合并完成后，同名属性的类型将变成never
2. 同名非基础类型属性的合并
合并完成后，可使用合并类型
```

#### TS接口及与类型别名区别

```tsx
在TS中，接口除了对类的一部分行为进行抽象外（Java中的接口常用操作方式），也常用对对象的形状进行描述

1. 针对一组对象进行描述
interface User{
    username:string;
    password:string;
}

2. 可选、只读、任意属性
interface User{
    username?: string; // 可选
    readonly password: string // 只读
    [propName:string]: any // 任意属性
}

3. 与类型别名区别
	3.1 均可定义为描述对象的形状或者函数签名 // 同
    
     3.2 但类型别名可以用于定义其他类型 // type alias 不同
     	type color = string

	    type x = {x:string}
		type y = {y:number}
		type xy = x | y

		type tupleColor = [string,number]

	3.3 相互继承
    	interface extends interface
	    type alias extends type alias
		interface extends type alias
		type alias extends interface

	3.4 实现
		class implements interface
		class implements type alias // 但只能是单类型别名，不支持联合类型的实现

	3.5 自动合并 // interface 不同
		接口可定义多次，相同的接口会被合并为单个接口
```

#### TS各种符号

```tsx
1. 非空断言操作符 -》 !
2. 可选链运算符 -》 ?.
3. 空值合并运算符 -》 ??
4. 可选属性 -》 ?:
5. 交叉类型 -》 &
6. 联合类型 -》 |
7. 数字分隔符 -》 _
8. 装饰符 -》 @XXX
9. 私有字段 -》 #XXX
```

#### tsconfig.json

```tsx
1. 作用
	⽤于标识 TypeScript 项⽬的根路径；
    ⽤于配置 TypeScript 编译器；
    ⽤于指定编译的⽂件
    
2. 个别字段
	files - 设置要编译的⽂件的名称
	include - 设置需要进⾏编译的⽂件，⽀持路径模式匹配
	exclude - 设置⽆需进⾏编译的⽂件，⽀持路径模式匹配
	compilerOptions - 设置与编译流程相关的选项

3. compilerOptions配置说明
    {
        "compilerOptions": {
            /* 基本选项 */
            "target": "es5", // 指定 ECMAScript ⽬标版本: 'ES3'(default),'ES5','ES6' / 'ES2015','ES2016','ES2017',or 'ESNEXT'
            "module": "commonjs", // 指定使⽤模块: 'commonjs', 'amd','system','umd' or 'es2015'
            "lib": [], // 指定要包含在编译中的库⽂件
            "allowJs": true, // 允许编译 javascript ⽂件
            "checkJs": true, // 报告 javascript ⽂件中的错误
            "jsx": "preserve", // 指定 jsx 代码的⽣成: 'preserve','react-native',or 'react'
            "declaration": true, // ⽣成相应的 '.d.ts' ⽂件
            "sourceMap": true, // ⽣成相应的 '.map' ⽂件
            "outFile": "./", // 将输出⽂件合并为⼀个⽂件
            "outDir": "./", // 指定输出⽬录
            "rootDir": "./", // ⽤来控制输出⽬录结构 --outDir.
            "removeComments": true, // 删除编译后的所有的注释
            "noEmit": true, // 不⽣成输出⽂件
            "importHelpers": true, // 从 tslib 导⼊辅助⼯具函数
            "isolatedModules": true, // 将每个⽂件做为单独的模块 （与'ts.transpileModule'类似）.

            /* 严格的类型检查选项 */
            "strict": true, // 启⽤所有严格类型检查选项
            "noImplicitAny": true, // 在表达式和声明上有隐含的 any类型时报错
            "strictNullChecks": true, // 启⽤严格的 null 检查
            "noImplicitThis": true, // 当 this 表达式值为 any 类型的时候，⽣成⼀ 个错误 "alwaysStrict": true, // 以严格模式检查每个模块，并在每个⽂件⾥加⼊'use strict'

            /* 额外的检查 */
            "noUnusedLocals": true, // 有未使⽤的变量时，抛出错误
            "noUnusedParameters": true, // 有未使⽤的参数时，抛出错误
            "noImplicitReturns": true, // 并不是所有函数⾥的代码都有返回值时，抛出错误 "noFallthroughCasesInSwitch": true, // 报告 switch 语句的 fallthrough 错误。（ 即， 不允许switch 的case 语句贯穿）

            /* 模块解析选项 */
            "moduleResolution": "node", // 选择模块解析策略： 'node' (Node.js) or 'classic' (TypeScript pre - 1.6)
            "baseUrl": "./", // ⽤于解析⾮相对模块名称的基⽬录
            "paths": {}, // 模块名到基于 baseUrl 的路径映射的列表
            "rootDirs": [], // 根⽂件夹列表，其组合内容表示项⽬运⾏时的结构内容 "typeRoots": [], // 包含类型声明的⽂件列表
            "types": [], // 需要包含的类型声明⽂件名列表
            "allowSyntheticDefaultImports": true, // 允许从没有设置默认导出的模块中默认导⼊。

            /* Source Map Options */
            "sourceRoot": "./", // 指定调试器应该找到 TypeScript ⽂件⽽不是源⽂ 件的位置 
            "mapRoot": "./", // 指定调试器应该找到映射⽂件⽽不是⽣成⽂件的位置 
            "inlineSourceMap": true, // ⽣成单个 soucemaps ⽂件，⽽不是将sourcemaps⽣ 成不同的⽂ 件 
            "inlineSources": true, // 将代码与 sourcemaps ⽣成到⼀个⽂件中， 要求同时设置了--inlineSourceMap 或--sourceMap 属性

            /* 其他选项 */
            "experimentalDecorators": true, // 启⽤装饰器
            "emitDecoratorMetadata": true // 为装饰器提供元数据的⽀持
        }
    }
```

