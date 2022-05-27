## 2022.05.27

#### 框架代码

```java
整个 Spring5 框架的代码基于 Java8，运行时兼容 JDK9，许多不建议使用的类和方
法在代码库中删除
```

#### 自带日志的封装Log4j2

```java
Spring5 已经移除 Log4jConfigListener，官方建议使用 Log4j2，若需要使用Log4j需要降级处理
1. 引入依赖包
    log4j-api-2.11.2.jar
    log4j-core-2.11.2.jar
    log4j-slf4j-impl-2.11.2.jar
    slf4j-api-1.7.30.jar
    
2. 创建log4j2.xml
    <?xml version="1.0" encoding="UTF-8"?>
<!--日志级别以及优先级排序: OFF > FATAL > ERROR > WARN > INFO > DEBUG > TRACE > ALL -->
<!--Configuration后面的status用于设置log4j2自身内部的信息输出，可以不设置，当设置成trace时，可以看到log4j2内部各种详细输出-->
<configuration status="INFO">
    <!--先定义所有的appender-->
    <appenders>
        <!--输出日志信息到控制台-->
        <console name="Console" target="SYSTEM_OUT">
            <!--控制日志输出的格式-->
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </console>
    </appenders>
    <!--然后定义logger，只有定义了logger并引入的appender，appender才会生效-->
    <!--root：用于指定项目的根日志，如果没有单独指定Logger，则会使用root作为默认的日志输出-->
    <loggers>
        <root level="info">
            <appender-ref ref="Console"/>
        </root>
    </loggers>
</configuration>
    
private static final Logger logger = LoggerFactory.getLogger(Log4j2Test.class);
public static void main(String[] args) {
    logger.error("测试logger");
}    
```

#### @Nullable注解

```java
（1）@Nullable 注解可以使用在方法上面，属性上面，参数上面，表示方法返回可以为空，属性值可以
为空，参数值可以为空
（2）注解用在方法上面，方法返回值可以为空
```

#### 核心容器支持函数式风格 GenericApplicationContext

```java
在之前的写法中 常常用new Xxx() 来显式创建类
// User.java
    public class User {
        private String name;
        private String age;
        public String getName() {
            return name;
        }
        public void setName(String name) {
            this.name = name;
        }
        public String getAge() {
            return age;
        }
        public void setAge(String age) {
            this.age = age;
        }
        public User() {
        }
        public User(String name, String age) {
            this.name = name;
            this.age = age;
        }
        @Override
        public String toString() {
            return "User{" +
                "name='" + name + '\'' +
                ", age='" + age + '\'' +
                '}';
        }
    }

// Test
@Test
public void test(){
    // 函数式风格创建对象，交给 spring 进行管理
    // 创建 GenericApplicationContext 对象
    GenericApplicationContext genericApplicationContext = new GenericApplicationContext();
    // 调用 context 的方法对象注册
    genericApplicationContext.refresh();
    genericApplicationContext.registerBean("userTest", User.class, () -> new User());
	// 获取在 spring 注册的对象
    User userTest = (User)genericApplicationContext.getBean("userTest");
    userTest.setName("李大爷");
    userTest.setAge("20");
    System.out.println(userTest);
    // User{name='李大爷', age='20'}
}
```

#### 整合JUnit4

```java
在之前的例子中 我们一直使用 junit-4.12.jar hamcrest-core-1.3.jar 
JUnit4来作单元测试 但是特别是在作Spring的测试时，每次都需要显式的创建context对象，在显示的获取指定Bean来进行操作
    
@RunWith(SpringJUnit4ClassRunner.class) // 指定JUnit4测试框架
@ContextConfiguration("classpath:bean.xml") // 加载配置文件
public class TestJUnit4{
    @Test
    public void test(){
        // ....
    }
}
```

整合JUnit5

```java
1. 引入JUnit5依赖

2. 方式1    
@ExtendWith(SpringExtension.class)
@ContextConfiguration("classpath:bean.xml")
public class TestJUnit5{
    @Test
    public void test(){
        // ....
    }
} 

3. 方式2
@SpringJUnitConfig(locations = "classpath:bean.xml")    
public class TestJUnit5{
    @Test
    public void test(){
        // ....
    }
}     
```

