## 2022.06.06

#### 拦截器

```java
1. 作用
    拦截器用于"拦截控制器方法"的执行
2. 实现
    2.1 需要实现"HandlerInterceptor"
    2.2 拦截必须在SpringMVC的配置文件中进行配置
```

#### 拦截器三个抽象方法

```java
preHandle：控制器方法执行之前执行preHandle()，其boolean类型的返回值表示是否拦截或放行，返回true为放行，即调用控制器方法；返回false表示拦截，即不调用控制器方法
    
postHandle：控制器方法执行之后执行postHandle()
    
afterComplation：处理完视图和模型数据，渲染视图完毕之后执行afterComplation()
```

#### 多个拦截器执行顺序

```java
1. 若每个拦截器的preHandle()都返回true
    此时多个拦截器的执行顺序和拦截器在SpringMVC的配置文件的配置顺序有关：
preHandle()会按照配置的"顺序执行"(源码使用i++ 迭代遍历的)，而postHandle()和afterComplation()会按照配置的"反序执行"(源码使用i-- 迭代遍历的)
    
2. 若某个拦截器的preHandle()返回了false   
    preHandle()返回false和它之前的拦截器的preHandle()都会执行，postHandle()都不执行，返回false的拦截器之前的拦截器的afterComplation()会执行
```

#### 拦截器实现

```java
// TestInterceptorF.java
public class TestInterceptorF implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("TestInterceptorF::preHandle");
        return HandlerInterceptor.super.preHandle(request, response, handler);
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
        System.out.println("TestInterceptorF::postHandle");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
        System.out.println("TestInterceptorF::afterCompletion");
    }
}

// TestInterceptorS.java
@Component // 标识为Spring Bean组件 方便在SpringMVC配置中使用ref引入bean
public class TestInterceptorS implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("TestInterceptorS::preHandle");
        return HandlerInterceptor.super.preHandle(request, response, handler);
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
        System.out.println("TestInterceptorS::postHandle");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
        System.out.println("TestInterceptorS::afterCompletion");
    }
}

// SpringMVC.xml
	<!--    配置拦截器-->
    <mvc:interceptors>
        
        <!--    方式1：bean标签拦截所有-->
        <!--        <bean class="com.company.mvc.interceptor.TestInterceptorF"/>-->
            
        <!--        方式2：ref标签引入bean(特别需要注意我们在Spring中学习过无自定义名称时，IOC会将类名首字母小写当作标识符)拦截所有-->
        <!--        <ref bean="testInterceptorS"/>-->
            
        <!--        方式3：子interceptor标签可配置指定路径下匹配执行拦截器-->
        <mvc:interceptor>
            <!--            需要匹配的路径-->
            <mvc:mapping path="/**"/>
            <!--            需要排除的路径-->
            <mvc:exclude-mapping path="/"/>
            <!--            对应的拦截器-->
            <!--            <ref bean="testInterceptorS"/>-->
            <bean class="com.company.mvc.interceptor.TestInterceptorF"/>
        </mvc:interceptor>
            
    </mvc:interceptors>
```

#### 异常处理器

```java
SpringMVC提供了一个处理控制器方法过程中所出现的异常的接口 "HandlerExceptionResolver"
    其中它有两个实现类：
    	"DefaultHandlerExceptionResolver" （比如我们经常看的到404 405等异常页面）
    	"SimpleMappingExceptionResolver" （自定义异常处理器）
    
1. 基于xml配置文件开启异常处理器
    <!--    基于xml开启控制器方法异常处理器-->
    <bean class="org.springframework.web.servlet.handler.SimpleMappingExceptionResolver">
        <property name="exceptionMappings">
            <props>
                <!--
                    properties的键表示处理器方法执行过程中出现的异常
                    properties的值表示若出现指定异常时，设置一个新的视图名称，跳转到指定页面
                -->
                <prop key="java.lang.ArithmeticException">error</prop>
            </props>
        </property>
        <!--        exceptionAttribute属性设置一个属性名，将出现的异常信息在请求域中进行共享-->
        <property name="exceptionAttribute" value="iAmExceptionAreaObject"/>
    </bean>
        
2. 基于注解开启异常处理器
    @ControllerAdvice
    public class TestInterceptor {
        @ExceptionHandler(value = {ArithmeticException.class, NullPointerException.class})
        public String handleException(Model model, Exception ex){
            model.addAttribute("iAmExceptionAreaObject", ex);
            return "error";
        }
    }

3. 自定义错误视图
    <!DOCTYPE html>
    <html lang="en" xmlns:th="http://www.thymeleaf.org">
    <head>
        <meta charset="UTF-8">
        <title>error</title>
    </head>
    <body>
    <h1>这里是自定义控制器方法异常处理 跳转到指定error页面 且可以通过配置的exceptionAttribute来获取异常信息</h1>
    <h3 th:text="${iAmExceptionAreaObject}"></h3>
    </body>
    </html>
```

