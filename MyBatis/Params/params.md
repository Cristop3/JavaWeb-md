## 2022.06.11

#### 单个字面量类型参数

```java
// UserMapper.java
public interface UserMapper {
    // 1. 单个字面量传参 int类型 查询 getUserById
    User getUserById(int id);
    // 1. 单个字面量传参 String类型 查询 getUserByName
    User getUserByName(String username);
}

// UserMapper.xml
<!--    1. 单个字面量传参 查询 getUserById-->
    <select id="getUserById" resultType="user">
        select *
        from t_user
        where id = #{id}
    </select>
<!--    <select id="getUserById" resultType="user">-->
<!--        select *-->
<!--        from t_user-->
<!--        where id = ${id}-->
<!--    </select>-->

    <!--    1. 单个字面量传参 String类型 查询 getUserByName-->
<!--    <select id="getUserByName" resultType="user">-->
<!--        select *-->
<!--        from t_user-->
<!--        where username = #{username}-->
<!--    </select>-->
    <select id="getUserByName" resultType="user">
        select *
        from t_user
        where username = '${username}'
    </select>
    <select id="getUserByName" resultType="user">
        select *
        from t_user
        where username = '${xxx}'
    </select>   
        
// test
User user = mapper.getUserById(1);
User user = mapper.getUserByName("李大爷");
System.out.println("单个字面量参数获取方式: " + user);       
        
注意：
    1. 当mapper接口中的方法参数为"单个"的字面量类型时，使用"#{}"或者"${}"均可
    2. 切在#{}、${}中的参数名称可以以"任意名称"来获取,如上面的username可以用"xxx"获取
    3. 但在使用${}时需要注意的时为String类型时需要主动加上单引号
    4. #{}本质为占位符，而${}本质为字符串sql拼接
```

#### 多个字面量类型的参数

```java
// UserMapper.java
// 2. 多个字面量参数传参 查询 getUserByIdName
User getUserByIdName(int id, String username);

// UserMapper.xml
<!--    2. 多个字面量参数传参 查询 getUserByIdName-->
<!--    <select id="getUserByIdName" resultType="user">-->
<!--        select *-->
<!--        from t_user-->
<!--        where id = #{arg0}-->
<!--          and username = #{arg1}-->
<!--    </select>-->
    <select id="getUserByIdName" resultType="user">
        select *
        from t_user
        where id = #{param1}
          and username = '${param2}'
    </select>

// test
User user = mapper.getUserByIdName(1, "李大爷");
System.out.println("多个字面量参数获取方式: " + user);    

注意：
    1. 当mapper接口中的方法参数为多个时，Mybatis会自动将这些参数放在一个map集合中，按照常规的写法我们不能直接用形参来获取对应值
    2. 可以通过"arg0","arg1"...为键，真实的参数值为值来访问
       也可以通过"param1","param2"...为键，真实的参数值为值来访问
    3. 使用#{}或者${}均可以访问，但需要注意${}需要考虑是否手动添加单引号，如上          
```

#### map类型的参数

```java
基于上述多参数时，我们可以手动的构建一个Map集合在mapper接口方法

// UserMapper.java
// 3. map类型参数传参 查询 getUserByMap
User getUserByMap(Map<String,Object> userMap);

// UserMapper.xml
<!--    3. map类型参数传参 查询 getUserByMap-->
    <select id="getUserByMap" resultType="user">
        select *
        from t_user
        where id = #{id}
          and username = '${username}'
    </select>

// test
Map<String, Object> userMap = new HashMap<>();
userMap.put("id",2);
userMap.put("username","李二爷");
User user = mapper.getUserByMap(userMap);
System.out.println("map类型参数获取方式: " + user);

注意：
    1. 通过访问map集合的键就可以获取对应的值 如id,username
    2. #{}、${}均可以使用，但仍需注意${}的单引号问题
```

#### 实体类类型的参数

```java
可以在mapper接口中方法传入实体类对象
// UserMapper.java
    // 4. 实体类类型参数传参 插入 insertUserByPojo
    int insertUserByPojo(User user);
		    
// UserMapper.xml
	<!--    4. 实体类类型参数传参 插入 insertUserByPojo-->
    <insert id="insertUserByPojo">
        insert into t_user
        values (null, #{username}, #{password}, #{sex}, #{age}, #{email})
    </insert>
        
// test
 	User user = new User(null, "李四爷", "4", 24, "男", "4@qq.com");
    int result = mapper.insertUserByPojo(user);
    System.out.println("实体类型参数获取方式: " + result); 

注意：
    1. 通过访问实体类对象中的属性名来获取属性值
    2. #{}、${}均可以使用，但仍需注意${}的单引号问题    
```

