## 2022.03.22

### 以下Class声明有问题的地方是

```java
public abstract final class Test{
    abstract void method();
}
final修饰的类为终态类，不能被继承，而 抽象类是必须被继承的才有其意义的，因此，final是不能用来修饰抽象类的。
    更正：
    	去掉class声明中的final
    
public abstract class Test{
    abstract final void method();
}    
final修饰的方法为终态方法，不能被重写。而继承抽象类，必须重写其方法。
    更正：
    	去掉抽象方法中的声明的final
 
public abstract class Test{
    abstract void method(){
        
    }
}
定义的抽象方法没有实体时候，大括号必须省略。
    更正：
    	去掉抽象方法的大括号，加分号
```

## 2022.03.23

### 关于HttpServlet

```java
Servlet生命周期分为三个阶段：

    1.初始化阶段  调用init()方法
    2.响应客户请求阶段　　调用service()方法
    3.终止阶段　　调用destroy()方法

HttpServlet容器响应Web客户请求流程如下：
    1）Web客户向Servlet容器发出Http请求；
    2）Servlet容器解析Web客户的Http请求；
    3）Servlet容器创建一个HttpRequest对象，在这个对象中封装Http请求信息；
    4）Servlet容器创建一个HttpResponse对象；
    5）Servlet容器调用HttpServlet的service方法，这个方法中会根据request的Method来判断具体是执行doGet还是doPost，把HttpRequest和HttpResponse对象作为service方法的参数传给HttpServlet对象；
    6）HttpServlet调用HttpRequest的有关方法，获取HTTP请求信息；
    7）HttpServlet调用HttpResponse的有关方法，生成响应数据；
    8）Servlet容器把HttpServlet的响应结果传给Web客户。

doGet() 或 doPost() 是创建HttpServlet时需要覆盖的方法.
```

### 关于Servlet的方法描述

```java
getParameter()是获取POST/GET传递的参数值；
getInitParameter获取Tomcat的server.xml中设置Context的初始化参数
getAttribute()是获取对象容器中的数据值；
getRequestDispatcher是请求转发。
```

### 关于正则表达式

```java
1. 任意一个字符表示匹配任意对应的字符，如a匹配a，7匹配7，-匹配-。

2. []代表匹配中括号中其中任一个字符，如[abc]匹配a或b或c。

3. -在中括号里面和外面代表含义不同，如在外时，就匹配-，如果在中括号内[a-b]表示匹配26个小写字母中的任一个；[a-zA-Z]匹配大小写共52个字母中任一个；[0-9]匹配十个数字中任一个。

4. ^在中括号里面和外面含义不同，如在外时，就表示开头，如^7[0-9]表示匹配开头是7的，且第二位是任一数字的字符串；如果在中括号里面，表示除了这个字符之外的任意字符(包括数字，特殊字符)，如[^abc]表示匹配除去abc之外的其他任一字符。

5. .表示匹配任意的字符。

6. \d表示数字。

7. \D表示非数字。

8. \s表示由空字符组成，[\t\n\r\x\f]。

9. \S表示由非空字符组成，[^\s]。

10. \w表示字母、数字、下划线，[a-zA-Z0-9_]。

11. \W表示不是由字母、数字、下划线组成。

12. ?: 表示出现0次或1次。

13. +表示出现1次或多次。

14. *表示出现0次、1次或多次。

15. {n}表示出现n次。

16. {n,m}表示出现n~m次。

17. {n,}表示出现n次或n次以上。

18. XY表示X后面跟着Y，这里X和Y分别是正则表达式的一部分。

19. X|Y表示X或Y，比如"food|f"匹配的是foo（d或f），而"(food)|f"匹配的是food或f。

20. (X)子表达式，将X看做是一个整体
    
21. \b : 匹配一个单词边界，也就是指单词和空格间的位置（即正则表达式的“匹配”有两种概念，一种是匹配字符，一种是匹配位置，这里的\b就是匹配位置的）。例如，“er\b”可以匹配“never”中的“er”，但不能匹配“verb”中的“er”。
    
22. \B : 匹配非单词边界。“er\B”能匹配“verb”中的“er”，但不能匹配“never”中的“er”。
    
23. \d : 匹配一个数字字符。等价于[0-9]。grep 要加上-P，perl正则支持
    
24. \D : 匹配一个非数字字符。等价于[^0-9]。grep要加上-P，perl正则支持
    
25. \w : 匹配包括下划线的任何单词字符。类似但不等价于“[A-Za-z0-9_]”，这里的"单词"字符使用Unicode字符集。
    
26. \W : 匹配任何非单词字符。等价于“[^A-Za-z0-9_]”。
    
27. \s : 	
匹配任何不可见字符，包括空格、制表符、换页符等等。等价于[ \f\n\r\t\v]。
    
28. \S : 匹配任何可见字符。等价于[^ \f\n\r\t\v]。    
```

