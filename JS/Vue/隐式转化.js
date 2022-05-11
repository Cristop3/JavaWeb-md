const { array } = require("js-md5")

基本类型（原始类型）：
  1. String,Number,Boolean,null,undefined,Symbol,BigInt
  2. 是指存放在栈内存中的简单数据段，数据大小确定，内存空间大小可以分配，它们是直接按值存放的，
  所以可以直接按值访问。

引用类型：
  1. Array,Function,Date,RegExp等等
  2. 其“变量名”保存在“栈内存”中，其真实值保存在“堆内存”中 而栈中的值保存的是指向“堆内存”的地址
  也就是“指针”   

typeof:
  1. 针对后面的表达式 取其类型
  2. 除null 其他很容易得到类型的字符串说明
    2.1 typeof 1 // 'number'
    2.2 typeof '1' // 'string'
    2.3 typeof true // 'boolean'
    2.4 typeof undefined // 'undefined'
    2.5 typeof Symbol() // 'symbol'
    2.6 typeof [] // 'object'
    2.7 typeof {} // 'object'
    2.8 typeof console.log // 'function'
    2.9 typeof null // 'object'
  3. 缺点就是不好区分值为'object'的真实类型
  4. 除 Function 外的所有构造函数的类型都是 'object' 如 typeof new String('') // 'object' 
  5. 注意取的值均为“小写的字符串类型”
  
instanceof:
  1. 用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。
  2. object（某个实例对象） instanceof constructor （某个构造函数） 
    2.1 ({}) instanceof Object // true
    2.2 new Date() instanceof Date // true
    2.3 new String('') instanceof String // true
    2.4 console.log instanceof Function // true
    2.5 new Number(0) instanceof Number // true

最直接取类型操作：
    Object.prototype.toString.call(xxx)  &&  Object.prototype.toString.call(xxx).slice(8,-1)
    1. Object.prototype.toString.call('123') -> "[object String]" -> "String"
    2. Object.prototype.toString.call(123) -> "[object Number]" -> 'Number'
    3. Object.prototype.toString.call(true) -> "[object Boolean]" -> 'Boolean'
    4. Object.prototype.toString.call(null) -> "[object Null]" -> 'Null'
    5. Object.prototype.toString.call(undefined) -> "[object Undefined]" -> 'Undefined'
    6. Object.prototype.toString.call(Symbol()) -> "[object Symbol]" -> 'Symbol'
    7. Object.prototype.toString.call(console.log) -> "[object Function]" -> 'Function'
    8. Object.prototype.toString.call({}) -> "[object Object]" -> 'Object'
    9. Object.prototype.toString.call([]) -> "[object Array]" -> 'Array'
    10. Object.prototype.toString.call(new Date()) -> "[object Date]" -> 'Date'
    11. Object.prototype.toString.call(Math) -> "[object Math]" -> 'Math'
    12. Object.prototype.toString.call(Math.abs) -> "[object Function]" -> 'Function'
    13. Object.prototype.toString.call(Math.abs()) -> "[object Number]" -> 'Number'

常见的隐式转化分析：

一. 比较运算符 > < >= <=
1. 两边都是“数字类型” 则直接比较大小
2. 若含有“非数字类型” 则会将“非数字类型”转化成“数字类型”再比较大小
3. 若两则均为“字符串类型” 则不会转化为数字 相反会比较字符的“Unicode编码大小”


二. 其他类型转化为Boolean类型
1. 只有“null”,"undefined","0","false","NaN","空字符串"这6种情况转化布尔值为false
2. 除上面的6种情况 其余均为true

三. 其他类型转化为Number类型
1. null: 转化为0
2. undefined: 转化为NaN
3. Boolean: true转为1，false转为0
4. String: 纯数字字符串转化为对应的数字，空字符串转化为0，其余情况则为NaN；
5. Array: []转化为0；[0]转为0，[2]转为2；['a']转为NaN
6. Object: 首先会调用对象的valueOf()方法若返回原始类型则返回若返回非原始类型则继续调用toString()
           方法，若为原始类型则返回 否则报错；
           {}转为NaN；{x:1}也转化为NaN;{valueOf(){return 1}}转为1

四. 对象转为其他类型（原始类型）
1. 当对象转为其他原始类型时，会先调用对象的valueOf()方法，
   如果valueOf()方法返回的是原始类型，则直接返回这个原始类型；

2. 如果valueOf()方法返回的是不是原始类型或者valueOf()方法不存在，
   则继续调用对象的toString()方法，如果toString()方法返回的是原始类型，
   则直接返回这个原始类型,如果不是原始类型，则直接报错抛出异常。

3. 对于不同类型的对象来说，转为原始类型的规则有所不同，比如Date对象会先调用toString。

五. 宽松相等（==）的隐式转换
1. “字符串”与“数字”类型比较时：（字符串类型转化为数字类型）
  1.1 纯数字字符串 -> 数字类型
  1.2 空字符串 -> 0
  1.3 其余情况则 -> NaN

2. “布尔”与其他类型比较时：（布尔类型转化为数字类型）
  2.1 true -> 1
  2.2 false -> 0

3. null类型与undefined类型与其他类型比较：
  3.1 null == null (true)
  3.2 undefined == undefined (true)
  3.3 null == undefined (true)
  3.4 null === undefined (false)
  3.5 其他类型与null&undefined比较情况均为false

4. 对象与原始类型比较：
  4.1 对象与原始类型相比较时，会把对象按照对象转换规则转换成原始类型，再比较。
  4.2 {} == 0 // false ({}->valueOf()->{}->toString()->"[object,object]"->NaN)
  4.3 {} == "[object,object]" // true
  4.4 [] == false // true ([]->valueOf()->[]->toString()->""->false转0->""转0即相等)
  4.5 [1,2,3] == '1,2,3' // true ([1,2,3]->valueOf()->[1,2,3]->toString()->"1,2,3"即相等)

5. 对象与对象比较：
  5.1 俩个对象指向同一个对象，相等操作符返回true，否则返回false
  5.2 var a = {};var b = {}; a == b; // false
  5.3 var a = {};var b = a; a == b // true
  5.4 var a = [];var b = []; a == b // false
  5.5 [] == ![] // true （![] -> Boolean([]) -> !true -> 即[] == false比较 -> []转化为
      原始类型 -> valueOf() -> [] -> toString() -> "" -> 即"" == false -> "" == 0 -> 0 == 0）
  5.6 {} == !{} // false （!{} -> Boolean({}) -> !true -> 即{} == false -> {}转化为
      原始类型 -> valueOf() -> {} -> toString() -> "[object,object] -> 即
      "[object,object]" == false -> "[object,object]" == 0 -> NaN == 0）   

六. 字符串连接符与加号运算符
1. 看作字符串连接符情况：
  1.1 任意一边为“字符串类型” -> 字符串拼接
  1.2 任意一边为“对象类型” -> 将对象转化为可取得的原始值后进行字符串拼接

2. 看作加号运算符情况：
  2.1 两边均为数字类型 -> 正常加操作
  2.2 Boolean,Number,null,undefined，(除开String)均转化为Number类型后（但是需要注意
  Number(undefined) == NaN 而Number(null) == 0） -> 正常加操作
  2.3 NaN与任何类型相加均为NaN 包括它自己  
  2.4 [] + {} -> （[]转化为原始类型为""空字符串 而{}转化为原始类型为"[object,object]"） -> "[object,object]"
  2.5 {} + [] -> （js解释器会将开头的 {} 看作一个代码块 即+[]）->  +"" -> +0 -> 0
