## 2022.05.31

#### 通过ServletAPI获取

```java
将HttpServletRequest作为控制器方法的形参
    @RequestMapping(value = "/testPramasType")
    public String test7(HttpServletRequest request) {
        String username = request.getParameter("username");
        String id = request.getParameter("id");
        String[] hobbies = request.getParameterValues("hobby");
        System.out.println("通过HttpServletRequest的getParameter方式获取：" + id + "::" + username + "::" + Arrays.asList(hobbies));
        return "params";
    }

这种方式 在JavaWeb中的Servlet经常使用，单值参数使用getParameter, 当存在多个相同key的值时我们需要使用getParameterValues，否则只会获取到第一个值
```

#### 通过控制器方法形参对应到请求参数获取

```java
在控制器方法的形参位置，设置和请求参数同名的形参，当浏览器发送请求，匹配到请求映射时，在
DispatcherServlet中就会将请求参数赋值给相应的形参
	@RequestMapping(value = "/testPramasType2")
    public String test8(Integer id, String username, String hobby, String[] hobby2) {
        System.out.println("通过直接控制器方法形参方式获取：" + id + "::" + username + "::" + hobby + "::" + Arrays.toString(hobby2));
        return "params";
    }
其中针对多同名参数，若在控制器方法中使用"非数组"接收，则此参数的值为每个数据中使用逗号拼接的结果，若使用"数组"接收，则为数组，如上面hobby和hobby2两种方式
```

#### 通过参数注解@RequestParam获取

```java
将请求参数和控制器方法的形参创建映射关系
    @RequestMapping("/testPramasType3")
    public String test9(
            @RequestParam Integer id,
            @RequestParam(
//                    value = "user_name",
                    required = false,
                    defaultValue = "李大爷"
            ) String username,
            @RequestParam String[] hobbies) {
        System.out.println("通过@RequestParam方式获取：" + id + "::" + username + "::" + Arrays.toString(hobbies));
        return "params";
    }

1. value 指定为形参赋值的请求参数的参数名 (对应到前端提交上来的字段名)
    
2. required 设置是否必须传输此请求参数，默认值为true
    若设置为true时，则当前请求必须传输value所指定的请求参数，若没有传输该请求参数，且没有设置defaultValue属性，则页面报错400：Required String parameter 'xxx' is not present；若设置为false，则当前请求不是必须传输value所指定的请求参数，若没有传输，则注解所标识的形参的值为null
    
3. defaultValue  不管required属性值为true或false，当value所指定的请求参数没有传输或传输的值为""时，则使用默认值为形参赋值  
```

#### @RequestHeader注解

```java
将请求头信息和控制器方法的形参创建映射关系
    有三个属性：value、required、defaultValue，用法同@RequestParam
```

#### @CookieValue注解

```java
将cookie数据和控制器方法的形参创建映射关系
    有三个属性：value、required、defaultValue，用法同@RequestParam
```

#### 通过POJO获取

```java
在形参位置绑定一个实体类型，传输的请求参数和实体类中属性名一致，则会自动绑定
    // User.java
    public class User {
        private Integer id;
        private String password;
        private String username;
        private String sex;
        private Integer age;
        private String email;

        public User() {
        }

        public User(Integer id, String password, String username, String sex, Integer age, String email) {
            this.id = id;
            this.password = password;
            this.username = username;
            this.sex = sex;
            this.age = age;
            this.email = email;
        }

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getSex() {
            return sex;
        }

        public void setSex(String sex) {
            this.sex = sex;
        }

        public Integer getAge() {
            return age;
        }

        public void setAge(Integer age) {
            this.age = age;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        @Override
        public String toString() {
            return "User{" +
                    "id=" + id +
                    ", password='" + password + '\'' +
                    ", username='" + username + '\'' +
                    ", sex='" + sex + '\'' +
                    ", age=" + age +
                    ", email='" + email + '\'' +
                    '}';
        }
    }

	// html
	<form th:action="@{/pipeline/testPramasType5}" method="post">
        用户名：<input type="text" name="username"><br>
        密码：<input type="password" name="password"><br>
        性别：<input type="radio" name="sex" value="男">男<input type="radio"
                                                            name="sex" value="女">女<br>
        年龄：<input type="text" name="age"><br>
        邮箱：<input type="text" name="email"><br>
        <input type="submit">
    </form>
        
    // controller
        @RequestMapping("/testPramasType5")
        public String test11(User user) {
            System.out.println(user);
            return "pojo";
        }

	// console
    User{id=null, password='123', username='地区公司-市场开发', sex='女', age=21, email='caristop0210@gmail.com'}
```

