## 2022.05.14

#### 什么是IOC

```java
1. 概念
	控制反转，把对象创建和对象之间的调用过程，交给Spring进行管理；
	目的是为了耦合度降低。

2. 底层原理
	xml解析、工厂模式、反射
	2.1 在配置文件（例如 Bean.xml）中，对各个对象以及它们之间的依赖关系进行配置；
	2.2 我们可以把 IoC 容器当做一个工厂，这个工厂的产品就是 Spring Bean；
	2.3	容器启动时会加载并解析这些配置文件，得到对象的基本信息以及它们之间的依赖关系；
	2.4 IoC 利用 Java 的反射机制，根据类名生成相应的对象（即 Spring Bean），并根据依赖关系将这个对象注入到依赖它的对象中。
```

#### IOC容器的两种实现

```java
1. IoC 思想基于 IoC 容器实现的，IoC 容器底层其实就是一个 Bean 工厂。

2. Spring提供了IOC容器实现的两种方式（两个接口）
    2.1 BeanFactory: IOC容器的基本实现，是Spring内部使用，不建议给开发人员使用	
        // 由 org.springframework.beans.factory.BeanFactory 接口定义。
        
        特点：BeanFactory 采用懒加载（lazy-load）机制，容器在加载配置文件时并不会立刻创建 Java 对象，只有程序中获取（使用）这个对对象时才会创建。
        BeanFactory context = new ClassPathXmlApplicationContext("Beans.xml");
        HelloWorld obj = context.getBean("helloWorld", HelloWorld.class);
        obj.getMessage();
    
    2.2 ApplicationContext：BeanFactory接口的子接口,是对BeanFactory的扩展，一般开发人员直接使用
        // 而ApplicationContext接口下有2个实现类						
        ClassPathXmlApplicationContext：加载"类路径"classpath下指定的XML配置文件
        // ApplicationContext applicationContext = new ClassPathXmlApplicationContext(String configLocation);
        FileSystemXmlApplicationContext：加载指定的文件系统路径中的xml配置文件
        // ApplicationContext applicationContext = new FileSystemXmlApplicationContext(String configLocation);
        BeanFactory context = new FileSystemXmlApplicationContext("D:\\eclipe workspace\\spring workspace\\HelloSpring\\src\\Beans.xml");
        HelloWorld obj = context.getBean("helloWorld", HelloWorld.class);
        obj.getMessage();
        
        特点：在加载配置文件的时候就会把配置文件中的所有对象进行创建
```

#### IOC操作Bean管理

```java
1. 依赖注入（CI）
	在面向对象中，对象和对象之间是存在一种叫做“依赖”的关系。简单来说，依赖关系就是在一个对象中需要用到另外一个对象，即对象中存在一个属性，该属性是另外一个类的对象。	
	控制反转核心思想就是由 Spring 负责对象的创建。在对象创建过程中，Spring 会自动根据依赖关系，将它依赖的对象注入到当前对象中，这就是所谓的“依赖注入”。
    依赖注入本质上是 Spring Bean 属性注入的一种，只不过这个属性是一个对象属性而已。
```

```java
2. 基于xml方式创建对象
    // beans.xml
    <bean id="idUser" class="com.home.pojo.User"></bean>
    同时，bean标签中可以添加对应的属性，可以更完善的创建对象，比较常用的如id（唯一标识名称），class属性（类全路径、包类路径），要注意的是，SpringIOC容器在创建对象的时候，默认执行的是无参构造方法，若只有有参则创建报错    
```

![CI-属性.png](https://s2.loli.net/2022/05/14/dXmsND2kPLOzYUu.png)

```java
3. Spring Bean属性注入
    所谓 Bean 属性注入，简单点说就是将属性注入到 Bean 中的过程，而这属性既可以普通属性，也可以是一个对象（Bean）。
    Spring主要通过2种方式实现属性注入：
    	有参构造函数注入
    	setter注入（设值注入）
    
    3.1 // setter注入 （通过Bean的setter方法，将属性值注入到Bean属性中）
    	3.1.1 在Bean中（如User.java）中提供一个默认的无参构造函数，并为所需要注入的属性提供一个setXxx()方法
            private String username;
            private Integer id;
            public void setUsername(String username) {
                this.username = username;
            }
            public void setId(Integer id) {
                this.id = id;
            }

    	3.1.2 在Spring的xml配置文件中，使用<beans>及其子元素<bean>对Bean进行定义
    	3.1.3 在<bean>元素内使用<property>元素对各个属性进行赋值
            <bean id="idUserCISetter" class="com.home.pojo.UserCI">
                  <property name="id" value="1"/>
                  <property name="username" value="李大爷"/>
            </bean>
                
    3.2 //  有参构造函数注入
          3.2.1 在 Bean 中添加一个有参构造函数，构造函数内的每一个参数代表一个需要注入的属性
                private Integer id;
                private String username;
                private Integer age;
                public UserCIConstruct(Integer id, String username, Integer age) {
                    this.id = id;
                    this.username = username;
                    this.age = age;
                }

          3.2.2 在 Spring 的 XML 配置文件中，通过 <beans> 及其子元素 <bean> 对 Bean 进行定义
          3.2.3 在 <bean> 元素内使用 <constructor-arg> 元素，对构造函数内的属性进行赋值，Bean 的构造函数内有多少参数，就需要使用多少个 <constructor-arg> 元素
              	<bean id="idUserCIConstruct" class="com.home.pojo.UserCIConstruct">
                    <constructor-arg name="id" value="2"/>
                    <constructor-arg name="username" value="李大爷"/>
                    <!--        <constructor-arg index="2" value="20"/> index对应属性位置从0 1 2...这样-->
                </bean>
                    
     3.3 p命名空间操作 // 对应setter方法注入
           3.3.1  在配置文件的 <beans> 元素中导入以下 XML 约束。        
                  xmlns:p="http://www.springframework.org/schema/p"
                  <bean id="Bean 唯一标志符" class="包名+类名" p:普通属性="普通属性值" p:对象属性-ref="对象的引用">
           3.3.2 注意事项 （使用p命名空间）
                      Java类中必须有setter方法
                      Java 类中必须有无参构造器（类中不包含任何带参构造函数的情况，无参构造函数默认存在）
					在使用 p 命名空间实现属性注入前，XML 配置的 <beans> 元素内必须先导入 p 命名空间的 XML 约束
                      
     3.4 c命名空间操作 // 对应构造函数方法注入
           3.4.1  在配置文件的 <beans> 元素中导入以下 XML 约束。    
                  xmlns:c="http://www.springframework.org/schema/c"
                  <bean id="Bean 唯一标志符" class="包名+类名" c:普通属性="普通属性值" c:对象属性-ref="对象的引用">  
           3.4.2 注意事项 （使用c命名空间）
                      Java 类中必须包含对应的带参构造器；
					在使用 c 命名空间实现属性注入前，XML 配置的 <beans> 元素内必须先导入 c 命名空间的 XML 约束。
```
