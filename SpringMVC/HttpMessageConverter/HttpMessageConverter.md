## 2022.06.04

#### HttpMessageConverter

```java
HttpMessageConverter，是一个报文信息转换器，它会将"请求报文"转换为"Java对象"，或者将"Java对象"转换为"响应报文"
    
它提供了两个注解和两个类型
    @RequestBody
    @ResponseBody
    
    RequestEntity
    ResponseEntity
```

#### @RequestBody

```java
1. 使用该注解时，需要在控制器方法处设置一个形参，并使用@RequestBody来进行标识，则当前请求的"请求体"就会为当前注解所标识的形参赋值
    
2. 一般配合http的POST\PUT等请求使用（因为它是获取请求体）        
```

