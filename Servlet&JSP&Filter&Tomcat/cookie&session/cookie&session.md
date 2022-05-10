## 2022.05.09

#### Cookie

```java
1. 什么是Cookie
       服务器端通知客户端保存键值对的一种技术;
       客户端有了Cookie后，每次请求都发送给服务器端;
       每个Cookie大小不超过4kb

2. 服务端如何创建Cookie并通知客户端(Servlet版本)
       Cookie cookie = new Cookie("keyTest","valueTest");
       resp.addCookie(cookie); 
       // 实际通过http响应头Set-Cookie：keyTest=valueTest 告知客户端(浏览器)创建
 
3. 服务端如何获取Cookie(Servlet版本)
       客户端http请求头中包含了Cookie信息；
       Cookie[] cookies = req.getCookies() // Cookie[]
       for(Cookie cookie : cookies){
            // cookie.getName() 获取key
            // cookie.getValue() 获取value
       }

4. 服务端如何修改Cookie(Servlet版本)
        4.1 // 创建一个需要修改的同名key的cookie对象
            Cookie editCookie = new Cookie("key","value");
            // 设置响应头
            resp.addCookie(cookie);
        
        4.2 // 先找到需要修改的Cookie对象
            // 使用Cookie对象的setValue()方法
            cookie.setValue("editValue");
            // 设置响应头
            resp.addCookie(cookie);

5. Cookie生命控制
        主要使用cookie对象的setMaxAge()方法
        正数：表示在指定的秒数后过期
        负数：表示浏览器一关，Cookie 就会被删除（默认值是-1）
        0：表示马上删除 Cookie
        
6. Cookie的path属性过滤
        Cookie 的 path 属性可以有效的过滤哪些 Cookie 可以发送给服务器。哪些不发
        path 属性是通过请求的地址来进行有效的过滤
        // cookie1 path=/工程路径
        // cookie2 path=/工程路径/test
        
        若此时访问路径为http://ip:port/工程路径
        此时在浏览器的cookie中只会看见cookie1，而看不见cookie2，同样请求也只会带cookie1，不会带cookie2
        若此时访问路径为http://ip:port/工程路径/test/xxx.html
        此时浏览器中同时看到cookie1,cookie2，同样请求也会同时带上
        
        Cookie cookie2 = new Cookie("path","path");
        cookie2.setPath(req.getContextPath + "/test");
        resp.addCookie(cookie2);
```

#### Session

```java
1. 什么是Session
    是一个接口（HttpSession）;
    是一个会话，它是用来维护一个客户端和服务器之间关联的一种技术；
    每个客户端都有自己的一个Session会话；

2. 服务端如何创建或获取Session
        // 创建和获取是同一个方法
        HttpSession session = req.getSession()
        // 通过isNew()方法来判断是否是第一次创建
        Boolean isNew  = session.isNew();
	   // 每个会话都有一个身份证号。也就是 ID 值。而且这个 ID 是唯一的。
	    String id = session.getId();

3. session生命控制
    3.1 Session默认的超时时长在我们的服务器(Tomcat)的配置文件web.xml中配置的，表示当前tomcat服务器下所有的session超时时长是30分钟
    	<session-config>
    		<session-timeout>30</session-timeout>
    	</session-config>
    
    3.2 若想当前Tomcat服务器下的某个web工程，设置其session时长，则需要在自己工程下的web.xml中更改配置
    	<session-config>
    		<session-timeout>20</session-timeout>
    	</session-config>
    
    3.3 若想指定修改个别Session超时时长，则需要使用HttpSession提供的3个方法
    	session.setMaxInactiveInterval() // 以秒为单位，值为正数时，到点销毁，值为负数时，表示永不销毁
    	session.getMaxInactiveInterval() // 获取当前session的超时时长
    	session.invalidate() // 让当前session会话立马超时无效
    
    3.4 Session超时概念
    	它是指，客户端两次请求的最大间隔时长
    

 4. session技术，底层是基于Cookie技术来实现的 
```

![浏览器与session.png](https://s2.loli.net/2022/05/09/6HzFtWfijScZrIV.png)