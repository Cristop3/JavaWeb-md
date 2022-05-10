## 2022.05.09

#### lib包

```java
1. Tomcat
    Edit Configurations -> 导入本地tomcat目录下的所有lib包进来 -> 这样再new 文件的时候就可以看见Servlet
```

![导入tomcat所有lib包配置tomcat.png](https://s2.loli.net/2022/05/09/BUGKdaNiRtVEJhH.png)

```java
2. Servlet
    servlet-api.jar


3. 单元测试
    junit-4.12.jar
    hamcrest-core-1.3.jar

4. xml解析
    dom4j-1.6.1.jar    

5. JSP
    jsp-api.jar // from tomcat


6. EL表达式
    el-api.jar // from tomcat


7. JSTL
    taglibs-standard-impl-1.2.1.jar
    taglibs-standard-spec-1.2.1.jar
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>


8. MySQL
    mysql-connector-java-8.0.16.jar


9. JDBC连接池
    // 主要使用来读取数据库配置文件使用连接池进行连接
    druid-1.1.9.jar // utils工具类使用


10. 将Map对象转换为Bean对象
    commons-beanutils-1.8.0.jar // utils工具类使用
    commons-logging-1.1.1.jar // 依赖

11. MySQL执行sql
    commons-dbutils-1.3.jar // dao层使用

12. 文件上传下载
    commons-fileupload-1.2.1.jar
    commons-io-1.4.jar //     IOUtils.copy()下载
    
13. 谷歌验证码库
    kaptcha-2.3.2.jar
```