#### 解决GET方式参数中文乱码

```xml
设置Tomcat server.xml
<Connector port="8080" protocol="HTTP/1.1"
           URIEncoding="UTF-8" // 重点设置此项
           connectionTimeout="20000"
           redirectPort="8443" />
```

#### 解决Post方式参数中文乱码

```java
在JavaWeb中，
    1. 了解到三大组件，"监听器"、"过滤器"、"Servlet" 其中其执行顺序"监听器" 》 "过滤器" 》 "Servlet"
    2. 我们在servlet中通过request.setCharacterEncoding方法来设置乱码问题，且需要放在获取参数前面执行（才有效）
    3. 在SpringMVC中，我们也了解到它给我们作了DispatcherServlet收口，再匹配到控制器方法中，因此我们需要在此Servlet执行前进行设置Filter过滤器来设置(可以点进去看源码)
    
    // web.xml
    <!--配置springMVC的编码过滤器-->
    <filter>
        <filter-name>CharacterEncodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter
        </filter-class>
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
        <url-pattern>/*</url-pattern>
    </filter-mapping>
```

## 20221130 - 补充@RequestBody与@RequestParam区别

```shell
@RequestParam
	1. GET方式 问号传参 
	GET xxx?id=1&name=我是get问号传参方式
	# test(@RequestParam("id") String id, @RequestParam("name") String name) --- 带指定参数
	# test(@RequestParam String id, @RequestParam String name) --- 不带指定参数
	# test(@RequestParam Map<String, String> query) --- 用Map来接收参数 query:{id:1,name:"我是get问号传参方式"}
	
	2. POST方式 x-www-form-urlencoded表单提交 （GET方式同上编码成名称/值对追加到url?后面）
	POST xxx
	# test(@RequestParam("id") String id, @RequestParam("name") String name) --- 带指定参数
	# test(@RequestParam String id, @RequestParam String name) --- 不带指定参数
	# test(@RequestParam Map<String, String> query) --- 用Map来接收参数 query:{id:1,name:"我是get问号传参方式"}
	# test(@RequestParam("jsonXxx") String json) --- 传JSON.stringify格式过来 这边用JSON包解析 相当于多组参数整合传输
	
	3. POST方式 multipart/form-data表单提交（基本同POST的x-www-form-urlencoded，但多用于文件上传时使用）
	# test(@RequestParam("id") String id, @RequestParam("name") String name) --- 带指定参数
	# test(@RequestParam String id, @RequestParam String name) --- 不带指定参数
	# test(@RequestParam Map<String, String> query) --- 用Map来接收参数 query:{id:1,name:"我是get问号传参方式"}
	# test(@RequestParam("jsonXxx") String json) --- 传JSON.stringify格式过来 这边用JSON包解析 相当于多组参数整合传输
	
@RequestBody
	只支持【POST方式】且方式为【application/json】，但可与【问号传参】混合使用
	1. 以String接收
	# test(@RequestBody String jsonString)
	
	2. 以Map接收
	# test(@RequestBody Map<String, String> map)
	
	3. 以实体类接收
	# test(@RequestBody User user)
	
	4. 以Object超类接收
	# test(@RequestBody Object object)
	
	5. 混合使用
	# test(@RequestBody User user, @RequestParam String id)
```

