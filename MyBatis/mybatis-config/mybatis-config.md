## 2022.06.09

#### mybatis-config.xml核心配置文件

```java
1. 标签顺序
	核心配置文件中的标签必须按照固定的顺序：
    properties,
    settings,
    typeAliases,
    typeHandlers,
    objectFactory,
    objectWrapperFactory,
    reflectorFactory,
    plugins,
    environments,
    databaseIdProvider,
    mappers

2. properties
    <!--引入properties文件，此时就可以${属性名}的方式访问属性值-->
    <properties resource="jdbc.properties"></properties>  
        
3. typeAliases
     <typeAliases>
        <!--
        typeAlias：设置某个具体的类型的别名
        属性：
        type：需要设置别名的类型的全类名
        alias：设置此类型的别名，若不设置此属性，该类型拥有默认的别名，即类名且不区分大小
        写
        若设置此属性，此时该类型的别名只能使用alias所设置的值
        -->
        <!--<typeAlias type="com.company.mybatis.bean.User"></typeAlias>-->
        <!--<typeAlias type="com.company.mybatis.bean.User" alias="abc">-->
	</typeAlias>
        
	<!--以包为单位，设置改包下所有的类型都拥有默认的别名，即类名且不区分大小写-->
        <typeAliases>
        	<package name="com.company.mybatis.bean"/>
        </typeAliases>   
        
4. environments
        <!--
        environments：设置多个连接数据库的环境
        属性：
        default：设置默认使用的环境的id
        -->
        <environments default="mysql_test">
            <!--
            environment：设置具体的连接数据库的环境信息
            属性：
            id：设置环境的唯一标识，可通过environments标签中的default设置某一个环境的id，
            表示默认使用的环境
            -->
            <environment id="mysql_test">
                <!--
                    transactionManager：设置事务管理方式
                    type：设置事务管理方式，type="JDBC|MANAGED"
                    type="JDBC"：设置当前环境的事务管理都必须手动处理
                    type="MANAGED"：设置事务被管理，例如spring中的AOP
                -->
                <transactionManager type="JDBC"/>
                <!--
                    dataSource：设置数据源
                    属性：
                    type：设置数据源的类型，type="POOLED|UNPOOLED|JNDI"
                    type="POOLED"：使用数据库连接池，即会将创建的连接进行缓存，下次使用可以从
                    缓存中直接获取，不需要重新创建
                    type="UNPOOLED"：不使用数据库连接池，即每次使用连接都需要重新创建
                    type="JNDI"：调用上下文中的数据源
                -->
                <dataSource type="POOLED">
                    <!--设置驱动类的全类名-->
                    <property name="driver" value="${jdbc.driver}"/>
                    <!--设置连接数据库的连接地址-->
                    <property name="url" value="${jdbc.url}"/>
                    <!--设置连接数据库的用户名-->
                    <property name="username" value="${jdbc.username}"/>
                    <!--设置连接数据库的密码-->
                    <property name="password" value="${jdbc.password}"/>
                </dataSource>
            </environment>
        </environments>

5. mappers
        <!--引入映射文件-->
        <mappers>
            <mapper resource="UserMapper.xml"/>
            <!--
            以包为单位，将包下所有的映射文件引入核心配置文件
            注意：此方式必须保证mapper接口和mapper映射文件必须在相同的包下
            -->
            <package name="com.atguigu.mybatis.mapper"/>
        </mappers>

```

#### Idea中创建mybatis-config.xml模板文件

```java
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <!--1. 引入properties文件，此时就可以${属性名}的方式访问属性值-->
    <properties resource=""></properties>

    <!--2. 以包为单位，设置改包下所有的类型都拥有默认的别名，即类名且不区分大小写-->
    <typeAliases>
        <package name=""/>
    </typeAliases>

    <!--    3. 数据库配置-->
    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${jdbc.driver}"/>
                <property name="url" value="${jdbc.url}"/>
                <property name="username" value="${jdbc.username}"/>
                <property name="password" value="${jdbc.password}"/>
            </dataSource>
        </environment>
    </environments>

    <!--    4. mapper映射文件-->
    <mappers>
        <package name=""/>
    </mappers>
</configuration>
```

#### Idea中创建xxxMapper.xml模板文件

```java
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="">

</mapper>
```

#### Idea中创建log4j.xml模板文件

```java
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

