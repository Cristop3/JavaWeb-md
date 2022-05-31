## 2022.05.30

#### @RequestMapping功能

```java
@RequestMapping注解的作用就是将请求和处理请求的控制器方法关联起来，建立映射关系。

SpringMVC 接收到指定的请求，就会来找到在映射关系中对应的控制器方法来处理这个请求。
```

#### @RequestMapping位置

```java
1. 标识类
	设置映射请求的请求路径的初始信息
2. 标识方法
     设置映射请求请求路径的具体信息

@Controller
@RequestMapping("/pipeline")
public class TestController {
    @RequestMapping("/test")
    public String test() {
        return "index";
    }
}
// /pipeline/test
```

#### @RequestMapping属性

```java
1. value
    表示通过请求的请求地址匹配请求映射；
    是一个字符串数组，表示可以匹配多个请求到映射 @RequestMapping(value = {"/test","/test2"}) String[]
	@RequestMapping(value = {"/testMappingValue1", "/testMappingValue2"})
    public String test2() {
        return "index";
    }

	同时SpringMVC支持ant风格的路径匹配
        ？：表示任意的单个字符
        *：表示任意的0个或多个字符
        **：表示任意的一层或多层目录
        注意：在使用**时，只能使用/**/xxx的方式

2. method
    表示通过请求的请求方式匹配请求映射；
    是一个RequestType枚举类型的数组，表示可以匹配多种请求方式 @RequestMapping(method = {RequestType.GET, RequestType.POST})
    @RequestMapping(value = "/testMappingMethod", method = RequestMethod.GET)
    public String test3() {
        return "index";
    }

	对于处理指定请求方式的控制器方法，SpringMVC中提供了@RequestMapping的派生注解
    处理get请求的映射 --> @GetMapping
    处理post请求的映射 --> @PostMapping
    处理put请求的映射 --> @PutMapping
    处理delete请求的映射 --> @DeleteMapping
        
    @GetMapping("/testGetMapping") // 表示匹配get请求 路径为/testGetMapping
    public String test4(){
        return "index";
    }

3. params
    表示通过请求的请求参数匹配请求映射；
    是一个字符串数组，可以通过四种表达式设置请求参数和请求映射的匹配关系
    "param"：要求请求映射所匹配的请求必须携带param请求参数
    "!param"：要求请求映射所匹配的请求必须不能携带param请求参数
    "param=value"：要求请求映射所匹配的请求必须携带param请求参数且param=value
    "param!=value"：要求请求映射所匹配的请求必须携带param请求参数但是param!=value
	
    @RequestMapping(value = "/testParams", params = {"test"})
    public String test5(){
        return "index";
    }
	注意：当满足value和method，但不满足params时，会出现http 400响应状态码
        
 4. headers
    表示通过请求的请求头信息匹配映射；
    是一个字符串数组，同样可以通过四种表达式设置请求头和请求映射的匹配关系
    "header"：要求请求映射所匹配的请求必须携带header请求头信息
    "!header"：要求请求映射所匹配的请求必须不能携带header请求头信息
    "header=value"：要求请求映射所匹配的请求必须携带header请求头信息且header=value
    "header!=value"：要求请求映射所匹配的请求必须携带header请求头信息且header!=value  
        
    注意：当满足value和method，但不满足headers时，会出现http 404响应状态码    
```

#### 路径中的占位符

```java
1. 原始方式
    /queryUserById?id=1
2. rest方式
    /queryUserById/1
    常用于restful风格请求url，通过@RequestMapping中的value属性中的占位符{xxx}来表示传输的数据，再通过在方法中的@pathVariable注解，将值赋值到控制器方法的形参上。
    
    @RequestMapping(value = "/testRest/{id}/{name}")
    public String test6(@PathVariable Long id, @PathVariable String name){
        System.out.println(id + name);
        return "index";
    }
    http://localhost:8080/springMVC/pipeline/testRest/1/lidaye
```

## 
