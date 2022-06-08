## 2022.06.08

#### Mybatis特性

```java
1. MyBatis 是支持定制化 SQL、存储过程以及高级映射的优秀的持久层框架
    
2. MyBatis 避免了几乎所有的 JDBC 代码和手动设置参数以及获取结果集
    
3. MyBatis可以使用简单的XML或注解用于配置和原始映射，将接口和Java的POJO（Plain Old Java
Objects，普通的Java对象）映射成数据库中的记录
    
4. MyBatis 是一个 半自动的ORM（Object Relation Mapping）框架
```

#### Mybatis与其他持久层技术对比

```java
1. JDBC
    SQL 夹杂在Java代码中耦合度高，导致硬编码内伤
    维护不易且实际开发需求中 SQL 有变化，频繁修改的情况多见
    代码冗长，开发效率低
    
2. Hibernate 和 JPA
    操作简便，开发效率高
    程序中的长难复杂 SQL 需要绕过框架
    内部自动生产的 SQL，不容易做特殊优化
    基于全映射的全自动框架，大量字段的 POJO 进行部分映射时比较困难。
    反射操作太多，导致数据库性能下降
    
3. MyBatis
    轻量级，性能出色
    SQL 和 Java 编码分开，功能边界清晰。Java代码专注业务、SQL语句专注数据
    开发效率稍逊于HIbernate，但是完全能够接受
```

#### 搭建Mybatis开发环境