#### 基于xml配置搭建Spring+SpringMVC开发环境

```java
1. 新建一个空白的maven工程
    1.1 配置打包方式为war包（web项目）
    1.2 引入SpringMVC、日志、servlet、thymeleaf依赖包
    // pom.xml
    <!--    配置打包方式为war包（JavaWeb项目）-->
    <packaging>war</packaging>
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
    
2. 配置成web项目
    2.1 project structure -> Modules -> 若maven成功拉取所有依赖包后，在我们新建的maven模块项目下有个Web
    2.1 在右侧Deployment Descriptors（依赖描述）实际就是配置web.xml文件
    2.3 点击"+"号 确认web.xml路径，一般是放在src\main\webapp下（默认的\WEB-INF\web.xml）因此只需添加前缀路径src\main\webapp
    
3. 配置web.xml
    3.1 "Servlet"：引入DispatcherServlet组件（SpringMVC依赖此servlet）
    3.2 "Filter"：加入针对POST提交，中文乱码处理过滤器（CharacterEncodingFilter）
    3.3 "Filter"：加入隐藏http提交方式"_method"字段支持RESTful风格的PUT、DELETE（HiddenHttpMethodFilter）
    注意：
    	3.2的过滤器必须配置到3.3过滤器前，不然无效果
    	当配置了DispatcherServlet组件时，需要指定SpringMVC.xml文件配置路径因此需要创建该文件并配置关于SpringMVC的东西
    // web.xml
    <!--1. 配置编码过滤器-->
    <filter>
        <filter-name>CharacterEncodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>UTF-8</param-value>
        </init-param>
        <init-param>
            <param-name>forceResponseEncoding</param-name>
            <param-value>true</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>CharacterEncodingFilter</filter-name>
        <url-pattern></url-pattern> // 此处配置为：/*
    </filter-mapping>

    <!--2. 配置HiddenHttpMethodFilter-->
    <filter>
        <filter-name>HiddenHttpMethodFilter</filter-name>
        <filter-class>org.springframework.web.filter.HiddenHttpMethodFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>HiddenHttpMethodFilter</filter-name>
        <url-pattern></url-pattern> // 此处配置为：/*
    </filter-mapping>

    <!--3. 配置springMVC的前端控制器DispatcherServlet-->
    <servlet>
        <servlet-name>DispatcherServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:springMVC.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>DispatcherServlet</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

4. 创建SpringMVC.xml并配置
    在src\main\resource下创建springMVC.xml文件
    在src\main\java下创建包，com.company.mvc.controller.TestController
                		   com.company.mvc.interceptor.TestInterceptor
    
    4.1 "context"：开启Spring包扫描注册到IOC容器
                
    4.2 "bean"：配置View视图解析器 thymeleaf组件 （里面指定了视图的前缀路径，根据实际情况来配置）
                
    4.3 "mvc"：配置view-controller默认视图（不要控制器方法视图）
                
    4.4 "mvc"：由于开启了view-controller因此必须开启SpringMVC注解驱动
                
    4.5 "mvc"：配置静态资源访问（由于DispatcherServlet拦截了所有的请求，因此在匹配静态资源时会出现404，因此在部署到服务器后，需要开启DispatcherServlet转发查找不成功，则让服务器去查找，若再找不到才404）
                
    4.6 "bean"：配置文件上传解析MultipartFile（CommonsMultipartResolver）注意这个地方需要配置个id名称且为"multipartResolver"
                注意：需要引入"commons-fileupload"依赖包
                	 处理请求JSON格式也需要引入"com.fasterxml.jackson.core"依赖包
                
    4.7 "mvc"：配置拦截器
                
    4.8 "bean"：配置自定义控制器方法异常拦截（SimpleMappingExceptionResolver）
	
	// pom.xml
    	<!--        JSON处理-->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>2.12.1</version>
        </dependency>
        <!--        文件上传-->
        <dependency>
            <groupId>commons-fileupload</groupId>
            <artifactId>commons-fileupload</artifactId>
            <version>1.3.1</version>
        </dependency>
                
5. 配置本地Tomcat服务器
          
```

