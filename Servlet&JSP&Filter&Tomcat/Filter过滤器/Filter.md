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

```java
1. 执行构造器方法
2. 执行init初始化方法
	// 1、2步是在web工程启动的时候执行（Filter已经创建）
3. doFilter()方法
    // 每次拦截到请求，会执行
4. destroy方法
    // 在web工程停止的时候调用
```

#### FilterConfig类

```java
1. Filter过滤器的配置文件类
2. Tomcat每次创建Filter的时候，同时创建了一个FilterConfig类
3. 作用
    	获取Filter的名称 web.xml中filter-name配置项
    	获取Filter配置的参数 web.xml中 init-param参数 // 同servletConfig
    	获取ServletContext对象
    
// web.xml
    <filter>
    	<init-param>
    		<param-name>username</param-name>
    		<param-value>root</param-value>
    	</init-param>
    </filter>
```

#### FilterChain过滤器链

```java
针对同一个路径进行多次过滤器调用
```

![Filterchain.png](https://s2.loli.net/2022/05/10/F9wfrPhTEeb2CoL.png)

#### Filter拦截路径方式

```java
1. 精准匹配
	<url-pattern>/xxx.jsp</url-pattern>
 	// http:ip:port/工程路径/xxx.jsp
2. 目录匹配
    <url-pattern>/admin/*</url-pattern>
    // http:ip:port/工程路径/admin/*
3. 后缀名匹配    
    <url-pattern>*.html</url-pattern>
    <url-pattern>*.png</url-pattern>
    
Filter过滤器只关心请求地址是否匹配，不关心请求资源是否存在    
```

#### ThreadLocal

```java
1. ThreadLocal它可以给当前线程关联一个数据（可以是普通变量、对象、数组、集合）
2. 作用：解决多线程的数据安全问题
3. 特点：
    3.1 ThreadLocal可以为当前线程关联一个数据（它可以像Map一样存取数据，key为当前线程）
    3.2 每一个ThreadLocal对象，只能为当前线程关联一个数据，如果要为当前线程关联多个数据，就需要使用多个ThreadLocal对象实例
    3.3 每个ThreadLocal对象实例定义的时候，一般都是static类型
    3.4 ThreadLocal中保存数据，在线程销毁后，会由JVM虚拟自动释放

public class ThreadLocalTest {
    public static ThreadLocal<Object> threadLocal = new ThreadLocal<>();

    private static final Random random = new Random();

    public static class Task implements Runnable {
        @Override
        public void run() {
            // 在 Run 方法中，随机生成一个变量（线程要关联的数据），然后以当前线程名为 key 保存到 map 中
            int i = random.nextInt(1000);
            // 获取当前线程名
            String name = Thread.currentThread().getName();
            System.out.println("线程[" + name + "]生成的随机数是：" + i);
            // 将随机数放入到当前threadLocal实例中
            threadLocal.set(i);

            // 休眠3秒
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }

            // 在 Run 方法结束之前，以当前线程名获取出数据并打印。查看是否可以取出操作
            Object o = threadLocal.get();
            System.out.println("在线程[" + name + "]快结束时取出关联的数据是：" + o);
        }
    }

    public static void main(String[] args) {
        // 通过for循环创建三个新线程
        for (int i = 0; i < 3; i++) {
            new Thread(new Task()).start();
        }
    }
}    
```

#### ThreadLocal如何配合JDBC开启数据库事务

![jdbc&ThreadLocal开启事务.png](https://s2.loli.net/2022/05/10/VD24u8MLgzdHNXS.png)

```java
/**
* 获取数据库连接池中的连接
* @return 如果返回 null,说明获取连接失败<br/>有值就是获取连接成功
*/
public static Connection getConnection(){
    Connection conn = conns.get();
    if (conn == null) {
        try {
            conn = dataSource.getConnection();//从数据库连接池中获取连接
            conns.set(conn); // 保存到 ThreadLocal 对象中，供后面的 jdbc 操作使用
            conn.setAutoCommit(false); // 设置为手动管理事务
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    return conn;
}
/**
* 提交事务，并关闭释放连接
*/
public static void commitAndClose(){
    Connection connection = conns.get();
    if (connection != null) { // 如果不等于 null，说明 之前使用过连接，操作过数据库
        try {
            connection.commit(); // 提交 事务
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                connection.close(); // 关闭连接，资源资源
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    // 一定要执行 remove 操作，否则就会出错。（因为 Tomcat 服务器底层使用了线程池技术）
    conns.remove();
}
/**
* 回滚事务，并关闭释放连接
*/
public static void rollbackAndClose(){
    Connection connection = conns.get();
    if (connection != null) { // 如果不等于 null，说明 之前使用过连接，操作过数据库
        try {
            connection.rollback();//回滚事务
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                connection.close(); // 关闭连接，资源资源
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    // 一定要执行 remove 操作，否则就会出错。（因为 Tomcat 服务器底层使用了线程池技术）
    conns.remove();
}
```

```java
需要注意的是我们要在dao层如果捕获到异常 要抛出来 throw new RuntimeException(e) 到上层的service层，如果在service层作commit()或者rollback()操作，岂不是所有的service我们都要去try/catch，因此如下如何用Filter配合处理统一作提交或者回滚事务
    
再次需要注意 若嵌套多层 需要再每一层往外层抛出异常 最后Filter才好捕获！
```

#### Filter如何统一try/catch service层作所有servlet操作事务

![Filter统一操作.png](https://s2.loli.net/2022/05/10/WsVRCSem2YJBQUx.png)

```java
@Override
public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain
                     filterChain) throws IOException, ServletException {
    try {
        filterChain.doFilter(servletRequest,servletResponse);
        JdbcUtils.commitAndClose();// 提交事务
    } catch (Exception e) {
        JdbcUtils.rollbackAndClose();//回滚事务
        e.printStackTrace();
    }
}
```

#### 将部分异常抛出给Tomcat配置跳转指定页面

```xml
<!--error-page 标签配置，服务器出错之后，自动跳转的页面-->
<error-page>
    <!--error-code 是错误类型-->
    <error-code>500</error-code>
    <!--location 标签表示。要跳转去的页面路径-->
    <location>/pages/error/error500.jsp</location>
</error-page>
<!--error-page 标签配置，服务器出错之后，自动跳转的页面-->
<error-page>
    <!--error-code 是错误类型-->
    <error-code>404</error-code>
    <!--location 标签表示。要跳转去的页面路径-->
    <location>/pages/error/error404.jsp</location>
</error-page>

但是需要注意 在某些地方捕获了异常 最后层次必须要抛出异常通知Tomcat，这样配置才会生效
```

