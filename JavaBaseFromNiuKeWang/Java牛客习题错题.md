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

