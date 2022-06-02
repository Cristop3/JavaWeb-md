## 2022.06.02

#### 通过ServletAPI设置

```java
// controller
@RequestMapping("/testServletAPI")
public String testServletAPI(HttpServletRequest request) {
    request.setAttribute("testServletAPI", "i am value : testServletAPI");
    return "object";
}
// thymeleaf模板
<h3>ServletAPI:</h3>
<span th:text="${testServletAPI}"></span>
```

#### 通过ModelAndView设置

```java
// controller
@RequestMapping("/testModelAndView")
public ModelAndView testModelAndView() {
    ModelAndView modelAndView = new ModelAndView();
    modelAndView.addObject("testModelAndView", "i am value : testModelAndView");
    modelAndView.setViewName("object");
    return modelAndView;
}
// thymeleaf模板
<h3>ModelAndView:</h3>
<span th:text="${testModelAndView}"></span>
```

#### 通过Model设置

```java
// controller
@RequestMapping("/testModel")
public String testModel(Model model) {
    model.addAttribute("testModel", "i am value : testModel");
    return "object";
}
// thymeleaf模板
<h3>testModelMap:</h3>
<span th:text="${testModelMap}"></span>
```

#### 通过ModelMap设置

```java
// controller
@RequestMapping("/testModelMap")
public String testModelMap(ModelMap modelMap) {
    modelMap.addAttribute("testModelMap", "i am value : testModelMap");
    return "object";
}
// thymeleaf模板
<h3>testModelMap:</h3>
<span th:text="${testModelMap}"></span>
```

#### 通过HttpSession设置

```java
// controller
@RequestMapping("/testSession")
public String testSession(HttpSession httpSession) {
    httpSession.setAttribute("testSession", "i am value : testSession");
    return "object";
}
// thymeleaf模板
<h3>testSession:</h3>
<span th:text="${session.testSession}"></span>
```

#### 通过servletContext设置

```java
// controller
@RequestMapping("/testApplicationBySession")
public String testApplicationBySession(HttpSession httpSession) {
    ServletContext servletContext = httpSession.getServletContext();
    servletContext.setAttribute("testApplicationBySession", "i am value : testApplicationBySession");
    return "object";
}
// thymeleaf模板
<h3>testApplicationBySession:</h3>
<span th:text="${application.testApplicationBySession}"></span>
```

#### Model、ModelMap、Map的关系

```java
Model、ModelMap、Map类型的参数其实本质上都是 BindingAwareModelMap 类型的
public interface Model{}
public class ModelMap extends LinkedHashMap<String, Object> {}
public class ExtendedModelMap extends ModelMap implements Model {}
public class BindingAwareModelMap extends ExtendedModelMap {}    
```

我们在JavaWeb中学习过servlet的九大内置对象和4大域数据，分别是

```java
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
    
因此在上面我们在模板中使用session.xxx或者application.xxx来获取域对象值    
```

