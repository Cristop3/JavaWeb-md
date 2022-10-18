## 2022.05.21

#### 面向切面编程（AOP）

```java
AOP 的全称是“Aspect Oriented Programming”，译为“面向切面编程”，和 OOP（面向对象编程）类似，它也是一种编程思想。
    
与 OOP 中纵向的父子继承关系不同，AOP 是通过横向的抽取机制实现的。它将应用中的一些非业务的通用功能抽取出来单独维护，并通过声明的方式（例如配置文件、注解等）定义这些功能要以何种方式作用在那个应用中，而不是在业务模块的代码中直接调用。
    
通俗来讲：AOP就是不通过修改源代码方式，在主干功能里面添加新功能
```

#### AOP实现（框架）

```java
目前最流行的 AOP 实现（框架）主要有两个，分别为 Spring AOP 和 AspectJ。
1. Spring AOP (动态AOP)
    是一款基于 AOP 编程的框架，它能够有效的减少系统间的重复代码，达到松耦合的目的。
Spring AOP 使用纯 Java 实现，不需要专门的编译过程和类加载器，在运行期间通过代理方式向目标类植入增强的代码。Spring AOP 支持 2 种代理方式:
	1.1 分别是基于接口的 JDK 动态代理
        （Spring AOP 默认的动态代理方式，若目标对象实现了若干接口，Spring 使用 JDK 的 java.lang.reflect.Proxy 类进行代理。）
        
     1.2 基于继承的 CGLIB 动态代理。
        （若目标对象没有实现任何接口，Spring 则使用 CGLIB 库生成目标对象的子类，以实现对目标对象的代理。）
    
2. AspectJ (静态AOP)
     是一个基于 Java 语言的 AOP 框架，从 Spring 2.0 开始，Spring AOP 引入了对 AspectJ 的支持。
AspectJ 扩展了 Java 语言，提供了一个专门的编译器，在编译时提供横向代码的植入。
```

#### 如何理解AOP织入-20221009

```java
	织入是将增强添加对目标类具体连接点上的过程。AOP像一台织布机，将目标类、增强或引介通过AOP这台织布机天衣无缝地编织到一起。根据不同的实现技术
    AOP有三种织入的方式： 
        a、编译期织入，这要求使用特殊的Java编译器。 
        b、类装载期织入，这要求使用特殊的类装载器。 
        c、动态代理织入，在运行期为目标类添加增强生成子类的方式。 Spring采用动态代理织入，而AspectJ采用编译期织入和类装载期织入。
```

#### AOP术语

```java
1. 连接点
    类里面哪些方法可以被增强，这些方法称为连接点

2. 切入点
    实际被真正增强的方法，称为切入点
 
3. 通知（增强）
    3.1 实际增强的逻辑部分称为通知（增强）
    3.2 通知有多种类型
    	前置通知
    	后置通知
    	环绕通知
    	异常通知
    	最终通知
    
4. 切面
    是动作，把通知应用到切入点过程
```

