### 基本理论

```
1. JDK LTS（官方长期支持版本）
	JDK8\JDK11\JDK17
	
2. Java和Javac工具
windows下一般为Java.exe和Javac.exe
其中Java.exe为“执行工具”
   Javac.exe为“编译工具”
   一般情况下，在我们编写了Xxx.java源码后，使用Javac来编译该代码，然后使用Java来执行该代码。

3. 常用命令行
	盘符：切换某个盘下  直接敲“D:”或者“F:”
	dir: 查看当前路径下的文件信息
	cd: 进入单级目录： cd test
		进入多级目录： cd test\day1
		回退到上一级目录：cd..
		回退到盘符根目录：cd\
	cls：清屏

4. 编程语言
	4.1 机器语言：最底层都是由0和1来组成的机器能够识别的代码
	4.2 汇编语言：由机器语言演变出由英文字母编程的语言
	4.3 高级语言：使用接近人类自己的语言书写，翻译器再将其翻译成计算机能理解的机器指令
	
5. JDK组成
	5.1 JVM(Java Virtual Machine)：Java虚拟机，真正运行Java程序的地方
    5.2 核心类库：Java自己写好的程序，给程序员自己的程序调用。比如System.out方法
    
    "JVM"与"核心类库"并称为"JRE"(Java Runtime Environment)：Java的运行环境
    5.3 开发工具：
    	比如之前提到的"Java"和"Javac"等等
   	
   	JVM、核心类库、开发工具这三者组合成了我们的JDK
   	
   	比如我们写了一个HelloWorld.java文件，它是如何在JDK的帮助下最终执行的：
   	1. HelloWorld.java ->
   	2. 调用开发工具Javac来编译它 -> HelloWorld.class
   	3. 由JVM来运行该文件 ->
   	4. 在核心类库中调用源码中使用了的"System.out"
    
6. 如何跨平台
	感觉现在市面上的跨平台无非就是总公司针对不同的平台写了不同版本的运行器；
	比如Java 会分别写window版本JVM虚拟机、Linux版本JVM虚拟机、MacOS版本JVM虚拟机
```

### 开发坏境

```
1. Path环境变量（用于记住程序路径、方便在命令行窗口的任意目录启动程序）
	1.1 比如：我们经常在window下的cmd中输入某个命令后，窗口会显示“XXX 不是内部或外部命令、也不是可运行的程序或批处理文件”。
	当输入XXX命令后，计算机会在当前的路径下找该命令，若没有找到，它会到我们配置的Path环境变量中查找，都不存在则直接报错！
	1.2 一般在环境变量中存在两个Path变量设置项，一个针对用户，一个针对系统，就是两者的权限不一样而已。
	1.3 如何配置
		一般找到你需要执行的程序的bin文件路径，添加进去就行了
		
	1.4 新版本的JDK在安装的时候会自动配置javac,java等程序的路径到path环境变量中去，但是老版本的JDK可能是没有自动配置，比如我们安装了JDK17后，在系统环境变量中会发现这样的路径“C:\Program Files\Common Files\Oracle\Java\javapath”	进入路径会发现存在4个执行命令“java.exe”、“javac.exe”、“javaw.exe”、“jshell.exe”
	
	1.5 一般需要自己重新配置一下，把之前默认的配置删掉，然后找到你JDK的安装目录的bin目录，因为所有的可执行Java文件都在bin文件夹中，自己手动配置的Path中

2. JAVA_HOME环境变量配置（告诉计算机JDK安装在哪个位置，将来其他技术通过这个环境变量找JDK）
	JAVA_HOME D:\codeSoft\Java\jdk-17.0.1
	这样配置后的好处时，我们也将Path中的bin路径替换成"%JAVA_HOME%\bin"这样比如我们想切换JDK版本，那么只需要更改JAVA_HOME路径即可
```



### 基础语法

