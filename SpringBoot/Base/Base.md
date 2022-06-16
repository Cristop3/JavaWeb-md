## 2022.06.16

#### SpringBoot优缺点

```java
1. 优点
    1. 创建独立的Sping应用
    2. 内嵌web服务器
    3. 自动的starter依赖，简化构建配置
    4. 自动配置Spring及第三方功能
    5. 提供生产级别的监控、健康检查及外部化配置
    6. 无代码生成、无需编写xml
    总的来说SpringBoot就是整合Spring技术栈的一站式框架

2. 缺点
    1. 迭代快
    2. 内部原理复杂
```

#### 引入SpringBoot依赖

```java
参考官方文档，创建一个当前项目的"父级"Maven管理，这样有利于我们提取公共的依赖到父级中，可以多模块的整合
    // pom.xml
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.0</version>
    </parent>
    
    ctrl点击"spring-boot-starter-parent" -> 它的父级依赖"spring-boot-starter-parent-2.7.0" -> 再ctrl点击该父级依赖 -> 它的最顶层依赖"spring-boot-dependencies"
    从<properties>标签中我们可以看到SpringBoot给我们预置了很多依赖，几乎涵盖了日常开发中的依赖版本号，且自动版本仲裁机制，因此它是一站式开发框架。
    
    自动仲裁版本带来的好处就是子模块的依赖中，无需关注版本号，引入的依赖默认都可以不写版本号，但是引入非顶层父级版本仲裁的jar，就需要写上版本号。
    当然也可以修改默认的版本号，只需要在当前项目模块中的配置文件中的<properties>标签中重写指定要修改的版本号，如：
    			<properties>
    				<mysql.version>5.1.1</mysql.version>
    			</properties>
```

#### 引入Web开发

```java
1. 在之前我们如果要引入ssm框架来开发web项目，不但需要手动写很多配置文件，而且本地开发，也需要手动配置Tomcat，在SpringBoot世界中，它拆分出了很多业务场景，称为starter。
    官方提供了很多以"spring-boot-starter-*"：而此处的*就是指定的业务场景，只要我们引入该业务场景，则这个场景下的所有依赖都会自动的引入，而不在官网的场景中，比如第三方场景很多以"*-spring-boot-starter"
    
2. 我们再创建一个子模块
    // 子模块 pom.xml
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    
    当我们引入了官网的web场景后，它会自动的为我们引入
    	1. Tomcat
    	2. SpringMVC（比如核心Servlet，DispatcherServlet）
    	3. 常见的Web功能（比如字符编码）

3. 创建主程序
    // com.home.boot.MyApplication.java
    @SpringBootApplication
    public class MyApplication {
        public static void main(String[] args) {
            SpringApplication.run(MyApplication.class);
        }
    }
	3.1 注解@SpringBootApplication
        表明这是个SpringBoot配置类
     3.2 main方法
        调用SpringApplication.run方法
     3.3 默认包结构
        在之前我们的ssm项目中，我们会在配置类（@ComponentScan）或者xml（<context:component-scan>）中开启包扫描，现在我们不需要再指定包扫描，SpringBoot会默认"扫描主程序所在包及其下面的所有子包里面的组件"
            比如，我们上面，就会默认扫描com.home.boot下的所有包。
     3.4 改变扫描路径
         @SpringBootApplication
            等同于
         @SpringBootConfiguration
         @EnableAutoConfigration
         @ComponentScan("com.home.boot") // 在此处我们就可以向以前设置
            
 4. 配置默认值
      再我们执行了SpringApplication.run(MyApplication.class)这个的返回值就是SpringBoot默认为我们注入的组件
      4.1 默认的配置最终都是映射到某个类上
      4.2 虽然SpringBoot为我们提前引入很多依赖，但是若我们没有再继续配置所需场景的依赖，则该自动配置不会生效
      4.3 SpringBoot所有的自动配置功能都在spring-boot-autoconfigure包里面
```

#### 容器功能

```java
1. 定义组件
    1.1 @Configuration
    	一般使用在定义一个类为配置类，之前在Spring里面使用过
    	在定义为配置类的类中，可以@Bean来定义容器上的组件，默认单例	
    	@Configuration(proxyBeanMethods = true|false) 开启代理Bean方法：
    		Full(proxyBeanMethods=true):保证每个@Bean方法被调用多少次返回的组件都是单实例的】,常用在"配置类组件之间有依赖关系，方法会被调用得到之前单实例组件"
    		Lite(proxyBeanMethods=false):每个@Bean方法被调用多少次返回的组件都是新创建的,常用在"配置类组件之间无依赖关系用Lite模式加速容器启动过程，减少判断"
    
    1.2 @Bean、@Component、@Controller、@Service、@Repository
    	这些基本在SpringMVC中我们也使用过
    
    1.3 @ComponentScan、@Import
    	@ComponentScan定义扫描包路径
    	@Import：给容器中自动创建出指定类型的组件，默认组件的名字就是全类名，如@Import({User.class, Xxx.class})
    
    1.4 @Conditional
    	条件注解，满足条件则注册或者不注册容器组件，在SpringBoot底层中，可以大量的看见该注解的子注解用法，比如：@ConditionOnMissingClass\@ConditionOnMissingBean等等
```

#### 原生配置文件导入@ImportResource

```java
在之前使用Spring时，我们会写beans.xml配置文件来注册组件，而使用SpringBoot后，基本不再写类似的配置文件，但是SpringBoot也给了我们个注解来导入原生的配置文件，如：
    @ImportResource("classpath:beans.xml")
```

#### 配置绑定

```java
@Component + @ConfiurationProperties
@EnableConfigurationProperties + @ConfigurationProperties
```

#### 自动配置

```java
我们使用了@SpringBootApplication就可以自动的配置当前场景下的所有依赖，它主要由：
    @SpringBootConfiguration
    	表明是SpringBoot的配置，而它底层也使用了"@Configuation"标明为配置类
    @ComponentScan
    	表明指定扫描哪些包下的组件加入到容器中
    @EnableAutoConfiguration
    	Ctrl点击后，发现底层使用首先
    		"@AutoConfigurationPackage": 将指定我们主程序所在的包下的所有组件导入进来，因此就解释了在前面我们写的默认指定了包扫描路径，再者使用：
    		@Import来导入了一个叫"AutoConfigurationImportSelector"的类，其实底层就是通过"spring.factories"配置文件来为我们默认的加入了很多自动配置
             	1、利用getAutoConfigurationEntry(annotationMetadata);给容器中批量导入一些组件
                2、调用List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes)获取到所有需要导入到容器中的配置类
                3、利用工厂加载 Map<String, List<String>> loadSpringFactories(@Nullable ClassLoader classLoader)；得到所有的组件
                4、从META-INF/spring.factories位置来加载一个文件。
                    默认扫描我们当前系统里面所有META-INF/spring.factories位置的文件
                    spring-boot-autoconfigure-2.7.0.RELEASE.jar包里面也有META-INF/spring.factories   
```

#### 总结

```java
● SpringBoot先加载所有的自动配置类  xxxxxAutoConfiguration
● 每个自动配置类按照条件进行生效，默认都会绑定配置文件指定的值。xxxxProperties里面拿。xxxProperties和配置文件进行了绑定
● 生效的配置类就会给容器中装配很多组件
● 只要容器中有这些组件，相当于这些功能就有了
● 定制化配置
  ○ 用户直接自己@Bean替换底层的组件
  ○ 用户去看这个组件是获取的配置文件什么值就去修改。
xxxxxAutoConfiguration ---> 组件  ---> xxxxProperties里面拿值  ----> application.properties
```