![AOP-术语.png](https://s2.loli.net/2022/05/21/hBOlr7oJqmPjXGg.png)

#### Spring AOP

```java
1. 机制
    Spring 在运行期会为目标对象生成一个动态代理对象，并在代理对象中实现对目标对象的增强。

2. 连接点
    Spring AOP 并没有像其他 AOP 框架（例如 AspectJ）一样提供了完成的 AOP 功能，它是 Spring 提供的一种简化版的 AOP 组件。其中最明显的简化就是，Spring AOP 只支持一种连接点类型：方法调用。
    
3. 连接点扩展
    如果需要使用其他类型的连接点（例如成员变量连接点），我们可以将 Spring AOP 与其他的 AOP 实现一起使用，最常见的组合就是 Spring AOP + ApectJ。 
    
4. 通知类型
    Spring AOP 按照通知（Advice）织入到目标类方法的连接点位置，为 Advice 接口提供了 6 个子接口, 如下：
    4.1 前置通知 org.springframework.aop.MethodBeforeAdvice	// 在目标方法执行前实施增强。
    4.2 后置通知 org.springframework.aop.AfterReturningAdvice // 在目标方法执行后实施增强。
    4.3 后置返回通知	org.springframework.aop.AfterReturningAdvice // 在目标方法执行完成，并返回一个返回值后实施增强。
    4.4 环绕通知 org.aopalliance.intercept.MethodInterceptor // 在目标方法执行前后实施增强。
    4.5 异常通知 org.springframework.aop.ThrowsAdvice // 在方法抛出异常后实施增强。
    4.6 引入通知 org.springframework.aop.IntroductionInterceptor // 在目标类中添加一些新的方法和属性。	
    
 5. 切面类型
    Spring 使用 org.springframework.aop.Advisor 接口表示切面的概念，实现对通知（Adivce）和连接点（Joinpoint）的管理。
	在 Spring AOP 中，切面可以分为三类：一般切面、切点切面和引介切面。
	5.1 一般切面 org.springframework.aop.Advisor // Spring AOP 默认的切面类型。
        由于 Advisor 接口仅包含一个 Advice（通知）类型的属性，而没有定义 PointCut（切入点），因此它表示一个不带切点的简单切面。这样的切面会对目标对象（Target）中的所有方法进行拦截并织入增强代码。由于这个切面太过宽泛，因此我们一般不会直接使用。
    
     5.2 切点切面 org.springframework.aop.PointcutAdvisor // Advisor 的子接口，用来表示带切点的切面，该接口在 Advisor 的基础上还维护了一个 PointCut（切点）类型的属性。使用它，我们可以通过包名、类名、方法名等信息更加灵活的定义切面中的切入点，提供更具有适用性的切面。
     5.3 引介切面 org.springframework.aop.IntroductionAdvisor // Advisor 的子接口，用来代表引介切面，引介切面是对应引介增强的特殊的切面，它应用于类层面上，所以引介切面适用 ClassFilter 进行定义。
```

#### 基于接口的JDK动态代理示例（Spring AOP）

```java
// 1. 创建接口及其方法
public interface UserService {
    int queryCount(int x, int y);
}	

// 2. 创建其实现类及实现方法
public class UserServiceImpl implements UserService {
    @Override
    public int queryCount(int x, int y) {
        System.out.println("正常方法被执行..");
        return x + y;
    }
}

public class JDKProxy {
    public static void main(String[] args) {
        // 3. 使用Proxy类创建接口代理对象

        // 需要引入jdk中的lang包下的reflect.Proxy类
        // 调用newProxyInstance方法
        // 参数1：类加载器
        // 参数2：需要被增强方法所在的类，这个类实现的接口，支持多个接口
        // 参数3：实现这个接口InvocationHandler，创建代理对象，写增强的部分
        // 返回一个被包装（被增强）后的对象

        // 参数1：
        ClassLoader classLoader = JDKProxy.class.getClassLoader();
        // 参数2：
        Class[] interfaces = {UserService.class};
        // 参数3：
        // 参数3.1 将被增强的实现类实例 传入InvocationHandler
        UserServiceImpl userService = new UserServiceImpl();
        UserService u = (UserService) Proxy.newProxyInstance(classLoader, interfaces, new InvocationHandlerImpl(userService));
        int res = u.queryCount(12, 12);
        System.out.println("res: " + res + ", 被增强后执行最后结果");
    }
}

// 参数3：
class InvocationHandlerImpl implements InvocationHandler {
    // 1. 需要把被代理的对象，传递进来 通过有参构造函数传递
    private Object obj;

    public InvocationHandlerImpl(Object obj) {
        this.obj = obj;
    }

    // 2. 做业务增强逻辑操作
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // 方法之前
        System.out.println("方法之前执行...." + method.getName() + " :传递的参数..." + Arrays.toString(args));
        Object result = method.invoke(obj, args);
        // 方法之后
        System.out.println("方法之后执行...." + obj);
        return result;
    }
}
```

#### AspectJ + Spring AOP

```java
Spring AOP 是一个简化版的 AOP 实现，并没有提供完整版的 AOP 功能。如 Spring AOP 仅支持执行公共（public）非静态方法的调用作为连接点，如果我们需要向受保护的（protected）或私有的（private）的方法进行增强，此时就需要使用功能更加全面的 AOP 框架
    
引入依赖包
    spring-aop-5.2.6.RELEASE.jar
    spring-aspects-5.2.6.RELEASE.jar
    com.springsource.org.aspectj.weaver-1.6.8.RELEASE.jar
    com.springsource.net.sf.cglib-2.2.0.jar
    com.springsource.org.aopalliance-1.0.0.jar
    
确定概念（主要理解"切点（PointCut）"，"通知（Advice）","切面（Aspect或Advisor）"）
1. 通知（Advice）- "理解为执行增强操作的类中的具体方法"
    我理解就是像是vue里面的路由守卫或者生命周期（只说用法相似 概念不一样哈 为了方便理解而已）的回调函数一样 理解成有6种回调方式
2. 切点（PointCut） - "理解为执行增强操作的类中的方法"
    主要就是在众多"连接点"中选择哪些点来作为"切入点"，可以理解为"天选之人"
3. 切面（Aspect）- "理解为执行增强操作的类"
    由"通知"和"切点"组成一个完整的"切面"，比如一个面可以服务于多个需要被增强的方法，只需要添加切点，修改通知来完善逻辑
    
4. 切入表达式（execution）
    用于指定切入点关联的切入点表达式。
    execution([权限修饰符] [返回值类型] [类的完全限定名] [方法名称]([参数列表]) 
             返回值类型、方法名、参数列表是必须配置的选项，而其它参数则为可选配置项。
			返回值类型：*表示可以为任何返回值。如果返回值为对象，则需指定全路径的类名。
			类的完全限定名：指定包名 + 类名。
			方法名：*代表所有方法，set* 代表以 set 开头的所有方法。
			参数列表：(..)代表所有参数；(*)代表只有一个参数，参数类型为任意类型；(*,String)代表有两个参数，第一个参数可以为任何值，第二个为 String 类型的值。
```

#### AspectJ + Spring AOP（基于xml方式）

```xml
Spring 提供了基于 XML 的 AOP 支持，并提供了一个名为“aop”的命名空间，该命名空间提供了一个 <aop:config> 元素。
    在 Spring 配置中，所有的切面信息（切面、切点、通知）都必须定义在 <aop:config> 元素中；
	在 Spring 配置中，可以使用多个 <aop:config>。
	每一个 <aop:config> 元素内可以包含 3 个子元素： pointcut、advisor 和 aspect ，这些子元素必须按照这个顺序进行声明。

1. 编写需要被增强类及方法
    // 1. 可以称之"被增强类"
    // 以下方法都可以称为术语中的”连接点“
    public class UserDaoImpl implements UserDao {
        @Override
        public void regist() { // 连接点1
            System.out.println("regist....");
        }
        @Override
        public void logout() { // 连接点2
            System.out.println("logout....");
        }
        @Override
        public void login() { // 连接点3
            System.out.println("login....");
        }
    }

2. 编写增强类
    // 2. 可以称之"增强类" 用来对UserDaoImpl类进行增强
    public class Aspect2UserDao {
        // 3. 设置"通知"类型中的 "before" 前置通知
        public void use2Before(){
            System.out.println("before.....");
        }
        // 3. 设置"通知"类型中的 "after" 后置通知
        public void use2After(){
            System.out.println("after.....");
        }
    }

3. xml配置
    3.1 引入aop名称空间
    	<!--        4. 引入aop名称空间-->
		<beans xmlns="http://www.springframework.org/schema/beans"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:aop="http://www.springframework.org/schema/aop"
              xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                                  http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd">
    
	3.2 完整
    <!--    5. xml方式配置AOP-->
    <!--    5.1 IOC注入"增强类"和"被增强类"-->
    <bean id="userDao" class="com.home.aop.dao.impl.UserDaoImpl"/>
    <bean id="aspect2UserDao" class="com.home.aop.aspect.Aspect2UserDao"/>

    <!--    5.2 aop-config aop增强操作-->
    <aop:config>
        <!--        5.2.1 定义切点-->
        // id为当前切点起别名 方便后面通知时可以指定哪个切点
        // expression指定哪个"连接点"成为"切点" 比如我们有3个连接点（login\logout\regist）结果让login成为切点
        <aop:pointcut id="pcOne" expression="execution(* com.home.aop.dao.impl.UserDaoImpl.login(..))"/>
        <!--        5.2.2 定义切面-->
        // ref引入我们的增强类作为"切面"    
        <aop:aspect ref="aspect2UserDao">
            <!--            5.2.3 采用何种通知（增强方式） 作用在何种切点上-->
            // method：通知方式指定 在我们的增强类中的某个方法名称
            // pointcut-ref 该通知方式 作用在哪个切点上面
            <aop:before method="use2Before" pointcut-ref="pcOne"/>
        </aop:aspect>
    </aop:config>
```

#### AspectJ + Spring AOP（基于注解方式）

```java
AspectJ 框架为 AOP 开发提供了一套 @AspectJ 注解。它允许我们直接在 Java 类中通过注解的方式对切面（Aspect）、切入点（Pointcut）和增强（Advice）进行定义
    
1. 注解种类
  	@Aspect	用于定义一个切面。
    @Pointcut	用于定义一个切入点。
    @Before	用于定义前置通知，相当于 BeforeAdvice。
    @AfterReturning	用于定义后置通知，相当于 AfterReturningAdvice。
    @Around	用于定义环绕通知，相当于 MethodInterceptor。
    @AfterThrowing	用于定义抛出通知，相当于 ThrowAdvice。
    @After	用于定义最终通知，不管是否异常，该通知都会执行。 
    
2. 启用注解
    我们在IOC模块中 使用两种方式来支持注解 同理若需要使用AspectJ提供的注解 也需要开启
    2.1 xml配置开启 （注意引入context名称空间）
    	<!-- 开启注解扫描 -->
		<context:component-scan base-package="com.home.aop"></context:component-scan>
		<!--开启AspectJ 自动代理-->
		<aop:aspectj-autoproxy></aop:aspectj-autoproxy>
            
    2.2 配置类开启
         @Configuration
         @ComponentScan(basePackages = "com.home.aop") //注解扫描
         @EnableAspectJAutoProxy //开启 AspectJ 的自动代理
         public class AppConfig {
         }

3. 完整
    // DogDaoImpl.java
    // 1. 创建需要"被增强"类
    // 2. 通过注解成为IOC bean
    // 3. 其中的run方法称为"连接点"
    @Component("dogDao")
    public class DogDaoImpl implements DogDao {
        @Override
        public void run() {
            System.out.println("i am a dog and now running");
        }
    }
	
	// AspectAnno2DogDao.java
	// 3. 创建"增强"类
    // 4. 通过注解Component 成为IOC bean
    // 5. 通过注解Aspect 定义我们的增强类为"切面"
    @Component
    @Aspect
    public class AspectAnno2DogDao {
        // 5. 定义切点
        // 要求：返回值类型为 void，名称自定义，没有参数
        // 通过@Pointcut注解关联到指定的"连接点"
        @Pointcut("execution(* com.home.aop.dao.impl.DogDaoImpl.run(..))")
        public void dogPointCut() {

        }

        // 6. 定义通知
        @Before("dogPointCut()")
        public void drink() {
            System.out.println("dog run before need drink some water");
        }
    }
	
	// test.java
	@Test
    public void testAnno(){
        ApplicationContext context = new AnnotationConfigApplicationContext(AopConfig.class);
        DogDao dogDao = context.getBean("dogDao", DogDao.class);
        dogDao.run();
    }

	// console
	dog run before need drink some water
	i am a dog and now running
```