```java
1. 新建maven模块工程

2. 引入依赖
    // pom.xml
    <!--    打包方式为Jar包-->
    <packaging>jar</packaging>
    <dependencies>
        <!-- Mybatis核心 -->
        <dependency>
            <groupId>org.mybatis</groupId>
            <artifactId>mybatis</artifactId>
            <version>3.5.7</version>
        </dependency>
        <!-- junit测试 -->
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>
        <!-- MySQL驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.29</version>
        </dependency>
        <!-- log4j日志 -->
        <dependency>
            <groupId>log4j</groupId>
            <artifactId>log4j</artifactId>
            <version>1.2.17</version>
        </dependency>
    </dependencies>
    
3. 创建Mybatis配置文件
    // resources\mybatis-config.xml
    <?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE configuration
            PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
            "http://mybatis.org/dtd/mybatis-3-config.dtd">
    <configuration>
        <environments default="development">
            <environment id="development">
                <transactionManager type="JDBC"/>
                <dataSource type="POOLED">
                    <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                    <property name="url" value="jdbc:mysql://localhost:3306/mybatis"/>
                    <property name="username" value="root"/>
                    <property name="password" value="xxx"/>
                </dataSource>
            </environment>
        </environments>
        <mappers>
            <mapper resource="mappers/UserMapper.xml"/>
        </mappers>
    </configuration>
 
4. 创建数据库表
    DROP TABLE IF EXISTS `t_user`;
    CREATE TABLE `t_user`  (
      `id` int NOT NULL AUTO_INCREMENT,
      `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
      `age` int NULL DEFAULT NULL,
      `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
      `sex` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
      `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
      PRIMARY KEY (`id`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

5. 创建实体类
    // com.company.mybatis.bean.User
    public class User {
        private Integer id;
        private String username;
        private String password;
        private Integer age;
        private String sex;
        private String email;
        public User() {
        }
        public User(Integer id, String username, String password, Integer age, String sex, String email) {
            this.id = id;
            this.username = username;
            this.password = password;
            this.age = age;
            this.sex = sex;
            this.email = email;
        }
        public Integer getId() {
            return id;
        }
        public void setId(Integer id) {
            this.id = id;
        }
        public String getUsername() {
            return username;
        }
        public void setUsername(String username) {
            this.username = username;
        }
        public String getPassword() {
            return password;
        }
        public void setPassword(String password) {
            this.password = password;
        }
        public Integer getAge() {
            return age;
        }
        public void setAge(Integer age) {
            this.age = age;
        }
        public String getSex() {
            return sex;
        }
        public void setSex(String sex) {
            this.sex = sex;
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
                ", password='" + password + '\'' +
                ", age=" + age +
                ", sex='" + sex + '\'' +
                ", email='" + email + '\'' +
                '}';
        }
    }

6. 创建mapper接口（类似于以前的dao层接口）
	// com.company.mybatis.mappers.UserMapper
    public interface UserMapper {
        // 插入数据
        int insertUser();
        // 更新数据
        int updateUser();
        // 删除数据
        int deleteUser();
        // 查询所有数据
        List<User> queryAllUser();
        // 查询单个用户
        User queryUser();
    }

7. 创建mapper映射文件(类名+Mapper.xml，常规情况下避免了再写dao层实现类，直接走sql)
    // resources\mappers\UserMapper.xml
    <?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE mapper
            PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
            "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
    // 注意这里的namespace 它是指定到我们的mapper接口
    <mapper namespace="com.company.mybatis.mappers.UserMapper">
    	// 这里的id 必须唯一 指定到我们接口定义的方法 由namespace+id就能定位到具体的接口方法，即倒过来就会定位到具体的sql实现
        <!--    insertUser 插入数据-->
        <insert id="insertUser">
            insert into t_user
            values (null, "李大爷3", 40, "123456", "男", "1234@qq.com");
        </insert>
        <!--    updateUser 更新数据-->
        <update id="updateUser">
            update t_user
            set username="李大爷被修改",
                age=30
            where id = 1
        </update>
        <!--    deleteUser 删除数据-->
        <delete id="deleteUser">
            delete
            from t_user
            where id = 2;
        </delete>
        <!--    queryAllUser 查询所有-->
        <select id="queryAllUser" resultType="com.company.mybatis.bean.User">
            select *
            from t_user
        </select>
        <!--    queryUser 查询单个用户-->
        <select id="queryUser" resultType="com.company.mybatis.bean.User">
            select *
            from t_user
            where id = 1
        </select>
    </mapper>
            
8. 创建测试类
   // src.test.java.com.company.mybatis.test.TestMybatis
   public class TestMyBatis {
       @Test
       public void testCURD() throws IOException {
           InputStream is = Resources.getResourceAsStream("mybatis-config.xml"); //加载核心配置文件
           SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(is); //获取SqlSessionFactoryBuilder并获取sqlSessionFactory
           SqlSession sqlSession = sqlSessionFactory.openSession(true); //获取SqlSession 并设置为自动提交事务
           UserMapper mapper = sqlSession.getMapper(UserMapper.class); //获取mapper接口对象

           //        mapper.insertUser(); // 新增用户
           //        mapper.updateUser(); // 更新用户
           //        mapper.deleteUser(); // 删除用户
           // 查询所有用户
           //        List<User> userList = mapper.queryAllUser();
           //        userList.forEach(user -> System.out.println(user));
           // 写死查询id为1的用户
           User user = mapper.queryUser();
           System.out.println(user);
       }
   } 

9. 加入log4j.xml配置
    // resources.log4j.xml
    <?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE log4j:configuration SYSTEM "http://logging.apache.org/log4j/1.2/apidocs/org/apache/log4j/xml/doc-files/log4j.dtd">
    <log4j:configuration>
        <appender name="STDOUT" class="org.apache.log4j.ConsoleAppender">
            <param name="Encoding" value="UTF-8" />
            <layout class="org.apache.log4j.PatternLayout">
                <param name="ConversionPattern" value="%-5p %d{MM-dd HH:mm:ss,SSS}
    %m (%F:%L) \n" />
            </layout>
        </appender>
        <logger name="java.sql">
            <level value="debug" />
        </logger>
        <logger name="org.apache.ibatis">
            <level value="info" />
        </logger>
        <root>
            <level value="debug" />
            <appender-ref ref="STDOUT" />
        </root>
    </log4j:configuration>
```

#### Mybatis映射文件

```java
1. ORM（Object Relationship Mapping）对象关系映射。
对象：Java的实体类对象
关系：关系型数据库
映射：二者之间的对应关系

2. java与数据库对应关系
Java概念 					数据库概念
类 						 表
属性 						字段/列
对象 						记录/行
    
3. 规则
3.1 映射文件的命名规则：
	表所对应的实体类的类名+Mapper.xml
	例如：表t_user，映射的实体类为User，所对应的映射文件为UserMapper.xml
	因此一个映射文件对应一个实体类，对应一张表的操作
    
3.2 MyBatis映射文件用于编写SQL，访问以及操作表中的数据
	MyBatis映射文件存放的位置是src/main/resources/mappers目录下
    
3.3 MyBatis中可以面向接口操作数据，要保证两个一致：
	a>mapper接口的全类名和映射文件的命名空间（namespace）保持一致
	b>mapper接口中方法的方法名和映射文件中编写SQL的标签的id属性保持一致
```

#### Mybatis中select查询时注意事项

```java
1.在使用<select>标签时，必须设置属性"resultType"或者"resultMap"，主要用途是设置实体类和数据库表的映射关系
    1.1 resultType："自动映射"（用于属性名和表中字段名一致的情况）
    	其中无需定义，可直接使用
    	基本类型: resultType="基本类型"
    	如：查询所有用户 resultType="java.lang.Long"
    	
    	List类型: resultType="List中元素的类型"
    	当满足sql查询出的字段对应的pojo中有相同字段，则将resultType设置为当前pojo的类路径全限定名，如查询所有用户: com.company.mybatis.bean.User
            
    1.2 resultMap："自定义映射"（用于一对多、多对一、字段名和属性名不一致的情况）
    	其中需要在当前的mapper.xml文件中定义resultMap
        使用场景：
            字段有自定义的转化规则
            复杂的多表查询
            
        <resultMap id="userResultMap" type="com.company.mybatis.bean.User">
            <id property="id" column="id" />
            <result property="username" column="username" />
            <result property="password" column="password" />
            <result property="age" column="age" />
            <result property="email" column="email" />
        </resultMap>
            id –一个 ID 结果;标记出作为 ID 的结果可以帮助提高整体性能,一对多的查询中用于结果集合并；
                
            result – 注入到字段或 JavaBean 属性的普通结果
                column：对应表字段
                property：对应java实体
                
            association – 一个复杂类型的关联;许多结果将包装成这种类型。关联可以指定为一个 resultMap 元素，或者引用一个
                
            collection – 一个复杂类型的集合             
```

