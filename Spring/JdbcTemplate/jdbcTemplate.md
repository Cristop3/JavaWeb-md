## 2022.05.24

#### Spring中的JdbcTemplate

```java
JDBC 是 Java 提供的一种用于执行 SQL 语句的 API，可以对多种关系型数据库（例如 MySQL、Oracle 等）进行访问。

Spring 提供了一个 Spring JDBC 模块，它对 JDBC API 进行了封装，其的主要目的降低 JDBC API 的使用难度，以一种更直接、更简洁的方式使用 JDBC API。使用 Spring JDBC，开发人员只需要定义必要的参数、指定需要执行的 SQL 语句，即可轻松的进行 JDBC 编程，对数据库进行访问。
    
1. 依赖包
    spring-jdbc-xxx.jar // Spring JDBC 的核心依赖包
    spring-tx-xxx.jar // 用来处理事务和异常的依赖包
    mysql-connector-java-8.0.16.jar // MySQL 提供的 JDBC 驱动包
    
2. jdbc配置文件
    // jdbc.properties
    prop.driverClassName=com.mysql.cj.jdbc.Driver
    prop.url=jdbc:mysql://localhost:3306/xxx?characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8
    prop.userName=root
    prop.password=*******
        
 3. 引入context名称空间方便使用表达式 来绑定jdbc属性
    <beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                           http://www.springframework.org/schema/context http://www.springframework.org/schema/beans/spring-context.xsd">
	<context:property-placeholder location="classpath:jdbc.properties"/>
	
 4. 使用spring 自带jdbc库定义数据库相关
     <bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource" destroy-method="close">
        <!--        驱动名称-->
        <property name="driverClassName" value="${prop.driverClassName}"/>
        <!--        数据库位置url-->
        <property name="url" value="${prop.url}"/>
        <!--        用户名-->
        <property name="username" value="${prop.userName}"/>
        <!--        密码-->
        <property name="password" value="${prop.password}"/>
    </bean>   
  
  5. 引入jdbcTemplate 相关Bean类 并向其注入mysql配置相关
     <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
        <property name="dataSource" ref="dataSource"/>
    </bean>
         
  6. beans.xml中开启IOC包扫描
         <context:component-scan base-package="com.company.jdbc" />

  7. 创建数据库及表
      create database company;
	  CREATE TABLE
        IF
            NOT EXISTS `t_user` (
                `id` INT UNSIGNED AUTO_INCREMENT,
                `username` VARCHAR ( 50 ) NOT NULL,
                `age` VARCHAR ( 10 ) NOT NULL,
                `email` VARCHAR ( 100 ) NOT NULL,
            PRIMARY KEY ( `id` ) 
            ) ENGINE = INNODB DEFAULT CHARSET = utf8;

  8. 创建对应表实体类
      // entity/User.java
      public class User {
        private int id;
        private String username;
        private int age;
        private String email;
        public User() {
        }
        public User(int id, String username, int age, String email) {
            this.id = id;
            this.username = username;
            this.age = age;
            this.email = email;
        }
        public int getId() {
            return id;
        }
        public void setId(int id) {
            this.id = id;
        }
        public String getUsername() {
            return username;
        }
        public void setUsername(String username) {
            this.username = username;
        }
        public int getAge() {
            return age;
        }
        public void setAge(int age) {
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
                    ", username='" + username + '\'' +
                    ", age=" + age +
                    ", email='" + email + '\'' +
                    '}';
        }
       }

   8. 创建UserDao接口
      // dao/UserDao.java
      public interface UserDao {
        // 新增用户
        int addUser(User user);
        // 编辑用户
        int editUser(User user);
        // 删除用户
        int deleteUser(String id);
        // 获取用户数量
        int countUser();
        // 批量新增用户
        int[] addMuchUser(List<Object[]> muchUser);
        // 批量编辑用户
        int[] editMuchUser(List<Object[]> muchUser);
        // 批量删除用户
        int[] deleteMuchUser(List<Object[]> muchUser);
        // 获取所有用户列表
        List<User> findAllUser();
      }

   9. 实现UserDao
       // dao/impl/UserDaoImpl
       9.1 使用注解@Repository 自动装配类
       9.2 使用注解@Resource 自动装配属性
       @Repository
        public class UserDaoImpl implements UserDao {
            @Resource
            private JdbcTemplate jdbcTemplate;
            @Override
            public int addUser(User user) {
                String sql = "insert into t_user(username,age,email) values(?,?,?)";
                // 参数1： sql
                // 参数2： 可变的Object 数组格式
                Object[] args = {user.getUsername(), user.getAge(), user.getEmail()};
                // 返回数据库受影响的行数 int
                return jdbcTemplate.update(sql, args);
            }
            @Override
            public int editUser(User user) {
                String sql = "update t_user set username=?,age=?,email=? where id=?";
                // 参数1： sql
                // 参数2： 可变的Object 数组格式
                Object[] args = {user.getUsername(), user.getAge(), user.getEmail(), user.getId()};
                // 返回数据库受影响的行数 int
                return jdbcTemplate.update(sql, args);
            }
            @Override
            public int deleteUser(String id) {
                String sql = "delete from t_user where id = ?";
                return jdbcTemplate.update(sql, id);
            }
            @Override
            public int countUser() {
                String sql = "select count(1) from t_user";
                // 注意此处使用queryForObject()方法 返回某个值
                // 参数1：sql
                // 参数2：返回类型的class
                Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
                return count;
            }
            @Override
            public int[] addMuchUser(List<Object[]> muchUser) {
                String sql = "insert into t_user(username,age,email) values(?,?,?)";
                // 注意此处需要用到batchUpdate()方法 来执行批量操作
                // 参数1：sql
                // 参数2：List集合中包了个数组对象 对应多组数据对应的sql操作
                return jdbcTemplate.batchUpdate(sql, muchUser);
            }
            @Override
            public int[] editMuchUser(List<Object[]> muchUser) {
                String sql = "update t_user set username=?, age=?, email=? where id=?";
                // 注意此处需要用到batchUpdate()方法 来执行批量操作
                // 参数1：sql
                // 参数2：List集合中包了个数组对象 对应多组数据对应的sql操作
                return jdbcTemplate.batchUpdate(sql, muchUser);
            }
            @Override
            public int[] deleteMuchUser(List<Object[]> muchUser) {
                String sql = "delete from t_user where id=?";
                // 注意此处需要用到batchUpdate()方法 来执行批量操作
                // 参数1：sql
                // 参数2：List集合中包了个数组对象 对应多组数据对应的sql操作
                return jdbcTemplate.batchUpdate(sql, muchUser);
            }
            @Override
            public List<User> findAllUser() {
                String sql = "select id,username,age,email from t_user";
                // 注意此处需要用到query()方法 来执行批量操作
                // 参数1：sql
                // 参数2：RowMapper 是接口，针对返回不同类型数据，使用这个接口里面实现类完成数据封装
                // 参数3：sql语句所需值
        //        return jdbcTemplate.queryForList(sql, User.class);
                return jdbcTemplate.query(sql, new BeanPropertyRowMapper<User>(User.class));
            }
        }

	10. 创建UserService接口
        // service/UserService.java
        public interface UserService {
            // 新增用户
            int addUserService(User user);
            // 编辑用户
            int editUserService(User user);
            // 删除用户
            int deleteUserService(String id);
            // 获取用户数量
            int countUserService();
            // 批量新增用户
            int[] addMuchUserService(List<Object[]> muchUser);
            // 批量编辑用户
            int[] editMuchUserService(List<Object[]> muchUser);
            // 批量删除用户
            int[] deleteMuchUserService(List<Object[]> muchUser);
            // 获取所有用户列表
            List<User> findAllUserService();
        }
     
	11. 实现UserService
        // service/impl/UserServiceImpl
        11.1 使用注解@Service 开启自动装配类
        11.2 使用注解@Autowired 开启自动装配属性
        @Service
        public class UserServiceImpl implements UserService {
            @Autowired
            private UserDao userDao;
            @Override
            public int addUserService(User user) {
                return userDao.addUser(user);
            }
            @Override
            public int editUserService(User user) {
                return userDao.editUser(user);
            }
            @Override
            public int deleteUserService(String id) {
                return userDao.deleteUser(id);
            }
            @Override
            public int countUserService() {
                return userDao.countUser();
            }
            @Override
            public int[] addMuchUserService(List<Object[]> muchUser) {
                return userDao.addMuchUser(muchUser);
            }
            @Override
            public int[] editMuchUserService(List<Object[]> muchUser) {
                return userDao.editMuchUser(muchUser);
            }
            @Override
            public int[] deleteMuchUserService(List<Object[]> muchUser) {
                return userDao.deleteMuchUser(muchUser);
            }
            @Override
            public List<User> findAllUserService() {
                return userDao.findAllUser();
            }
        }

	12. 创建Controller类
        // controller/UserController.java
        // 这里只是模仿三层架构调用模式 不规范的地方请谅解
        12.1 使用注解@Controller 开启自动装配类
        12.2 使用@Autowired 开启自动装配属性
        @Controller("userController")
        public class UserController {
            @Autowired
            private UserService userService;
            public void addUserController(User user) {
                int i = userService.addUserService(user);
                System.out.println("添加了一个用户： " + user);
            }
            public void editUserController(User user) {
                int i = userService.editUserService(user);
                System.out.println("修改了一个用户：" + user);
            }
            public void deleteUserController(String id) {
                int i = userService.deleteUserService(id);
                System.out.println("删除了id为 " + id + " 的用户");
            }
            public void countUserController() {
                int i = userService.countUserService();
                System.out.println("当前用户总人数：" + i);
            }
            public void addMuchUserController(List<Object[]> muchUser) {
                int[] ints = userService.addMuchUserService(muchUser);
                System.out.println("批量添加了 " + muchUser + " 的用户");
            }
            public void editMuchUserController(List<Object[]> muchUser) {
                int[] ints = userService.editMuchUserService(muchUser);
                System.out.println("批量修改了 " + muchUser + " 的用户");
            }
            public void deleteMuchUserController(List<Object[]> muchUser) {
                int[] ints = userService.deleteMuchUserService(muchUser);
                System.out.println("批量删除了 " + muchUser + " 的用户");
            }
            public void findAllUserController() {
                List<User> allUserService = userService.findAllUserService();
                System.out.println("当前的所有用户： " + allUserService);
            }
        }

	13. 创建测试类
        // test/TestJdbc.java
        public class TestJdbc {
            @Test
            public void test() {
                ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
                UserController userController = context.getBean("userController", UserController.class);

                // 添加用户
                User user1 = new User();
                user1.setUsername("lidaye-newname");
                user1.setAge(33);
                user1.setEmail("lidaye-newname@qq.com");
                userController.addUserController(user1);

                // 修改用户
                User user2 = new User();
                user2.setId(1);
                user2.setUsername("lidaye edit by other name");
                user2.setAge(66);
                user2.setEmail("editName@qq.com");
                userController.editUserController(user2);

                // 删除用户
                userController.deleteUserController("10");

                //返回当前用户数量
                userController.countUserController();

                // 批量新增用户
                Object[] arg1 = {"lierye1", 21, "lierye1@qq.com"};
                Object[] arg2 = {"lierye2", 22, "lierye2@qq.com"};
                Object[] arg3 = {"lierye3", 23, "lierye3@qq.com"};
                List<Object[]> listsAdd = new ArrayList<>();
                listsAdd.add(arg1);
                listsAdd.add(arg2);
                listsAdd.add(arg3);
                userController.addMuchUserController(listsAdd);

                //批量修改用户
                Object[] arg4 = {"lierye1-byEdit11", 121, "lierye1@qq.com-byEdit", 4};
                Object[] arg5 = {"lierye2-byEdit11", 122, "lierye2@qq.com-byEdit", 5};
                Object[] arg6 = {"lierye3-byEdit11", 123, "lierye3@qq.com-byEdit", 6};
                List<Object[]> listsEdit = new ArrayList<>();
                listsEdit.add(arg4);
                listsEdit.add(arg5);
                listsEdit.add(arg6);
                userController.editMuchUserController(listsEdit);

                // 批量删除
                Object[] arg7 = {7};
                Object[] arg8 = {8};
                List<Object[]> listsDelete = new ArrayList<>();
                listsDelete.add(arg7);
                listsDelete.add(arg8);
                userController.deleteMuchUserController(listsDelete);

                // 查询当前所有用户
                userController.findAllUserController();
            }
        }

	14. console
         添加了一个用户： User{id=0, username='lidaye-newname', age=33, email='lidaye-newname@qq.com'}

		修改了一个用户：User{id=1, username='lidaye edit by other name', age=66, email='editName@qq.com'}

		删除了id为 10 的用户
    
		当前用户总人数：9
    
		批量添加了 [[Ljava.lang.Object;@47caedad, [Ljava.lang.Object;@7139992f, [Ljava.lang.Object;@69504ae9] 的用户
                                      
		批量修改了 [[Ljava.lang.Object;@1500b2f3, [Ljava.lang.Object;@7eecb5b8, [Ljava.lang.Object;@126253fd] 的用户
                                      
		批量删除了 [[Ljava.lang.Object;@5c86a017, [Ljava.lang.Object;@5c7bfdc1] 的用户
        
		当前的所有用户： [User{id=1, username='lidaye edit by other name', age=66, email='editName@qq.com'}, User{id=3, username='lidaye edit by other name', age=66, email='editName@qq.com'}, User{id=4, username='lierye1-byEdit11', age=121, email='lierye1@qq.com-byEdit'}, User{id=5, username='lierye2-byEdit11', age=122, email='lierye2@qq.com-byEdit'}, User{id=6, username='lierye3-byEdit11', age=123, email='lierye3@qq.com-byEdit'}, User{id=9, username='lierye2', age=22, email='lierye2@qq.com'}, User{id=11, username='lidaye-newname', age=33, email='lidaye-newname@qq.com'}, User{id=12, username='lierye1', age=21, email='lierye1@qq.com'}, User{id=13, username='lierye2', age=22, email='lierye2@qq.com'}, User{id=14, username='lierye3', age=23, email='lierye3@qq.com'}]
                
    15. 关于junit控制台打印乱码
        15.1 先检查当前test文件的file-encoding是否为utf-8
        15.2 Run/Debug Configurations里面
             设置Environment variables: -Dfile.encoding=utf-8   
```

