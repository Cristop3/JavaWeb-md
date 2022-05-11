## 2021.12.20

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

    1.4 新版本的JDK在安装的时候会自动配置javac,java等程序的路径到path环境变量中去，但是老版本的JDK可能是没有自动配置，比如我们安装了JDK17后，在系统环境变量中会发现这样的路径“C:\Program Files\Common Files\Oracle\Java\javapath”    进入路径会发现存在4个执行命令“java.exe”、“javac.exe”、“javaw.exe”、“jshell.exe”

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
                                    1    4    1 
                                    141(八进制)
    3.4 十六进制（每4位二进制作为一个单元，最小数是0，最大数是15，共16个数字，依次用0~9 A B C D E F代表）
    比如：
    97(十进制) -> 01100001(二进制) -> 0110 0001
                                    6    1
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
        1.2.1 "float" （单精度）
                内存占用(字节数) - "4"
                "随便一个小数字面量默认为double类型，当想表示float类型时，需要在后面加 F/f来表示" 如：
                float ft = 99.33F
        1.2.2 "double"(默认) （双精度）
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

#### 字符串转换为基本数据类型

```java
Java中得字符串String属于一个类，所以它是引用数据类型，因为在引用数据中，只存在String与基本数据类型的互转。

String 转 int
String str = "123456";

1. Integer.parseInt(str)
    int str = Integer.parseInt(str);
    "直接调用基本数据对应包装类中的静态方法"

2. Integer.valueOf(str).intValue()
    int str = Integer.valueOf(str).intValue()
    "次方法运用了包装类的拆装箱操作，将String->Integer->int 等价于new Integer(Integer.parseInt(str)),会额外产生一个对象"
```

#### 基本数据类型转换为字符串

```java
int 转 String
int num = 123;

1. num + ""
    String str = num + ""
    "先将数字num调用toString()转换成字符串，再进行字符串拼接，过程中产生两个String对象，一个toString()生成、一个拼接后的String对象"

2. String.valueOf(num)  
    String str = String.valueOf(num)
    "直接使用String类的静态方法，只产生一个对象，基础是Object.toString()，当valueOf的是一个Object时，会执行object.toString()"

3. Integer.toString(num)
    String str = Integer.toString(num)
    "采用次方式的基础是Object.toString(),因为java.lang.Object类中已有public方法toString(),所以严格意义上所有Java对象都可以调用该方法，但必须当前值不是null，否则会抛出NullPointerException异常"
int 转 String(推荐使用String.valueOf())
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
    1.1 表达式类型只能是"byte"\"short"\"int"\"char",
        jdk5开始支持"枚举常量"，
        jdk7开始支持"String"，但不支持"double\float\long"
    1.2 case给出的值不允许重复，且只能是字面量，不能是变量
    1.3 要写break;否则会出现穿透现象（但需要根据实际情况来决定）
    如：
        int a = 1;
        switch(a){
            case 1:
                break;
            case 2:
                break;
            default:
                break;
        }

2. 中断控制流程语句
    2.1 不带标签得break: 用于退出循环语句。
        while(i<10){
            if(i==5) break;
        }
    2.2 带标签得break: 用于退出"多重嵌套循环语句"
        onOff:
        while(...){
            while(...){
                if(xxx) break onOff;
            }
        }
        可以将标签应用应用到任何语句中，甚至if语句或者块语句中，如：
        laebl:
        {
            if(condition) break label;
        }
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

5. 检查字符串是否相等
    5.1 equals()
        s.equals(t)
    5.2 equalsIgnoreCase()
        检查两个字符串不区分大小写是否相等

    5.3 "千万不要使用==运算符检查两个字符串是否相等"（这个运算符只能确定两个字符串是否放置在同一个位置上，如果字符串放置在同一个位置肯定是相等的，但有可能将内容相同的字符串放置到不同位置）如：
        String a = "hello"
        a == "hello" // true
        a.substring(0,5) == "hello" // true
        a.substring(0,3) == "hel" // false

    5.4 空串与Null串
        5.4.1 空串 "它是长度为0的字符串，它是一个Java对象，有自己的长度(0)，内容(空)"
              检查字符串是否为空：
                "if(str.length() == 0)"
                "if(str.equals(""))"
        5.4.2 null串 "String变量还可以存一个特殊的值，就是null，表示没有任何对象和该变量关联"
              检查字符串是否为null:
              "if(str == null)"
        5.4.3 检查一个字符串既不是null也不是空串
              "if(str != null && str.length() != 0)"

6. String类是final类，不可以被继承
     对String类型最好的重用方式是关联关系(Has-A)和依赖关系(Use-A)而不是继承关系(Is-A)

7. 构建字符串
   动态构建字符串场景：比如来自"按键"或来自"文件中的单词"，若采用传统的String连接字符串方式的话效率比较低，"因为每次连接字符串，都会构建一个新的String对象"

   因此，Java提供了StringBuffer类和StringBuilder类
   7.1 JDK5.0中引入StringBuilder类，如果在一个单线程中操作字符串，应该选择StringBuilder类
   7.2 StringBuffer类是可以采用多线程的方式执行添加或删除字符串的操作，但效率低，适合多线程

   StringBuilder strBuilder = new StringBuilder()
   strBuilder.append(ch);
   strBuilder.append(str);

8. 字符串常见题
    8.1 首先我们要搞清楚，当使用""双引号来声明一个字符串时，此时该变量是个String对象，而且它在堆中的"字符串常量池"
    比如：String s1 = "test";
    这个"test"存在堆中的字符串常量池，作了一层缓存，不然下次再String s2 = "test" 又创建一个test，此时会在字符串常量池中找是否存在test若存在则返回常量池中的"test"地址。

    8.2 而我们使用String s5 = new String("test");这样来创建字符串对象时，"此时创建了2个对象"："第一个对象是双引号test，会在字符串常量池中创建；第二个对象是在堆中创建一个String对象也叫作'test'"，此时返回给s1的是堆中的"test"地址

    8.3 String s1 = "te" + "st";这个比较特殊，它是在编译阶段Java会将两者合并即直接等于"test"

    8.4 String s2 = "te";
        String s3 = "st";
        String s4 = s2 + s3;
        若是这种形式声明的字符串，先在字符串常量池中创建"te"对象和"st"对象，后面连接后，在堆中生成"test"对象返回地址，因此跟String s1 = "test"是不同的地址

    8.5 s4.intern() == s1?
        String对象的intern()会得到字符串对象在常量池中对应的引用，若常量池中没有对应的字符串，则该字符串被添加到常量池中，返回常量池地址引用，因此此对比为true
        s5.intern() == s5?
        首先s5是堆中的地址引用，而intern()返回的是常量池中的引用，因此对比为false
```

## 2022.01.17

### 类与对象