### 关于左右移运算符

```java
>> 为带符号右移，右移后左边的空位被填充为符号位
>>> 为不带符号右移，右移后左边的空位被填充为0
没有<<< 因为<<后右边总是补0
```

### 哪些行为会导致InterruptedException

```java
抛InterruptedException的代表方法有：

    1. java.lang.Object 类的 wait 方法

    2. java.lang.Thread 类的 sleep 方法

    3. java.lang.Thread 类的 join 方法
```

### 关于重载与重写

```java
1. 方法重写
    参数列表必须完全与被重写方法的相同；
    返回类型必须完全与被重写方法的返回类型相同；
    访问权限不能比父类中被重写的方法的访问权限更低。例如：如果父类的一个方法被声明为public，那么在子类中重写该方法就不能声明为protected。
    父类的成员方法只能被它的子类重写。
    声明为final的方法不能被重写。
    声明为static的方法不能被重写，但是能够被再次声明。
    子类和父类在同一个包中，那么子类可以重写父类所有方法，除了声明为private和final的方法。
    子类和父类不在同一个包中，那么子类只能够重写父类的声明为public和protected的非final方法。
    重写的方法能够抛出任何非强制异常，无论被重写的方法是否抛出异常。但是，重写的方法不能抛出新的强制性异常，或者比被重写方法声明的更广泛的强制性异常，反之则可以。
    构造方法不能被重写。
    如果不能继承一个方法，则不能重写这个方法。
    
2. 方法重载
    被重载的方法必须改变参数列表(参数个数或类型或顺序不一样)；
    被重载的方法可以改变返回类型；
    被重载的方法可以改变访问修饰符；
    被重载的方法可以声明新的或更广的检查异常；
    方法能够在同一个类中或者在一个子类中被重载。
    无法以返回值类型作为重载函数的区分标准。
```

### Web应用程序的文件与目录结构中，web.xml是放置

```
（1）/WEB-INF/web.xml 是部署描述文件

（2）/WEB-INF/classes 用来放置应用程序用到的自定义类(.class)，必须包括包(package)结构。

（3）/WEB-INF/lib 用来放置应用程序用到的JAR文件。
```

