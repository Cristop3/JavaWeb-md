## 2022.05.14

#### Spring注入外部Bean

```java
1. 创建service类和dao类
2. service调用dao
    // service
    public class UserServiceImpl implements UserService {
        // 1. 以dao类作为service类属性
        private UserDao userDao;
        // 2. 用setter方法注入dao类对象
        public void setUserDao(UserDao userDao) {
            this.userDao = userDao;
        }
        @Override
        public void testService() {
            System.out.println("i am service func now excute......");
            // 3. 在service方法中调用dao类方法
            userDao.update();
        }
    }
	// dao
    public class UserDaoImpl implements UserDao {
        @Override
        public void update() {
            System.out.println("from dao update func by service func....");
        }
    }

3. spring的xml配置文件中配置
    <!--    依赖注入 外部Bean 采用setter方法
            1. 首先注入Service类
        -->
    <bean id="userServiceImpl" class="com.home.service.impl.UserServiceImpl">
        <!--        3. 此时不再使用value属性 使用ref引用dao类指定id-->
        <property name="userDao" ref="userDaoImpl"/>
    </bean>
    <!--    2. 再注入Dao类-->
    <bean id="userDaoImpl" class="com.home.dao.impl.UserDaoImpl"/>
```

#### Spring注入内部Bean

```java
将定义在 <bean> 元素的 <property> 或 <constructor-arg> 元素内部的 Bean，称为“内部 Bean”。
 
1. 创建dept类和emp类（部门和员工 1对多）
    // dept
    public class Dept {
        private Integer deptno;
        private String dname;
        // 2. 有参构造函数方式
        public Dept(Integer deptno, String dname) {
            this.deptno = deptno;
            this.dname = dname;
        }
        // 1. setter方式
        public void setDeptno(Integer deptno) {
            this.deptno = deptno;
        }
        public void setDname(String dname) {
            this.dname = dname;
        }
        @Override
        public String toString() {
            return "Dept{" +
                "deptno=" + deptno +
                ", dname='" + dname + '\'' +
                '}';
        }
    }
	// emp
    public class Emp {
        private Integer empno;
        private String ename;
        private Dept dept;
        // 2. 有参构造函数方式
        public Emp(Integer empno, String ename, Dept dept) {
            this.empno = empno;
            this.ename = ename;
            this.dept = dept;
        }
        // 1. setter方式
        public void setEmpno(Integer empno) {
            this.empno = empno;
        }
        public void setEname(String ename) {
            this.ename = ename;
        }
        public void setDept(Dept dept) {
            this.dept = dept;
        }
        @Override
        public String toString() {
            return "Emp{" +
                "empno=" + empno +
                ", ename='" + ename + '\'' +
                ", dept=" + dept +
                '}';
        }
    }

2. 配置xml文件
    // setter方式
    <bean id="idEmp" class="com.home.pojo.Emp">
        <property name="empno" value="1"/>
        <property name="ename" value="李大爷"/>
        <property name="dept">
            <bean class="com.home.pojo.Dept">
                <property name="deptno" value="1001"/>
                <property name="dname" value="综合管理部"/>
            </bean>
        </property>
    </bean>
    // 构造函数方式
    <bean id="idEmpC" class="com.home.pojo.Emp">
        <constructor-arg name="empno" value="2"/>
        <constructor-arg name="ename" value="李二爷"/>
        <constructor-arg name="dept">
            <bean class="com.home.pojo.Dept">
                <constructor-arg name="deptno" value="1002"/>
                <constructor-arg name="dname" value="市场营销部"/>
            </bean>
        </constructor-arg>
    </bean>
```

#### Spring注入集合（Array&List&Map&Set）

