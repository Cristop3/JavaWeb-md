## 2022.06.13

#### 一级缓存

```java
一级缓存是SqlSession级别的，通过同一个SqlSession查询的数据会被缓存，下次查询相同的数据，就
会从缓存中直接获取，不会从数据库重新访问
使一级缓存失效的四种情况：
1) 不同的SqlSession对应不同的一级缓存
2) 同一个SqlSession但是查询条件不同
3) 同一个SqlSession两次查询期间执行了任何一次增删改操作
4) 同一个SqlSession两次查询期间手动清空了缓存
```

#### 二级缓存

```java
二级缓存是SqlSessionFactory级别，通过同一个SqlSessionFactory创建的SqlSession查询的结果会被
缓存；此后若再次执行相同的查询语句，结果就会从缓存中获取
二级缓存开启的条件：
a>在核心配置文件中，设置全局配置属性cacheEnabled="true"，默认为true，不需要设置
b>在映射文件中设置标签<cache />
c>二级缓存必须在SqlSession关闭或提交之后有效
d>查询的数据所转换的实体类类型必须实现序列化的接口
使二级缓存失效的情况：
两次查询之间执行了任意的增删改，会使一级和二级缓存同时失效
```

#### 二级缓存配置

```java
在mapper配置文件中添加的cache标签可以设置一些属性：
    eviction属性：缓存回收策略
    LRU（Least Recently Used） – 最近最少使用的：移除最长时间不被使用的对象。
    FIFO（First in First out） – 先进先出：按对象进入缓存的顺序来移除它们。
    SOFT – 软引用：移除基于垃圾回收器状态和软引用规则的对象。
    WEAK – 弱引用：更积极地移除基于垃圾收集器状态和弱引用规则的对象。
    默认的是 LRU。
    flushInterval属性：刷新间隔，单位毫秒
    默认情况是不设置，也就是没有刷新间隔，缓存仅仅调用语句时刷新
    size属性：引用数目，正整数
    代表缓存最多可以存储多少个对象，太大容易导致内存溢出
    readOnly属性：只读，true/false
    true：只读缓存；会给所有调用者返回缓存对象的相同实例。因此这些对象不能被修改。这提供了
    很重要的性能优势。
    false：读写缓存；会返回缓存对象的拷贝（通过序列化）。这会慢一些，但是安全，因此默认是
    false。
```

#### 缓存查询的顺序

```java
先查询二级缓存，因为二级缓存中可能会有其他程序已经查出来的数据，可以拿来直接使用。
如果二级缓存没有命中，再查询一级缓存
如果一级缓存也没有命中，则查询数据库
SqlSession关闭之后，一级缓存中的数据会写入二级缓存
```

#### Mybatis逆向工程