```java
此处记录的是跟JS语法上有区别的地方
    
1. 字面量
    1.1 字符
    	程序中必须使用“单引号”，有且仅能有一个字符。比如：'A','0'
    1.2 字符串
    	程序中必须使用“双引号”，内容可有可无

2. 变量
    数据类型 变量名称 = 初始值
    变量先声明再使用；
    什么类型变量存储什么类型的数据；
    变量存在访问范围，同一个范围变量名不能重复；
    变量定义时可以没有初始化值，但是在使用的时候必须有初始值。
   
   变量底层存储
3. 二进制 （只有0和1，按照逢2进1的方式表示数据）   
    3.1 十进制转二进制的方法
    	"除2取余法"
    3.2 二进制转十进制的方法
    	比如：1   1   0   1
			 2^3 2^2 2^1 2^0
    		 8   4   2   1
    		1*8 + 1*4 + 0*2 + 1*1 = 13
    	总结起来就是："从右到左 每位以2的按顺序次方 乘以对应每位0 1的和"
    
    3.3 八进制（每3位二进制作为一个单元，最小数是0，最大数是7，共8个数字）
    比如：
    97(十进制) -> 01100001(二进制) -> 01 100 001
    								1	4	1 
    								141(八进制)
    3.4 十六进制（每4位二进制作为一个单元，最小数是0，最大数是15，共16个数字，依次用0~9 A B C D E F代表）
    比如：
    97(十进制) -> 01100001(二进制) -> 0110 0001
    								6	1
    								61（十六进制）
    
    3.5 java支持书写以上3者
    	二进制：'0B'或者'0b'
    	八进制：'0'
    	十六进制：'0X'或者'0x'
    
4. 数据最小单位
    "计算机最小的组成单元是"：使用8个二进制位为一组，来保存数据，称之为"一个字节(byte,简称B)"，如整型6:
	二进制：110
    底层：0000 0110（8位一组）
    其中的每个二进制位称之为"一位(bit,简称b)"，1byte = 8bit（1B=8b）

5. ASCII    
   字符在计算机中是如何存储的，可以利用ASCII码（美国信息交换标准编码，规定了现代英语，数字字符，和其他西欧字符对应的数字编号）例如: char ch = 'a'；a对应97 再对应到二进制01存储。
        
```

### 数据类型

```java
1. 基本数据类型（4大类8种）
    1.1 整数
    	1.1.1 "byte"
    			内存占用(字节数) - "1"
    			（取值范围：-128~127）因为1个字节占8位，最大能表示2^8=256 因此-128到127=255再加上个0=256
    	1.1.2 "short"
    			内存占用(字节数) - "2"
    			（取值范围：-32768~32767）同理2个字节占16位，最大能表示2^16=65536因此-32768~32767=65535再加上个0=65536
    	1.1.3 "int"(默认)
    			内存占用(字节数) - "4"
    			（取值范围：推理同上）
    	1.1.4 "long"
    			内存占用(字节数) - "8"
    		  "随便一个整数字面量默认为int类型，当想表示long类型时，需要在后面加 L/l来表示" 如：
    			long lg = 1231231231L
    
    1.2 浮点数（小数）
    	1.2.1 "float"
    			内存占用(字节数) - "4"
    			"随便一个小数字面量默认为double类型，当想表示float类型时，需要在后面加 F/f来表示" 如：
    			float ft = 99.33F
    	1.2.2 "double"(默认)
    			内存占用(字节数) - "8"
    
    1.3 字符
    	1.3.1 "char"
    			内存占用(字节数) - "2"
    			（取值范围：0~65535）
    
    1.4 布尔
    	1.4.1 "boolean"
    			内存占用(字节数) - "1"

2. 引用数据类型（除基本数据类型之外）
```

### 类型转换

