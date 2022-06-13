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
    2.1 form表单的post提交
    	由于form表单的post提交，是在请求体中已&凭借，如key1=value1&key2=value2
    	此时我们使用(@RequestBody String form) 来接收
    2.2 ajax的json格式post提交
    	大多数我们实际开发中都是以json格式来提交数据，若刚好对应到java中的实体
    	此时我们使用(@RequestBody User user)来接收
    2.3 ajax的默认格式post提交
    	默认情况下，ajax默认的content-type是x-www-form-urlencoded, 它同样是以key1=value1&key2=value2来提交
```

#### @ResponseBody

```java
@ResponseBody用于标识一个控制器方法，可以将该方法的返回值直接作为响应报文的响应体响应到
浏览器

若需要返回json格式给前端，则需要添加json依赖
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.12.1</version>
</dependency>

此时在我们的控制器方法上加上@ResponseBody，则客户端受到json格式
```

#### @RequestEntity

```java
RequestEntity封装请求报文的一种类型，需要在控制器方法的形参中设置该类型的形参，当前请求的请求报文就会赋值给该形参，可以通过getHeaders()获取请求头信息，通过getBody()获取请求体信息

(RequestEntity<String> requestEntity)
    requestEntity.getHeaders()
    requestEntity.getBody()
```

#### @ResponseEntity

```java
ResponseEntity用于控制器方法的返回值类型，该控制器方法的返回值就是响应到浏览器的响应报文
```

#### @RestController

```java
@RestController注解是springMVC提供的一个复合注解，标识在控制器的类上，就相当于为类添加了@Controller注解，并且为其中的每个方法添加了@ResponseBody注解
    
比如我们直接往客户端返回二进制流
    public ResponseEntity<byte[]> xxx(){}
```