```java
1. 准备一个包含集合属性的类
    public class CollectionTypes {
        // 1. 数组
        private String[] arrays;
        // 2. List
        private List<String> lists;
        // 3. Map
        private Map<String, String> maps;
        // 4. Set
        private Set<Integer> sets;
        // 5. List中带对象
        private List<User> listsObject;
        // 6. 带公共List的属性
        private List<String> commonLists;
        public void setCommonLists(List<String> commonLists) {
            this.commonLists = commonLists;
        }
        public void setListsObject(List<User> listsObject) {
            this.listsObject = listsObject;
        }
        public void setArrays(String[] arrays) {
            this.arrays = arrays;
        }
        public void setLists(List<String> lists) {
            this.lists = lists;
        }
        public void setMaps(Map<String, String> maps) {
            this.maps = maps;
        }
        public void setSets(Set<Integer> sets) {
            this.sets = sets;
        }
        @Override
        public String toString() {
            return "CollectionTypes{" +
                    "arrays=" + Arrays.toString(arrays) +
                    ", lists=" + lists +
                    ", maps=" + maps +
                    ", sets=" + sets +
                    ", listsObject=" + listsObject +
                    ", commonLists=" + commonLists +
                    '}';
        }
    }

2. xml文件中配置
    <!--     依赖注入 集合类型 采用setter -->
    <bean id="collectionTypes" class="com.home.pojo.CollectionTypes">
        <!--        1.Arrays-->
        <property name="arrays">
            <array>
                <value>arrays1</value>
                <value>arrays2</value>
                <value>arrays3</value>
            </array>
        </property>
        <!--        2.List-->
        <property name="lists">
            <list>
                <value>list1</value>
                <value>list2</value>
                <value>list3</value>
            </list>
        </property>
        <!--        3.Map-->
        <property name="maps">
            <map>
                <entry key="key1" value="mapsValue1"/>
                <entry key="key2" value="mapsValue2"/>
            </map>
        </property>
        <!--        4.Set-->
        <property name="sets">
            <set>
                <value>1</value>
                <value>2</value>
                <value>3</value>
            </set>
        </property>
        <!--        5.List<Object>-->
        <property name="listsObject">
            <list>
                <ref bean="idUser"/>
                <ref bean="idUser2"/>
            </list>
        </property>
        <!--        6.commonLists-->
        <property name="commonLists" ref="commonList"/>
    </bean>
    // 给5.List<User>使用    
    <bean id="idUser" class="com.home.pojo.User">
        <property name="username" value="我是list集合中的对象" />
    </bean>
    <bean id="idUser2" class="com.home.pojo.User">
        <property name="username" value="我是list集合中的对象2" />
    </bean>    
    // 给6.commLists使用
    其中需要添加命名空间
    // xmlns:util="http://www.springframework.org/schema/util"
    // 在xsi:schemaLocation这个后面添加 http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util.xsd    
    <!--    公共List集合被多处使用 需要用到util命名空间-->
    <util:list id="commonList">
        <value>我是公共List元素1</value>
        <value>我是公共List元素2</value>
        <value>我是公共List元素3</value>
    </util:list>    
```

#### Spring注入其他类型

```java
除了以上可以注入外，Spring也支持将例如 Null 值、字面量、复合物属性等注入到Bean中

1. Null值 // 使用<null />标签
   <property name="propertyNull">
    <null/>
   </property>

2. 空字符串
    <property name="propertyEmptyString" value="" />
    
3. 特殊字面量 // 在 XML 配置中“<”、“>”、“&”等特殊字符是不能直接保存   
    <property name="propertyLiteral" value="&lt;我是含特殊字符&gt;" />
    或者使用xml文件专属短字符串<![CDATA[]]> 
    <property name="propertyLiteral" value="![CDATA[<我是含特殊字符>]]" />
    
4. 级联属性
    可以在 <bean> 的 <property> 子元素中，为它所依赖的 Bean 的属性进行赋值，这就是所谓的“级联属性赋值”。
    但需要注意以下3点：
    	Java 类中必须有 setter 方法；
	    Java 类中必须有无参构造器（默认存在）；
	    依赖其他 Bean 的类中，必须提供一个它依赖的 Bean 的 getXxx() 方法。
    // Emp
    public class Emp {
        private Dept dept;
        public Dept getDept() { // 必须提供依赖其他Bean的getXxx()方法
            return dept;
        }
    }
	// Dept
	public class Dept {
        private Integer deptno;
        private String dname;
        	public void setDeptno(Integer deptno) {
        	this.deptno = deptno;
    	}
        public void setDname(String dname) {
            this.dname = dname;
        }
    }
	// xml
	<bean id="idEmp" class="com.home.pojo.Emp">
        <property name="dept" ref="idDept"/>
        <property name="dept.dname" value="综合管理部"/> // 级联赋值
        <property name="dept.deptno" value="1001"/> // 级联赋值
    </bean>
    <bean id="idDept" class="com.home.pojo.Dept"/>
```

