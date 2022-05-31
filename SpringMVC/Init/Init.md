## 2022.05.29

#### 基于Maven来创建工程

```java
1. 下载maven
    https://maven.apache.org/download.cgi

2. 配置maven环境变量
    2.1 MAVEN_HOME // 系统变量
    2.2 path：%MAVEN_HOME%\bin
    2.3 cmd 校验是否配置成功 mvn -v
    2.4 mvn help:system 检验
    
3. 配置本地仓库
    3.1 任意位置创建文件夹  maven-repository
    3.2 maven安装目录下conf中setting.xml找到<localRepository>标签
        localRepository用于配置本地仓库，本地仓库其实起到了一个缓存的作用，它的默认地址是 C:\Users\用户名.m2。当我们从maven中获取jar包的时候，maven首先会在本地仓库中查找，如果本地仓库有则返回；如果没有则从远程仓库中获取包，并在本地库中保存。
        <localRepository>D:\codeSoft\Java\maven-repository</localRepository>  

4. 配置国内镜像
    4.1 找到<mirrors>标签 添加mirror标签为阿里云镜像
        <!-- 阿里云 -->
        <mirror>
          <id>alimaven</id>
          <mirrorOf>central</mirrorOf>
          <name>aliyun maven</name>
          <url>http://maven.aliyun.com/nexus/content/repositories/central/</url>
        </mirror>

5. idea中配置maven
    5.1 settings中找到"Build,Execution,Deployment"下"Build Tools"下"Maven"
    5.2 "Maven home path"设置为 本地安装包位置
    5.3 "User settings file"设置为 本地安装包中的conf中的settings.xml（需要后面Override打勾）
    5.4 "Local repository"设置为 本地库      
            
6. 创建一个新模块 build system基于Maven
    6.1 在main文件夹下新建webapp文件夹
    6.2 项目结构（Project Structure）中选择Modules，选择上面新建的模块中的"Web" 在"Deployment Descriptors"中添加web.xml到指定的位置 也就是src\main\webapp
     
7. pom.xml配置
    7.1  配置打包方式为war包（JavaWeb项目） 
            <packaging>war</packaging>
    7.2 引入模块依赖
             <!--    模块依赖-->
            <dependencies>
                <!-- SpringMVC -->
                <dependency>
                    <groupId>org.springframework</groupId>
                    <artifactId>spring-webmvc</artifactId>
                    <version>5.3.1</version>
                </dependency>
                <!-- 日志 -->
                <dependency>
                    <groupId>ch.qos.logback</groupId>
                    <artifactId>logback-classic</artifactId>
                    <version>1.2.3</version>
                </dependency>
                <!-- ServletAPI -->
                <dependency>
                    <groupId>javax.servlet</groupId>
                    <artifactId>javax.servlet-api</artifactId>
                    <version>3.1.0</version>
                    <!--            已被Tomcat服务器提供 不需要打进war包 因此设置scope-->
                    <scope>provided</scope>
                </dependency>
                <!-- Spring5和Thymeleaf整合包 -->
                <dependency>
                    <groupId>org.thymeleaf</groupId>
                    <artifactId>thymeleaf-spring5</artifactId>
                    <version>3.0.12.RELEASE</version>
                </dependency>
            </dependencies>
            
 8. 配置Tomcat服务器    
```

#### 基于SpringMVC前端控制器DispatcherServlet配置web.xml

```xml
在之前的JavaWeb的学习中，我们了解到我们的每一个Servlet组件都需要到web.xml中配置，在使用SpringMVC框架后 带来最重要的改变就是一切的请求配置全部配置到"前端控制器DispatcherServlet"来统一接收，再到实际的方法内，这样就不需要我们每个servlet都去配置
    
1. 默认配置方式
    <!-- 配置SpringMVC的前端控制器，对浏览器发送的请求统一进行处理 -->
    <servlet>
    	<servlet-name>springMVC</servlet-name>
    	<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>springMVC</servlet-name>
        <!--
        设置springMVC的核心控制器所能处理的请求的请求路径
        /所匹配的请求可以是/login或.html或.js或.css方式的请求路径
        但是/不能匹配.jsp请求路径的请求
        -->
        <url-pattern>/</url-pattern>
    </servlet-mapping>

此配置作用下，SpringMVC的配置文件默认位于WEB-INF下，默认名称为<servlet-name>-
servlet.xml，例如，以下配置所对应SpringMVC的配置文件位于WEB-INF下，文件名为springMVC-servlet.xml 不利于我们使用maven来管理工程 因此有下面的扩展配置
    
2. 扩展配置方式 (同时需要到src\main\java\resources创建springMVC.xml)   
    <!-- 配置SpringMVC的前端控制器，对浏览器发送的请求统一进行处理 -->
    <servlet>
        <servlet-name>springMVC</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!-- 通过初始化参数指定SpringMVC配置文件的位置和名称 -->
        <init-param>
            <!-- contextConfigLocation为固定值 -->
            <param-name>contextConfigLocation</param-name>
            <!-- 使用classpath:表示从类路径查找配置文件，例如maven工程中的src/main/resources -->
            <param-value>classpath:springMVC.xml</param-value>
        </init-param>
        <!-- 
            作为框架的核心组件，在启动过程中有大量的初始化操作要做
            而这些操作放在第一次请求时才执行会严重影响访问速度
            因此需要通过此标签将启动控制DispatcherServlet的初始化时间提前到服务器启动时
        -->
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>springMVC</servlet-name>
        <!--
            设置springMVC的核心控制器所能处理的请求的请求路径
            /所匹配的请求可以是/login或.html或.js或.css方式的请求路径
            但是/不能匹配.jsp请求路径的请求
        -->
        <url-pattern>/</url-pattern>
    </servlet-mapping>
```

#### 基于控制器Controller概念和thymeleaf模板

```java
在上面的配置后，我们不需要再往web.xml里面手动的注入每个Servlet组件了，因此SpringMVC中的C，提出的控制器Controller概念，它并不是个什么特殊的类，依然是个POJO（普通java类），借助我们在Spring5学习中的注解@Controller将其标识为控制层组件
    
1. 标识Controller
    @Controller
2. 开启Spring的组件扫描为IOC容器
    <context:component-scan base-package="com.home.mvc.*" />

3. 配置thymeleaf模板引擎
    <!-- 配置Thymeleaf视图解析器 -->
    <bean id="viewResolver" class="org.thymeleaf.spring5.view.ThymeleafViewResolver">
        <property name="order" value="1"/>
        <property name="characterEncoding" value="UTF-8"/>
        <property name="templateEngine">
            <bean class="org.thymeleaf.spring5.SpringTemplateEngine">
                <property name="templateResolver">
                    <bean class="org.thymeleaf.spring5.templateresolver.SpringResourceTemplateResolver">
                        <!-- 视图前缀 -->
                        <property name="prefix" value="/WEB-INF/templates/"/>
                        <!-- 视图后缀 -->
                        <property name="suffix" value=".html"/>
                        <property name="templateMode" value="HTML5"/>
                        <property name="characterEncoding" value="UTF-8" />
                    </bean>
                </property>
            </bean>
        </property>
    </bean>
 4. webapp\WEB-INF\下新建templates文件夹及index.html
      4.1 在JavaWeb的学习中，我们知道浏览器不能直接访问或者重定向"WEB-INF"下的资源 ，只能通过转发操作，这里建templates文件夹的原因是因为我们的模板引擎配置的视图前缀就是"/WEB-INF/templates/" 而后缀是".html"                   
```

