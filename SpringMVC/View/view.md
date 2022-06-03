## 2022.06.03

#### SpringMVC视图

```java
SpringMVC中的视图是view接口，视图的作用是渲染数据，将模型Model中的数据展示给用户，其中SpringMVC视图的种类很多，默认有转发视图和重定向视图
```

#### 转发视图

```java
转发视图是InternalResourceView，当控制器方法中所设置的视图名称以"forward:"为前缀时，创建InternalResourceView视图，此时的视图名称不会被SpringMVC配置文件中所配置的视图解析器解析，而是会将前缀"forward:"去掉，剩余部分作为最终路径通过转发的方式实现跳转
```

#### 重定向视图

```java
重定向视图是RedirectView，当控制器方法中所设置的视图名称以"redirect:"为前缀时，创建RedirectView视图，此时的视图名称不会被SpringMVC配置文件中所配置的视图解析器解析，而是会将前缀"redirect:"去掉，剩余部分作为最终路径通过重定向的方式实现跳转
```

#### 视图控制器

```java
控制器方法中，仅仅用来实现页面跳转，即只需要设置视图名称时，可以将处理器方法使用viewcontroller标签进行表示
<!--
path：设置处理的请求地址
view-name：设置请求地址所对应的视图名称
-->
<mvc:view-controller path="/testView" view-name="success"></mvc:view-controller>

当SpringMVC中设置任何一个view-controller时，其他控制器中的请求映射将全部失效，此时需
要在SpringMVC的核心配置文件中设置开启mvc注解驱动的标签：
<mvc:annotation-driven />
```

#### RESTful

```java
1. REST：Representational State Transfer，表现层资源状态转移。

2. HTTP 协议里面，四个表示操作方式的动词：GET、POST、PUT、DELETE。它们分别对应四种基本操作：GET 用来获取资源，POST 用来新建资源，PUT 用来更新资源，DELETE用来删除资源。REST 风格提倡 URL 地址使用统一的风格设计，从前到后各个单词使用斜杠分开，不使用问号键值对方式携带请求参数，而是将要发送给服务器的数据作为 URL 地址的一部分，以保证整体风格的一致性。
    
3. 由于浏览器在form表单提交时，只支持get和post请求，因此在RESTful规范下，如何发送put和delete请求
    因此SpringMVC提供了"HiddenHttpMethodFilter"过滤器来帮助我们将post请求转换为delete或put请求，但次过滤器需要前端请求时必要的条件：
    a. 当前请求方式必须为post方式
    b. 当前请求必须传输请求参数"_method"（该filter组件源码中显式的使用了该字段）
    
    // web.xml
    <filter>
        <filter-name>HiddenHttpMethodFilter</filter-name>
        <filter-class>org.springframework.web.filter.HiddenHttpMethodFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>HiddenHttpMethodFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
	
	注意：在之前的例子中我们使用了"CharacterEncodingFilter"这个组件来解决我们post提交中文乱码的问题，因此在我们配置"HiddenHttpMethodFilter"组件时，由于源码中去获取了请求参数"_method"，因此若我们将该filter组件配置在"CharacterEncodingFilter"之前，则导致乱码无效，因此配置时需要注意顺序。	
```

