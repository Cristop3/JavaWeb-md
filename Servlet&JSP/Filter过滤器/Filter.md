## 2022.05.09

#### 什么是Filter过滤器

```java
1. Filter过滤器是JavaWeb三大组件之一，三大组件分别是：Servlet程序、Listener监听器、Filter过滤器
2. 是一个JavaEE的规范接口，过滤器是执行过滤任务的对象，这些任务是针对对某一资源（servlet 或静态内容）的请求或来自某一资源的响应执行的，抑或同时针对这两者执行。
3. 它的作用：拦截请求、过滤响应
4. 常见的应用场景：
    	权限检查、日志操作、事务管理...
```

#### 如何创建Filter过滤器

```java
1. 编写一个类去实现Filter接口
2. 实现其过滤方法doFilter()
    // 这里注意下doFilter()方法中的参数 需要强制类型转换为HttpServletRequest
    HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
    HttpSession session = httpServletRequest.getSession();

    Object user = session.getAttribute("user");
    if (user == null) {
        System.out.println("无权限");
    } else {
        // 继续执行(必须执行该方法 不然没效果)
        filterChain.doFilter(servletRequest, servletResponse);
    }

3. web.xml配置Filter拦截路径
    <!--    配置Filter过滤器 大致和Servlet相同 -->
    <filter>
        <!--        给Filter过滤器起一个别名-->
        <filter-name>AdminFilter</filter-name>
        <!--        Filter类全类名路径-->
        <filter-class>com.atguigu.filter.AdminFilter</filter-class>
    </filter>
    <!--    配置filter拦截路径-->
    <filter-mapping>
        <!--        拦截哪一个Filter名称-->
        <filter-name>AdminFilter</filter-name>
        <!--        指定拦截路径：斜杠表示http://ip:port/工程路径/ 其映射到idea的web目录下 admin目录下的全部-->
        <url-pattern>/admin/*</url-pattern>
    </filter-mapping>
```

![Filter流程.png](https://s2.loli.net/2022/05/10/7bz4QBqpJo8mEVT.png)

#### Filter生命周期

```

```

