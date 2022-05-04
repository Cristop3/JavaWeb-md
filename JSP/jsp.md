## 2022.05.03

#### 什么是jsp

```jsp
jsp全称是java server pages Java的服务器页面
jsp的主要作用就是代替Servlet程序回传html页面的数据
```

#### jsp的访问

```jsp
jsp页面和html页面一样，都是存放在web目录下，访问也跟访问html页面一样
```

#### jsp本质

```jsp
jsp页面本质上是一个Servlet程序；
当第一次访问jsp页面时，Tomcat服务器会帮我们把jsp页面翻译成一个java源文件，并且还有个被编译为.class的字节码程序。
// 如a.jsp
```

![jsp本质.png](https://s2.loli.net/2022/05/03/TqkeoImn63a9Zh2.png)

```javascript
打开源文件：
// a_jsp.java
public final class a_jsp extends org.apache.jasper.runtime.HttpJspBase{} 
// 其中HttpJspBase直接继承了HttpServlet类，本质上就是Servlet

// HttpJspBase.java
public abstract class HttpJspBase extends HttpServlet implements HttpJspPage{}
```

#### jsp头部page指令相关

```jsp
jsp的page指令可以修改jsp页面中的一些重要的属性，或者行为。
<%@ page
    language="java" // jsp翻译后是什么语言，暂时支持java
    
    contentType="text/html;charset=utf-8" // jsp返回的数据类型是什么，等同于resp.setContentType()参数值
    
    pageEncoding="utf-8" // 当前jsp页面文件本身的字符集
    
    import="java.utils.Map" // 等同于java中导包，导类
    
    // 以下两个属性是给out输出流使用
    autoFlush="true" // 设置当out输出流缓冲区满了后，是否自动刷新冲级区，默认true
    buffer="8kb" // 设置out缓冲区大小，默认8kb
    // 若设置autoFlush="false";buffer="1kb"则当jsp内容超过1kb时则报错显示 如：Java.io.IOException: Error JSP Buffer overflow
    
    errorPage="/errorPage.jsp" // 设置当jsp页面运行时出错，自动跳转去的错误页面路径
    // 路径一般以斜杠打头，表示请求地址为http://ip:port/工程路径/映射到代码的web目录下
    
    isErrorPage="false" // 设置当前jsp页面是否是错误信息页面，默认false，若是true则可以从源码中看到获取了一个Exception
    
    session="true" // 设置访问当前jsp页面，是否会创建HttpSession对象，默认true
    
    extends="" // 设置jsp翻译出来的java类默认继承谁
%>
```

#### jsp中的声明脚本

```java
声明脚本格式：<%! 声明java代码 %>
作用：可以给jsp翻译出来的java类定义属性、方法、静态代码块、内部类
// 属性
    <%!
    	private String username;
		private String password;
    %>
// 方法
    <%!
        public int test(){
        	return 123;
        }
    %>
// 静态代码块
    <%!
        static {
        	System.out.println("static")
    	}
    %>
// 内部类
    <%!
        public static class A{
            private String email = "1@qq.com";
        }
    %>
```

#### jsp中的表达式脚本

```java
表达式脚本格式：<%= 表达式 %>
作用：给jsp页面上输出数据

// 输出整型
    <%=
    	33
    %>
// 输出字符串
    <%=
    	"i am string"
    %>
...
 
特点：
    所有表达式脚本会被翻译到_jspService()方法中；
    所有表达式脚本会被翻译成out.print()输出到页面上；
    可以使用_jspService()方法中的所有对象，如：<%= request.getParameter("test") %>;
    所有表达式脚本不能以分号结束 
```

#### jsp中的代码脚本

```java
代码脚本格式：<% java语句 %>
作用：在jsp页面中，编写自己需要的功能（java语法）
    
特点：
    翻译之后都在_jspService方法中；
    _jspService()方法中的对象都可以直接使用；
    可以由多个代码脚本块组合完成一个完整的java语句；
    可以和表达式脚本一起组合使用，在jsp页面上输出数据。
```

#### jsp九大内置对象及四大域对象

```java
// 从编译后的源码中可以看出
request   // 请求对象
response  // 响应对象
pageContext  // jsp的上下文对象
session   // 会话对象
application  // ServletContext对象
config    // ServletConfig对象
out       // jsp输出流对象
page      // 指向当前jsp的对象
exception // 异常对象
    
// 4大域对象                     所属类                        scope范围
pageContext                (PageContextImpl类)            当前jsp页面范围内有效
request                    (HttpServletRequest类)         一次请求内有效
session                    (HttpSession类)         一个会话范围（打开浏览器直到关闭）
application                (ServletContext类)  整个web工程范围内（直到web工程停止）
    
以上4者可以像Map一样存取数据setAttribute(key,value)&getAttribute(key); 但存取范围有限及优先顺序，从下到大如下排列：
    pageContext -> request -> session -> application
```

#### jsp中out输出和response.getWriter.write()输出区别及out.write()和out.print()区别

```java
首先：
    out也可以再jsp编译后的源码中看见，均使用out进行输出；
    reponse响应对象中，也可以设置返回给客户端的输出内容。
区别：
    两者均会先输出到各自对应的缓冲区，比如out缓冲区，response缓冲区；
    当jsp页面所有代码执行完成后会做两个操作：
    	1. 执行out.flush()操作，会把out缓冲区中的数据追加写入到reponse缓冲区末尾
    	2. 执行response刷新操作，把response缓冲区所有数据写回到客户端。
    因此，默认情况下两者均存在时，会先输出reponse内容再输出out内容（除非手动的执行out.flush()方法），即在jsp页面时均使用"out"来统一输出。
    
其中：
    out.write() 输出字符串没问题，但输出整型，会输出Ascal码（底层代码 cb[nextChar++] = (char) c 做了char类型的强制类型转换）
    out.print() 输出任意类型没问题（底层代码均做了所有类型转换为字符串后再调用out.write()方法输出）
因此：
    在jsp页面中，统一使用out.print()来进行输出。
```

#### jsp常用标签

```jsp
1. 静态包含
    <%@ include file="" %>

2. 动态包含
	<jsp:include page="">
	  <jsp:param name="test" value="test" />
    </jsp:include>

	区别：
		2.1 使用动态包含时也会把动态部分编译为java代码和字节码
		2.2 JspRuntimeLibrary.include(request, response, "/include/footer.jsp", out, false); 底层是使用这样的方法去动态加载，并把父页面的request\response\out对象传递给了子页面，因此父子共用一个out输出流
		2.3 可以传递参数，如上所示，在子页面使用request.getParameter(key)获取

3. 转发标签
	<jsp:forward page=""></jsp:forward>
```

#### 三大组件之二：Listener监听器

```java
1. JavaWeb三大组件
    1.1 Servlet程序
    1.2 Filter过滤器
    1.3 Listener监听器
    
2. 什么是监听器
    它是JavaEE的规范，就是接口

3. 作用
    监听某种事物变化，然后通过回调函数让程序做一些相应的处理
    
4. ServletContextListner监听器
    4.1 监听ServletContext对象的创建和销毁
    4.2 涉及实现的两个方法
    	contextInitialized()方法： web工程启动时候回调
    	contextDestroyed()方法： web工程停止的时候回调
    
5. 如何使用
    5.1 编写一个类去实现ServletContextListener接口
    5.2 实现其两个回调方法
    5.3 在web.xml中配置监听器
    	<listener>
        	<listener-class>classpath</listener-class>
    	</listener>
```

## 2022.05.04

#### EL表达式

```java
1. 含义
    Express Language(表达式语言)
2. 作用
    主要是代替jsp页面中的表达式脚本在jsp页面中进行数据的输出
3. 格式
    ${ 表达式 }
```

#### EL表达式获取域数据的顺序

```java
pageContext.setAttribute("key","pageContext");
request.setAttribute("key","request");
session.setAttribute("key","session");
application.setAttribute("key","application");
当四个域中都有相同的key的数据时，EL表达式会按照四个域的从小到大的顺序，找到就输出
    ${ key } // pageContext
```

#### EL中的"."点运算和"[]"中括号运算

```java
.点运算，可以输出Bean对象中某个属性的值 pojo.username // 其中特别注意在EL中.点操作符后面默认找的是其getXxx() 如上面就是找的getUsername() getter方法，因此在EL中使用时注意可以不要get前缀，直接后面的内容
[]中括号运算，可以输出有序集合中某个元素的值 pojo.cities[0]
也可以输出map集合中key含特殊字符的值 pojo.map['x+x+x'] || pojo.map["y.y.y"]
```

#### EL中11个隐含对象

```java
// 该11个隐含对象是EL自定义的，因此只能在El表达式中使用，注意与jsp9大内置对象区别

变量                         类型					 作用
// 注意在jsp内置对象中也有pageContext是当前jsp上下文对象 这里是在EL中使用来获取jsp9大对象    
pageContext             PageContextImpl          获取jsp中九大内置对象
    
1. 协议
    jsp: <% request.getScheme() %>
    EL: ${ pageContext.request.scheme }
2. 服务器IP
    jsp: <% request.getServerName() %>
    EL: ${ pageContext.request.serverName }
3. 服务器端口
    jsp: <% request.getServerPort() %>
    EL: ${ pageContext.request.serverPort }
4. 工程路径
    jsp: <% request.getContextPath() %>
    EL: ${ pageContext.request.contextPath }
5. 请求方法
    jsp: <% request.getMethod() %>
    EL: ${ pageContext.request.method }
6. 客户端IP
    jsp: <% request.getRemoteHost() %>
    EL: ${ pageContext.request.remoteHost }
7. 会话id
    jsp: <% session.getId() %>
    EL: ${ pageContext.session.id }

// 这四个对标jsp中的4大域对象    
pageScope               Map<String,Object>       获取pageContext域中数据
requestScope            Map<String,Object>       获取request域中数据
sessionScope            Map<String,Object>       获取session域中数据applicationScope        Map<String,Object>       获取ServletContext域中数据
    
param                   Map<String,String>       获取请求参数的值
paramValues             Map<String,String[]>     获取多个值的参数值

header                  Map<String,String>       获取请求头的信息
headerValues            Map<String,String[]>     获取多个值的请求头值
    
cookie                  Map<String,Cookie>       获取当前请求的Cookie信息

// 这里需要注意，我们在servlet配置web.xml时 使用<init-param>来配置的"servletConfig"值 而这里的initParam对标的是我们在servlet配置web.xml中<context-param>这个"servletContext"值
initParam               Map<String,String>       获取web.xml中配置的<context-param>上下文参数
```

