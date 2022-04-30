## 2022.04.25

#### 什么是servlet

```java
1. JavaEE规范之一，规范就是接口
2. 是JavaWeb三大组件之一：servlet程序、Filter过滤器、Listener监听器
3. 运行在服务器上的一个java小程序，"它可以接收客户端发送过来的请求，并相应数据给客户端"
```

#### 如何通过"实现Servlet"来创建一个servlet程序（通过一个类来实现Servlet类）

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

#### 实现Servlet类下如何获取GET&POST方法

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

#### 如何通过"继承HttpServlet类"来创建一个servlet程序（通过一个类继承HttpServlet类）

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
    // 同上配置
```

#### 解决右键New未出现Servlet配置项（变相就是通过Idea来创建Servlet程序）

```java
https://blog.csdn.net/a124654564/article/details/119105837?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-0.pc_relevant_paycolumn_v3&spm=1001.2101.3001.4242.1&utm_relevant_index=3
```

#### 整个Servlet继承实现体系

![servlet-体系.png](https://s2.loli.net/2022/04/25/HwiOcze86v73RhB.png)

#### ServletConfig类

```java
1. 用处
    Servlet程序的配置信息类；
    Servlet程序和ServletConfig对象都是由Tomcat负责创建，我们负责使用；
    Servlet程序默认是第一次访问的时候创建，ServletConfig是每个Servlet程序创建时，就创建一个对应的ServletConfig对象。
    
2. 三大作用（均在init方法中使用）
    2.1 "获取Servlet程序的别名（web.xml中的servlet-name）"
     // servletConfig.getServletName()
    
    2.2 "获取初始化参数init-param（web.xml中找到当前Servlet配置标签项）"
     // <init-param>
     <Servlet>
     	// Servlet配置
    	// ...
    	// servletConfig init参数
    	<init-param>
    		<param-name>username</param-name>
    		<param-value>root</param-value>
    	</init-param>
     </Servlet>
     // servletConfig.getInitParameter("username")
    
   2.3 "获取ServletContext对象"
    // servletConfig.getServletContext()
```

#### ServletContext类

```java
1. 含义
    ServletContext是一个接口，表示Servlet上下文对象；
    一个web工程，只有一个ServletContext对象实例；
    ServletContext对象是一个域对象。
    
    什么是域对象？
    	是可以像Map一样存取数据的对象，叫域对象。
    	这里的域指的是存取数据的操作范围。（整个web工程）
    
2. 四个作用
    2.1 "获取web.xml中配置的上下文参数<context-param>(与<servlet>标签同级)"
    	// web.xml
    		<!--    配置servletContext配置项 -->
                <context-param>
                    <param-name>sameLevelServlet</param-name>
                    <param-value>1234</param-value>
                </context-param>
        // servlet 的doPost方法中
    		ServletContext servletContext = getServletContext(); // 这里我直接使用getServletContext()方法 该方法在GenericServlet抽象类当中
        	System.out.println("获取配置的context域对象参数sameLevelServlet的值" + servletContext.getInitParameter("sameLevelServlet")); // 特别需要注意获取context-param参数也使用getInitParameter方法 但注意不能得到init-param配置项
    
    2.2 "获取当前的工程路径，格式：/工程路径"
        System.out.println("获取当前的工程路径，格式： /工程路径:" + servletContext.getContextPath()); // 若在本地则同Tomcat中Deployment中的Application context设置相同，也等于url路径中端口号后面到Servlet名称前内容
    
    2.3 "获取工程部署后在服务器硬盘上的绝对路径"
        System.out.println("获取工程部署到服务器硬盘上的绝对路径" + servletContext.getRealPath("/"));
	    //	"/":斜杠表示被服务器解析地址为：http://ip:port/工程名/
        //   再者映射到IDEA代码目录中的web文件夹
    
    2.4 "像Map一样存取数据"
        ServletContext servletContext = getServletContext();
	    servletContext.setAttribute(key,value)
        servletContext.getAttribute(key)
        servletContext.removeAttribute(key)
    
    2.5 "ServletContext是在web工程部署启动的时候创建，在web工程停止的时候销毁"        
```

#### GET请求分析

![get请求分析.png](https://s2.loli.net/2022/04/26/wVMGHXkFvbTiAxn.png)

#### POST请求分析

![post请求分析.png](https://s2.loli.net/2022/04/26/mr9WG3eiDCPbOg4.png)

#### HTTP-Request-Header

![http-request-header.png](https://s2.loli.net/2022/04/26/yUFGtA9Y4wsJvC1.png)

#### HTTP-Response-Header

![http-response-header.png](https://s2.loli.net/2022/04/26/KCPQTNl7E1Z9zRv.png)

## 2022.04.29

#### HttpServletRequest类

```java
1. 作用
    每次只要有请求进入 Tomcat 服务器，Tomcat 服务器就会把请求过来的 HTTP 协议信息解析好封装到 Request 对象中。然后传递到 service 方法（doGet 和 doPost）中给我们使用。我们可以通过 HttpServletRequest 对象，获取到所有请求的信息。
    
