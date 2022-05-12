## 2022.05.12

#### Spring

```java
1. 广义
	泛指以 Spring Framework 为核心的 Spring 技术栈。例如 Spring Framework、Spring MVC、SpringBoot、Spring Cloud、Spring Data、Spring Security 等，其中 Spring Framework 是其他子项目的基础。
```

![spring子模块.png](https://s2.loli.net/2022/05/12/rLNpEQT8K5Uj1MO.png)

```java
2. 狭义
	特指 Spring Framework，通常我们将它称为 Spring 框架。其有两个核心部分： IoC 和 AOP。
```

![springframework-core.png](https://s2.loli.net/2022/05/12/rCO5WDyx32q9tQo.png)

```java
3. 特点
    方便解耦，简化开发
    Spring 就是一个大工厂，可以将所有对象的创建和依赖关系的维护交给 Spring 管理。

    方便集成各种优秀框架
    Spring 不排斥各种优秀的开源框架，其内部提供了对各种优秀框架（如 Struts2、Hibernate、MyBatis 等）的直接支持。

    降低 Java EE API 的使用难度
    Spring 对 Java EE 开发中非常难用的一些 API（JDBC、JavaMail、远程调用等）都提供了封装，使这些 API 应用的难度大大降低。

    方便程序的测试
    Spring 支持 JUnit4，可以通过注解方便地测试 Spring 程序。

    AOP 编程的支持
    Spring 提供面向切面编程，可以方便地实现对程序进行权限拦截和运行监控等功能。

    声明式事务的支持
    只需要通过配置就可以完成对事务的管理，而无须手动编程。
```

#### Spring体系

![structs-spring5.png](https://s2.loli.net/2022/05/12/sBXGRCLhiUmq8JK.png)

```java
详情请见：http://c.biancheng.net/spring/module.html
```

#### Spring基础框架包搭建

```java
1. 访问https://repo.spring.io/ui/native/release/org/springframework/spring/ 该地址获取spring5最新的稳定框架包

2. 获取Core Container架构层下的核心4个jar包
    spring-beans-5.2.6.RELEASE.jar
    spring-context-5.2.6.RELEASE.jar
    spring-core-5.2.6.RELEASE.jar
    spring-expression-5.2.6.RELEASE.jar
    其中还需要一个公共的日志包
    commons-logging-1.1.1.jar
    方便单元测试再加入两个依赖包
    junit-4.12.jar // 该包必须依赖下面的jar包 不然单测启动报错
    hamcrest-core-1.3.jar
```

#### Spring run first

```java
// 1. 创建类
public class User {
    private String username;

    public void add() {
        System.out.println("add......");
    }

}

// 2. 创建beans.xml配置文件
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="user" class="com.spring5.bean.User"></bean>
</beans>
        
// 3. 创建单测类
public class UserTest {
    @Test
    public void test(){
        User user;
        try (ClassPathXmlApplicationContext classPathXmlApplicationContext = new ClassPathXmlApplicationContext("/bean.xml")) {
            // 此处第一个参数 对应到xml文件中的<bean>标签id
            // 第二个参数 对应到<bean>标签中的class
            user = classPathXmlApplicationContext.getBean("user", User.class);
        }
        System.out.println(user);
        user.add();
    }
}        
```