![UML图例说明.png](https://s2.loli.net/2022/01/17/3BdUVtbphJYCqDy.png)

```java
1. 访问器方法
    只访问对象而不修改对象的方法有时称为"访问器方法"，而修改对象的方法称为"更改器方法"

2. 构造器
    2.1 构造器与类同名
    2.2 每个类可以有一个以上的构造器
    2.3 构造器可以有0个、1个或者多个参数
    2.4 构造器没有返回值
    2.5 构造器总是伴随new操作符一起调用

3. 类方法的隐式参数和显式参数
    隐式参数：当前类对象，也就是this
    显式参数：方法括号中的参数

4. 方法参数使用情况
    4.1 一个方法不能修改一个基本数据类型的参数（即数值型或者布尔值）
    4.2 一个方法可以改变要给对象参数的状态
    4.3 一个方法不能让对象参数引用一个新的对象（想通过传入对象来改变对象的引用是不可的！）

5. 重载
    有相同的方法名字，但不同参数，就叫"重载"（overloading）
    编译器会挑选出具体执行哪个方法，它通过用各个方法给出的参数类型与特定方法调用所使用的值类型进行匹配来挑选出相应的方法。若匹配不到参数，就会报编译错误，这个过程被称为"重载解析"（overloading resolution）

6. 域初始化
    6.1 默认域（若在构造器中没有显式的给域赋值初始，那么会自动赋值为默认值，比如int为0，double为0.0，布尔为false，对象引用为null）
    6.2 无参数构造器
    （若一个类没有写构造器，则系统会提供一个无参数构造器）
    （若提供了一个构造器含参数，则在构造对象时必须传入参数否则报错）
    （若想在构造对象时不传入参数，则需要重载一个无参数的构造器）
    6.3 显式域初始化
        6.3.1 在类定义中，直接将值赋值给域，比如
                class Test{
                    private int d = 12;
                }
        6.3.2 初始不一定是常量值，也可以调用方法对域进行初始化
                class Test{
                    private int id = getId();
                }
    6.4 同类调用其他构造器
        可以使用this来调用其他构造器，这样就可以抽出一个公共构造器，然后再按需调用其他构造器。

7. 初始化块（初始化数据域方式）
    7.1 在构造器中设置值
    7.2 在声明定义中赋值
    7.3 初始化块    
        在一个类的声明中，可以包含多个代码块，只要构造类的对象，这些块就会被执行。如：
        class Test{
            private static int nextId;
            private int id;
            // 初始化块
            {
                id = nextId;
                nextId++;
            }
            // 针对静态域进行静态代码块初始值
            static
            {
                Random x = new Random();
                nextId = x.nextInt(100);
            }
        }   
```

### 继承

```java
1. 关键字
    使用"extends"表明正在构造新类派生于一个已存在得类。
    已存在的类称为"超类(superclass)"、"基类(base class)"、"父类(parent class)"
    而新类称为"子类(subclass)"、"派生类(derived class)"、"孩子类(child class)"

2. super
    2.1 当我们在子类中想调用父类中的方法时，需要使用super.xxx()来调用。（但是不能认为跟this是引用类似的概念，因为super不是一个对象的引用，不能将super赋值给另一个对象变量，"它只是一个指示编译器调用父类的特殊关键字"）
    2.2 也可以使用super来调用超类的构造器（但必须出现在第一行）

    类比this关键字：
    2.3 引用隐式参数
    2.4 调用该类的其他构造器
    类比super关键字：
    2.5 调用超类的方法
    2.6 调用超类的构造器

3. 继承层次
    由一个公共超类派生出来的所有类的集合被称为"继承层次(inheritance hierarchy)"；从某个特定的类到其祖先的路径被称为该类的"继承链(inheritance chain)"
    Java不支持多继承

4. 多态
    在Java中，对象变量是"多态的"，一个XXX变量既可以引用一个XXX类对象，也可以引用一个XXX类的任何一个"子类"的对象

5. 阻止继承：final类和方法
    final类：阻止人们利用某个类定义子类，可以使用final关键字，则不允许扩展的类被称为final类。如：
    public final class Test{}
    定义为"final类"后，该类中的所有方法自动成为final方法，但不包括域。    
    final方法：类中的特定方法也可以被声明为final，这样之后，子类就不能覆盖这个方法。

6. 抽象类
    6.1 当层次比较高的类，如祖先类，我们只将其作为派生其他类的基类，而不作为想使用的特定的实例类时，我们可以将其定义为"抽象类"，当我们提供的一个公共方法，并不知道其到底会有什么操作时，可以将其定义为"抽象方法"，当包含一个或者多个抽象方法的类本身必须被声明为抽象，使用关键字"abstruct"。
    6.2 抽象类同样可以包含具体的数据和具体的方法，建议将通用的域和方法（不管是否是抽象）放在超类（不管是否为抽象类）中。  
    6.3 抽象类是不能被实例化的。
    6.4 抽象类中的抽象方法没有方法体。
    6.5 抽象类的子类必须给出父类中的抽象方法的具体实现，除非该类也是抽象类。

7. 可见性的4个访问修饰符
    7.1 仅对本类可见 - "private"
    7.2 对所有类可见 - "public"
    7.3 对本包和所有子类可见 - "protected"
    7.4 对本包可见 - "默认"，不需要修饰符  

8. Object(所有类的超类)
    Java中每个类都是扩展Object类来的；
    若没有明确指出超类则，认为Object是这个类的超类；
    Object类型的变量可以引用任何类型的对象；
    Java中只有"基本类型"不是对象，其他均是扩展Object类

9. 自动装箱与拆箱
    9.1 基本类型可以转换为对象，所有的基本类型都有一个与之对应的类。比如int基本类型对应Integer类等，这些类称为"包装器（wrapper）"
    9.2 自动装箱就是Java自动将"原始类型值"转换成对应的对象，比如将int的变量转换成Integer对象，这个过程叫做"装箱"，反之将Integer对象转换成int类型值，这个过程叫做"拆箱"    
    9.3 "装箱"：编译器将调用包装类对象的valueOf方法将原始类型值转换成对象   
        "拆箱"：编译器调用包装类对象的intValue或者doubleValue方法将对象转换成原始类型值

    9.4 关于缓存
        Java中的8种基本类型种，除了double和float的自动装箱代码没有使用缓存，每次都是new新的对象，其他6种基本类型都使用了缓存策略
        缓存是有一定范围的，如下图，值在这个范围内的数值都是返回缓存，超过后会重新创建对象，比如下面这个：
        Integer a = 127;
        Integer b = 127;
        Integer c = 128;
        Integer d = 128;
        Long f = 128;
        int e = 128;
        a == b // true 范围内 返回同一个
        c == d // false 超过127了 返回新对象 对象==比较的地址 即false
        d == e // true 拆箱操作比较的是数值 即true 

10. 参数数量可变
    jdk1.5后推出了省略号...来接收任意数量的对象，js是在es6才推出叫做展开运算符，提到这里来对比下重载、重写、不定参的区别：
       10.1 "重载"
            首先作用范围，它是在"同一个类中"，只要"形参列表不同"而方法名称相同，则称为方法的重载
            10.1.1 同一个类中方法名相同
            10.1.2 参数列表不同（至于其他部分，比如"返回值类型"、"修饰符"则与重载没有关系）
       10.2 "不定参"
            首先作用范围，它是定义一个"方法"时，在最后一个形参的类型后增加三个点(...)，则表明该形参可以接受多个参数值，注意：获取到的可变参数变量是一个"数组"，且不定形参只能处于形参列表的最后一个，且最多只能有个一不定参数。
       10.3 "重写"
            首先作用范围，它是体现在"子类中包含有父类同名方法的现象"就被称为重写。
            10.3.1 方法名相同，形参列表相同
            10.3.2 子类返回值类型应比父类方法返回值类型更小或者相等
            10.3.3 子类方法声明抛出的异常类应比父类抛出的异常类更小或者相等
            10.3.4 子类方法的访问权限应比父类方法的访问权限更大或者相等
            10.3.5 覆盖的方法和被覆盖的要么都是类方法要么都是实例方法，不能一个是类方法一个是实例方法
```

![包装类.png](https://s2.loli.net/2022/01/19/oQnr2PEl1H46ecF.png)

### 接口

```java
1. 接口特性：
    1.1 接口不是类，而是对类的一组需求描述，这些类要遵从接口描述的统一格式进行定义

    1.2 接口中的所有方法自动属于public，因此在接口声明方法时，不必提供关键字public，但是在实现接口时，实现类中必须将方法声明为public

    1.3 接口不是类，不能使用new运算符实例化一个接口；
        可以声明接口的变量，如：InterfaceX xxx，但接口变量必须引用实现了接口的类对象；
        可以使用instance检查一个对象是否实现了某个特定的接口；
        接口可以被其他接口进行扩展，如：
        public Interface1 extends Interface2{}；
        接口中不能包含实例域或者静态方法，但却可以包含常量，且接口中的域自动被设为public static final；
        Java中类只能继承一个父类，但是可以实现多个接口，如：class Test implements Interface1, Interface2{}；
        "抽象类与接口的区别：单说功能上，抽象类也能模拟接口，但是因为Java的单继承，使得一个类只能有一个父类，导致不能多样性，因此才出现接口的多实现来扩展功能"

2. 静态方法
    在Java SE8中，允许在接口中增加静态方法，如：
    public interface Path{
        public static Path get(String first,String... more){
            return FileSystems.getDefault().getPath(first,more);
        }
    }

3. 默认方法
    可以为接口方法提供一个默认实现，必须用"default"修饰符标记这样一个方法。

4. 解决默认方法冲突
    若在一个接口中将一个方法定义为默认方法，然后又在超类或者另一个接口中定义了同样的方法时：
        4.1    "超类优先"：若超类提供一个具体方法，同名且有相同参数类型的默认方法会被忽略。
        4.2 "接口冲突"：若一个超接口提供了一个默认方法，另一个接口提供了一个同名且参数类型（不论是否默认参数）相同的方法，必须覆盖这个方法来解决冲突。
```

### 抽象类与接口的异同

```java
1. 抽象类与接口都不能实例化
    1.1 但可以"类继承某个抽象类(extends)"
    1.2 但可以"类实现某个接口(implements)"
    1.3 该类必须对其中的抽象方法全部进行实现，否则该类需要被声明为抽象类
```

### lambda

```java
1. 形式
    参数，箭头（->）以及一个表达式；若逻辑无法放入一个表达式中，就可以像写方法一样，把这些代码放在{}中，并包含显式的return语句
    类比js: "箭头函数"

2. 特性
    若没有参数，仍要提供空括号，就像无参方法一样；
    如果可以推导出一个lambda表达式的参数类型，则可以忽略其类型；
    若方法只有一个参数，而且这个参数的类型可以推导得出，那么甚至可以省略小括号；
    若lambda表达式只在分支返回一个值，而在另外一些分支不返回值，则这是不合法的。

3. 方法引用        
    可以使用::操作复分割方法名与对象或类名：
        object::instanceMethod
        Class::staticMethod
        Class::instanceMethod
        super::instaceMethod    
    Timer t = new Timer(1000, event -> System.out.println(event)) 替换成：
    Timer t = new Timer(1000, System.out::println)

    (x,y) -> Math.pow(x,y) 替换成 Math::pow
    (x,y) -> x.compareToIgnoreCase(y) 替换成 String::compareToIgnoreCase  

4. 构造器引用     
    构造器引用与方法引用类似，只不过方法名为new，比如Person::new是Person构造器的一个引用。

5. 变量作用域
    lambda表达式有3个部分：
        5.1 一个代码块
        5.2 参数
        5.3 自由变量的值，这里指非参数而且不在代码中定义的变量
    利用闭包特性，lambda表达式中可以捕获外围作用域中的变量的值，但是是有限制的：
        5.1 只能引用值不会改变的变量必须是实际上的最终变量
        5.2 lambda表达式同样不能有同名的局部变量
        5.3 lambda表达式中的this关键字，是指向创建这个lambda表达式的方法的this参数
```

### 内部类

```java
1. 定义
    内部类（inner class）是定义在另一个类中的类，为什么使用，主要原因如下：
    1.1 内部类方法可以访问该类定义所在的作用域中的数据，包括私有的数据
    1.2 内部类可以对同一个包中的其他类隐藏起来
    1.3 当想定义一个会第哦啊函数且不想编写大量代码时，使用匿名内部类比较便捷
```

### 异常

```java
1. 所有的异常都是由Throwable继承下来的，下层分为两个分支：Error和Exception
    1.1 Error
        Error类层次结构描述了Java运行时系统的"内部错误"和"资源耗尽错误"
    1.2 Exception
        1.2.1 派生于"RuntimeException"（由程序错误导致的异常）
            "错误的类型转换"
            "数组访问越界"
            "访问null指针"
        1.2.2 其他异常（如I/O错误）
            "试图在文件尾部后面读取数据"            
            "试图打开一个不存在的文件"            
            "试图根据给定的字符串查找Class对象，而这个字符串标识的类并不存在"
    Java规范中将
    非受查异常（unchecked）: "Error类"和"RuntimeException类"
    受查异常（checked）: "其他异常"   

2. 如何声明受查异常
   若遇到了无法处理的情况，那么Java的方法可以抛出一个异常：不仅需要告诉编译器将返回什么值，"还要告诉编译器有可能发生什么错误"，方法应该在其首部声明所有可能抛出的异常，如
    public FileInputStream(String name) throws FileNotFoundException{

    }
    若存在多个受查异常类型，必须在方法首部列出所有异常类且用逗号隔开，如
    public Image loadImage(String s) throws FileNotFoundException, EOFException{

    }    

3. 什么时候需要抛出异常？
    在自己编写方法时，不必要将所有的可能抛出的异常进行声明
    3.1 "调用一个抛出受查异常的方法，例如：FileInputStream构造器"
    3.2 "程序运行过程中发生错误，并且利用throw语句抛出一个受查异常"
        对于哪些可能被他人使用的Java方法，应该根据异常规范，在方法的首部声明这个方法可能抛出的异常。    

    3.3 "程序出现错误，例如：ArrayIndexOutOfBoundsException这样的非受查异常"
    3.4 "Java虚拟机和运行时库出现的内部错误"
        针对以上两者，3.3Java内部错误，我们对其没有任何控制能力，同样针对3.4，也不应该声明从RuntimeException继承的那些非受查异常
    综上所诉："一个方法必须声明所有可能抛出的受查异常，而非受查异常要么不可控制(Error)，要么就应该避免发生(RuntimeException),若方法没有声明所有可能发生的受查异常，编译器就会发出一个错误消息"

4. 如何抛出异常    
    4.1 找到一个合适的异常类
    4.2 创建这个类的一个对象
    4.3 将对象抛出

5. 如何创建异常类
    只需要定义一个派生于Exception的类，或者派生于Exception子类的类
    习惯上，定义的类应该包含两个构造器，一个是默认的构造器；另一个是带有详细描述信息的构造器（超类Throwable的toString方法将会打印出这些详情，在调试中非常有用）

6. 如何捕获异常  
    若某个异常发生的时候没有在任何地方进行捕获，那么程序就会终止执行，并在控制台上打印出异常信息。
    想要捕获一个异常，必须设置try/catch语句块，如：
    try{
        // 正常业务逻辑
    }catch(ExceptionType e){ // 符合的异常类型
        // 针对异常进行处理
    }
    6.1 若在try中抛出了一个catch中说明的异常类，则会跳过try语句块其余代码，将执行catch中的处理器代码。
    6.2 若在方法中任何代码中抛出了一个catch中没有声明的异常类型，那么这个方法会立刻退出。  

    一个方法可以在方法内，进行try/catch捕获异常来由方法书写者来处理；也可以通过throws将异常传递给调用者，以便告知调用者这个方法可能会抛出异常。因此，我们需要仔细阅读下Java API文档，以便知道每个方法可能会抛出哪种异常，然后再决定是自己处理，还是添加到throws列表中。    

    6.3 捕获多个异常
        在一个try语句块中可以捕获多个异常类型，并对不同类型的异常做出不同的处理。如:
        try{

        }catch(ExceptionType1 e1){

        }catch(ExceptionType2 e2){

        }catch(ExceptionType3 e3){

        }
        同时，异常对象e可能包含与异常本身有关的信息，想要获得对象的更多信息，可以试着使用e.getMessage()得到详细的错误信息（如果有的话）或者使用e.getClass().getName()得到异常对象的实际类型。
        在Java7中，同一个catch中可以捕获多个异常类型，如：
        try{

        }catch(FileNotFoundException | UnknownHostException e){

        }

   6.4 再次抛出异常与异常链
       在catch语句块中，可以再次抛出更详细的异常类型及信息，常用于子系统发生异常，可以往上层抛出详情的信息，避免丢失原始该有的异常信息；还有如果在一个方法中发生了一个受查异常，而不允许抛出它，此时使用包装，将其包装成一个运行时异常

   6.5 finally
       不论是否有异常被捕获，finally语句中的代码都被执行。
       try{

       }finally{

       }
    或者
        try{

        }catch(ExceptionType e){

        }finally{

        }

  6.6 带资源的try语句
      在我们跟资源相关书写代码的时候，比如读取文件，若使用上面的模式，我们可以catch到try里面的异常，然后在finally中关闭文件流，但是调用close的时候也会发生异常，因此就会在外面又套一层try/catch，这样代码就显得臃肿。
      因此，Java7后，提出"带资源的try语句（try-with-resources）"
      try(Resouce res = ...){
          // work with res
      }
      这样当我们的try块退出时，就会自动的调用res.close()，还可以指定多个资源，如：
      try (Scanner in = new Scanne「(new FileInputStream('7usr/share/dict/words"). "UTF-8"):
PrintWriter out = new Pri ntWriter("out.txt"))
    {
    while (in.hasNextO)
    out.pri ntl n(i n.next().toUpperCaseO);
    }   

7. 分析堆栈轨迹元素                                     堆栈轨迹（stack trace）是一个方法调用过程的列表，它包含了程序执行过程中方法调用的特定位置。
    7.1 可以调用Throwable类的"printStackTrace"（访问堆栈轨迹的文本描述信息）注意："我们经常看现存代码上经常在处理异常的时候使用e.printStackTrace()，不能认为它只能在异常的时候才能调用，这个方法只是显示当前方法堆栈调用轨迹方便我们分析问题在哪儿，就跟浏览器打印出JS异常一样"
    7.2 更灵活的方法就是"getStackTrace"方法，它会得到一个"StackTraceEelement"，类含有能够获取文件名和当前执行的代码行号方法，且能获取类名和方法名的方法。
    7.3 静态的Thread.getAllStackTrace()，它可以产生所有线程的堆栈轨迹                                
```

### 断言

```java
1. 含义：
    针对测试期间可以向代码中插入一些检查语句，来检查代码逻辑是否正确，否则抛出异常，当代码发布时，这些插入的检查语句将会被自动移走。

2. 形式
    assert 条件;
    assert 条件:表达式;
    这两种形式都会对条件进行检测， 如果结果为 false, 则抛出一个 AssertionError 异常。
    在第二种形式中，表达式将被传人 AssertionError 的构造器， 并转换成一个消息字符串。

3. 启用和禁用断言   
    默认情况下，断言被禁用，可以使用如下方式开启：
        3.1 在运行程序时用-enableassertions或-ea选项
            java -enableassertions XXX
        3.2 指定某个类或者整个包中使用
            java -ea:myClass -ea:com.company.mylib XXX
   使用-disableassertions或者-da禁用某个类或者包
            java -ea:... -da:MyClass XXX

   注意：启用和禁用所有的断言的-ea和-da开关不能应用到哪些没有类加载器的"系统类"，即需要使用-enablesystemassertions/-esa开关启用断言

4. Java处理错误机制及什么时候使用断言
    4.1 抛出一个异常
    4.2 日志
    4.3 使用断言

    4.1 断言失败是致命的，不可恢复的错误
    4.2 断言检查只用于开发和测试阶段
```

### 泛型

```java
1. 泛型好处
    编写的代码可以被很多不同类型的对象所重用

2. 泛型类
    一个泛型类就是具有一个或者多个类型变量的类；
    引入类型变量T,用尖括号(<>)括起来,并放在类名的后面，且泛型类可以有多个类型变量。
    public class Test<T,U>{
        // ...
    }
Java中，常常类型变量使用大写形式，且比较短，比如：使用变量E标识集合的元素类型，K和V分别表示表的关键字与值的类型，而T（或者U\S）表示“任意类型”

3. 泛型方法
    泛型方法中的类型变量放在修饰符（如public static）的后面，方法返回类型的前面；泛型方法可以定义在普通类中，也可以定义在泛型类中，如：
    public class Test{
        public static <T> T getTest(T... args){
            // ....
        }
    }
    调用一个泛型方法时，在方法名前的尖括号中放入具体的类型，但实际大多数情况下，编译器有足够的信息能够推断出所调用的方法，如：
    String test = Test.<String>getTest("test");
    String test = Test.getTest("test");

4. 类型变量的限定
    限定使用"extends"关键字，多个限定类型使用"&"分割，而多个类型变量使用","逗号分割，如：
    public class Test{
        public static <T extends Comparable & Serializable> T getTest(T... args){
            // ...
        }
    }

5. 类型擦除
    无论何时定义一个泛型类型，都自动提供了一个相应的"原始类型"，原始类型的名字就是删去参数后的泛型类型名。擦除类型变量，并替换为限定类型（无限定的变量用Object）

6. 翻译泛型表达式
    当程序调用泛型方法时，如果擦除返回类型，编译器插入强制类型转换

7. 翻译泛型方法
    虚拟机中没有泛型，只有普通的类和方法；
    所有的类型参数都用它们的限定类型替换；
    桥方法被合成来保持多态；
    为保持类型安全性，必要时插入强制类型转换。

8. 约束与局限性
    不能用类型参数代替基本类型；
    运行时类型查询只适用于原始类型；
    不能创建参数化类型的数组；
    不能实例化类型变量；
    不能构造泛型数组；
    不能在静态域或者静态方法中引用类型变量；
    不能抛出或者捕获泛型类的实例；
    可以消除对受查异常的检查

9. 通配符类型
    使用"?"来表示
    Test<? extends TestMore>
    或者表示通配符的超类型限定：
    ? super TestMore
    或者无限顶通配符：
    Test<?>
```

## 2022.01.27

### 集合

![java集合框架.png](https://s2.loli.net/2022/01/28/U1RTVd9QocEGwik.png)

![java集合框架2.png](https://s2.loli.net/2022/01/28/Jr5yedLiz2Yvw1R.png)

```java
1. 含义
    我理解的Java集合就是针对我们传统的"数据结构"进行的实现，是一个数据结构类库。
    Java集合类库也将"接口"（interface）与"实现"（implementtaion）分离

2. Collection接口
    集合类的基本接口是Collection接口。
    public interface Collection<E>{
        boolean add(E element);
        Iterator<E> iterator();
        ...
    }
    其中add方法用于向集合中添加元素，若改变了集合就返回true，若没改变就返回false。
    再其中iterator方法返回了一个实现Iterator接口的对象，使用这个迭代器对象一次访问集合中的元素。

    2.1 迭代器（iterator）
        public interface Iterator<E>{
            E next();
            boolean hasNext();
            void remove();
            default void forEachRemaining(Consumer<? super E> action);
        }
        如何使用？
            反复调用next方法，可以逐个访问集合中的每个元素，若到达了集合的末尾，next方法会抛出一个"NoSuchEelementException"，因此，我们常常在调用next()方法之前，先调用hashNext()，查看是否还存在值。
        迭代方式？
            2.1.1 "while"
                while(iter.hashNext()){
                    String current = iter.next();
                    // do something
                }
            2.1.2 "for each"
                for(String current : x){
                    // do somethiing
                }
                "for each"循环可以与任何实现了Iterable接口的对象一起工作。
            2.1.3 Java8后："forEachRemaining+lambda"
                iter.forEachRemaining(item -> // do something);
       Iterator接口的next和hashNext方法与"Enumeration接口的nextElement和hasMoreElements"方法的作用一样，但嫌弃命名太长，因此引入了Iterator                
       remove()方法将会删除上一次调用next()返回的元素（通俗来理解就是从底层集合中移除迭代器返回的最后一个元素）如：需要删除字符串集合中的第一个元素方法：
       Iterator<String> it = c.iterator();
       it.next();
       it.remove();
       其中需要注意：
          "remove()方法不能直接将调用，必须先调用next()方法；不能多次调用，必须配合每次调用next()后，才能调用remove()一次"

3. AbstractCollection类
   由于接口类Collection有很多方法，若我们手动要实现Collection接口的每一个类会是一件很烦人的事情，为了让实现者更好的实现这个接口，因此Java类库提供了一个类AbstractCollection，它将基础方法size和iterator抽象化，但是提供了很多默认的方法。
   public abstract class AbstractCollection<E> implements Collection<E>{
       // ...
   }
   因此其余的类就可以(extends)扩展AbstractCollection类，其中部分方法由AbstractCollection超类提供了，若扩展子类有更好的实现，就由子类提供。 

4. 补充
    Java中的迭代器，查找操作与位置变更是紧密相连的，查找一个元素的唯一方法就是"调用next",而在执行查找操作的同时，迭代器位置随之向前移动。
    "因此，应该将Java迭代器认为是位于两个元素之间，当调用next时，迭代器就越过下一个元素，并返回刚刚越过的那个元素的引用"                                  
```

![迭代器示意.png](https://s2.loli.net/2022/03/02/zREL1skYASjgBby.png)

## 2022.03.02

![Java具体集合描述.png](https://s2.loli.net/2022/03/02/UgkuYfVHI7prsRi.png)

#### 集合框架

```java
1、所有集合类都位于java.util包下。Java的集合类主要由两个接口派生而出：Collection和Map，Collection和Map是Java集合框架的根接口，这两个接口又包含了一些子接口或实现类。

2、集合接口：6个接口（短虚线表示），表示不同集合类型，是集合框架的基础。

3、抽象类：5个抽象类（长虚线表示），对集合接口的部分实现。可扩展为自定义集合类。

4、实现类：8个实现类（实线表示），对接口的具体实现。

5、Collection 接口是一组允许重复的对象。

6、Set 接口继承 Collection，集合元素不重复。

7、List 接口继承 Collection，允许重复，维护元素插入顺序。

8、Map接口是键－值对象，与Collection接口没有什么关系。
```

![UML图例说明.png](https://s2.loli.net/2022/01/17/3BdUVtbphJYCqDy.png)

#### Collection和Collections的区别

```java
Collection是一个接口，它是Set、List等容器的父接口；
Collections是一个工具类，提供了一系列的静态方法来辅助容器操作，这些方法包括对容器的搜索、排序、线程安全化等等。
```

#### 迭代器 - Iterator - interface

```java
public interface Iterator<E>
    {
        E next();
        boolean hasNextO;
        void remove0;
        default void forEachRemaining(Consumer<? super E> action);
    }

迭代器，是"遍历集合"的工具，即通常我们通过Iterator来遍历结合，其中Collection依赖于Iterator，是因为Collection的实现类都要实现iterator()函数，返回一个Iterator对象。
```

#### Collection - interface - 依赖迭代器（Iterator）

```java
public interface Collection<E>
    {
        boolean add(E element);
        Iterator<E> iterator();
        ...
    }
Collection是一个接口，它包含了集合的基本操作和属性，其中下面主要有List和Set两大分支
```

##### List - interface - 继承&扩展自Collection（extends）

```java
1. List是一个有序的队列，每一个元素都有它的索引。第一个元素的索引值是0。List的实现类有LinkedList, ArrayList, Vector, Stack。
2. List有序集合中每个元素的位置十分重要，其中访问元素有2种方式：
    2.1 迭代器
        iterator()
        listIterator()
    2.2 使用get()和set()随机访问每个元素（但不适用于链表，却对数组很有用）
```

###### 链表 - LinkedList - 实现类

```java
1. 在Java中，所有链表都是"双向链表（doubly linked）"

2. 传统数据结构中，链表的优点就是处理“添加”“删除”时很便捷，比如数组一旦添加或者删除都是将剩余的进行移位。但缺点就是链表的取值就必须一个一个遍历去查询，而数组有下标就能快速定位。      "链表与泛型集合之间有个重要的区别，链表是一个有序集合，每个对象的位置十分重要，其中LinkedList提供的add方法是将对象添加到链表的尾部"，但常常我们需要将元素添加到链表的中间或指定位置，因此，"由于迭代器是描述集合中位置，所以这种依赖于位置的add方法将由迭代器负责，即ListIterator"
    LinkedList.add() - 添加到尾部
    listlterator.add() - 迭代位置添加

3. LinkedList.iterator()
    "iterator迭代器，提供next()一步一步遍历链表，提供hasNext()判断是否已到表尾，提供remove()来删除元素，但只能正向遍历"
   LinkedList.listIterator() 
    "listIterator迭代器，同样提供next()、remove()、hasNext()的同时，还支持previous()，hasPrevious()倒序遍历并且可以set()修改上一次遍历值"
```

###### 数组列表 - ArrayList - 实现类

```java
1. ArrayList 类， 这个类也实现了 List 接口。ArrayList 封装了一个动态再分配的对象数组。

2. 建议在不需要同步时使用 ArrayList, 而不要使用 Vector
```

##### Set - interface - 继承&扩展自Collection（extends）

```java
1. "Set是一个不允许有重复元素的集合"。Set的实现类有HastSet和TreeSet。HashSet依赖于HashMap，它实际上是通过HashMap实现的；TreeSet依赖于TreeMap，它实际上是通过TreeMap实现的。

2. Set接口有三个具体实现类，分别是散列集HashSet、链式散列集LinkedHashSet和树形集TreeSet。    
```

###### 散列集 - HashSet - 实现类

![散列表.png](https://s2.loli.net/2022/03/04/3gpSac7xyV29qNZ.png)

```java
Set<String> words = new HashSet(); // HashSet implements Set

1. 优点：可以快速查找所需对象
   缺点：无法控制元素出现的次序

2. 散列表为每个对象计算一个"整数"，称为"散列码"(hashCode)，散列码是由对象的实例域产生的一个整数，根据不通数据域的对象将产生不同的散列码。    

3. 在Java中，散列表用链表数组实现，每个列表称为"桶"(bucket), 要想查找表中对象的位置，就要计算它的散列码，然后与桶的总数取余，所得到的结果就似乎这个元素的桶的索引。比如散列码为76268，并且有128个桶（76268除以128余108）则表示对象保存可以保存在第108号桶中

4. 若上述的108号桶被占据了，这种现象称为"散列冲突"  

5. Java中提供了一个HashSet类，它实现了基于散列表的集，
    使用add添加元素；
    使用contains查看是否某个元素已经出现在集中；
    使用散列表迭代器(iterator())依次迭代访问所有桶，由于散列表分散在表的各个位置上，所以访问他们的顺序几乎是随机的；
    因此，在不关心集合中元素的顺序时才应该使用"HashSet"
```

###### 树集 - TreeSet - 实现类

```java
SortedSet<String> sorter = new TreeSet(); // TreeSet implements SortedSet

1. 树集是一个有序集合(sorted collection)，可以以任意顺序将元素插入到集合中，在对集合遍历时，每个值将自动地按照排序后的顺序呈现。

2. 将一个元素添加到树种要比添加到散列表中慢，但添加的元素是自动排序的

3. 要求存放的对象所属的类必须实现Comparable接口，该接口提供了比较元素的compareTo()方法，当插入元素时会回调该方法比较元素的大小。    
```

###### 队列 - Queue - interface

###### 双端队列 - Deque - interface

###### ArrayDeque - 实现类

###### 优先级队列 - PriorityQueue - 实现类

```java
1. 队列：有效的从尾部添加一个元素，在头部删除一个元素。

2. 双端队列：有两个端头的队列，可以有效的在头部和尾部同时添加或删除元素。

3. ArrayDeque<String> ad = new ArrayDeque<>();  

4. 优先级队列中的元素可以按照任意的顺序插入，却总是按照排序的顺序进行检索。内部使用了"堆"(heap)
     PriorityQueue<LocalDate> pq = new PriorityQueue<>();
```

##### Map - interface

```java
Map是一个映射接口，即key-value键值对。Map中的每一个元素包含“一个key”和“key对应的value”。AbstractMap是个抽象类，它实现了Map接口中的大部分API。而HashMap，TreeMap，WeakHashMap都是继承于AbstractMap。Hashtable虽然继承于Dictionary，但它实现了Map接口。
```

![Map实现类.png](https://s2.loli.net/2022/03/04/c1nz2bdi79HJl4S.png)

###### 散列映射 - HashMap - 实现类

```java
1. 对键进行散列

2. Map<String, String> mp = new HashMap<String, String>();
```

###### 树映射 - TreeMap - 实现类

```java
1. 对键得整体顺序对元素进行排序，并将其组织成搜索树。

2. 如何选择散列映射还是树映射，与集一样，散列稍微快一些，如果不需要按照排列顺序访问键，就最好选择散列。    
```

###### 链接映射 - LinkedHashMap - 实现类

```java
1. LinkedHashMap是HashMap的一个子类，它保留插入的顺序，如果需要输出的顺序和输入时的相同，那么就选LinkedHashMap。

2. 这样就可以避免在散列表中得项从表面上看是随机排列的，实际当元素插入时，就会并入到双向链表中。    
```

## 2022.03.07

### 并发

```java
这坨比较深奥 后面来补充
```

## 2022.03.14

### 日期和时间

```java
1. 本地时间
    在国内就是指得是北京时间，全球一共分为24个时区，伦敦所在时区称为"标准时区"，其他时区按东/西偏移，北京时间所在时区在东八区

2. 时区
    只靠本地时间还无法确认一个准确的时刻，需要给本地时间加上一个时区，时区分为好几种：
    2.1 GMT 如：GMT+08:00
    2.2 UTC 如：UTC+08:00   
    2.3 CST 如：China Standard Time（中国标准时间）
    2.4 CST 如：Central Standard Time USA（美国中部时间）
    2.5 Asia/Shanghai 表示上海所在地时区

3. 夏令时
    美国人使用，夏天开始时候，把时间往后拨1小时，夏天结束再往前拨1小时

4. 本地化
    在计算机中，通常使用Locale表示一个国家或地区的日期、时间、数字、货币等格式。它由"语言_国家"字母缩写构成，比如："zh_CN"表示中文+中国，en_US表示英文+美国
```

```java
1. Epoch Time(时间戳)
    计算机中存储的本质上是一个整数，称为"时间戳"，它表示"1970年1月1日零点(格林威治时区/GMT+00:00)到现在所经历的秒数"
    在不通的编程语言中，会有多种存储方式：
    1.1 "以秒为单位的整数"：1574208900 缺点是精度到秒
    1.2 "以毫秒为单位的整数"：1574208900123 后3位表示毫秒数
    1.3 "以秒为单位的浮点数"：1574208900.123 小数点后面表示零点几秒
    在Java中时间戳通常是用long类型表示：
    long time = 1574208900123L;

2. 获取当前时间戳
    System.currentTimeMillis()
```

```java
目前Java库中有2套处理日期和时间的API
1. 一套定义在"java.util"这个包里面，主要包括Date、Calendar和TimeZone这几个类；
2. 一套新的API是在Java 8引入的，定义在"java.time"这个包里面，主要包括LocalDateTime、ZonedDateTime、ZoneId等。
```

#### java.util（老版本）

```java
1. java.util.Date
    import java.util.Date;
    Date date = new Date();
    // 年
    date.getYear() + 1900 // 必须加上1900
    // 月
    date.getMonth() + 1 // 0-11
    // 日
    dete.getDate() // 1-31
    // 转换为String
    date.toString() // Mon Mar 14 19:58:37 CST 2022
    // 转换为GMT
    date.toGMTString() // 14 Mar 2022 11:58:37 GMT
    // 转换为本地时区
    date.toLocaleString() // 2022年3月14日 下午7:58:37    
    // 默认 就是toString()格式
    date // Mon Mar 14 20:03:36 CST 2022   

2. SimpleDateFormat (格式化数据)
    yyyy：年
    MM：月
    dd: 日
    HH: 小时
    mm: 分钟
    ss: 秒 
     import java.text.SimpleDateFormat;
     SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")   
     sdf.format(date) // 2022-03-14 20:16:30 
    M：输出9
    MM：输出09
    MMM：输出Sep
    MMMM：输出September    
     SimpleDateFormat sdf = new SimpleDateFormat("E MMM dd, yyyy")   
     sdf.format(date) // 周一 3月 14, 2022 

3. 缺点
    3.1 不能转换时区（除了GMT格式）
    3.2 很难对日期或者时间进行加减     
```

```java
1. java.util.Calendar
    import java.util.Calendar;
    Calendar c = Calender.getInstance(); // Calendar只有一种方式获取，即调用Calendar的静态方法 无需new
    c.getTime() // 将一个Calendar对象转换为Date对象，即可以使用SimpleDateFormat来进行格式化
    // 年
    c.get(Calendar.YEAR)
    // 月    
    c.get(Calendar.Month) + 1
    "Calendar获取年月日这些信息变成了get(int field)，返回的年份不必转换，返回的月份仍然要加1，返回的星期要特别注意，1~7分别表示周日，周一，……，周六" 

    Calendar比Date多了一个可以设置时间的操作，但设置时间前我们需要调用clear()方法清除所有字段
    c.clear();    
    // 设置年
    c.set(Calendar.YEAR, 2011);
    // 设置月 注意8表示9月
    c.set(Calendar.MONTH, 8)
    // Calendar与Date相比，提供了时区转换功能
    c.setTimeZone()    
```

```java
java.util.TimeZone
    import java.util.TimeZone;
    TimeZone.getDefault(); // 当前时区
    TimeZone.getTimeZone("GMT+09:00"); // GMT+09:00
    TimeZone.getID(); // Asia/Shanghai

    时区的唯一标识是以字符串表示的ID

    因此，利用Calendar进行时区转换：
        1. 清除所有字段
        2. 设定指定时区
        3. 设定日期和时间
        4. 创建SimpleDateFormat并设定目标时区
        5. 格式化获取Date对象
```

#### java.time（新版本）

```java
新API严格区分了时刻、本地日期、本地时间和带时区的日期时间，并且，对日期和时间进行运算更加方便。

Month的范围用1~12表示1月到12月；
Week的范围用1~7表示周一到周日。
```

```java
1. 本地日期和时间
    1.1 LocalDateTime/LocalDate/LocalTime
        // 获取当前时间
        LocalDateTime ldt = LocalDateTime.now() // 当前日期时间 按ISO 8601格式输出 2022-03-17T15:24:57.771192200
        LocalDate ld = LocalDate.now(); // 日期
        LocalTime lt = LocalTime.now(); // 时间

        LocalDateTime ldt = LocalDateTime.now();
        LocalDate d = ldt.toLocalDate(); // 转换到日期
        LocalTime t = ldt.toLocalTime(); // 转换到时间

        // 获取指定日期和时间
        LocalDate d = LocalDate.of(2022,2,12);
        LocalTime t = LocalTime.of(12,13,14);
        LocalDateTime  ldt = LocalDateTime.of(2022,2,12,12,13,14);

        // 字符串转为标准格式
        LocalDate ld = LocalDate.parse("2011-01-23");
        LocalTime lt = LocalTime.parse("12:12:13");
        LocalDateTime ldt = LocalDateTime.parse("2011-01-23T12:12:13"); // 注意日期时间中间有个T分隔符

        // 对日期时间加减 链式调用
        ldt.minusMonths(1).plusDays(5).minusHours(3) // 当前日期时间减去1月加上5天减去3小时

        // 对日期和时间直接调整
        调整年：withYear()
        调整月：withMonth()
        调整日：withDayOfMonth()
        调整时：withHour()
        调整分：withMinute()
        调整秒：withSecond()

        // 比较日期时间先后
        isBefore()
        isAfter()

    1.2 DateTimeFormatter
        对比老版本SimpleDateFormat,新版本直接调用DateTimeFormatter的静态方法"ofPattern"来指定格式，而老版本是new SimpleDateFormat()

    1.3 Duration和Period
        Duration:表示两个"时刻"之间的时间间隔
        Period:表示两个"日期"之间的天数
```

```java
2. ZonedDateTime
    是带时区的日期和时间，可用于时区转换
    ZonedDateTime zdt = ZonedDateTime.now();
    System.out.println(zdt); // 2022-03-17T16:01:09.560301100+08:00[Asia/Shanghai]
```

```java
3. Instant
    3.1 通常获取当前时间戳，可以使用System.currentTimeMillis()
    3.2 Instant it = Instant.now(); // 2022-03-17T08:19:08.634535400Z
        it.getEpochSecond() // 精确到秒 1647505148
        it.toEpochMilli() // 精确到毫秒 1647505148634
```

## 之前基础梳理

### 面向对象

##### 创建对象

```java
// 通过new 关键字创建一个新的对象
ClassName classname = new ClassName()
```

##### 属性和方法

```java
1. 属性
    也称为“字段”，它可以是任意类型的对象，也可以是基础数据类型。
2. 方法
    类中还应该包含方法，基本组成应该包含：“方法名称”、“参数”、“返回值”、“方法体”
```

##### 构造方法

```java
1. 含义：特殊方法，也称为“构造函数”、“构造器”，只能在对象被创建时期调用一次，保证对象的初始化进行。
2. 无参数无返回值，但“名称”必须要与“类名”保持一致。
3. 可以存在多个构造方法。
4. 若未自定义构造方法，JVM会自动生成一个构造方法。    
```

##### 方法重载

```java
1. 含义：同一个类中存在“相同名称”方法，但其入参必须不同。
2. 重载条件：
    方法名称必须相同；
    参数列表必须不同（个数不同、或类型不同、参数类型排列顺序不同等）；
    方法的返回类型可以相同或者可以不同；
    仅仅返回类型不同不足以称为方法的重载；
    重载是发生在编译时（编译器可以根据参数类型来选择使用哪个方法）。
```

##### 方法重写

```java
1. 含义：方法重写是描述“子类与父类”之间，而方法重载是指同一类
2. 重写原则：
    方法必须和父类一致，包括“返回值类型”、“方法名”、“参数列表”；
    重写方法可以使用“@Override”注解来标识；
    子类中重写方法的访问权限不能低于父类中的方法的访问权限
```

##### 初始化类中执行顺序

```java
1. 静态属性：static开头定义的属性
    private static String staticField = "11"

2. 静态方法块：static{}包起来的代码块
    static {
     System.out.println(staticField);
     System.out.println("静态方法块初始化");
    }

3. 普通属性：非static定义的属性    
    private String field = "123"

4. 普通方法块：{}包起来的代码块    
    {
         System.out.println(field);
     }

5. 构造函数：类名相同的方法
    public xxx(){
        System.out.println("构造函数初始化")    
    }
```

##### 对象作用域

```java
作用域决定了其内部定义的变量名的可见性和生命周期。通常使用
{}
的位置来决定
```

##### this&super

```java
1. this表示当前对象，this可以调用方法，属性和指向对象本身，其中比较特殊的就是和构造函数一起使用，this(参数)，表示调用了同类中的其他的构造方法。（但是使用this()必须放在构造方法的第一行，否则编译不通过）

2. super表示父类的引用，使用方式跟this差不多
```

##### 访问控制权限

![访问控制权限.png](https://s2.loli.net/2021/12/20/CJAKbqUt9h7fMEp.png)

##### 继承

```java
1. 只要我们创建了一个类，就隐式的继承自“Object”父类
2. 关键字“extends”
```

##### 多态

```java
1. 多态是指同一个行为具有不同表现形式，是指一个类实例（对象）的相同方法在不同情形下具有不同的表现形式
2. 多态实现条件：
    继承；
    重写父类方法；
    父类引用指向子类对象。
```

##### 组合

```java
就是将对象引用置于新类中（建议多用组合，少用继承）
public class Apple{
    private String name;
    private Orange orange
}
public class Orange{
    private String age;
}
这样就可以通过Orange类的引用来调用Orange中的属性和方法
```

![组合与继承区别.png](https://s2.loli.net/2021/12/20/9JdY8STg567aApD.png)

##### 代理

```java
除了继承和组合外，还有种模式叫做“代理”，比如：A想要调用B类方法，A不直接调用，A会在自己的类中创建一个B对象的代理，再由代理调用B的方法。
```

##### 向上、向下转型

```java
"向上转型"：通过子类对象（小范围）转化为父类对象（大范围），这种转换是自动完成的，不用强制
"向下转型"：通过父类对象（大范围）实例化子类对象（小范围），这种转换不是自动完成的，需要强制指定
```

##### static

```java
1. 含义：表示”静态的“，可以用来修饰成员变量和方法，用在没有创建对象的情况下调用方法/变量

2. 用static声明的成员变量为"静态成员变量"，也称为"类变量"

   用static声明的方法为"静态方法"，静态方法直接使用"类名.方法名"进行调用，但是没有this关键字，切记"在静态方法种不能访问类的非静态成员变量和非静态方法"

   除了修饰变量和方法，还有"静态代码块"功能，主要用于类的初始化操作
```

##### final

```java
1. 含义：最后的，最终的
   作用：修饰类、属性、方法

2. 修饰
    修饰"类"：表明这个类不能被继承。final类中的成员变量可以根据需要设为final,但是要注意final类中的所有成员方法都会被隐式的指定为final方法。

    修饰"方法"：表明这个方法不能被任何子类重写，因此，如果只有在想明确禁止该方法在子类中被覆盖的情况下才将方法设置为final。

    修饰"变量"：当修饰"基本数据类型"时，表示数据类型的值不能被修改；当修饰"引用类型"，表示对其初始化后便不能让其指向另一个对象。
```

##### 接口

```java
1. 含义：对外的一种约定和标准；由"interface"表示
   public interface Xxx{}

2. 接口特征：
    interface接口是一个完全抽象的类，它不会提供任何方法的实现，只是会进行方法的定义。

    接口中只能使用两种访问修饰符，一种是public，它对整个项目可见，一种是default，它只具有包访问权限。

    接口没有实现，需要其他类来实现，实现接口使用"implements"来表示。

    接口不能被实例化，因此不能有任何构造方法。

    接口的实现必须实现接口的全部方法，否则定义为"抽象类"
```

##### 抽象类

```java
1. 含义：也是对外的约定但抽象能力弱于接口的类；由"abstract"表示
    abstract class Xxx{
        abstract void Say();
    }

2. 抽象类特征：
    如果一个类中有"抽象方法"，那么这个类一定是"抽象类"，使用"abstract"修饰的方法一定是抽象方法，具有抽象方法的类一定是抽象类。

    抽象类中不一定只有抽象方法，也可以有具体的方法。

    抽象类中可以定义"构造方法"、"抽象方法"、"普通属性"、"方法"、"静态属性"、"静态方法"。

    抽象类和接口一样不能被实例化，实例化只能实例化具体的类。
```

##### 异常

```java
1. 发生异常阶段
    一般异常发生阶段分为两个："编译阶段"和"运行时阶段"
2. 异常问题种类：2类
    java.lang.Exception
    java.lang.Error

3. Throwable类 (checked)
    它是所有”错误errors“和”异常exceptions“的父类，只有继承于Throwable的类或者其子类才能够被抛出，或者使用"@throw"注解，Throwable类有2个子类："Exception"和"Error"

    在这里需要再梳理下什么是"Checked Exception"和"UnChecked Exception"
    "Checked Exception"：它是必须再代码中进行恰当处理的Exception，编译器会强制开发者对其进行处理，否则编译会不通过。可以使用"catch"去捕获或者使用"throws"去抛出。 ---- （不处理编译不通过）
    "Unchecked Exception"：它的发生可能是由于开发者代码逻辑错误造成的（比如空指针）或者有些是非开发者问题而是java.lang.Error发生的异常（比如OutOfMemoryError）编译器在编译的时候无法检测到这些异常。---- （不处理可以通过编译）

    3.1 "Exception":（可恢复错误）
        它本身是个checked类型，它有2个子类：
        3.1.1 java.lang.RuntimeException和其子类（它是一个Unchecked Exception）- 比如"NullPointerException"、"ClassCastException"
        3.1.2 其他的checked exception和其子类  

    3.2 "Error":（不可恢复错误）
        它本身是个Unchecked类型，包括它其他的Unchecked Exception子类。它是程序无法处理的错误，大多数时候于开发者代码逻辑无关，而是代码运行时JVM出现的问题。称为"JVM Exception"它是由JVM自己抛出的异常。所有的JVM Exception都是unchecked，而程序中的异常可能是unchecked或者checked
```

![异常层级.png](https://s2.loli.net/2021/12/22/AGzXUvHIdtmLh7n.png)

![常见的异常分类.png](https://s2.loli.net/2021/12/22/R7bI45KwSh1lyY6.png)

```java
1. Exception相关操作关键字
    1.1 throws和throw
        异常也是一个对象，它能够被程序员自定义抛出或者应用程序抛出，她两通常是成对出现。
        throw语句用在方法体内，表示抛出异常，由方法体内语句处理。
        throws语句用在方法声明后面,表示再抛出异常，由该方法的调用者来处理。
        public void catchException() throws Exception{
    throw new Exception()
}
好比，我们自己有个方法A，在A方法内我们自己有自己的处理逻辑，可能会出现异常，此时我们需要使用throw抛出，但是还需要在我们的方法A后，再进行throws抛出throw抛出的异常，就是为了别人调用我们的A方法能晓得有异常，它逻辑再处理A方法的异常。

    1.2 try...catch & try...finally & try...catch...finally
```

##### 内部类

```java
平时我们创建一个普通类，如果需要去继承某个父类，也只能“单继承”，因此可以使用内部类来使得java的多继承机制变得完善。
1. 使用场景及优点
    每个内部类能够独立继承一个类（实现多个接口），无论外部类是否已经继承或者实现，对于内部类都没有影响。
    在开发涉及中会存在一些使用接口很难解决得问题，而类只能继承一个父类，这个时候可以用内部类去继承其他父类，及implements去实现多个接口能力来解决。

2. 内部类分类
    2.1 "成员内部类"
        public class OutClass{
            String name = "OutClass";
            static String nickName = "out";
            void h1(){}
            static h2(){}
            // 成员内部类
            class InnerClass{
                String innerName = "InnerClass";
                void h3(){
                    // 就像OutClass内部成员一样均可以访问外部类的变量、方法等
                }
            }
        }
        特征描述：
        2.1.1 "成员内部类就像外部类的普通成员一样，可以访问外部类的属性及方法"；
        2.1.2 "成员内部类内部不允许存在任何静态变量或静态方法，因为成员内部类属于对象的，而static相关会先于外部类对象存在"
        2.1.3 "成员内部类如果需要在外部类的外部使用，择需要通过调用外部类对象的普通方法创建"
        2.1.4 "成员内部类对象的创建依赖外部类的实例对象，在没有外部类实例之前是无法创建内部类的。因为非静态内部类对象存在一个指向外部类对象的引用；也因此成员内部类可以在随意访问外部类的成员"
   2.2 "静态内部类"
       public class OutClass{
            String name = "OutClass";
            static String nickName = "out";
            void h1(){}
            static h2(){}
            // 成员内部类
            static class InnerClass{
                String innerName = "InnerClass";
                static String staticName = "staticName"
                void h3(){
                    // 无法访问外部类的普通属性和普通方法，只能访问静态的
                    // 比如 nickName h2()
                }
            }
        }
        特征描述：
        2.2.1 "使用static修饰的内部类就称为静态内部类，它与成员内部类最大的区别就是非静态内部类在编译完成后会隐含的保存着一个引用，指向创建它的外部类，而静态内部类则没有"
        2.2.2 "静态内部类的创建不需要依赖外部类，可以直接创建"
        2.2.3 "静态内部类不可以使用任何外部类的非static属性和方法"
        2.2.4 "静态内部类可以存在自己的成员变量包括非静态和静态属性和方法"
    2.3 "局部内部类"  
         它就是在方法里面声明的类
         public class Out{
             public void Test{
                 // 方法内部类 不能使用访问修饰符
                 class FuncInnerClass{
                     String name = "test";
                     public void say(String names){
                         System.out.println(names);
                     }
                 }
                 FuncInnerClass funcInnerClass = new FuncInnerClass()
                 funcInnerClass.say(name);
             }
         }
        特征描述：
        2.3.1 "方法内部类不允许使用访问修饰符；public\private\protected"
        2.3.2 "方法内部类对外部完全隐藏，除了创建这个类的方法可以访问它以外，其他均不能访问"
        2.3.3 "方法的访问区域范围就是方法内部类可以访问的区域范围"   
   2.4 "匿名内部类" 
       interface CInterface {  void test(); }
        class Outer{
            public void hello(CInterface cInterface) {
                cInterface.test();
            }
        }
        public class Test {
            public static void main(String[] args) {
                Outer outer = new Outer();
                outer.hello(new CInterface(){
                    public void test(){
                        System.out.println("test CInterface");
                    }
                });
            }
        }
        特征描述：
        2.4.1 "匿名内部类就是一个没有名字的方法内部类"
        2.4.2 "匿名内部类必须继承一个抽象类或者实现一个接口"    
```

### 集合

```java

```

### 泛型

##### 基础概念

```java
1. 含义：泛型就是一种参数化的集合，它限制了你的数据类型。多态也可以看作泛型的机制。好处就是：在代码的编译期间就会报错，方便我们修改。

2. 泛型-类
    public class Test<T>{

    }
    这里的T可以随便写为任意标识，常见的T\E\K\V等形式的参数常用于标识泛型

3. 泛型-接口
    public interface Test<T>{
        public T next();
    }
    一般泛型接口常用于“生成器”中，生成器相当于对象工厂，是一种专门用来创建对象的类。

4. 泛型-方法
    public class Test{
        public <T> void f(T x){
            // ....
        }
    }

5. 泛型通配符
    List是泛型类，为了标识各种泛型List的父类，使用类型通配符"?"标识，元素类型可以匹配任何类型。
    5.1 上界通配符：<? extends ClassType>该通配符为ClassType的所有子类型，它表示的是任何类型都是ClassType类型的子类。
    5.2 下界通配符：<? super ClassType>该通配符为ClassType的所有超类型。表示任何类型的父类都是ClassType。
```

##### 使用泛型

```java
1. 使用泛型时，把泛型的参数<T>替换为需要的class类型，如"ArrayList<String>"、"ArrayList<Number>"可以省略编译器能自动推断出的类型，例如："List<String> list = new ArrayList<>()"

2. 不指定泛型参数类型时，编译器会给出警告，且只能将<T>视为Object类型

3. 可以在接口中定义泛型类型，实现此接口的类必须实现正确的泛型类型。    
```

##### 编写泛型

```java
1. 编写泛型时，需要定义泛型类型<T>

2. 静态方法不能引用泛型类型，必须定义其他类型（例如<K>）来实现静态泛型方法

3. 泛型可以同事定义多种类型，例如Map<K,V>    
```

##### 泛型原理

```java
1. 泛型就是一种类似于"模板代码"的技术，不通语言的泛型实现方式不一定相同，而Java的泛型实现方式是“擦拭法”。

2. 虚拟机对泛型其实不知道的，所有的工作都是编译器做的。

3. 泛型的局限性
    3.1 不能是基本类型，例如：int；因为最后都是视为Object
    3.2 不能获取带泛型类型的Class，例如：Pair<String>.class；
    3.3 不能判断带泛型类型的类型，例如：x instanceof Pair<String>；
    3.4 不能实例化T类型，例如：new T()。
```

### 反射

##### 什么是反射

```java
1. 反射就是Reflection，Java的反射是指程序在运行期可以拿到一个对象的所有信息。 

2. 反射是为了解决在运行期，对某个实例一无所知的情况下，如何调用其方法。    
```

##### Class类

```java
1. 除了int等基本类型外，Java的其他类型全部都是class(包括interface);
2. 而class是由JVM在执行过程中动态加载的，JVM在第一次独取到一种class类型时，将其加载进内存;
3. 由于JVM为每个加载的class创建了对应的Class实例，并在实例中保存了该class的所有信息，包括类名、包名、父类、实现的接口、所有方法、字段等，因此，如果获取了某个Class实例，我们就可以通过这个Class实例获取到该实例对应的class的所有信息。这种通过Class实例获取class信息的方法称为反射（Reflection）。

如何获取一个class的Class实例

1. 直接通过一个class的静态变量"class"
    Class cls = String.class
2. 如果有实例变量，则通过实例的"getClass()"
    String s = 'test';
    Class cls = s.getClass();
3. 如果知道一个class的完整类名，则通过静态方法"Class.forName()"
    Class cls = Class.forName("java.lang.String");

JVM总是动态加载class，可以在运行期根据条件来控制加载class
```

##### 访问字段

```java
Java的反射API提供的Field类封装了字段的所有信息

通过Class实例的方法可以获取Field实例:
    Field getField(name)：根据字段名获取某个public的field(包括父类)
    Field getDeclaredField(name)：根据字段名获取当前类的某个field（不包括父类）
    Field[] getFields()：获取所有public的field（包括父类）
    Field[] getDeclaredFields()：获取当前类的所有field（不包括父类）  

通过Field实例可以获取字段信息:
    getName()：返回字段名称
    getType()：返回字段类型，也是一个Class实例
    getModifiers()：返回字段的修饰符，它是一个int，不同的bit表示不同含义

 通过Field实例可以读取或者设置某个对象的字段值，若存在访问权限，则首先调用setAccessible(true)来访问非public字段
    Object value = x.get(xxx) // Field x Object xxx

    x.setAccessible(true)
    x.set(xxx,value)    

通过反射读写字段是一种非常规方法，它会破坏对象的封装。
```

##### 调用方法

```java
通过Class实例获取所有Method信息：
    Method getMethod(name,Class...)：获取某个public的Method（包括父类）
    Method getDeclareMethod(name,Class...)：获取当前类的某个Method（不包括父类）
    Method[] getMethods()：获取所有public的Method（包括父类）
    Method[] getDeclareMethods()：获取当前类的所有Method（不包括父类）

通过Method对象可以获取一个方法的信息：
    getName()：返回方法名称
    getReturnType()：返回方法返回值类型，也是一个Class实例，如String.class
    getParameterTypes()：返回方法的参数类型是一个Class数组，如{String.class,int.class}
    getModifiers()：返回方法的修饰符，是一个int

通过Method实例可以调用某个对象的方法：
    Object invoke(Object instance,Object... parameters)  
    通过设置setAccessible(true)来访问非public方法；

通过反射调用方法时，仍然遵循多态原则。        
```

##### 调用构造方法

```java
import java.lang.reflect.Constructor;

一般我们使用 new 操作符来创建新的实例，若通过反射来创建新的实例，可以调用Class提供的newInstance()方法，而单独使用newInstance()方法时，它的局限就是只能调用该类的public无参数构造方法，若构造方法带有参数或者不是public则无法直接通过Class.newInstance()调用

但Java反射API提供了Constructor对象，通过Class实例获取Constructor的方法  
    getConstructor(Class...)：获取某个public的Constructor
    getDeclaredConstructor(Class...)：获取某个Constructor
    getConstructors()：获取所有public的Constructor
    getDeclareConstructors()：获取所有Constructor
注意Constructor总是当前类定义的构造方法，和父类无关，因此不存在多态的问题。然后通过Constructor实例再创建一个实例对象
     Constructor cons2 = Integer.class.getConstructor(String.class);
        Integer n2 = (Integer) cons2.newInstance("456");
        System.out.println(n2);
```

##### 获取继承关系

```java
通过Class对象可以获取继承关系：
    Class getSuperclass()：获取父类类型；
    Class[] getInterfaces()：获取当前类实现的所有接口。

通过Class对象的isAssignableFrom()方法可以判断一个向上转型是否可以实现。
```

##### 动态代理

```java
对比class和interface区别：
    class(非abstract)可以实例化；
    interface不能实例化。所有interface类型的变量总是通过某个实例向上转型并赋值给接口类型变量。比如：
    public interface Hello {
        void morning(String name);
    }
    public class HelloWorld implements Hello {
        public void morning(String name) {
            System.out.println("Good morning, " + name);
        }
    }
    Hello hello = new HelloWorld();
    hello.morning("Bob");

动态代理
    还有一种方式是动态代码，我们仍然先定义了接口Hello，但是我们并不去编写实现类，而是直接通过JDK提供的一个Proxy.newProxyInstance()创建了一个Hello接口对象。这种没有实现类但是在运行期动态创建了一个接口对象的方式，我们称为动态代码。JDK提供的动态创建接口对象的方式，就叫动态代理。

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;    
```
