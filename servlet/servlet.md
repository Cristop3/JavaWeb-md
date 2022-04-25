## 2022.04.25

#### 什么是servlet

```java
1. JavaEE规范之一，规范就是接口
2. 是JavaWeb三大组件之一：servlet程序、Filter过滤器、Listener监听器
3. 运行在服务器上的一个java小程序，"它可以接收客户端发送过来的请求，并相应数据给客户端"
```

如何通过"实现Servlet"来创建一个servlet程序（通过一个类来实现Servlet类）

```java
1. 编写一个类去实现servlet接口 
    这里需要引入servlet包，一般包可以使用Tomcat的lib中的servlet-api.jar
    // 注意这里是实现了Servlet类 一般实际开发中 是扩展Servlet子类来操作
    public TestServlet implements Servlet{}

2. 实现service方法，处理请求，并相应数据
    // 专门用来处理请求和访问
    @Override
    public void service(ServletRequest servletRequest, ServletResponse servletResponse) throws ServletException, IOException {
        System.out.println("进入servlet 访问的service方法");
    }

3. 需要到web.xml中去配置servlet程序的访问地址
    在<web-app>
    	// servlet标签的Tomcat配置servlet程序
    	<servlet>
    		// servlet-name标签：Servlet程序的一个别名（一般是类名）
    		<servlet-name>TestServlet</servlet-name>
   			// servlet-class标签：是Servlet程序的全类名
    		<servlet-class>com.kd.servlet.TestServlet</servlet-class>
    	</servelt>
        // servlet-mapping标签：表示给哪个servlet程序配置访问地址        
         <servlet-mapping>
             // servlet-name标签：告诉服务器，当前配置的地址给哪个servlet程序使用一般与上面的servlet-name配置项一致   
             <servlet-name>TestServlet</servlet-name>
            // url-pattern标签：配置访问地址 
            // "/":斜杠表示：服务器在解析的时候，地址为 http://ip:port/工程路径 (其中工程路径在Tomcat之前配置的application context值)
            // "/testServlet": http://ip:port/工程路径/testServlet (表示调用servlet-name中配置的Servlet程序)
             <url-pattern>/testServlet</url-pattern>
         </servlet-mapping>
      </web-app>
```

![url2servlet-path.png](https://s2.loli.net/2022/04/25/bH3wjoPC4WMgNsx.png)

#### Servlet生命周期

```java
1. 执行构造器方法
2. 执行init初始化方法
	// 1、2步是在第一次访问的时候创建Servlet会调用
3. service方法
    // 每次访问Servlet程序都会调用
4. destroy方法
    // 在web工程停止的时候调用
```

实现Servlet类下如何获取GET&POST方法

```java
1. 若在service方法中
	// 使用servletRequest的子类型HttpServletRequest中的getMethods方法来获取到底是get请求还是post请求
    HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
    String method = httpServletRequest.getMethod();
    System.out.println(method);
    if ("GET".equals(method)) {
    	System.out.println("get方法");
    } else {
    	System.out.println("post方法");
 	}
```

如何通过"继承HttpServlet类"来创建一个servlet程序（通过一个类继承HttpServlet类）

```java
1. 编写一个类去继承 HttpServlet类
2. 根据业务需求来重写doGet或者doPost方法
    public class TestHttpServlet extends HttpServlet {
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
            super.doGet(req, resp);
        }

        @Override
        protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
            super.doPost(req, resp);
        }
	}
3. 到web.xml中去配置Servlet访问地址    
    // 同上
```