![jdbcTemplate.png](https://s2.loli.net/2022/05/24/OetRHYDmAqpjCk7.png)

#### Spring中的事务操作

```java
1. 什么是事务
    事务（Transaction）是基于关系型数据库（RDBMS）的企业应用的重要组成部分。

    事务具有 4 个特性：原子性、一致性、隔离性和持久性，简称为 ACID 特性。
    原子性（Atomicity）：一个事务是一个不可分割的工作单位，事务中包括的动作要么都做要么都不做。
    一致性（Consistency）：事务必须保证数据库从一个一致性状态变到另一个一致性状态，一致性和原子性是密切相关的。
    隔离性（Isolation）：一个事务的执行不能被其它事务干扰，即一个事务内部的操作及使用的数据对并发的其它事务是隔离的，并发执行的各个事务之间不能互相打扰。
    持久性（Durability）：持久性也称为永久性，指一个事务一旦提交，它对数据库中数据的改变就是永久性的，后面的其它操作和故障都不应该对其有任何影响。

2. Spring中的事务    
    Spring 并不会直接管理事务，而是通过事务管理器对事务进行管理的。（在 Spring 中提供了一个 org.springframework.transaction.PlatformTransactionManager 接口，这个接口被称为 Spring 的事务管理器）    

3. Spring中操作事务方式    
Spring中有2种方式操作事务：
    1. 编程式事务管理
    2. 声明式事务管理 （常用）
    	2.1 基于xml方式声明事务
    	2.2 基于注解方式声明事务
    
4. @Transactional参数分析    // 基于注解
    4.1 propagation // 事务传播行为
    	多"事务方法"（指的是能让数据库表数据发生改变的方法，例如新增数据、删除数据、修改数据的方法。）直接进行调用，这个过程中事务，是如何进行管理的。而Spring定义了7种传播行为：
    PROPAGATION_MANDATORY	支持当前事务，如果不存在当前事务，则引发异常。
    PROPAGATION_NESTED	如果当前事务存在，则在嵌套事务中执行。
    PROPAGATION_NEVER	不支持当前事务，如果当前事务存在，则引发异常。
    PROPAGATION_NOT_SUPPORTED	不支持当前事务，始终以非事务方式执行。
    PROPAGATION_REQUIRED	默认传播行为，如果存在当前事务，则当前方法就在当前事务中运行，如果不存在，则创建一个新的事务，并在这个新建的事务中运行。 // 默认
    PROPAGATION_REQUIRES_NEW	创建新事务，如果已经存在事务则暂停当前事务。
    PROPAGATION_SUPPORTS	支持当前事务，如果不存在事务，则以非事务方式执行。
    @Transactional(propagation=Propagation.REQUIRED)	
    
    4.2 ioslation // 事务隔离级别
    	事务有特性成为隔离性，多事务操作之间不会产生影响，不考虑隔离性产生很多问题
    	4.2.1 脏读
    			一个未提交事务读取到另一个未提交事务的数据
		4.2.2 不可重复读
    			一个未提交事务读取到另一个提交事务"修改的数据"
    	4.2.3 幻读
    			一个未提交事务读取到另一个提交事务"添加的数据"
    	
        ISOLATION_DEFAULT	使用后端数据库默认的隔离级别
    	// 脏读（存在） 不可重复读（存在） 幻读（存在）
        ISOLATION_READ_UNCOMMITTED	允许读取尚未提交的更改，可能导致脏读、幻读和不可重复读 
    	// 脏读（不存在） 不可重复读（存在） 幻读（存在）
        ISOLATION_READ_COMMITTED	Oracle 默认级别，允许读取已提交的并发事务，防止脏读，可能出现幻读和不可重复读  
    	//  脏读（不存在） 不可重复读（不存在） 幻读（存在）
        ISOLATION_REPEATABLE_READ	MySQL 默认级别，多次读取相同字段的结果是一致的，防止脏读和不可重复读，可能出现幻读 
    	//  脏读（不存在） 不可重复读（不存在） 幻读（不存在）
        ISOLATION_SERIALIZABLE	完全服从 ACID 的隔离级别，防止脏读、不可重复读和幻读
     @Transactional(isoLation=IsoLation.REPEATABLE_READ)
    
    4.3 timeout // 超时时间
    	事务需要在一定时间内进行提交，如果不提交则进行回滚
    	默认值是-1 表示永不超时 单位是秒
    
    4.4 readOnly // 是否只读
    	读：查询操作， 写：insert\update\delete
    	readOnly 默认值 false，表示可以查询，可以添加修改删除操作
        设置 readOnly 值是 true，设置成 true 之后，只能查询
    
    4.5 rollbackFor // 回滚
    	可以设置哪些异常即执行事务回滚
    
    4.6 noRollbackFor // 不回滚
    	可以设置出现哪些异常不进行事务回滚
```

#### 基于注解方式声明事务(不完整注解方法 注解类或者具体方法)

```java
接着上面的jdbcTemplate操作
1. 修改下表结构 增加"money"字段
    
2. 则对应的user实体类也需要增加money属性及getter\setter\toString\constructor

3. 为了简单快速的测试 在dao层加入两个方法 一个作增加 一个作减少    
    // UserDao.java
    // 增加账户金额
    int addUserMoney(User user, BigDecimal money);
    // 减少账户金额
    int reduceUserMoney(User user, BigDecimal money);
	
	// UserDaoImpl.java
	@Override
    public int addUserMoney(User user, BigDecimal money) {
        String sql = "update t_user set money=money+? where id=?";
        Object[] args = {money, user.getId()};
        return jdbcTemplate.update(sql, args);
    }
    @Override
    public int reduceUserMoney(User user, BigDecimal money) {
        String sql = "update t_user set money=money-? where id=?";
        Object[] args = {money, user.getId()};
        return jdbcTemplate.update(sql, args);
    }
   
4. 只在service层 测试 并加上@Transactional注解
    // UserServiceImpl.java
    @Override
    @Transactional(readOnly = false, timeout = -1, propagation = Propagation.REQUIRED, isolation = Isolation.REPEATABLE_READ)
    public int[] testTransaction() {
        User A = new User();
        A.setId(1);
        User B = new User();
        B.setId(2);
        userDao.addUserMoney(A, BigDecimal.valueOf(500));
        int x = 100 / 0; // 异常
        userDao.reduceUserMoney(B, BigDecimal.valueOf(500));
        return new int[0];
    }

5. xml文件中添加aop\tx名称空间
    // 由于事务是基于aop的 因此需要引入aop名称空间
    // 上个例子已经引入tx依赖包了
    <beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                           http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd
                           http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd
                           http://www.springframework.org/schema/tx http://www.springframework.org/schema/tx/spring-tx.xsd">

6. 开启事务管理器 由于使用jdbcTemplate则使用DataSourceTransactionManager
    <!--    6. 开启事务管理器-->
    <bean id="transactionManage" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <!--        6.1. 注入mysql数据源-->
        <property name="dataSource" ref="dataSource"/>
    </bean>
        
 7. 配置tx开启事务注解
    <tx:annotation-driven transaction-manager="transactionManage"/>
        
 8. Test
    @Test
    public void testTransaction(){
        ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
        UserService userService = context.getBean("userService", UserService.class);
        userService.testTransaction();
    }
```

#### 基于xml配置文件声明事务

```xml
<!--    9. 基于xml配置方式 开启事务-->
<!--    9.1 配置通知-->
<tx:advice id="txAdvice">
    <!--        9.2 配置事务参数-->
    <tx:attributes>
        <!--            9.3 指定在哪种规则的方法上添加事务-->
        <tx:method name="testTransaction" propagation="REQUIRED"/>
    </tx:attributes>
</tx:advice>
<!--    9.4 配置切入点和切面-->
<aop:config>
    <!--        9.5 配置切入点-->
    <aop:pointcut id="aopP" expression="execution(* com.company.jdbc.service.UserService.testTransaction(..))"/>
    <!--        9.6 配置切面-->
    <aop:advisor advice-ref="txAdvice" pointcut-ref="aopP"/>
</aop:config>
```

#### 全面开启注解方式

```java
由于在前面的例子中 有些配置写在xml中 有些又是使用注解 导致很混乱 因此下面使用配置类开启全面注解方式
	
    // SpringConfig
    @Configuration // 作为配置类，替代 xml 配置文件
    @ComponentScan(basePackages = {"com.company.jdbc"}) // 扫描包位置 IOC
    @EnableTransactionManagement // 开启事务
    public class SpringConfig {
        // 注入数据库的配置 使用durid依赖包
        @Bean
        public DruidDataSource getDruidDataSourceConfig() {
            DruidDataSource dataSource = new DruidDataSource();
            dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
            dataSource.setUrl("jdbc:mysql://localhost:3306/company?characterEncoding=utf8&useSSL=false&serverTimezone=GMT%2B8");
            dataSource.setUsername("root");
            dataSource.setPassword("xxx");
            return dataSource; // 返回配置对象
        }

        // 注入JdbcTemplate
        @Bean
        public JdbcTemplate getJdbcTemplateConfig(DruidDataSource dataSource) { // 依赖上面的配置对象 因此参数就是该配置对象 会到IOC容器中找该对象
            JdbcTemplate jdbcTemplate = new JdbcTemplate();
            jdbcTemplate.setDataSource(dataSource);
            return jdbcTemplate; // 返回jdbcTemplate配置对象
        }

        // 注入事务管理器
        @Bean
        public DataSourceTransactionManager getDataSourceTransactionManager(DruidDataSource dataSource) {
            DataSourceTransactionManager dataSourceTransactionManager = new DataSourceTransactionManager();
            // 依赖上面的配置对象 因此参数就是该配置对象 会到IOC容器中找该对象 dataSource
            dataSourceTransactionManager.setDataSource(dataSource);
            return dataSourceTransactionManager;
        }
    }
	
	// Service
	@Override
    @Transactional(readOnly = false, timeout = -1, propagation = Propagation.REQUIRED, isolation = Isolation.REPEATABLE_READ)
    public int[] testTransaction() {
        User A = new User();
        A.setId(1);
        User B = new User();
        B.setId(2);
        userDao.addUserMoney(A, BigDecimal.valueOf(500));
        int x = 100 / 0;
        userDao.reduceUserMoney(B, BigDecimal.valueOf(500));
        return new int[0];
    }
	
	// Test
	@Test
    public void testTransaction(){
        ApplicationContext context = new AnnotationConfigApplicationContext(SpringConfig.class);
        UserService testUser = context.getBean("testUser", UserService.class);
        testUser.testTransaction();
    }
```

#### 结合其他理解

```java
1. 关于数据库连接池
    在上面的例子中，我们使用的Spring提供的jdbc库，在之前的JavaWeb学习中，我们使用的是druid-1.1.9.jar包来作的连接池
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" destroy-method="close">
        <!--        驱动名称-->
        <property name="driverClassName" value="${prop.driverClassName}"/>
        <!--        数据库位置url-->
        <property name="url" value="${prop.url}"/>
        <!--        用户名-->
        <property name="username" value="${prop.userName}"/>
        <!--        密码-->
        <property name="password" value="${prop.password}"/>
    </bean> 
        
2. 关于jdbc使用
     在上面中，我们直接使用的Spring的JdbcTemplate库，来操作，没有管数据库连接，关闭，异常等，非常方便。在JavaWeb的学习中，我们使用commons.dbutils-1.3.jar包来进行数据库的增删改查，同时针对数据库和实体类的注入绑定使用的是commons.beanutils-1.8.0.jar包来进行映射
     // jdbc sql    
     new QueryRunner().update(connection, sql, args)   
     new QueryRunner().query(connection, sql, new BeanHandler<T>(type), args)
     // beanutils
     BeanUtils.populate(bean, value);   

	// JdbcTemplate
	jdbcTemplate.query(sql, new BeanPropertyRowMapper<User>(User.class))
    利用BeanPropertyRowMapper就可以完成数据集与bean的注入
        
3. 关于事务
     在上面例子中，我们使用了注解方式和xml方式很方便的在Spring中开启事务管理，回想之前在JavaWeb的学习中，我们在代码里面写死了事务的判断，如下：
        try{
            // 1. 开启事务 不自动提交
            
            // 2. dao逻辑1
            
            // 3. 模拟异常
            
            // 4. dao逻辑2
            
            // 5. 提交事务
        }catch{
            // 6. 回滚事务
        }
		后面 配合ThreadLocal和Filter组件 来控制事务提交和回滚
```

