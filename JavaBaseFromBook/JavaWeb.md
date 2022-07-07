## 2022.04.16

#### 单元测试

```java
1. 什么是单元测试
   	就是针对最小的功能单元编写测试代码，Java程序最小的功能单元是方法，因此，单元测试就是针对Java方法的测试，进而检查方法的正确性。
```

#### 反射

```java
1. 什么是反射
    是指对于任何一个Class类，在"运行的时候"都可以直接得到这个类全部成分，如：
    	构造器对象：Constructor
    	成员变量对象：Filed
    	成员方法对象：Method
    这种运行时动态获取类信息以及调用类中成分的能力称为Java的反射机制。

2. 关键
    反射的第一步都是先得到编译后的Class类对象，然后取Class全部成分。

3. 获取Class类的对象的三种方式
    3.1 Class c1 = Class.forName("全路径名：包名+类名")
    3.2 Class c2 = 类名.class
    3.3 Class c3 = 对象.getClass()
        
4. 获取构造器方式
    getDeclaredConstructors()
    getDeclaredConstructor(Class<T>... parameterTypes)
    
    反射得到的构造器用来做什么？
       	依然是创建对象: public newInstance(Object... initargs)
        若是非public的构造器，需要打开权限（暴力反射），然后再创建对象
            setAccessible(boolean)
            反射可以破坏封装性，私有的也可以执行了。
            
5. 获取成员变量方式
    getDeclaredFields()
    getDeclaredField(String name)
    
    反射得到成员变量用来做什么？
         依然是在某个对象中取值和赋值
            void set(Object obj, Object value);
			Object get(Object obj)
         若成员变量是非public，同样需要暴力反射，再取值赋值
            setAccessible(boolean)
          
6. 获取成员方法方式
     getDeclaredMethods()
     getDeclaredMethod(String name, Class<?>... parameterTypes)
     
     反射得到成员方法用来做什么？
          依然是在某个对象中触发该方法执行
             Object invoke(Object obj, Object... args) // 使用Object来接返回值，若无则为null
          若成员方法是非public，同样需要暴力反射，再取值赋值
            setAccessible(boolean)
                
7. 反射的作用
      7.1 可以给约定了泛型的集合存入其他类型的元素
             编译成Class文件进入运行阶段的时候，泛型会自动擦除
             反射是作用在运行时的技术，此时已经不存在泛型了
      7.2 可以在运行时得到一个类的全部成分然后操作
      7.3 可以破环封装性
      7.4 适合做Java高级框架
```

#### 注解

```java
1. 什么是注解
    1.1 Annotation又叫标注，是jdk5引入的注释机制
    1.2 Java中的"类"、"构造器"、"方法"、"成员变量"、"参数"等都可以被注解进行标注
 
2. 作用    
    "对Java中类、方法、成员变量做标记，然后进行特殊处理"，至于做何种处理由业务需求来决定
    
3. 自定义注解
    public @interface 注解名称 {
    	public 属性类型(Java支持的都支持) 属性名() default 默认值;
	}
	其中：若注解只有一个value属性的情况下，则可以省略value的名称不写; 若存在多个value，则不能省略。
        
4. 元注解
        4.1 注解<注解>的注解
        4.2
			@Target: 约束自定义注解只能在哪些地方使用
                ElementType枚举值中常用值如下：
					TYPE, 类，接口
                	FIELD, 成员变量
                	METHOD, 成员方法
                	PARAMETER, 方法参数
                	CONSTRUCTOR, 构造器
                	LOCAL_VARIABLE，局部变量
                如：
                @Target({ElementType.METHOD}) // 只能在方法上使用
                public @interface 注解名称 {
                    public 属性类型(Java支持的都支持) 属性名() default 默认值;
                }

            @Retention: 声明注解的生命周期
                RetentionPolicy枚举值中常用值如下：
                	SOURCE: 注解只作用在源码阶段，生成的字节码文件中不存在
                    CLASS: 注解作用在源码阶段，字节码文件姐u但，运行阶段不存在，默认值。
                    RUNTIME: 注解作用在源码阶段、字节码文件阶段、运行阶段（开发常用）
                如：
                @Retention({RetentionPolicy.RUNTIME}) // 只能在方法上使用
                public @interface 注解名称 {
                    public 属性类型(Java支持的都支持) 属性名() default 默认值;
                }   

5. 注解的解析
    5.1 注解的操作中经常需要进行解析，注解的解析就是判断是否存在注解，存在注解就解析出内容。
    
    5.2 与注解解析相关的接口
   		5.2.1 Annotation: 注解的顶级接口，注解都是Annotation类型的对象
        5.2.2 AnnotatedElement: 该接口定义了与注解解析相关的解析方法
            
    5.3
        Annotation[] getDeclaredAnnotations()
        T getDeclaredAnnotation(Class<T> annotationClass)
        boolean isAnnotationPresent(Class<Annotation> annotationClass)
```

## 2022.07.07

#### Servlet关系图

![servlet.png](https://s2.loli.net/2022/07/07/O3ufLoS6PA4Xc7s.png)
