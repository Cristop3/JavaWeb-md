## 2022.05.28

#### MVC

```java
MVC是一种软件架构的思想，将软件按照模型、视图、控制器来划分
    
M：Model，模型层，指工程中的JavaBean，作用是处理数据
    JavaBean分为两类：
    一类称为实体类Bean：专门存储业务数据的，如 Student、User 等
    一类称为业务处理 Bean：指 Service 或 Dao 对象，专门用于处理业务逻辑和数据访问。
    
V：View，视图层，指工程中的html或jsp等页面，作用是与用户进行交互，展示数据
    
C：Controller，控制层，指工程中的servlet，作用是接收请求和响应浏览器
    
用户通过视图层发送请求到服务器，在服务器中请求被Controller接收，Controller
调用相应的Model层处理请求，处理完毕将结果返回到Controller，Controller再根据请求处理的结果
找到相应的View视图，渲染数据后最终响应给浏览器    
```

#### SpringMVC

```java
在JavaWeb的学习中，我们了解到了JavaEE开发三层架构：表述层（表示层）（Web层）、业务逻辑层、数据访问层。
其中表述层是指"前台页面和后端Servlet"
    
而SpringMVC就是作为表述层开发的首选方案
    
SpringMVC基于原生Servlet，通过"前端控制器DispatcherServlet"，对请求和响应进行统一处理。
```