```java
1. 自动类型转换
    "类型范围小"的变量，可以直接赋值给"类型范围大"的变量，如byte赋值给int
    byte -> short -> int -> long -> float -> double
   	其中特别需要注意char类型只能赋值给int类型
    
2. 表达式的自动类型转换
    在表达式中，小范围类型的变量会自动转换为当前较大范围的类型再运算
    "byte\short\char" -> int -> long -> float -> double
    表达式的最终结果类型由表达式中的最高类型决定；
    其中byte\short\char是直接转换成int类型参与运算（主要就是防止单个字面量未超限，计算过后超限，因此直接int）。

3. 强制类型转换
    首先，类型范围大的数据或者变量，不能直接赋值给类型范围小的变量，会报错；
    但是，可以强行将类型范围大的变量、数据赋值给类型范围小的变量。如：
    数据类型 变量A = (数据类型)变量B\数据
    int A = 10;
	byte B = (byte)A;

	需要注意：
        强制类型转换"可能造成数据(丢失)溢出"；
        浮点型强制转换成整型，"直接丢掉小数部分，保留整数部分返回"
```

### 运算符

```java
1. "+"
    1.1 与字符串做+运算时会被当作连接符，其结果还是字符串
    1.2 能算则算，不能算就在一起
    其中很容易出错的就是char类型的字符，如
    int a = 10;
	a+'a' // 这里表达式中首先char会转int即97+10 = 107

2. "自增自减"
   2.1 单独使用时 前++后++或者前--或者后-- 都一样
   2.2 当含有其他操作时
        放在变量前面，则先对其+1/-1 再赋值
        int a = 12;
		int b = ++a; // 这里b = 13 a = 13
		放在变量后面，则先赋值，再对其自身处理
        int a = 12;
		int b = a++; // 这里b = 12 a = 13

3. "逻辑运算符"
    可以把多个条件的布尔结果放在一起运算，最终返回一个布尔结果。
    3.1 "&" (逻辑与) 都true才true，任意false则false
    3.2 "|" (逻辑或) 任意true则true，否则false
    3.3 "!" (逻辑非) !true=false，!false=true
    3.4 "^" (逻辑异或) 都true都false则false,true/false则为true
    
    3.5 "&&"(短路与) 结果同"&"一致，但左边是false，右边则不执行
    3.6 "||"(短路或) 结果同"|"一致，但左边是true，右边则不执行
    注意：逻辑与、逻辑或无论左边是false还是true，右边均要执行
```

### 流程控制

```java
1. switch分支注意事项：
    1.1 表达式类型只能是"byte"\"short"\"int"\"char",jdk5开始支持枚举，jdk7开始支持String，但不支持"double\float\long"
    1.2 case给出的值不允许重复，且只能是字面量，不能是变量
    1.3 要写break;否则会出现穿透现象（但需要根据实际情况来决定）
```

### 数组

```java
尽量梳理与JS的不同

0. 实例
    js: Array
    java: Arrays
    
1. 声明
    int[] a = new int[]{1,2,3,4};
	int a[] = new int[]{1,2,3,4};
	int[] b = {1,2,3,4};
	js中使用"中括号"：const a = [1,2,3,4]
2. 打印数组
    js：
    const a = [1,2,3]
    console.log(a)
    java：
    int[] a = {1,2,3};
	System.out.println(Arrays.toString(a))
    System.out.println(a) // 直接打印会得到该数组的堆头编码
3. 遍历
   for循环遍历都差不多；
   foreach遍历
      	js:
		a.forEach(item => console.log(item))
        java:
		for(int item: a){
            System.out.println(item)
        }
4. 拷贝
    js:
	const b = a.slice()
    java:
	int[] b = Arrays.copyOf(a,a.length);

5. 超界
    js:
	const a = [1,2,3] // length:3
    a[3] = 4 // 不报错，解释器会同时修改a的length,让其改变
    java:
	int[] a = {1,2,3};
	a[3] = 4; // 能编译，但是使用会报"array index out of bounds"异常

等等不同，最直观的就是声明方式，具体可以查看
js-MDN: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array
java-java11: https://www.apiref.com/java11-zh/java.base/java/util/Arrays.html#sort(byte%5B%5D)
```