#### 基于注解配置类搭建Spring+SpringMVC开发环境

```java
在Servlet3.0环境中，容器会在类路径中查找实现"javax.servlet.ServletContainerInitializer"接口的类，如果找到的话就用它来配置Servlet容器。 Spring提供了这个接口的实现，名为
"SpringServletContainerInitializer"，这个类反过来又会查找实现"WebApplicationInitializer"的类并将配置的任务交给它们来完成。Spring3.2引入了一个便利的WebApplicationInitializer基础实现，名为
"AbstractAnnotationConfigDispatcherServletInitializer"，当我们的类"扩展"（extends）了
AbstractAnnotationConfigDispatcherServletInitializer并将其部署到Servlet3.0容器的时候，容器会自动发现它，并用它来配置Servlet上下文。

// 配置web.xml
// WebConfig.java extends AbstractAnnotationConfigDispatcherServletInitializer
    public class WebConfig extends AbstractAnnotationConfigDispatcherServletInitializer {
        // 指定spring的配置类
        @Override
        protected Class<?>[] getRootConfigClasses() {
            return new Class[]{SpringConfig.class};
        }

        // 指定springMVC的配置类
        @Override
        protected Class<?>[] getServletConfigClasses() {
            return new Class[]{WebMVCConfig.class};
        }

        // 指定DispatcherServlet的映射规则，即url-pattern
        @Override
        protected String[] getServletMappings() {
            return new String[]{"/"};
        }

        // 注册过滤器characterEncodingFilter及hiddenHttpMethodFilter
        @Override
        protected Filter[] getServletFilters() {
            CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
            characterEncodingFilter.setEncoding("UTF-8");
            characterEncodingFilter.setForceResponseEncoding(true);
            HiddenHttpMethodFilter hiddenHttpMethodFilter = new HiddenHttpMethodFilter();
            return new Filter[]{characterEncodingFilter, hiddenHttpMethodFilter};
        }
    }
    
// 配置springMVC.xml
	需要配置类去实现"WebMvcConfigurer"接口
     在src\main下面创建webapp\WEB-INF\templates指定模板文件   
     @Configuration // 1. 注解为配置类
        @ComponentScan("com.company.mvc") // 2. 指定包扫描路径
        @EnableWebMvc // 3. 开启mvc注解驱动
        public class WebMVCConfig implements WebMvcConfigurer {
            // 4. 开启静态资源默认访问 default-servlet-handler
            @Override
            public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
                configurer.enable();
            }

            // 5. 开启默认视图
            @Override
            public void addViewControllers(ViewControllerRegistry registry) {
                registry.addViewController("/").setViewName("index");
            }

            // 6. 开启文件上传组件
            @Bean
            public MultipartResolver multipartResolver() {
                CommonsMultipartResolver commonsMultipartResolver = new CommonsMultipartResolver();
                return commonsMultipartResolver;
            }

            // 7. 开启控制器异常处理器
            @Override
            public void configureHandlerExceptionResolvers(List<HandlerExceptionResolver> resolvers) {
                SimpleMappingExceptionResolver exceptionResolver = new SimpleMappingExceptionResolver();
                Properties prop = new Properties();
                prop.setProperty("java.lang.ArithmeticException", "error");
                exceptionResolver.setExceptionMappings(prop);
                exceptionResolver.setExceptionAttribute("exception");
                resolvers.add(exceptionResolver);
            }

            // 8. 配置生成模板解析器
            @Bean
            public ITemplateResolver templateResolver() {
                WebApplicationContext webApplicationContext = ContextLoader.getCurrentWebApplicationContext();
                // ServletContextTemplateResolver需要一个ServletContext作为构造参数，可通过WebApplicationContext 的方法获得
                ServletContextTemplateResolver templateResolver = new ServletContextTemplateResolver(
                    webApplicationContext.getServletContext());
                templateResolver.setPrefix("/WEB-INF/templates/");
                templateResolver.setSuffix(".html");
                templateResolver.setCharacterEncoding("UTF-8");
                templateResolver.setTemplateMode(TemplateMode.HTML);
                return templateResolver;
            }

            // 8.1 生成模板引擎并为模板引擎注入模板解析器
            @Bean
            public SpringTemplateEngine templateEngine(ITemplateResolver templateResolver) {
                SpringTemplateEngine templateEngine = new SpringTemplateEngine();
                templateEngine.setTemplateResolver(templateResolver);
                return templateEngine;
            }

            // 8.2 生成视图解析器并未解析器注入模板引擎
            @Bean
            public ViewResolver viewResolver(SpringTemplateEngine templateEngine) {
                ThymeleafViewResolver viewResolver = new ThymeleafViewResolver();
                viewResolver.setCharacterEncoding("UTF-8");
                viewResolver.setTemplateEngine(templateEngine);
                return viewResolver;
            }
        }   

// 配置spring.xml
```

