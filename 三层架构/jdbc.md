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

## 2022.05.02

#### JavaEE项目三层架构

![三层架构.png](https://s2.loli.net/2022/05/02/t96V47hGNTXeW1s.png)

```java
     分层								包名										含义
1. web层/视图展现层                 com.xxx.web(.servlet/.controller)  
         
2. service层						com.xxx.service                                Service接口包
         					     com.xxx.service.impl					      Service接口实现类
         
3. dao持久层					   com.xxx.dao                                    Dao接口包
         						 com.xxx.dao.impl                               Dao接口实现类
         
4. 实体bean对象					   com.xxx.pojo(.entity/.domain/.bean)            JavaBean类
         
5. 测试包（单测）                    com.xxx.test(.junit)                            测试类，单测
         
6. 工具类					        com.xxx.utils                                  jdbc驱动连接
```

```java
// 以注册业务为例 大致梳理下
1.  创建数据库表
    drop database if exists xxx;
	create database xxx;
	use xxx;
	create table t_xxx(
    	'id' int primary key auto_increment,
        'username' varchar(20) not null unique,
        'password' varchar(32) not null,
        'email' varchar(200)
    ) 

2. 编写数据库表对应的JavaBean对象 // 在pojo包下新建User类
     public class User{
         private Integer id;
         private String username;
         private String password;
         private String email;
         // 利用idea Generator自动生成getter/setter、toString、构造函数
         // ...
     }

3. 编写连接数据库jdbc工具类
    3.1 先导入需要的jar包（数据库和连接池）
    	druid-1.1.9.jar // 连接池
    	mysql-connector-java-8.0.16.jar // 数据库
    
    3.2 在源码src文件夹下新建jdbc.properties数据库属性配置文件
    	// 上面提到过
    
    3.3 在utils包下新建"JdbcUtils"工具类
    	// 读取jdbc.properties配置文件
    	// 创建数据库链接池
    
   	// 总的来说 jdbc这个工具类就是为了创建连接池跟mysql数据库进行连接和关闭连接
    
4. 编写"Dao"层    
    // 在上面那张图中 我们可以基本看到在Dao层其实就是作数据库的CURD
    4.1 先导入需要的jar包
    	commons-dbutils-1.3.jar // 对数据库操作的封装的jar包
    
    4.2 编写抽象类BaseDao // 目前我理解就是将可能会遇到的sql场景 利用DbUtils进行封装
    
    4.3 编写UserDao接口
    
    4.4 编写UserDao的实现UserDaoImpl // 继承至BaseDao实现UserDao
    
5. 编写"Service"层
    // 从上面那张图中 我们可以看到在service层 主要是处理实际业务逻辑、调用dao层保存数据
    5.1 编写UserService接口
    
    5.2 编写UserService接口实现类 UserServiceImpl
    
6. 编写"web"层
    // 从上面那张图中 看出web层就是接收客户端消息的第一层
    6.1 编写Servlet类 处理请求
```

#### Idea中Debug调试

```java
1. 如何调试
    // 断点 + Debug启动服务器
    
2. 调试栏依次从左往右
    2.1 让代码往下执行一行
    2.2 可以进入当前方法体内（自己写的代码，非框架源码）
    2.3 强制进入当前方法体内
    2.4 跳出当前方法体外 
    2.5 
    2.6 停在光标所在行（相当于临时断点）
    
3. 变量窗口
    可以查看当前方法范围内所有有效的变量
    
4. 方法调用栈窗口
    方法调用栈可以查看当前线程有哪些方法调用信息；
    下面的调用上一行的方法。
```