2. 常用方法
    // -----------------------------setCharacterEncoding--------------------------
    3.1 setCharacterEncoding() - "设置字符集" （针对post请求 中文乱码 但是必须要在请求参数之前 调用）
        req.setCharacterEncoding("UTF-8")
    
    // ------------------------------------base-----------------------------------
    2.1 getRequestURI() - "获取请求的资源路径"
    System.out.println("getRequestURI() - \"获取请求的资源路径\"" + req.getRequestURI());
	// /servlet-demo/TestHttpServletRequest

    2.2 getRequestURL() - "获取请求的统一资源定位符（绝对路径）"
    System.out.println("getRequestURL() - \"获取请求的统一资源定位符（绝对路径）\"" + req.getRequestURL());    
    // http://127.0.0.1:8080/servlet-demo/TestHttpServletRequest

    2.3 getRemoteHost() - "获取客户端的IP"
    System.out.println("getRemoteHost() - \"获取客户端的IP\"" + req.getRemoteHost());
	// 127.0.0.1

    2.4 getHeader() - "获取请求头"
    System.out.println("getHeader() - \"获取请求头\"" + req.getHeader("content-type"));
	// application/x-www-form-urlencoded
	
	2.7 getMethod() - "获取请求的方式"
    System.out.println("getMethod() - \"获取请求的方式\"" + req.getMethod());
	// POST
	
	// --------------------------------获取参数值-----------------------------------
    2.5 getParameter() - "获取请求的参数"
    	String username = req.getParameter("username");
        String password = req.getParameter("password");
        System.out.println("username: " + username);
        System.out.println("password: " + password);    

    2.6 getParameterValues() - "获取请求的参数（多个值(当存在一个字段key 跟多个value值时)时使用）"
        String[] hobbies = req.getParameterValues("hobby");
        System.out.println("hobby: " + Arrays.asList(hobbies));
        
    
	// ------------------------------设置获取数据域---------------------------------
    2.8 setAttribute(key,value) - "设置数据域"
        req.setAttribute("fromHttpServletRequest", "test");

    2.9 getAttribute(key) - "获取数据域"
        Object fromHttpServletRequest = req.getAttribute("fromHttpServletRequest");
        System.out.println(fromHttpServletRequest);
	
    // --------------------------------请求转发-------------------------------------
    3.0 getRequestDispatcher() - "获取请求转发对象"
        RequestDispatcher requestDispatcher = req.getRequestDispatcher("/TestDispatcher"); // "/"表示http://ip:port/工程名（映射到idea中的web文件夹）
        requestDispatcher.forward(req, resp);
	
	// -------------------------------请求转发特点----------------------------------
	    1. 浏览器地址栏没有变化
     	2. 他们是一次请求
         3. 他们共享Request域中的数据
         4. 可以转发到WEB-INF目录下的资源
         5. 不可以访问工程以外的资源
```

#### 请求转发示意图

![请求转发.png](https://s2.loli.net/2022/04/30/VLmvIoTQDUEAtZe.png)

#### JavaWeb中的相对路径和绝对路径

```java
相对路径：
	.   // 表示当前目录
    ..  // 表示上一级目录
    资源名 // 表示当前目录/资源名
    
绝对路径：
    http://ip:port/工程路径/资源路径
```

#### web中 / 斜杠的不同意义

```java
在web中 / 斜杠 是一种绝对路径
    
/ 斜杠：如果被"浏览器"解析，得到的地址是:"http://ip:port"
    如：<a href="/">斜杠</a>
    
/ 斜杠：如果被"服务器"解析，得到的地址是："http:ip:port/工程路径"    
    如：<url-pattern>/servlet</url-pattern>
        servletContext.getRealPath("/")
        request.getRequestDispatcher("/")

特殊情况：respose.sendRedirect("/") 把斜杠发送给浏览器解析，得到"http://ip:port/"    
```

## 2022.04.30

#### HttpServletResponse类

```java
HttpServletResponse 类和 HttpServletRequest 类一样。每次请求进来，Tomcat 服务器都会创建一个 Response 对象传递给 Servlet 程序去使用。HttpServletRequest 表示请求过来的信息，HttpServletResponse 表示所有响应的信息，我们如果需要设置返回给客户端的信息，都可以通过 HttpServletResponse 对象来进行设置
```

#### 响应的两个输出流的说明

```java
字节流：getOutputStream() 常用于下载（传递二进制数据）
字符流：getWriter() 常用于回传字符串（常用）
两个流同时只能使用一个，否则报错。    
```

#### 如何解决客户端响应、服务端打印中文乱码问题

```java
1. 首先Tomcat默认的字符集是 ISO-8859-1
    // 通过resp.getCharacterEncoding()来查看
2. 手动设置服务器的字符集
    // 通过resp.setCharacterEncoding("UTF-8")
    // 这步设置过后可以看到服务器打印出来的字体是正确的中文，但是响应给浏览器的还是乱码，因此需要服务器告诉浏览器以什么字符集来显示，这里就体现了响应头中的Content-Type
3. 通知浏览器客户端以什么字符集显示
    // resp.setHeader("Content-Type","text/html;charset=UTF-8")
    // PrintWriter writer = resp.getWriter()
    // writer.write("这是我的响应！！！")

4. 一步到位设置
    // resp.setContentType("text/html;charset=UTF-8")
    // 同时设置客户端、服务端使用UTF-8字符集且设置响应头
```

#### 请求重定向

```java
// 方式1
resp.setStatus(302)
resp.setHeader("Location","http://localhost:8080/servlet-web/testResponse2")
    
// 方式2
resp.sendRedirect("http://localhost:8080/servlet-web/testResponse2")
```

![请求重定向.png](https://s2.loli.net/2022/04/30/9U1O8jTNdFGMqhQ.png)