## 2022.06.07

#### SpringMVC执行流程

```java
1. 客户端向服务器发送http请求，此时请求被SpringMVC的前端控制器"DispatcherServlet"捕获。
2. "DispatcherServlet"对请求的URL进行解析，得到请求资源标识符URI，判断请求URI所对应的映射
    2.1 不存在
    	2.1.1 判断是否配置了"mvc:default-servlet-handler"
    		2.1.1.1 若未配置，则控制台报映射查找不到，客户端显示404错误
    		2.1.1.2 若有配置，则访问目标资源（一般为静态资源，如：JS\html\css），若还是找不到则客户端显示404错误
    2.2 存在
    	2.2.1 根据该URI，调用"HandlerMapping"获得该"Handler"配置的所有相关的对象（包括Handler对象以及Handler对象对应的拦截器），最后以"HandlerExecutionChain"执行链对象的形式返回
    	2.2.2 "DispatcherServlet" 根据获得的Handler，选择一个合适的"HandlerAdapter"
    	2.2.3 如果成功获得"HandlerAdapter"，此时将开始执行拦截器的"preHandler(…)"方法【正向】 
    	2.2.4 提取Request中的模型数据，填充Handler入参，开始执行Handler（Controller)方法，处理请求。在填充Handler的入参过程中，根据你的配置，Spring将帮你做一些额外的工作：
			2.2.4.1  HttpMessageConveter： 将请求消息（如Json、xml等数据）转换成一个对象，将对象转换为指定的响应信息
    		 2.2.4.2 数据转换：对请求消息进行数据转换。如String转换成Integer、Double等
    		 2.2.4.3 数据格式化：对请求消息进行数据格式化。 如将字符串转换成格式化数字或格式化日期等
    		 2.2.4.4 数据验证： 验证数据的有效性（长度、格式等），验证结果存储到BindingResult或Error中
         2.2.5  Handler执行完成后，向DispatcherServlet 返回一个ModelAndView对象。
    	 2.2.6 此时将开始执行拦截器的postHandle(...)方法【逆向】。
		2.2.7 根据返回的ModelAndView（此时会判断是否存在异常：如果存在异常，则执行
HandlerExceptionResolver进行异常处理）选择一个适合的ViewResolver进行视图解析，根据Model和View，来渲染视图。
		2.2.8 渲染视图完毕执行拦截器的afterCompletion(…)方法【逆向】。
    	2.2.9 将渲染结果返回给客户端。
```