```xml
正向工程：先创建Java实体类，由框架负责根据实体类生成数据库表。Hibernate是支持正向工程
的。
逆向工程：先创建数据库表，由框架负责根据数据库表，反向生成如下资源：
    Java实体类
    Mapper接口
    Mapper映射文件
    
1. 添加依赖和插件
   <!-- 依赖MyBatis核心包 -->
    <dependencies>
    	<dependency>
    	<groupId>org.mybatis</groupId>
    	<artifactId>mybatis</artifactId>
    	<version>3.5.7</version>
    </dependency>
    </dependencies>
    <!-- 控制Maven在构建过程中相关配置 -->
    <build>
    	<!-- 构建过程中用到的插件 -->
    	<plugins>
    		<!-- 具体插件，逆向工程的操作是以构建过程中插件形式出现的 -->
    		<plugin>
    			<groupId>org.mybatis.generator</groupId>
    			<artifactId>mybatis-generator-maven-plugin</artifactId>
    			<version>1.3.0</version>
    			<!-- 插件的依赖 -->
   				<dependencies>
                    <!-- 逆向工程的核心依赖 -->
                    <dependency>
                        <groupId>org.mybatis.generator</groupId>
                        <artifactId>mybatis-generator-core</artifactId>
                        <version>1.3.2</version>
                    </dependency>
                    <!-- 数据库连接池 -->
                    <dependency>
                        <groupId>com.mchange</groupId>
                        <artifactId>c3p0</artifactId>
                        <version>0.9.2</version>
                    </dependency>
                    <!-- MySQL驱动 -->
                    <dependency>
                        <groupId>mysql</groupId>
                        <artifactId>mysql-connector-java</artifactId>
                        <version>5.1.8</version>
                    </dependency>
                  </dependencies>
    		</plugin>
    	</plugins>
    </build>

2. 创建逆向工程的配置文件
	// generatorConfig.xml
	<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE generatorConfiguration
    d>执行MBG插件的generate目标
    效果：
    PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
    "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
    <generatorConfiguration>
        <!--
        targetRuntime: 执行生成的逆向工程的版本
        MyBatis3Simple: 生成基本的CRUD（清新简洁版）
        MyBatis3: 生成带条件的CRUD（奢华尊享版）
        -->
    	<context id="DB2Tables" targetRuntime="MyBatis3Simple">
    	<!-- 数据库的连接信息 -->
        <jdbcConnection driverClass="com.mysql.jdbc.Driver"
        connectionURL="jdbc:mysql://localhost:3306/mybatis"
        userId="root"
        password="123456">
        </jdbcConnection>
    	<!-- javaBean的生成策略-->
    <javaModelGenerator targetPackage="com.atguigu.mybatis.bean"
    targetProject=".\src\main\java">
    <property name="enableSubPackages" value="true" />
    <property name="trimStrings" value="true" />
    </javaModelGenerator>
    <!-- SQL映射文件的生成策略 -->
    <sqlMapGenerator targetPackage="com.atguigu.mybatis.mapper"
    targetProject=".\src\main\resources">
    <property name="enableSubPackages" value="true" />
    </sqlMapGenerator>
    <!-- Mapper接口的生成策略 -->
    <javaClientGenerator type="XMLMAPPER"
    targetPackage="com.atguigu.mybatis.mapper" targetProject=".\src\main\java">
    <property name="enableSubPackages" value="true" />
    </javaClientGenerator>
    <!-- 逆向分析的表 -->
    <!-- tableName设置为*号，可以对应所有表，此时不写domainObjectName -->
    <!-- domainObjectName属性指定生成出来的实体类的类名 -->
    <table tableName="t_emp" domainObjectName="Emp"/>
    <table tableName="t_dept" domainObjectName="Dept"/>
    </context>
    </generatorConfiguration>

3. QBC查询
	@Test
    public void testMBG() throws IOException {
        InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
        SqlSession sqlSession = new
        SqlSessionFactoryBuilder().build(is).openSession(true);
        EmpMapper mapper = sqlSession.getMapper(EmpMapper.class);
        EmpExample empExample = new EmpExample();
        //创建条件对象，通过andXXX方法为SQL添加查询添加，每个条件之间是and关系
        empExample.createCriteria().andEnameLike("a").andAgeGreaterThan(20).andDidIsNot
        Null();
        //将之前添加的条件通过or拼接其他条件
        empExample.or().andSexEqualTo("男");
        List<Emp> list = mapper.selectByExample(empExample);
        for (Emp emp : list) {
        System.out.println(emp);
        }
    }
```

#### 分页插件

```java
1. 添加依赖
	<!-- https://mvnrepository.com/artifact/com.github.pagehelper/pagehelper -->
    <dependency>
        <groupId>com.github.pagehelper</groupId>
        <artifactId>pagehelper</artifactId>
        <version>5.2.0</version>
    </dependency>
        
2. 配置分页插件
    // mybatis-config.xml
    <plugins>
    	<!--设置分页插件-->
    	<plugin interceptor="com.github.pagehelper.PageInterceptor"></plugin>
    </plugins>
 
3. 如何使用
     3.1 在查询功能之前使用PageHelper.startPage(int pageNum, int pageSize)开启分页功能
        pageNum：当前页的页码 pageSize：每页显示的条数
	 3.2 在查询获取list集合之后，使用PageInfo<T> pageInfo = new PageInfo<>(List<T> list, int navigatePages)获取分页相关数据
        list：分页之后的数据 navigatePages：导航分页的页码数
	 3.3 pageNum：当前页的页码
          pageSize：每页显示的条数
          size：当前页显示的真实条数
          total：总记录数
          pages：总页数
          prePage：上一页的页码
          nextPage：下一页的页码
          isFirstPage/isLastPage：是否为第一页/最后一页
          hasPreviousPage/hasNextPage：是否存在上一页/下一页
          navigatePages：导航分页的页码数
          navigatepageNums：导航分页的页码，[1,2,3,4,5]	
```