![webxml.png](https://s2.loli.net/2022/03/23/QOT8GfCVDnMeSEX.png)

### 创建线程的两种方式

```
1. 继承Thread类，重载run方法

2. 实现Runnable接口，实现run方法
```

## 2022.07.06

#### 关于静态成员和静态初始化块父子类下执行先后顺序

```java
public class Test1 {

    static int cnt = 6;
 
    static {
        cnt += 9;
    }
 
    public static void main(String[] args) {
        System.out.println("cnt =" + cnt);
    }
 
    static {
        cnt /= 3;
    }
}

// 解析
（1）父类静态成员和静态初始化块，按在代码中出现的顺序依次执行。（若静态初始化在前静态成员在后，则后面覆盖前面）
（2）子类静态成员和静态初始化块，按在代码中出现的顺序依次执行。
（3）父类实例成员和实例初始化块，按在代码中出现的顺序依次执行。
（4）执行父类构造方法。
（5）子类实例成员和实例初始化块，按在代码中出现的顺序依次执行。
（6）执行子类构造方法。
```

#### 创建新线程的两种方式（无返回值）

```java
// 方法1：继承Thread 重写run方法
class TestThread extends Thread{
    @Override
    public void run(){
        // 逻辑...
    }
}
TestThread tt = new TestThread()
tt.start()
 
// 方法2：实现Runnable接口 实现run方法
class TestThread implements Runnable{
    public void run(){
        // 逻辑...
    }
}
TestThread tt = new TestThread()
new Thread(tt).start()
    
若直接调用线程实例的run()方法，则跟当前线程同属一个线程    
```

#### 何为类方法

```java
所谓类的方法就是指类中用static 修饰的方法（非static 为实例方法）
```

#### java语言的下面几种数组复制方法中，哪个效率最高？

```java
System.arraycopy > clone > Arrays.copyOf > for循环
```

#### 有关SPRING的事务传播特性

```java
PROPAGATION_REQUIRED--支持当前事务，如果当前没有事务，就新建一个事务。这是最常见的选择。 
PROPAGATION_SUPPORTS--支持当前事务，如果当前没有事务，就以非事务方式执行。 
PROPAGATION_MANDATORY--支持当前事务，如果当前没有事务，就抛出异常。 
PROPAGATION_REQUIRES_NEW--新建事务，如果当前存在事务，把当前事务挂起。 
PROPAGATION_NOT_SUPPORTED--以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。 
PROPAGATION_NEVER--以非事务方式执行，如果当前存在事务，则抛出异常。
```

#### ArrayList与LinkedList优缺点及使用场景

```java
ArrayList：增删慢，查询快。
由于是数据组实现，需要连续的内存空间，如果删除数组中间的值，为了保证下标的有效性，需要将后面的数据往前移，所以删除慢。
当插入A对象到B对象的前面时，需要将B对象和B对象之后的所有对象后移一位，再插入A对象。所以插入慢。
数组的大小是固定的，如果数组满了，需要重新分配空间，new一个新数组并copy旧数据之后再增加新数据，所以增加慢。
因为是连续内存空间，可以通过下标查询数据，所以查询快。

LInkedList：增删快，查询慢。
由于是链表实现，当前节点的next指向下一个节点，prev指向上一个节点，不需要连续的内存空间，所以增删快。
因为不是连续内存空间，所以不能使用下标查询，只能通过next遍历，所以查询慢。
```

## 2022.07.07

#### Java中创建对象的方式

```java
1. 使用 new 关键字（最常用）： ObjectName obj = new ObjectName();

2. 使用反射的Class类的newInstance()方法： ObjectName obj = ObjectName.class.newInstance(); 

3. 使用反射的Constructor类的newInstance()方法： ObjectName obj = ObjectName.class.getConstructor.newInstance();

4. 使用对象克隆clone()方法： ObjectName obj = obj.clone(); 

5. 使用反序列化（ObjectInputStream）的readObject()方法： try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(FILE_NAME))) { ObjectName obj = ois.readObject(); }
```

## 2022.07.11

#### String, StringBuffer,StringBuilder的区别

```java
1. 可变与不可变
	String类中使用字符数组保存字符串，如下就是，因为有“final”修饰符，所以可以知道string对象是不可变的。
    private final char value[]
    
    StringBuilder与StringBuffer都继承自AbstractStringBuilder类，在AbstractStringBuilder中也是使用字符数组保存字符串，如下就是，可知这两种对象都是可变的。
    char[] value;

2. 是否多线程安全
    String中的对象是不可变的，也就可以理解为常量， 显然线程安全 。
    
    AbstractStringBuilder是StringBuilder与StringBuffer的公共父类，定义了一些字符串的基本操作，如expandCapacity、append、insert、indexOf等公共方法。
StringBuffer对方法加了同步锁或者对调用的方法加了同步锁，所以是 线程安全的
    
    StringBuilder并没有对方法进行加同步锁，所以是 非线程安全的 。
    
3. StringBuilder与StringBuffer共同点
    StringBuilder与StringBuffer有公共父类AbstractStringBuilder( 抽象类 )。

抽象类与接口的其中一个区别是：抽象类中可以定义一些子类的公共方法，子类只需要增加新的功能，不需要重复写已经存在的方法；而接口中只是对方法的申明和常量的定义。

StringBuilder、StringBuffer的方法都会调用AbstractStringBuilder中的公共方法，如super.append(...)。只是StringBuffer会在方法上加synchronized关键字，进行同步。

最后，如果程序不是多线程的，那么使用StringBuilder效率高于StringBuffer
    
4. 效率比较
    效率比较String < StringBuffer < StringBuilder
```

## 2022.07.25

#### synchronized关键字

```java
public class Test {
    // 同步非静态方法 锁得是“类实例对象this”
    private synchronized void a() {
    }
    // 同步静态方法 锁得是“Class对象”
    private synchronized static void c() {
    }
    private void b() {
        // 同步代码块 锁得是小括号中“指定的” 如下：锁的“类实例对象this”
        synchronized (this) {
        }
    }
    private void d() {
        // 同步代码块 锁得是小括号中“指定的” 如下：锁的“Class对象”
        synchronized (Test.class) {
        }
    }
}
```

#### 命令行 执行Java和编译Java

```java
java XXX // 执行java
javac XXX.java // 编译java源文件
```

#### 关于接口Interface中隐式声明

```java
接口，比抽象类还要抽象的类。
	1. 方法的隐式声明
    接口中每一个方法也是隐式抽象的,接口中的方***被隐式的指定为 public abstract （只能是 public abstract，其他修饰符都会报错）。
	2. 变量的隐式声明
    接口中可以含有变量，但是接口中的变量会被隐式的指定为  public static final   变量（并且只能是 public，用 private 修饰会报编译错误。）"同时均可以省略不写" 但是必要的是变量的"类型"和"初始值"(final)
	3. 规则
    接口中的方法是不能在接口中实现的，只能由实现接口的类来实现接口中的方法。

    注：
接口是隐式抽象的，当声明一个接口的时候，不必使用abstract关键字。
接口中每一个方法也是隐式抽象的，声明时同样不需要abstract关键字。
接口中的方法都是公有的。public
```

#### 关于HashMap与HashTable

```java
 1.  关于HashMap的一些说法： 
     a)  HashMap实际上是一个“链表散列”的数据结构，即数组和链表的结合体。HashMap的底层结构是一个数组，数组中的每一项是一条链表。
     b)  HashMap的实例有俩个参数影响其性能： “初始容量” 和 装填因子。 
     c)  HashMap实现不同步，线程不安全。  HashTable线程安全 
     d)  HashMap中的key-value都是存储在Entry中的。 
     e)  HashMap可以存null键和null值，不保证元素的顺序恒久不变，它的底层使用的是数组和链表，通过hashCode()方法和equals方法保证键的唯一性 
     f)  解决冲突主要有三种方法：定址法，拉链法，再散列法。
     HashMap是采用拉链法解决哈希冲突的。 注： 链表法是将相同hash值的对象组成一个链表放在hash值对应的槽位；    用开放定址法解决冲突的做法是：当冲突发生时，使用某种探查(亦称探测)技术在散列表中形成一个探查(测)序列。 沿此序列逐个单元地查找，直到找到给定 的关键字，或者碰到一个开放的地址(即该地址单元为空)为止（若要插入，在探查到开放的地址，则可将待插入的新结点存人该地址单元）。   拉链法解决冲突的做法是： 将所有关键字为同义词的结点链接在同一个单链表中 。若选定的散列表长度为m，则可将散列表定义为一个由m个头指针组成的指针数 组T[0..m-1]。凡是散列地址为i的结点，均插入到以T[i]为头指针的单链表中。T中各分量的初值均应为空指针。在拉链法中，装填因子α可以大于1，但一般均取α≤1。拉链法适合未规定元素的大小。 
     
 2.  Hashtable和HashMap的区别： 
     a)   继承不同。  public class Hashtable extends Dictionary implements Map public class HashMap extends  AbstractMap implements Map 
     b)  Hashtable中的方法是同步的，而HashMap中的方法在缺省情况下是非同步的。在多线程并发的环境下，可以直接使用Hashtable，但是要使用HashMap的话就要自己增加同步处理了。 
     c)  Hashtable 中， key 和 value 都不允许出现 null 值。 在 HashMap 中， null 可以作为键，这样的键只有一个；可以有一个或多个键所对应的值为 null 。当 get() 方法返回 null 值时，即可以表示 HashMap 中没有该键，也可以表示该键所对应的值为 null 。因此，在 HashMap 中不能由 get() 方法来判断 HashMap 中是否存在某个键， 而应该用 containsKey() 方法来判断。 
     d)  两个遍历方式的内部实现上不同。Hashtable、HashMap都使用了Iterator。而由于历史原因，Hashtable还使用了Enumeration的方式 。 
     e)  哈希值的使用不同，HashTable直接使用对象的hashCode。而HashMap重新计算hash值。 
     f)  Hashtable和HashMap它们两个内部实现方式的数组的初始大小和扩容的方式。HashTable中hash数组默认大小是11，增加的方式是old*2+1。HashMap中hash数组的默认大小是16，而且一定是2的指数。   
         注：  HashSet子类依靠hashCode()和equal()方法来区分重复元素。      
         HashSet内部使用Map保存数据，即将HashSet的数据作为Map的key值保存，这也是HashSet中元素不能重复的原因。而Map中保存key值的,会去判断当前Map中是否含有该Key对象，内部是先通过key的hashCode,确定有相同的hashCode之后，再通过equals方法判断是否相同。
```

#### 根类Object中包含的方法及用法

```java
1. protected Object clone()
    创建并返回此对象的一个副本。 
    
2. boolean equals(Object obj)
    指示其他某个对象是否与此对象“相等”。 
    
3. protected void finalize()
    当垃圾回收器确定不存在对该对象的更多引用时，由对象的垃圾回收器调用此方法。 
    
4. class  getClass()
    返回此 Object 的运行时类。 
    
5. int hashCode()
    返回该对象的哈希码值。 
    
6. void notify()
    唤醒在此对象监视器上等待的单个线程。 
    
7. void notifyAll()
    唤醒在此对象监视器上等待的所有线程。
    
8. String toString()
    返回该对象的字符串表示。
    
9. void wait()
    在其他线程调用此对象的 notify() 方法或 notifyAll() 方法前，导致当前线程等待。 
    
10. void wait(long timeout)
    在其他线程调用此对象的 notify() 方法或 notifyAll() 方法，或者超过指定的时间量前，导致当前线程等待。
    
11. void wait(long timeout, int nanos)
    在其他线程调用此对象的 notify() 方法或 notifyAll() 方法，或者其他某个线程中断当前线程，或者已超过某个实际时间量前，导致当前线程等待。
```

#### 二维数组声明的几种方式

```java
int [][] table = new int[2][2];
int [][] table = new int[2][]; 

int [] table [] = new int[2][2];
int [] table [] = new int[2][];

1.  定义一维数组时，必须显式指明数组的长度
    int []a = new int[3]
    int a[] = new int[3]
    
2. 定义多维数组时，其一维数组的长度必须首先指明，其他维数组长度可以稍后指定
    int a[][] = new int[3][]

3. “[]” 是数组运算符的意思，在声明一个数组时，数组运算符可以放在数据类型与变量之间，也可以放在变量之后
    int a[][] = new int[3][3]
    int []a[] = new int[3][3]
    int [][]a = new int[3][]
```

## 2022.07.26

#### 关于&运算符计算方式

```java
13 & 17 
    13： 01101
    17： 10001
    
此时：若对应位都是1(真)，则为1(真)，否则为0(假)
    结果：00001 -> 1
```

#### 内存划分

```java
新生代（Young）
    Eden 区
    From Survivor 区
    To Survivor 区
老生代（Old）
```

#### 类型转换规则

```java
byte b1=1,b2=2,b3,b6,b8;
final byte b4=4,b5=6,b7;
b3=(b1+b2);  /*语句1*/ 强转 b3 = (byte)(b1+b2)
b6=b4+b5;    /*语句2*/ 不自动提升 主要看b6类型 即通过
b8=(b1+b4);  /*语句3*/ 非final如b1自动提升为int 即强转 b8 = (byte)(b1+b4)
b7=(b2+b5);  /*语句4*/ final一旦定义 则不修改
System.out.println(b3+b6);

定义：
     1、所有的byte,short,char型的值将被提升为int型；
	2、如果有一个操作数是long型，计算结果是long型；
	3、如果有一个操作数是float型，计算结果是float型；
	4、如果有一个操作数是double型，计算结果是double型；
	5、被fianl修饰的变量不会自动改变类型，当2个final修饰相操作时，结果会根据左边变量的类型而转化。
```

## 2022.07.27

#### Java中标识符命名规则

```java
由26个英文字母大小写，数字：0-9 符号：_ $ 组成
标识符应以字母、_ 、$开头。
标识符不能是关键字。
严格区分大小写 
```

#### 类的分类及可使用的访问修饰符

```java
1. 普通类（外部类）
    public default(啥都不写) abstract final 均可修饰

2. 成员类（内部）// 也可理解为外部类成员
    public default(啥都不写) protected private static final abstract(抽象)
    
    2.1 局部内部类（出现在方法里面的类）
        以方法的访问修饰符为准，因此不用其他关键字再来修饰

    2.2 匿名内部类（类似局部变量）
    	直接实现，类名都无，即无访问修饰符
    
```

#### 关于数值类型之间的转换

```java
当两个数值进行二元操作时，先要将两个操作数转换为同一个类型，再进行计算，转换规则如下顺序：
    •如果两个操作数中有一个是 double 类型， 另一个操作数就会转换为 double 类型。
	•否则，如果其中一个操作数是 float 类型，另一个操作数将会转换为 float 类型。
	•否则， 如果其中一个操作数是 long 类型， 另一个操作数将会转换为 long 类型。
	•否则， 两个操作数都将被转换为 int 类型。
```

## 2022.08.02

#### 内部类

```java
1. 成员内部类
    1.1 非静态成员内部类
    	public class Outer{ 
            private int age = 99;
            String name = "Coco";
            public class Inner{ // 特点1
                String name = "Jayden"; // 特点4
                public void show(){
                    System.out.println(Outer.this.name); // 特点5
                    System.out.println(name);
                    System.out.println(age); // 特点2
                }
            }
            public Inner getInnerClass(){
                return new Inner();
            }
            public static void main(String[] args){
                Outer o = new Outer();
                Inner in = o.new Inner(); // 特点3
                in.show();
            }
        }
		
		特点：
            1.1.1 Inner类可以使用任意的"访问控制符"，如public、protected、private、default等（上述注释特点1）
            1.1.2 Inner类中的方法可以直接访问Outer类中的成员数据，而不受"访问控制符"影响，如上述特点2处访问Outer类中的private属性（上述注释特点2）
            1.1.3 如何创建Inner类的对象：内部类 对象名 = 外部类对象.new 内部类() （上述注释特点3）
            1.1.4 编译后会产生两个.class文件
            1.1.5 非静态内部成员类，不能定义任何static变量和方法
            1.1.6 Outer类不能直接访问Inner类成员和方法，可先创建内部类的对象，再来访问
            1.1.7 若Inner类和Outer类具有相同的成员变量和方法，Inner类默认访问自己的成员变量和方法，若要访问外部类，则使用this关键字：Outer.this.name（上述注释特点5）
            
            
    1.2 静态成员内部类
        public class Outer{
			private int age = 99;
			static String name = "Coco";
             static String sex = "man";
			public static class Inner{ // 特点1
				String name = "Jayden";
				public void show(){
					System.out.println(Outer.name); // 特点4
					System.out.println(name);	
                      System.out.println(new Outer().age); // 特点3
                      System.out.println(sex); // 特点5
				}
			}
			public static void main(String[] args){
				Inner i = new Inner(); // 特点2
				i.show();
			}
		}

		特点：
            1.2.1 静态内部类就是使用static关键字修饰的成员内部类（上述注释特点1）
            1.2.2 静态内部类不能直接访问外部类的非静态成员，但可以通过new Outer().xxx来访问（上述注释特点3）
            1.2.3 若外部静态成员与内部静态成员名称相同，则需要访问外部类静态成员时，可以使用"类名.静态成员"指定访问外部（上述注释特点4）
            1.2.4 若外部静态成员与内部静态成员名称不同时，则直接通过"成员名"直接调用外部类的静态成员（上述注释特点5）
            1.2.5 创建静态内部类的对象时，不需要外部类对象，直接"内部类 对象名 = new 内部类()" （上述注释特点2）
    
2. 方法内部类（局部内部类）
          public class Outer{
            public void Show(){
                final int a = 25;
                int b = 13;
                class Inner{ // 特点1
                    int c = 2;
                    public void print(){
                        System.out.println("访问外部类:" + a); // 特点2
                        System.out.println("访问内部类:" + c);
                    }
                }
                Inner i = new Inner();
                i.print();
            }
            public static void main(String[] args){
                Outer o = new Outer();
                o.show();
            }
        } 

	    特点：
            2.1 其作用域仅限于方法内，方法外部无法访问该内部类
    	    2.2 局部内部类就像方法里面的一个局部变量一样，"不能有public、protected、private、以及static修饰符，但可以有abstract、final修饰符"（上述注释特点1）
            2.3 方法内部类中，只能去访问方法体中的"final"类型的局部变量（上述注释特点2）
            原因：当方法被调用运行完毕之后，局部变量就已消亡了。但内部类对象可能还存在,直到没有被引用时才会消亡。此时就会出现一种情况，就是内部类要访问一个不存在的局部变量;使用final修饰符不仅会保持对象的引用不会改变,而且编译器还会持续维护这个对象在回调方法中的生命周期.局部内部类并不是直接调用方法传进来的参数，而是内部类将传进来的参数通过自己的构造器备份到了自己的内部，自己内部的方法调用的实际是自己的属性而不是外部类方法的参数（注意:在JDK8版本之中,方法内部类中调用方法中的局部变量,可以不需要修饰为 final,匿名内部类也是一样的，主要是JDK8之后增加了 Effectively final 功能）
            
3. 匿名内部类
        public class OuterClass {
            public InnerClass getInnerClass(final int   num,String str2){
                return new InnerClass(){
                    int number = num + 3;
                    public int getNumber(){
                        return number;
                    }
                };        /* 注意：分号不能省 */
            }
            public static void main(String[] args) {
                OuterClass out = new OuterClass();
                InnerClass inner = out.getInnerClass(2, "chenssy");
                System.out.println(inner.getNumber());
            }
        }
        interface InnerClass {
            int getNumber();
        } 

		特点：
            3.1 匿名内部类是直接使用 new 来生成一个对象的引用
            3.2 匿名内部类中是不能定义构造函数的,匿名内部类中不能存在任何的静态成员变量和静态方法
```

![内部类.png](https://s2.loli.net/2022/08/02/WTIP3dghtbvqKCc.png)

#### 常用修饰符

```java
1. 权限修饰符：
    private :        修饰私有变量
    默认修饰符default（不用把default写出来）： 比private限制更少，但比protected限制更多
    protected:    修饰受保护变量
    public :         修饰公有变量

2. 状态修饰符：
    final 最终变量（final修饰类，该类不能被继承，final修饰方法，该方法不能被重写，final修饰变量，该变量不能被重新赋值（相当于常量））
    static 静态变量（随着类的加载而加载，优先于对象存在，被所有对象所共享，可以通过类名调用）且静态变量只能在类主体中定义，不能在方法中定义。 静态变量属于类所有而不属于方法。

3. 抽象修饰符：
	abstract 抽象类&抽象方法（抽象类不能被实例化，抽象类中不一定有抽象方法，但有抽象方法的类必须定义为抽象类）
```

#### try-catch-finally

```java
try的形式有三种：
    try-catch
    try-finally
    try-catch-finally
但catch和finally语句不能同时省略！
```

#### 位运算符

```java
1. << 左移运算符
    "丢弃左边指定位数，右边补0"
    int x = 123
    x << 1 // 左移1位
    x << 8 // 左移8位
    x << 32 // int类型超过32位时，需与32取余值为左移位数 32%32=0 位
    x << 40 // int类型超过32位时，需与32取余值为左移位数 40%32=8 位
    
    long xl = 2342342423L
    x << 1 // 左移1位
    x << 8 // 左移8位
    x << 64 // long类型超过64位时，需与64取余值为左移位数 64%64=0 位
    x << 72 // long类型超过64位时，需与64取余值为左移位数 72%64=8 位
    
    左移后，最高位0表示正数，1表示负数
    若左移1位，则直接(值*2)
    
    其中double，float不能进行移位操作
    
2. >> 右移运算符
    "丢弃右边指定位数，左边补上符号位"，其中符号位表示原数据的最高位0或者1
    
3. >>> 无符号右移运算符
    "丢弃右边指定位数，左边补0"
```

