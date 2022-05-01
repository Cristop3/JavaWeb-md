## 2022.05.01

#### 关于JavaBean

https://www.delftstack.com/zh/howto/java/java-bean/

#### 关于数据库连接池

https://www.cnblogs.com/wenxuehai/p/15058811.html

#### 关于读取配置文件

https://juejin.cn/post/6844904193489109006

#### 关于java2mysql数据库驱动jdbc

```java
因为我用的是Mysql 8.x，因此驱动包版本变化了（ mysql-connector-java-8.0.16.jar）    
```

#### 关于数据库配置文件

```properties
# 老版本：
username=root
password=root
url=jdbc:mysql://localhost:3306/book
driverClassName=com.mysql.jdbc.Driver
initialSize=5
maxActive=10

# 可能报错信息
# 1. Loading class `com.mysql.jdbc.Driver'. This is deprecated. The new driver class is `com.mysql.cj.jdbc.Driver'. 
# 2. 时区异常
# 3. init datasource error, url: jdbc:mysql:/

# 新版本：
username=root
password=123456
url=jdbc:mysql://localhost:3306/book?characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8
# driverClassName=com.mysql.jdbc.Driver
driverClassName=com.mysql.cj.jdbc.Driver
initialSize=5
maxActive=10

# 参考链接https://blog.csdn.net/qq_26545503/article/details/104879286
```

