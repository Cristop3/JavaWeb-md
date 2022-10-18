## 2022.10.18

### 架构示意

![架构示意.png](https://s2.loli.net/2022/10/18/dqGuzTHjl5OZM4J.png)

### 依赖（基于SpringBoot+Mysql）

```mysql
<dependencies>
    <dependency>
    	<groupId>org.springframework.boot</groupId>
    	<artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
    	<groupId>org.springframework.boot</groupId>
    	<artifactId>spring-boot-starter-test</artifactId>
    	<scope>test</scope>
    </dependency>
    <dependency>
    	<groupId>com.baomidou</groupId>
    	<artifactId>mybatis-plus-boot-starter</artifactId>
    	<version>3.5.1</version>
    </dependency>
    <dependency>
    	<groupId>org.projectlombok</groupId>
    	<artifactId>lombok</artifactId>
    	<optional>true</optional>
    </dependency>
    <dependency>
    	<groupId>mysql</groupId>
    	<artifactId>mysql-connector-java</artifactId>
    	<scope>runtime</scope>
    </dependency>
</dependencies>
```

### 数据源配置

```yaml
spring:
	# 配置数据源信息
	datasource:
	# 配置数据源类型
	type: com.zaxxer.hikari.HikariDataSource
	# 配置连接数据库信息
	driver-class-name: com.mysql.cj.jdbc.Driver
	url: jdbc:mysql://localhost:3306/mybatis_plus?characterEncoding=utf-
	8&useSSL=false
	username: root
	password: 123456
	
1. 关于driver-class-name驱动配置项（看SpringBoot版本）
	spring boot 2.0（内置jdbc5驱动），驱动类使用：
		driver-class-name: com.mysql.jdbc.Driver
	spring boot 2.1及以上（内置jdbc8驱动），驱动类使用：
		driver-class-name: com.mysql.cj.jdbc.Driver
		
2. 连接地址（看Mysql版本等数据库）
	MySQL5.7版本的url：
		jdbc:mysql://localhost:3306/mybatis_plus?characterEncoding=utf-8&useSSL=false
	MySQL8.0版本的url：
    	jdbc:mysql://localhost:3306/mybatis_plus?
serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false
```

### 启动类（或配置类）上配置mapper包扫描地址

```java
@SpringBootApplication
@MapperScan("com.test.mybatisplus.mapper") // 包位置 有些将mapper放在dao下
public class MybatisplusApplication {
    public static void main(String[] args) {
    	SpringApplication.run(MybatisplusApplication.class, args);
    }
}
```

### 库表结构及数据

```mysql
CREATE DATABASE `mybatis_plus` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
    use `mybatis_plus`;
    CREATE TABLE `user` (
    `id` bigint(20) NOT NULL COMMENT '主键ID',
    `name` varchar(30) DEFAULT NULL COMMENT '姓名',
    `age` int(11) DEFAULT NULL COMMENT '年龄',
    `email` varchar(50) DEFAULT NULL COMMENT '邮箱',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO user (id, name, age, email) VALUES
(1, 'Jone', 18, 'test1@baomidou.com'),
(2, 'Jack', 20, 'test2@baomidou.com'),
(3, 'Tom', 28, 'test3@baomidou.com'),
(4, 'Sandy', 21, 'test4@baomidou.com'),
(5, 'Billie', 24, 'test5@baomidou.com');
```

### 通用Mapper

```java
通用Mapper就是在我们可以使用MyBatisPlus提供的封装好的一些单表的基本的CURD操作，直接在Mapper层（Dao层）与数据库进行交互

首先，我们需要在编写自己的Mapper（或Dao层）接口时，去继承【BaseMapper】
// UserMapper.java (或UserDao.java)
    public interface UserMapper extends BaseMapper<User> {
	} 
其中BaseMapper中的泛型指的是我们的实体类名（一般来说简单的表实体名和表名一致）

@Autowired
private UserMapper userMapper; // 依赖注入我们的UserMapper接口，若Idea报红可以在UserMapper接口上加上@Repository注解

1. Insert
    int insert(T entity) // 插入一个实体类为一条数据
    
    @Test
    public void testInsert(){
        User user = new User(null, "张三", 23, "zhangsan@atguigu.com");
        // INSERT INTO user ( id, name, age, email ) VALUES ( ?, ?, ?, ? )
        int result = userMapper.insert(user);
        System.out.println("受影响行数："+result);
    }

2. Delete
	// 根据 entity 条件，删除记录
    int delete(@Param(Constants.WRAPPER) Wrapper<T> wrapper); // wrapper	实体对象封装操作类（可以为 null）

    // 删除（根据ID 批量删除）
    int deleteBatchIds(@Param(Constants.COLLECTION) Collection<? extends Serializable> idList); // idList	主键 ID 列表(不能为 null 以及 empty)
	@Test
    public void testDeleteBatchIds(){
        //通过多个id批量删除
        //DELETE FROM user WHERE id IN ( ? , ? , ? )
        List<Long> idList = Arrays.asList(1L, 2L, 3L);
        int result = userMapper.deleteBatchIds(idList);
        System.out.println("受影响行数："+result);
    }

    // 根据 ID 删除
    int deleteById(Serializable id); // id	主键 ID
	@Test
    public void testDeleteById(){
        //通过id删除用户信息
        //DELETE FROM user WHERE id=?
        int result = userMapper.deleteById(1475754982694199298L);
        System.out.println("受影响行数："+result);
    }

    // 根据 columnMap 条件，删除记录
    int deleteByMap(@Param(Constants.COLUMN_MAP) Map<String, Object> columnMap); // columnMap	表字段 map 对象
	@Test
    public void testDeleteByMap(){
        //根据map集合中所设置的条件删除记录
        //DELETE FROM user WHERE name = ? AND age = ?
        Map<String, Object> map = new HashMap<>();
        map.put("age", 23);
        map.put("name", "张三");
        int result = userMapper.deleteByMap(map);
        System.out.println("受影响行数："+result);
    }

3. Update
    // 根据 whereWrapper 条件，更新记录
	int update(@Param(Constants.ENTITY) T updateEntity, @Param(Constants.WRAPPER) Wrapper<T> whereWrapper); // updateWrapper	实体对象封装操作类（可以为 null,里面的 entity 用于生成 where 语句）
	
	// 根据 ID 修改
	int updateById(@Param(Constants.ENTITY) T entity); // entity	实体对象 (set 条件值,可为 null)
	@Test
    public void testUpdateById(){
        User user = new User(4L, "admin", 22, null);
        //UPDATE user SET name=?, age=? WHERE id=?
        int result = userMapper.updateById(user);
        System.out.println("受影响行数："+result);
    }

4. Select
    // 根据 ID 查询
    T selectById(Serializable id); // id	主键 ID
	@Test
    public void testSelectById(){
        //根据id查询用户信息
        //SELECT id,name,age,email FROM user WHERE id=?
        User user = userMapper.selectById(4L);
        System.out.println(user);
    }

    // 根据 entity 条件，查询一条记录
    T selectOne(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper); // queryWrapper	实体对象封装操作类（可以为 null）

    // 查询（根据ID 批量查询）
    List<T> selectBatchIds(@Param(Constants.COLLECTION) Collection<? extends Serializable> idList); // idList	主键 ID 列表(不能为 null 以及 empty)
	@Test
    public void testSelectBatchIds(){
        //根据多个id查询多个用户信息
        //SELECT id,name,age,email FROM user WHERE id IN ( ? , ? )
        List<Long> idList = Arrays.asList(4L, 5L);
        List<User> list = userMapper.selectBatchIds(idList);
        list.forEach(System.out::println);
    }

    // 根据 entity 条件，查询全部记录
    List<T> selectList(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
	@Test
    public void testSelectList(){
        //查询所有用户信息
        //SELECT id,name,age,email FROM user
        List<User> list = userMapper.selectList(null);
        list.forEach(System.out::println);
    }

    // 查询（根据 columnMap 条件）
    List<T> selectByMap(@Param(Constants.COLUMN_MAP) Map<String, Object> columnMap); // columnMap	表字段 map 对象
	@Test
    public void testSelectByMap(){
        //通过map条件查询用户信息
        //SELECT id,name,age,email FROM user WHERE name = ? AND age = ?
        Map<String, Object> map = new HashMap<>();
        map.put("age", 22);
        map.put("name", "admin");
        List<User> list = userMapper.selectByMap(map);
        list.forEach(System.out::println);
    }

    // 根据 Wrapper 条件，查询全部记录
    List<Map<String, Object>> selectMaps(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);

    // 根据 Wrapper 条件，查询全部记录。注意： 只返回第一个字段的值
    List<Object> selectObjs(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);

    // 根据 entity 条件，查询全部记录（并翻页）
    IPage<T> selectPage(IPage<T> page, @Param(Constants.WRAPPER) Wrapper<T> queryWrapper); // page	分页查询条件（可以为 RowBounds.DEFAULT）

    // 根据 Wrapper 条件，查询全部记录（并翻页）
    IPage<Map<String, Object>> selectMapsPage(IPage<T> page, @Param(Constants.WRAPPER) Wrapper<T> queryWrapper);

    // 根据 Wrapper 条件，查询总记录数
    Integer selectCount(@Param(Constants.WRAPPER) Wrapper<T> queryWrapper);
```

### 通用Service

```java
通用Service就是在我们可以使用MyBatisPlus提供的封装好的一些单表的基本的CURD操作，直接在Service层与数据库进行交互
    
MyBatis-Plus中有一个接口 IService和其实现类 ServiceImpl，封装了常见的业务层逻辑
一般我们都会有自己的业务Service接口，因此我们需要继承MyBatisPlus的ServiceImpl再实现我们自定义的Service接口
// UserService.java
// ServiceImpl实现了IService，提供了IService中基础功能的实现
// 若ServiceImpl无法满足业务需求，则可以使用自定的UserService定义方法，并在实现类中实现
    @Service
    public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements
        UserService {
    } 

1. Save
    // 插入一条记录（选择字段，策略插入）
    boolean save(T entity); // entity	实体对象

    // 插入（批量）
    boolean saveBatch(Collection<T> entityList); // entityList	实体对象集合
	@Test
    public void testSaveBatch(){
        // SQL长度有限制，海量数据插入单条SQL无法实行，
        // 因此MP将批量插入放在了通用Service中实现，而不是通用Mapper
        ArrayList<User> users = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            User user = new User();
            user.setName("ybc" + i);
            user.setAge(20 + i);
            users.add(user);
        }
        //SQL:INSERT INTO t_user ( username, age ) VALUES ( ?, ? )
        userService.saveBatch(users);
    }

    // 插入（批量）
    boolean saveBatch(Collection<T> entityList, int batchSize); // batchSize	插入批次数量

2. SaveOrUpdate
    // TableId 注解存在更新记录，否插入一条记录
    boolean saveOrUpdate(T entity); // entity	实体对象	

    // 根据updateWrapper尝试更新，否继续执行saveOrUpdate(T)方法
    boolean saveOrUpdate(T entity, Wrapper<T> updateWrapper); // updateWrapper	实体对象封装操作类 UpdateWrapper

    // 批量修改插入
    boolean saveOrUpdateBatch(Collection<T> entityList); // entityList	实体对象集合

    // 批量修改插入
    boolean saveOrUpdateBatch(Collection<T> entityList, int batchSize); // batchSize	插入批次数量

3. Remove
	// 根据 entity 条件，删除记录
    boolean remove(Wrapper<T> queryWrapper); // queryWrapper	实体包装类 QueryWrapper

    // 根据 ID 删除
    boolean removeById(Serializable id); // id	主键 ID

    // 根据 columnMap 条件，删除记录
    boolean removeByMap(Map<String, Object> columnMap); // columnMap	表字段 map 对象

    // 删除（根据ID 批量删除）
    boolean removeByIds(Collection<? extends Serializable> idList); // idList	主键 ID 列表

4. Update
    // 根据 UpdateWrapper 条件，更新记录 需要设置sqlset
    boolean update(Wrapper<T> updateWrapper); // updateWrapper	实体对象封装操作类 UpdateWrapper

    // 根据 whereWrapper 条件，更新记录
    boolean update(T updateEntity, Wrapper<T> whereWrapper);

    // 根据 ID 选择修改
    boolean updateById(T entity); // entity	实体对象

    // 根据ID 批量更新
    boolean updateBatchById(Collection<T> entityList); // entityList	实体对象集合

    // 根据ID 批量更新
    boolean updateBatchById(Collection<T> entityList, int batchSize); // batchSize	更新批次数量

5. Get
    // 根据 ID 查询
    T getById(Serializable id);

    // 根据 Wrapper，查询一条记录。结果集，如果是多个会抛出异常，随机取一条加上限制条件 wrapper.last("LIMIT 1")
    T getOne(Wrapper<T> queryWrapper);

    // 根据 Wrapper，查询一条记录
    T getOne(Wrapper<T> queryWrapper, boolean throwEx); // throwEx	有多个 result 是否抛出异常

    // 根据 Wrapper，查询一条记录
    Map<String, Object> getMap(Wrapper<T> queryWrapper);

    // 根据 Wrapper，查询一条记录
    <V> V getObj(Wrapper<T> queryWrapper, Function<? super Object, V> mapper); // mapper	转换函数

6. List
    // 查询所有
    List<T> list();

    // 查询列表
    List<T> list(Wrapper<T> queryWrapper);

    // 查询（根据ID 批量查询）
    Collection<T> listByIds(Collection<? extends Serializable> idList);

    // 查询（根据 columnMap 条件）
    Collection<T> listByMap(Map<String, Object> columnMap);

    // 查询所有列表
    List<Map<String, Object>> listMaps();

    // 查询列表
    List<Map<String, Object>> listMaps(Wrapper<T> queryWrapper);

    // 查询全部记录
    List<Object> listObjs();

    // 查询全部记录
    <V> List<V> listObjs(Function<? super Object, V> mapper);

    // 根据 Wrapper 条件，查询全部记录
    List<Object> listObjs(Wrapper<T> queryWrapper);

    // 根据 Wrapper 条件，查询全部记录
    <V> List<V> listObjs(Wrapper<T> queryWrapper, Function<? super Object, V> mapper);

7. Page
    // 无条件分页查询
    IPage<T> page(IPage<T> page); // page	翻页对象

    // 条件分页查询
    IPage<T> page(IPage<T> page, Wrapper<T> queryWrapper);

    // 无条件分页查询
    IPage<Map<String, Object>> pageMaps(IPage<T> page);

    // 条件分页查询
    IPage<Map<String, Object>> pageMaps(IPage<T> page, Wrapper<T> queryWrapper);

8. Count
    // 查询总记录数
    int count();

    // 根据 Wrapper 条件，查询总记录数
    int count(Wrapper<T> queryWrapper);

9. Chain
    chain-query
    	// 链式查询 普通
        QueryChainWrapper<T> query();
        // 链式查询 lambda 式。注意：不支持 Kotlin
        LambdaQueryChainWrapper<T> lambdaQuery();

        // 示例：
        query().eq("column", value).one();
        lambdaQuery().eq(Entity::getId, value).list();

	chain-update
        // 链式更改 普通
        UpdateChainWrapper<T> update();
        // 链式更改 lambda 式。注意：不支持 Kotlin
        LambdaUpdateChainWrapper<T> lambdaUpdate();

        // 示例：
        update().eq("column", value).remove();
        lambdaUpdate().eq(Entity::getId, value).update(entity);


```

### 常用注解

```java
1. @TableName
使用MyBatis-Plus实现基本的CRUD时，我们并没有指定要操作的表，只是在Mapper接口继承BaseMapper时，设置了泛型User，而操作的表为user表，因此MyBatis-Plus在确定操作的表时，由BaseMapper的泛型决定，即实体类型决定，且默认操作的表名和实体类型的类名一致
    1.1 若操作的实体与表名不一致时，我们可以使用@TableName来修正
    若表名为【t_user】则对应的实体类标识
    @TableName("t_user")
    public class User{
        // ...
    }
	1.2 若团队规定了使用统一方式建表，如t_tablename，则可以通过全局配置解决
     mybatis-plus:
        configuration:
        	global-config:
        		db-config:
        			# 配置MyBatis-Plus操作表的默认前缀
        			table-prefix: t_ // 就不需要额外再在每个实体上使用@TableName

2. @TableId
MyBatis-Plus在实现CRUD时，会默认将id作为主键列，并在插入数据时，默认基于雪花算法的策略生成id，若我们表、实体类中主键名称非id，即使我们在表中让主键自增，而不设置实体主键标识，同样在使用MP时不会生效；若我们的表中主键与实体主键属性不一致时，我们需要通过实体类主键属性进行标识
     1.1 实体类与表主键名称非【id】
     public class User{
         @TableId
         private Long uid;
     }    
	1.2 实体类与表主键名称不一致
     public class User{
         @TableId("uid") | @TableId(value="uid")
         private Long id;
     }
	1.3 type属性
     IdType.ASSIGN_ID（默认） 基于雪花算法的策略生成数据id，与数据库id是否设置自增无关； 
     IdType.AUTO 使用数据库的自增策略，注意，该类型请确保数据库设置了id自增，否则无效   
     @TableId(value="uid", type=IdType.AUTO)
     1.4 全局配置
     mybatis-plus:
        configuration:
        	global-config:
        		db-config:
        			# 配置MyBatis-Plus的主键策略
					id-type: auto
                        
3. @TableField
   MyBatis-Plus在执行SQL语句时，要保证【实体类中的属性名】和【表中的字段名】一致   
   1.1 驼峰转换
   一般在java实体类中我们使用驼峰命名，而表字段我们使用下划线命名，如userName【user_name】
   MyBatis-Plus会自动将下划线命名风格转化为驼峰命名风格，在MyBatis中我们得知此项可设置，而MP则自动转换
   1.2 两边不一致
   如name【user_name】，此时需要使用@TableField标识
   public class User{
       @TableField("user_name")
       private String name;
   }

4. @TableLogic
   物理删除：真实删除，将对应数据从数据库中删除，之后查询不到此条被删除的数据
   逻辑删除：假删除，将对应数据中代表是否被删除字段的状态修改为“被删除状态”，之后在数据库
中仍旧能看到此条数据记录 
    
    1. 实体中增加逻辑删除标识属性
    public class User{
       @TableLogic
       private Integer hasDeleted;
    }
	2. 表中增加has_deleted字段
```

### 条件构造器

![Wrapper.png](https://s2.loli.net/2022/10/18/2fx8V6iZovdeXPy.png)

```java
配合通用Service、通用Mapper中所提供的方法参数为Wrapper的均可使用
    
1. QueryWrapper
    // 常规使用
    QueryWrapper<User> queryWrapper = new QueryWrapper<>();
    queryWrapper.like("username", "a")
        .between("age", 20, 30)
        .isNotNull("email");
    List<User> list = userMapper.selectList(queryWrapper);
    list.forEach(System.out::println);
	
	// condition条件拼接
	String username = null;
	Integer ageBegin = 10;
	Integer ageEnd = 24;
	QueryWrapper<User> queryWrapper = new QueryWrapper<>();
	queryWrapper
		.like(StringUtils.isNotBlank(username), "username", "a")
        .ge(ageBegin != null, "age", ageBegin)
		.le(ageEnd != null, "age", ageEnd);
        List<User> users = userMapper.selectList(queryWrapper);
        users.forEach(System.out::println);

2. UpdateWrapper
    UpdateWrapper<User> updateWrapper = new UpdateWrapper<>();
    updateWrapper
        .set("age", 18)
        .set("email", "user@atguigu.com")
        .like("username", "a")
        .and(i -> i.gt("age", 20).or().isNull("email"));
	int result = userMapper.update(null, updateWrapper);
System.out.println(result);

3. LambdaQueryWrapper
    String username = "a";
	Integer ageBegin = 10;
	Integer ageEnd = 24;
	LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper
    .like(StringUtils.isNotBlank(username), User::getName, username)
    .ge(ageBegin != null, User::getAge, ageBegin)
    .le(ageEnd != null, User::getAge, ageEnd);
    List<User> users = userMapper.selectList(queryWrapper);
    users.forEach(System.out::println);
    
4. LambdaUpdateWrapper
    LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
    updateWrapper
    .set(User::getAge, 18)
    .set(User::getEmail, "user@atguigu.com")
    .like(User::getName, "a")
    .and(i -> i.lt(User::getAge, 24).or().isNull(User::getEmail));
    User user = new User();
    int result = userMapper.update(user, updateWrapper);
    System.out.println("受影响的行数：" + result);
```