### 字符串

```java
1. api
    单纯从api的个别方法上来说，js,java同时都提供了作用差不多的api,如：codeAt()\concat()\indexOf()\lastIndexOf()\startWith()\endsWidth()\substring() 等等
    说到substring()，这里需要提一嘴，在JS中还存在一个叫"substr"的方法，但是MDN上已经不建议使用。

2. 声明
    两者中都有字符串字面量和对象声明 两种方式
    js:
	const a = '123'
    const b = new String('1231')
    java:
	String a = "123";
	String b = new String("123");
	
3. 原理(不可变性)
    java中的String东西有点烫：
    String a = "123"; // a(符号引用) "123"(字面量)
	"编译期"
	当我们写下这代码后，：JVM为了提高性能和减少内存开销，在实例化字符串常量的时候进行了一些优化。为了减少在JVM中创建的字符串的数量，字符串类维护了一个字符串常量池。
    因此：在JVM运行时区域的方法区中，有一块区域是运行时常量池，主要用来存储"编译期"生成的各种“字面量”和“符号引用”。
    String b = new String("123");
	"运行期"
    首先会去"字符串常量池"中查找是否存在相同的字符串123，若有的话，则会在java的堆上面创建b来指向常量池，若没有则会先在常量池中创建123，再创建b指向，因此：    String b = new String("123") 创建了几个对象，是看是否在字符两常量池存在该值，若有：则只创建一个对象创建1次，若没有则创建2次。
     
    String a = "123";    
	String b = new String("123");
	String c = new String("123").intern();
	a是指向"字符串常量池"
    b是指向"堆上b",其再指向"字符串常量池"
    intern()，方法会先查看"常量池"中是否有"123",若有则指向"常量池"，若无则创建。
    因此：
        System.out.println(a == c) // true
        System.out.println(a == b) // false 引用不同
        System.out.println(a.equals(b)) // true 比较字面量都是123
        System.out.println(b == c) // false // 存在常量池123 则跟字面量创建方式相同
        
        String d = new String("1234");
		String e = new String("1234").intern();
		System.out.println(d == e) // false 同理 e指向常量池 而d指向堆
        System.out.println(d.equals(e)) // true 同样比较字面量    

4. 字符串拼接
   js:
	相对来说js中字符串拼接相对简单，
        使用"+"连接符或者
        `i am string ${xxx}`或者
        调用concat()方法，从MDN上得知，不推荐都使用该方式。
   java:
	4.1 "+"拼接符
        结论：
        	普通情况下可以使用；
        	循环中不建议使用。
        原理：
        	底层"+"其实是StringBuilder.append()来实现的，若在循环中，则会一直new StringBuilder()，导致不必要的内存消耗，性能不行。
        
    4.2 concat()
        原理：
        	创建一个字符数组，长度是已有字符串长度和待拼接字符串长度之和，再使用Arrays.copyOf拷贝到字符数组，再通过new String()返回。
        
    4.3 StringBuffer类（append\insert）
    4.4 StringBuilder类（append\insert）
        原理：
        	两者内部封装了字符数组，但与String类不同的时，它不是final的，所以通常使用该两者来进行灵活的字符拼接，可以随时修改，而String是不可变性。
        	StringBuffer是线程安全，而StringBuilder不是线程安全。
        
    4.5 StringUtils.join类（开源库）
    4.6 StringJoiner类
        原理：
        	该两者内部都是经过StringBuiler的封装
  
  日常开发，如何选择：
  	"简单的字符串拼接，直接考虑'+'操作符";
	"循环中，考虑使用StringBuilder或者StringBuffer";
	"通过一个List进行字符串拼接，考虑StringJoiner"。
```