## 2022.05.15

#### Spring两种Bean类型

```java
通常来说，Spring中存在两种Bean，一种普通的Bean（比如上面在xml里面写的所有bean）,还有一种就是工厂bean(FactoryBean)
1. 普通bean (在配置文件中定义的bean类型就是返回类型)
	如：<bean id="xxx" class="com.xxx.xx.User" /> // 此处定义了bean是User类型
	User user = context.getBean("xxx", User.class) // 这里接收使用User类型

2. 工厂bean，可以在配置文件中定义的bean类型和返回类型不一样
        2.1 创建类，让这个类实现接口"FactoryBean"
        2.2 实现接口里面的方法，在实现方法中定义返回的bean类型
```

#### Spring中的Bean作用域

```java
默认情况下，所有的 Spring Bean 都是单例的，但是我们可以在 <bean> 元素中添加 scope 属性来配置 Spring Bean 的作用范围。
    <bean id="xxx" class="com.xxx.xx.Test" scope="prototype" />
    1. singleton // 默认 单例模式 加载spring 配置文件时候就会创建单实例对象
    
    2. prototype // 多例模式 不是在加载 spring 配置文件时候创建 对象，在调用getBean 方法时候创建多实例对象
```

![Bean-Scope.png](https://s2.loli.net/2022/05/15/2VOzGqcXfIHmeZB.png)

#### Spring中Bean的生命周期

```java
对于 singleton 作用域的 Bean 来说，Spring IoC 容器能够精确地控制 Bean 何时被创建、何时初始化完成以及何时被销毁；
对于 prototype 作用域的 Bean 来说，Spring IoC 容器只负责创建，然后就将 Bean 的实例交给客户端代码管理，Spring IoC 容器将不再跟踪其生命周期。
    
1. 生命周期 （简化版 5步）
    Bean 的实例化 // 通过构造器创建 bean 实例（无参数构造）
    Bean 属性赋值 // 为 bean 的属性设置值和对其他 bean 引用（调用 set 方法）
    Bean 的初始化 // 调用 bean 的初始化的方法（需要进行配置初始化的方法）
    Bean 的使用 // bean 可以使用了（对象获取到了）
    Bean 的销毁 // 当容器关闭时候，调用 bean 的销毁的方法（需要进行配置销毁的方法）
    // Book.java	
    public class Book {
        private String bName;
        public Book() {
            System.out.println("1. 无参构造函数被调用");
        }
        public void setbName(String bName) {
            this.bName = bName;
            System.out.println("2. setXxx()方法被调用");
        }
        // 初始化方法
        public void initMethodFromBook() {
            System.out.println("3. 初始化被调用");
        }
        // 销毁方法
        public void destroyMethodFromBook(){
            System.out.println("5. 销毁方法被调用");
        }
    }
	// beans.xml
	<!--    测试Bean生命周期-->
    <bean id="idBook" class="com.home.pojo.Book" init-method="initMethodFromBook"
          destroy-method="destroyMethodFromBook">
        <property name="bName" value="这是一本书"/>
    </bean>
    // 其中init-method和destroy-method是3种方式中的一种，指定"bean"初始化的回调和销毁回调
        
    // test
    ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("/beans.xml");
    Book book = context.getBean("idBook", Book.class);
    System.out.println("4. bean被使用了");
    context.close();

	// Bean的生命周期回调方法主要有两种：
	// 初始化回调方法：在Spring Bean被初始化后调用，执行一些自定义的回调操作
	// 销毁回调方法：在Spring Bean被销毁前调用，执行一些自定义的回调操作

	// 同时，可以有3种方式自定义Bean的生命周期回调方法：
	// 1. 通过接口实现 （Bean Java类实现 InitializingBean(afterPropertiesSet方法) 和 DisposableBean(destroy方法) 接口）
	// 2. 通过xml配置init-method和destroy-method（如上面所示）
	// 3. 通过注解实现 @PostConstruct 和 @PreDestory

2. 生命周期（增加后置处理器方法 7步）
    BeanPostProcessor 接口也被称为后置处理器，通过该接口可以自定义调用初始化前后执行的操作方法。
    主要重写其"postProcessBeforeInitialization"和"postProcessAfterInitialization"方法，若存在多个后置处理器，则可以继续实现Ordered接口，重写其"getOrder"方法，数值越大则执行越靠后
    // 最后在bean中配置 则所有的Bean创建都会执行该两次回调方法
    <!--    后置处理器-->
    <bean class="com.home.pojo.BookBack" />
        
    （1）通过构造器创建 bean 实例（无参数构造）
    （2）为 bean 的属性设置值和对其他 bean 引用（调用 set 方法）
     //（3）把 bean 实例传递 bean 后置处理器的方法 postProcessBeforeInitialization 
    （4）调用 bean 的初始化的方法（需要进行配置初始化的方法）
     // （5）把 bean 实例传递 bean 后置处理器的方法 postProcessAfterInitialization
    （6）bean 可以使用了（对象获取到了）
    （7）当容器关闭时候，调用 bean 的销毁的方法（需要进行配置销毁的方法）

3. 生命周期（详细版）
    2.1 Spring 启动，查找并加载需要被 Spring 管理的 Bean，对 Bean 进行实例化。
    2.2 对 Bean 进行属性注入。
    2.3 如果 Bean 实现了 BeanNameAware 接口，则 Spring 调用 Bean 的 setBeanName() 方法传入当前 Bean 的 id 值。
    2.4 如果 Bean 实现了 BeanFactoryAware 接口，则 Spring 调用 setBeanFactory() 方法传入当前工厂实例的引用。
    2.5 如果 Bean 实现了 ApplicationContextAware 接口，则 Spring 调用 setApplicationContext() 方法传入当前 ApplicationContext 实例的引用。
    2.6 如果 Bean 实现了 BeanPostProcessor 接口，则 Spring 调用该接口的预初始化方法 postProcessBeforeInitialzation() 对 Bean 进行加工操作，此处非常重要，Spring 的 AOP 就是利用它实现的。
    2.7 如果 Bean 实现了 InitializingBean 接口，则 Spring 将调用 afterPropertiesSet() 方法。
    2.8 如果在配置文件中通过 init-method 属性指定了初始化方法，则调用该初始化方法。
    2.9 如果 BeanPostProcessor 和 Bean 关联，则 Spring 将调用该接口的初始化方法 postProcessAfterInitialization()。此时，Bean 已经可以被应用系统使用了。
    3.0 如果在 <bean> 中指定了该 Bean 的作用域为 singleton，则将该 Bean 放入 Spring IoC 的缓存池中，触发 Spring 对该 Bean 的生命周期管理；如果在 <bean> 中指定了该 Bean 的作用域为 prototype，则将该 Bean 交给调用者，调用者管理该 Bean 的生命周期，Spring 不再管理该 Bean。
    3.1 如果 Bean 实现了 DisposableBean 接口，则 Spring 会调用 destory() 方法销毁 Bean；如果在配置文件中通过 destory-method 属性指定了 Bean 的销毁方法，则 Spring 将调用该方法对 Bean 进行销毁。
```

#### Spring中Bean的继承

```java
在 Spring 中，Bean 和 Bean 之间也存在继承关系。我们将被继承的 Bean 称为父 Bean，将继承父 Bean 配置信息的 Bean 称为子 Bean。
    <!--父Bean-->
    <bean id="parentBean" class="xxx.xxxx.xxx.ParentBean" >
        <property name="xxx" value="xxx"></property>
        <property name="xxx" value="xxx"></property>
    </bean> 
    <!--子Bean--> 
    <bean id="childBean" class="xxx.xxx.xxx.ChildBean" parent="parentBean"></bean>
        
在父 Bean 的定义中，有一个十分重要的属性，那就是 abstract 属性。如果一个父 Bean 的 abstract 属性值为 true，则表明这个 Bean 是抽象的。 
抽象的父 Bean 只能作为模板被子 Bean 继承，它不能实例化，也不能被其他 Bean 引用。        
```

