## 2022.06.22

#### 静态内容

```java
默认情况下，Spring Boot从类路径中的"/static"、"/public"、"/META-INF/resources"目录下提供静态内容
    1. 访问： 当前项目根路径/ + 静态资源名
    	原理：请求进来，先去找Controller看能不能处理。不能处理的所有请求又都交给静态资源处理器。静态资源也找不到则响应404页面
    
    2. 回顾：在之前的SpringMVC学习中，我们可以在xml中使用"<mvc:default-servlet-handler />"或者配置类中重载方法
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
                configurer.enable();
            }
	来开启对静态资源的访问
        
	3. 更改默认静态资源路径
      spring:
        mvc:
          static-path-pattern: "/resources/**" // 指定静态资源路径前缀为resources
       	resources:
		 static-locations: [classpath:/xxx/] // 指定静态资源目录路径在xxx目录下
	
	4. 默认无前缀访问
        当前项目 + static-path-pattern + 静态资源名 = 静态资源文件夹(如上面的xxx)下查找
```

#### 欢迎页

```java
Spring Boot支持静态和模板化的欢迎页面。它首先在配置的静态内容位置中查找index.html文件。如果找不到，则会查找index模板。如果找到任何一个，它将自动用作应用程序的欢迎页面。
    
可以设置spring.mvc.resources来指定静态资源根目录，但是不能设置静态资源前缀（会失效）    
```

#### 自定义应用图标Favicon

```java
Spring Boot在配置的静态内容位置和类路径的根（按此顺序）中查找favicon.ico。如果存在这样的文件，它将自动用作应用程序的favicon。
```

#### 表单元素rest风格请求

```java
1. 核心filter
	HiddenHttpMethodFilter

2. 用法：表单method=post，隐藏域 _method=put
    
3. 过程
    表单提交会带上_method=PUT
	 请求过来被HiddenHttpMethodFilter拦截
    请求是否正常，并且是POST
     获取到_method的值。
     兼容以下请求；PUT.DELETE.PATCH
     原生request（post），包装模式requesWrapper重写了getMethod方法，返回的是传入的值。
     过滤器链放行的时候用wrapper。以后的方法调用getMethod是调用requesWrapper的。

4. SpringBoot中如何开启
    spring:
      mvc:
        hiddenmethod:
          filter:
            enabled: true
                
5. 如何改变指定的隐藏参数
    @Bean
    public HiddenHttpMethodFilter hiddenHttpMethodFilter(){
        HiddenHttpMethodFilter methodFilter = new HiddenHttpMethodFilter();
        methodFilter.setMethodParam("_xxx");
        return methodFilter;
    }
```