#### 使用@Param注解标识的参数

```java
可以通过@Param注解标识mapper接口中的方法参数
// UserMapper.java
    // 5. @Parma注解形参 查询 getUserByAnnoParam
    User getUserByAnnoParam(@Param("id") int id, @Param("username") String username);

// UserMapper.xml
	<!--    5. @Parma注解形参 查询 getUserByAnnoParam-->
    <!--    <select id="getUserByAnnoParam" resultType="user">-->
    <!--        select *-->
    <!--        from t_user-->
    <!--        where id = #{id}-->
    <!--          and username = '${username}'-->
    <!--    </select>-->
    <select id="getUserByAnnoParam" resultType="user">
        select *
        from t_user
        where id = #{param1}
          and username = '${username}'
    </select>
              
// test
User user = mapper.getUserByAnnoParam(4, "李四爷");
System.out.println("注解形参参数获取方式: " + user); 

注意：
    1. 若使用了注解形参方式，Mybatis会将这些参数放在map集合中
    2. 使用注解的value值来访问或者也可以使用param1...等来访问（注意区别多字面量参数方式）
    3. #{}、${}均可以使用，但仍需注意${}的单引号问题
```

#### 各种查询

```java
1. 查询一个实体类对象
    // UserMapper.java
    User getUserById(@Param("id") int id);

2. 查询一个List集合
    List<User> getUser();

3. 查询总数
    int getUserCount();
	其中在mapper.xml文件中，需要注意的是resultType的设置，比如查询所有用户，此时我们可以设置resultType="java.lang.Integer"
    在Mybatis中，对于常用的类型它都给我们设置了类型别名，如：
        java.lang.Integer -> int || integer
        int -> _int || _integer
        java.lang.Long -> Long
        Map -> map
        List -> list
        
4. 查询map
    Map<String,Object> getUserByName();
	此时resultType="map"
        
5. 查询多条数据为map集合
    List<Map<String,Object>> getAllUser2Map();
    此时resultType="map"
    或者：
        
    @MapKey("id")
    Map<String,Object> getAllUser2Map();
    此时resultType="map"    
    它将表中的数据以map集合的方式查询，一条数据对应一个map；若有多条数据，就会产生多个map集合，并
且最终要以一个map的方式返回数据，此时需要通过@MapKey注解设置map集合的键，值是每条数据所对应的
map集合    
```

#### 特殊SQL

```java
1. 模糊查询
    1.1 ${}方式
    	<select id="getUserSpecialByName" resultType="user">
            select *
            from t_user
            where username like '%${username}%'
        </select>
    
    1.2 #{}方式
    	<select id="getUserSpecialByName" resultType="user">
            select *
            from t_user
            where username like "%"#{username}"%"
        </select>
    	注意是使用双引号来包括的%，而#{}占位符不需要	
    
    1.3 sql函数方式
    	<select id="getUserSpecialByName" resultType="user">
            select *
            from t_user
            where username like concat('%', #{username}, '%')
        </select>
    	注意此时百分号使用单双引号均可
    
2. 批量删除
    使用mysql的in操作符实现
    <delete id="deleteUserByIds">
        delete
        from t_user
        where id in (${ids})
    </delete>
    注意此处使用的是${}来获取
    
3. 动态设置表名
    <select id="getUserDynamicTableName" resultType="user">
        select *
        from ${tableName}
    </select>
    注意此处使用的是${}来获取
        
4. 自动获取自增主键 
        useGeneratedKeys：设置使用自增的主键
        keyProperty: 因为增删改有统一的返回值是受影响的行数，因此只能将获取的自增的主键放在传输的参数user对象的某个属性中
   <insert id="insertAutoSetPrimaryKey" useGeneratedKeys="true" keyProperty="id">
        insert into t_user
        values (null, #{username}, #{password}, #{sex}, #{age}, #{email})
   </insert>   
   // console
   自动设置主键前：User{id=null, username='李五爷', password='5', age=25, sex='女', email='5@qq.com'}
   自动设置主键后：User{id=9, username='李五爷', password='5', age=25, sex='女', email='5@qq.com'}
```

