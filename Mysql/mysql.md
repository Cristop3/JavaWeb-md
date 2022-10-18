## 2022.03.23

### 关系型数据库

```mysql
1.数据以表格的形式出现
2.每行为各种记录名称
3.每列为记录名称所对应的数据域
4.许多的行和列组成一张表单
5.若干的表单组成database
```

### mysql数据类型

```mysql
mysql数据类型大致分为三类：
	1. 数值
	2. 日期/时间
	3. 字符串（字符）
```

![mysql-number.png](https://s2.loli.net/2022/03/23/yCAb2snD6rgZxlR.png)

![mysql-datetime.png](https://s2.loli.net/2022/03/23/be9nd6GSqHExWcg.png)

![mysql-string.png](https://s2.loli.net/2022/03/23/9Xao4LNg8MOdckG.png)

### 创建表

```mysql
创建表需要以下信息：
1. 表名
2. 表字段名
3. 定义每个表字段

CREATE TABLE IF NOT EXISTS `runoob_tbl`(
   `runoob_id` INT UNSIGNED AUTO_INCREMENT,
   `runoob_title` VARCHAR(100) NOT NULL,
   `runoob_author` VARCHAR(40) NOT NULL,
   `submission_date` DATE,
   PRIMARY KEY ( `runoob_id` )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### 删除表

```mysql
DROP TABLE table_name ;
```

### insert插入数据

```mysql
1. 插入单条
INSERT INTO table_name ( field1, field2,...fieldN )
                       VALUES
                       ( value1, value2,...valueN );
如果数据是字符型，必须使用单引号或者双引号.     

2. 插入多条一次性
INSERT INTO table_name  (field1, field2,...fieldN)  VALUES  (valueA1,valueA2,...valueAN),(valueB1,valueB2,...valueBN),(valueC1,valueC2,...valueCN)......;

3. 加``跟''
指定插入哪些字段，字段名顺序与字段值顺序一致即可，可以给部分或所有字段名加``，不能加''，加''时会执行报错
```

### select查询数据

```mysql
SELECT column_name,column_name
FROM table_name
[WHERE Clause]
[LIMIT N][ OFFSET M]

1. 查询语句中你可以使用一个或者多个表，表之间使用逗号(,)分割，并使用WHERE语句来设定查询条件。
2. SELECT 命令可以读取一条或者多条记录。
3. 你可以使用星号（*）来代替其他字段，SELECT语句会返回表的所有字段数据
4. 你可以使用 WHERE 语句来包含任何条件。
5. 你可以使用 LIMIT 属性来设定返回的记录数。
6. 你可以通过OFFSET指定SELECT语句开始查询的数据偏移量。默认情况下偏移量为0。
```

### where子句

```mysql
SELECT field1, field2,...fieldN FROM table_name1, table_name2...
[WHERE condition1 [AND [OR]] condition2.....
 
1. 查询语句中你可以使用一个或者多个表，表之间使用逗号, 分割，并使用WHERE语句来设定查询条件。
2. 你可以在 WHERE 子句中指定任何条件。
4. 你可以使用 AND 或者 OR 指定一个或多个条件。
5. WHERE 子句也可以运用于 SQL 的 DELETE 或者 UPDATE 命令。
6. WHERE 子句类似于程序语言中的 if 条件，根据 MySQL 表中的字段值来读取指定的数据。 
```

![mysql-where.png](https://s2.loli.net/2022/03/23/hsgTxNrLPHid5OI.png)

### update更新数据

```mysql
UPDATE table_name SET field1=new-value1, field2=new-value2
[WHERE Clause]

1. 你可以同时更新一个或多个字段。
2. 你可以在 WHERE 子句中指定任何条件。
3. 你可以在一个单独表中同时更新数据。
```

### delete删除数据

```mysql
DELETE FROM table_name [WHERE Clause]

1. 如果没有指定 WHERE 子句，MySQL 表中的所有记录将被删除。
2. 你可以在 WHERE 子句中指定任何条件
3. 您可以在单个表中一次性删除记录。
```

### delete\drop\truncate区别

```mysql
delete，drop，truncate 都有删除表的作用
1. delete 和 truncate 仅仅删除表数据，而drop 连表数据和表结构一起删除

2. delete 是 DML 语句，操作完以后如果没有不想提交事务还可以回滚；而truncate 和 drop 是 DDL 语句，操作完马上生效，不能回滚
```

### like子句

```mysql
SELECT field1, field2,...fieldN 
FROM table_name
WHERE field1 LIKE condition1 [AND [OR]] filed2 = 'somevalue'

1. 你可以在 WHERE 子句中指定任何条件。
2. 你可以在 WHERE 子句中使用LIKE子句。
3. 你可以使用LIKE子句代替等号 =。
4. LIKE 通常与 % 一同使用，类似于一个元字符的搜索。
5. 你可以使用 AND 或者 OR 指定一个或多个条件。
6. 你可以在 DELETE 或 UPDATE 命令中使用 WHERE...LIKE 子句来指定条件。

'%a'     //以a结尾的数据
'a%'     //以a开头的数据
'%a%'    //含有a的数据
'_a_'    //三位且中间字母是a的
'_a'     //两位且结尾字母是a的
'a_'     //两位且开头字母是a的

1. %：表示任意 0 个或多个字符。可匹配任意类型和长度的字符，有些情况下若是中文，请使用两个百分号（%%）表示。
2. _：表示任意单个字符。匹配单个任意字符，它常用来限制表达式的字符长度语句。
3. []：表示括号内所列字符中的一个（类似正则表达式）。指定一个字符、字符串或范围，要求所匹配对象为它们中的任一个。
4. [^] ：表示不在括号所列之内的单个字符。其取值和 [] 相同，但它要求所匹配对象为指定字符以外的任一个字符。
查询内容包含通配符时,由于通配符的缘故，导致我们查询特殊字符 “%”、“_”、“[” 的语句无法正常实现，而把特殊字符用 “[ ]” 括起便可正常查询。
```

### union\union all操作符

```mysql
MySQL UNION 操作符用于连接两个以上的 SELECT 语句的结果组合到一个结果集合中。多个 SELECT 语句会删除重复的数据。

UNION 语句：用于将不同表中相同列中查询的数据展示出来；（不包括重复数据）
UNION ALL 语句：用于将不同表中相同列中查询的数据展示出来；（包括重复数据）

SELECT expression1, expression2, ... expression_n
FROM tables
[WHERE conditions]
UNION [ALL | DISTINCT]
SELECT expression1, expression2, ... expression_n
FROM tables
[WHERE conditions];

1. expression1, expression2, ... expression_n: 要检索的列。
2. tables: 要检索的数据表。
3. WHERE conditions: 可选， 检索条件。
4. DISTINCT: 可选，删除结果集中重复的数据。默认情况下 UNION 操作符已经删除了重复数据，所以 DISTINCT 修饰符对结果没啥影响。
5. ALL: 可选，返回所有结果集，包含重复数据。

数据量大时，对于表连接来说，union的效率要高一些，
union: 多个结果集拼接（如加法）
join: 笛卡尔积（如乘法）

需要注意每个union的子集字段名、字段顺序需保持一致，不然就会按第一子集字段显示，造成错误理解
```

### order by排序

```mysql
SELECT field1, field2,...fieldN FROM table_name1, table_name2...
ORDER BY field1 [ASC [DESC][默认 ASC]], [field2...] [ASC [DESC][默认 ASC]]

1. 你可以使用任何字段来作为排序的条件，从而返回排序后的查询结果。
2. 你可以设定多个字段来排序。
3. 你可以使用 ASC 或 DESC 关键字来设置查询结果是按升序或降序排列。 默认情况下，它是按升序排列。
4. 你可以添加 WHERE...LIKE 子句来设置条件。
5. 若存在多个order by字段 则按order by顺序先排序，相同的数据再按第二个order by排序，如：
	select * from user order by age desc, id asc;
	先按age年龄降序排列，若年龄相同的再按id编号升序排列。
```

## 2022.03.24

### group by分组

```mysql
1. group by
GROUP BY 语句根据一个或多个列对结果集进行分组。
在分组的列上我们可以使用 COUNT, SUM, AVG,等函数。

SELECT column_name, function(column_name)
FROM table_name
WHERE column_name operator value
GROUP BY column_name;

2. with rollup
WITH ROLLUP 可以实现在分组统计数据基础上再进行相同的统计（SUM,AVG,COUNT…）。

3. having
having是在分组后过滤，where在分组前过滤，不冲突，可以同时使用;
having是用来过滤的，group by是限定分组;
select语句中没有聚合函数的使用时也可以用having。
```

### coalesce函数

```
select coalesce(a,b,c);

参数说明：如果a==null,则选择b；如果b==null,则选择c；如果a!=null,则选择a；如果a b c 都为null ，则返回为null（没意义）。
```

### join\left join\right join连接

```mysql
INNER JOIN（内连接,或等值连接）：获取两个表中字段匹配关系的记录。
LEFT JOIN（左连接）：获取左表所有记录，即使右表没有对应匹配的记录。
RIGHT JOIN（右连接）： 与 LEFT JOIN 相反，用于获取右表所有记录，即使左表没有对应匹配的记录。
```

![join理解.png](https://s2.loli.net/2022/10/12/7CmY5PQG2zMuBnT.png)

### null值处理

```mysql
IS NULL: 当列的值是 NULL,此运算符返回 true。

IS NOT NULL: 当列的值不为 NULL, 运算符返回 true。

IFNULL() : select * , columnName1+ifnull(columnName2,0) from tableName;

连接时，null = null 不相同即无法匹配
```

### REGEXP正则匹配

```mysql
regexp关键字，专属正则匹配，注意与like区分
select id from student where name regexp '[^李王]'

^	匹配输入字符串的开始位置。如果设置了 RegExp 对象的 Multiline 属性，^ 也匹配 '\n' 或 '\r' 之后的位置。若放在括号里面，则表示匹配不在括号中的任何字符，如[^abc]匹配非abc字符。

$	匹配输入字符串的结束位置。如果设置了RegExp 对象的 Multiline 属性，$ 也匹配 '\n' 或 '\r' 之前的位置。
.	匹配除 "\n" 之外的任何单个字符。要匹配包括 '\n' 在内的任何字符，请使用像 '[.\n]' 的模式。

[...]	字符集合。匹配所包含的任意一个字符。例如， '[abc]' 可以匹配 "plain" 中的 'a'。

[^...] | [!...]	负值字符集合。匹配未包含的任意字符。例如， '[^abc]' 可以匹配 "plain" 中的'p'。

p1|p2|p3	匹配 p1 或 p2 或 p3。例如，'z|food' 能匹配 "z" 或 "food"。'(z|f)ood' 则匹配 "zood" 或 "food"。

*	匹配前面的子表达式零次或多次。例如，zo* 能匹配 "z" 以及 "zoo"。* 等价于{0,}。

+	匹配前面的子表达式一次或多次。例如，'zo+' 能匹配 "zo" 以及 "zoo"，但不能匹配 "z"。+ 等价于 {1,}。

{n}	n 是一个非负整数。匹配确定的 n 次。例如，'o{2}' 不能匹配 "Bob" 中的 'o'，但是能匹配 "food" 中的两个 o。

{n,m}	m 和 n 均为非负整数，其中n <= m。最少匹配 n 次且最多匹配 m 次。
```

###  事务

```mysql
事务主要用于处理操作量大，复杂度高的数据。

1. 在 MySQL 中只有使用了 Innodb 数据库引擎的数据库或表才支持事务。
2. 事务处理可以用来维护数据库的完整性，保证成批的 SQL 语句要么全部执行，要么全部不执行。
3. 事务用来管理 insert,update,delete 语句

4. 事务控制语句
BEGIN 或 START TRANSACTION 显式地开启一个事务；

COMMIT 也可以使用 COMMIT WORK，不过二者是等价的。COMMIT 会提交事务，并使已对数据库进行的所有修改成为永久性的；

ROLLBACK 也可以使用 ROLLBACK WORK，不过二者是等价的。回滚会结束用户的事务，并撤销正在进行的所有未提交的修改；

SAVEPOINT identifier，SAVEPOINT 允许在事务中创建一个保存点，一个事务中可以有多个 SAVEPOINT；

RELEASE SAVEPOINT identifier 删除一个事务的保存点，当没有指定的保存点时，执行该语句会抛出一个异常；

ROLLBACK TO identifier 把事务回滚到标记点；

SET TRANSACTION 用来设置事务的隔离级别。InnoDB 存储引擎提供事务的隔离级别有READ UNCOMMITTED、READ COMMITTED、REPEATABLE READ 和 SERIALIZABLE。

5. 处理事务方法
5.1 用 BEGIN, ROLLBACK, COMMIT来实现
        BEGIN 开始一个事务
        ROLLBACK 事务回滚
        COMMIT 事务确认
5.2 直接用 SET 来改变 MySQL 的自动提交模式
		SET AUTOCOMMIT=0 禁止自动提交
		SET AUTOCOMMIT=1 开启自动提交
		
6. 保留点	
    使用保留点 SAVEPOINT
    savepoint 是在数据库事务处理中实现“子事务”（subtransaction），也称为嵌套事务的方法。事务可以回滚到 savepoint 而不影响 savepoint 创建前的变化, 不需要放弃整个事务。

    ROLLBACK 回滚的用法可以设置保留点 SAVEPOINT，执行多条操作时，回滚到想要的那条语句之前。
    使用 SAVEPOINT
    SAVEPOINT savepoint_name;    // 声明一个 savepoint

    ROLLBACK TO savepoint_name;  // 回滚到savepoint
    删除 SAVEPOINT
    保留点再事务处理完成（执行一条 ROLLBACK 或 COMMIT）后自动释放。

    MySQL5 以来，可以用:
    RELEASE SAVEPOINT savepoint_name;  // 删除指定保留点
```

### alter命令

```mysql
当我们需要修改数据表名或者修改数据表字段时

1. 添加字段 - add
	alter table 表名 add 字段名 字段类型
	alter table 表名 add 字段名 字段类型 first // 指定添加到第一列
	alter table 表名 add 字段名 字段类型 after 字段2 // 指定添加到某个字段后面
	
2. 修改字段 - modify&change
	alter table 表名 modify 字段名 字段类型
	alter table 表名 change 要修改字段名 新字段名 新类型
	alter table 表名 modify 字段名 字段类型 not null default 1 // 指定非null及默认值
	
	alter table 表名 alter 字段 set default 1 // 指定字段设置默认值
	alter table 表名 alter 字段 drop default // 指定字段删除默认值属性
	
3. 删除字段 - drop
	alter table 表名 drop 字段名
	
4. 修改数据表引擎类型
	alter table 表名 engine = myisam
	
5. 修改表名
	alter table 表名 rename to 新表名
```

### 索引

```mysql
索引可以大大提高MySQL的检索速度。

1. 单列索引
	即一个索引只包含单个列
2. 组合索引
	即一个索引包含多个列（一个表可以有多个单列索引，但这不是组合索引。）
	
需要确保该索引是应用在 SQL 查询语句的条件(一般作为 WHERE 子句的条件)。	
	
普通索引
	1. 创建索引
	create index 索引名称 on 表名(以哪个字段作索引-字段名)
	2. 添加索引
	alter table 表名 add index 索引名称(以哪个字段作索引-字段名)
	3. 创建表时指定
	CREATE TABLE mytable(  
    	ID INT NOT NULL,   
    	username VARCHAR(16) NOT NULL,  
    	INDEX [indexName] (username(length))  
    );  
    4. 删除索引
    drop index [索引名称] on 表名
    
唯一索引    
	它与前面的普通索引类似，不同的就是：索引列的值必须唯一，但允许有空值。如果是组合索引，则列值的组合必须唯一。
	1. 创建唯一索引
	create unique index 索引名称 on 表名(针对哪个字段作唯一索引-字段名(length))
	2. 修改表结构来添加唯一索引
	alter table 表名 add unique [索引名称] (字段名(length))
	3. 创建表时候指定
	CREATE TABLE mytable(  
        ID INT NOT NULL,   
        username VARCHAR(16) NOT NULL,  
        UNIQUE [indexName] (username(length))  
    );  
```

## 2022.03.28

### SQL分类

```mysql
DQL(Data Query Language) - 数据查询语言
	代表关键字： select

DML(Data Manipulation Language) - 数据操纵语言
	代表关键字：insert\delete\update

DDL(Data Definition Language) - 数据定义语言
	代表关键字：create\drop\alter

TCL（Transactional Control Language）- 事务控制语言
	代表关键字：commit\rollback

DCL(Data Control Language) - 数据控制语言
	代表关键字：grant\revoke
```



### 单表查询执行顺序

```mysql
select 
	...
from 
	...
where 
	...
group by
	...
having 
	...
order by
	...
limit
	...
	
1. from
2. where
3. group by
4. having
5. select
6. order by
7. limit
```

### 单行处理函数

```mysql
单行处理函数特点：输入多行，输出多行

1. lower（转换小写）
2. upper（转换大写）
3. substr(取子串) substr(被截取字符串,起始下标，截取长度) // 注意起始下标是1
4. length（取长度）
5. trim（去空格）
6. str_to_date（将字符串转换成日期）
7. date_format（格式化日期）
8. format（设置千分位）
9. round（四舍五入）
10. rand（随机数）
11. case...when...then...when...then...end（条件分支）
12. ifnull（若为空则默认值）
```



### 多行处理函数（分组函数）

```mysql
多行处理函数特点：输入多行，最终输出一行

1. count 计数
2. sum 求合
3. avg 求平均
4. max 最大值
5. min 最小值

其中需要注意的是，聚合函数不能嵌套使用，如max(count(1))这种，可以使用子查询来拆分，再查询

注意：
	1. 分组函数在使用的时候必须先进行分组，然后才能使用；
	2. 如果你没有对数据进行分组，整张表默认为一组。
	3. 在一条select语句钟，如果有group by语句的话，select后面只能跟："参加分组的字段，以及分组函数，其他一律不能跟"
	4. where和having，优先选择where,若实在完成不了，则选择having
```

### distinct

```mysql
1. 出现在一个字段前面表示对该字段进行去重

2. 出现在两个字段前面表示两个字段联合起来去重

3. 只能出现在所有字段得前面
```

### 连接查询

```mysql
内连接 
	含义：（完全能够匹配上这个条件的数据都查出来，无主次关系，匹配不上的就不查出来了，因此可能存在数据变少）
	
	1. 等值连接 （条件值相等）
	2. 非等值连接 （条件值不相等）
	3. 自连接 （一张表看作两张表，自己跟自己连接查询）

外连接
	含义：（有主次关系，将能匹配上这个条件的数据都查出来，而且需要将主表未匹配上的数据也要显示出来，因此可能存在数据变多）
	
	1. 左外连接（左连接） left join 
		同理下
	
	2. 右外连接（右连接） right join
		表示将join关键字右边的这张表看成主表，主要是为了将这张表的数据全部查询出来，捎带关联查询	
		
因此：外连接的查询结果条数一定是 >= 内连接的查询结果条数		
	
全连接

92SQL语法：
	select
		a.name,b.age
	from
		testA a, testB b
	where 
		a.id = b.id 
		and 后面加条件
	
99SQL语法：
	select
		a.name,b.age
	from
		testA a
    join    // 逗号变join
        testB b
	on // where变on
		a.id = b.id
	where
    	... // 条件清晰
    	
三张表、四张表怎么连接？
	select 
		...
	from 
		a
	join
		b
	on
		a和b的连接条件
	join
		c
	on 
		a和c的连接条件
	join
		d
	on
		a和d的连接条件
		
```

## 2022.03.30

### 子查询

```mysql
1. select语句中嵌套select语句，被嵌套的select语句称为子查询

2. 子查询可以出现在：
	select
		..(select) // 对于select后面的子查询来说，这个子查询只能一次返回1条结果，多于1条就报错
	from 
		..(select)
	where
		..(select)
```

## 2022.04.02

### limit

```
1. 完整用法
	limit startIndex, length 
	// 起始位置从0开始
	
2. 缺省用法
	limit 5 // 去前5
	
3. mysql中limit在order by之后执行
	select 
		...
	from
		...
	order by
		...
	limit 
		...
		
4. 分页公式
	limit (pageNo - 1)*pageSize, pageSize
```

### 常见的数据类型

```
varchar(最长255)
	可变把长度的字符串
	比较智能，节约空间
	会根据实际的数据长度动态分配空间
	
	优点：节省空间
	缺点：需要动态分配空间，速度慢
char(最长255)
	定长字符串
	不管实际的数据长度是多少
	分配固定长度的空间去存储数据
	使用不恰当的时候，可能会导致空间的浪费
	
	优点：不需要动态分配空间，速度快
	缺点：使用不恰当的时候，可能会导致空间的浪费
	
int(最长11)
	数字中的整数型，等同于java中的int
	
bigint
	数字中的长整型，等同于java中的long

float
	单精度浮点型数据

double
	双精度浮点型数据
	
date
	短日期类型
	
datetime
	长日期类型
	
clob
	字符大对象
	对多可以存储4G的字符串
	比如：存储一篇文章、存储一个说明
	超过255个字符的都要采用CLOB字符大对象来存储
	Character Large OBject: CLOB
	
blob
	二进制大对象
	Binary Large OBject
	专门用来存储图片、声音、视频等流媒体数据
	往BLOB类型的字段上插入数据的时候，例如一个图片、视频等
	你需要使用IO流才行
	
```

### insert

```mysql
1. 
insert into 表名(字段名1，字段名2，字段名3...) values(值1，值2，值3)
字段名和值要一一对应

2. 
insert into 表名 values(值1，值2，值3)

3.
str_to_date （字符串转换为日期类型date）
%Y 年
%m 月
%d 日
%h 时
%i 分
%s 秒
str_to_date('03-12-1994','%m-%d-%Y')
// 若提供的日期字符串格式为：%Y-%m-%d 如'1994-03-12' 则可以省略str_to_date函数，mysql会自动处理

4. date_format(日期类型数据，'日期格式')
// 注意mysql中查询语句中，会自动将数据库中的date类型转换成varchar类型，并且采用的格式是默认格式'%Y-%m-%d'

5. insert into 表名 select * from 另一张表

6. 一次插入多条记录
	insert into 表名(字段1，字段2，字段3) values(),(),()....
```

## 2022.04.03

### delete

```mysql
1.逻辑删除
delete from 表名 // 这种删除比较慢

delete语句删除数据的原理
	表中的数据被删除了，但是这个数据在硬盘上的真实存储空间不会被释放；
	缺点：删除效率比较低；
	优点：支持回滚
	
多表删除时，delete和from之间必须要写明想要删除记录的表名	
	
2.物理删除
truncate table 表名

truncate 语句删除数据的原理
	效率比较高，表被一次截断，物理删除
	缺点：不支持回滚
	优点：快速
```

### 约束

```mysql
1. 什么是约束?
	constraint
	在创建表的时候，可以给表中的字段加上一些约束，来保证这个表中的数据的完整性，有效性，主要是为了保证表中的数据有效。
	
2. 约束包括哪些？
	2.1 
	非空约束：not null
	
	2.2
	唯一性约束：unique
		单列：
			字段名 unique // 列级约束
		联合唯一：
			字段1，
			字段2，
			unique(字段1，字段2..) // 表级约束
	
    // 注意：在mysql中，如果一个字段同时被not null和unique约束的话，该字段自动变成主键字段（但oracle中不一样）
	
    2.3
	主键约束：primary key（简称PK）
		列级约束：
			字段名 primary key 
		表级约束：
			primary key(字段名)
		复合主键：
			primary key(字段1，字段2)
			
	// 注意：一张表，主键约束只能有一个		
	
	主键值建议使用：
		int
		bigint
		char等类型
		不建议使用：varchar来做主键，主键值一般都是数字，一般都是定长
		
	主键除了：单一主键和复合主键外，还可以分为：
    	自然主键：是一个自然数，和业务没关系
    		// 使用auto_increment 从1开始自增
    	业务主键：和业务做紧密关联。
	
    2.4
	外键约束：foreign key（简称FK）
		当两站表形成外键约束时，被引用来作为外键的表叫做"父表"，另外一张表叫做"子表"
		
		// 注意：
		A->父表
		B->子表
		
		删除表的顺序：
			先删子（B）、再删父（A）
		创建表的顺序：
        	先创建父（A）、再创建子（B）
        删除数据的顺序：
        	先删子（B）、再删父（A）
        插入数据的顺序：
        	先插入父（A）、再插入子（B）
        	
       foreign key(外键字段名) references 表名（该表字段）
       // 思考
       子表中的外键引用的父表中的某个字段，被引用的这个字段必须是主键吗？
       不一定是主键，但至少具有unique约束
       
       外键值可以为NULL吗？
       可以为NULL
	
	2.5
	检查约束：check(mysql不支持，oracle支持)
```

### 存储引擎

```mysql
1. 什么是存储引擎
	其实就是一个表存储/组织数据的方式，不同的存储引擎，表结构存储数据的方式不同。

2. 如何查看当前表的存储引擎
	show create table 表名
	
	如何添加、指定存储引擎？
		在建表的时候在最后小括号的右边使用：
			ENGINE来指定"存储引擎"
			CHARSET来指定"字符编码方式"
		mysql中默认的：
        	ENGINE:InnoDB
        	CHARSET:utf8
        	
3. 如何查看当前mysql支持哪些存储引擎？
	show engines \G
```

### 事务

```mysql
1. 什么是事务？
	就是一个完整的业务逻辑，最小的操作工作单元，要么同时成功，要么同时失败

2. 只有DML语句才会有事务这一说，其他语句和事务无关！
	insert
	update
	delete
	
3. 事务：就是批量的DML语句同时成功，或者同时失败！

4. 事务特性
	A: 原子性
		说明事务是最小的工作单元，不可再分
	C: 一致性
		所有事务要求，在同一个事务中，所有操作必须同时成功，或者同时失败，以保证数据的一致性
	I: 隔离性
		A事务和B事务之间具有一定的隔离
	D: 持久性
		事务最终结束的一个保障，事务提交，就相当于将没有保存到硬盘上的数据保存到硬盘上
		
5. 事务隔离
	5.1 (没有提交可以读到)
	读未提交：read uncommitted（最低的隔离级别）
	什么是读未提交？
		事务A可以读取到事务B未提交的数据
	问题？
		脏读现象（Dirty Read）
	
	5.2（提交之后才能读到）
	读已提交：read committed
	什么是读已提交？
		事务A只能读取到事务B提交之后的数据
	解决什么？
		解决脏读现象
	问题？
		不可重复读取数据（比如第一次读3条，下一次读5条）
	oracle数据库默认的级别
    
    5.3（提交之后也读不到）
    可重复读：repeatable read
    什么是可重复读？
    	事务A开启之后，不管多久，每一次在事务A中读取到得数据都是一致的，即使事务B将数据已经修改，并且提交了，事务A读取到的数据还是没有发生改变
    解决什么？
    	解决不可重复读
    问题？
    	可能会出现幻影读，每一次读取到的数据都是幻象，不真实
    mysql中默认的级别
    
    5.4
    序列化/串行化：serializable（最高的隔离级别）
    什么是？
    	表示事务排队，不能并发
```

## 2022.04.04

### 索引

```mysql
1. 什么是索引
	索引是在数据库表的字段上添加的，是为了提供查询效率存在的一种机制，一张表的一个字段可以添加一个索引，当然多个字段联合起来也可以添加索引
	
2. mysql查询方式
	2.1 全表扫描
	2.2 根据索引检索

3. 索引实现简易原理
	3.1
	在任何数据库中"主键"上都会自动添加索引对象，如id字段上自动添加索引，因为id是PK；在mysql中一个字段上如果有unique约束的话，也会自动创建索引对象
	
	3.2
	在任何数据库中，任何一张表的任何一条记录在硬盘存储上都有一个硬盘的物理存储编号
	
	3.3
	在mysql中，索引是一个单独的对象，不同的存储引擎以不同的形式存在，在MyISAM存储引擎中，索引存储在一个.MYI文件中；在InnoDB存储引擎中索引存储在一个逻辑名称叫做tablespace中；在Memory存储引擎中索引被存储在内存中。不管索引存储在哪里，索引在mysql中都是一个树的形式存在（自平衡二叉树：B-Tree）
	
4. 心得
	4.1
	在mysql中，主键上，以及unique字段上都会自动添加索引
	4.2
	在什么条件下，我们会考虑给字段添加索引？
	条件1：数据量庞大（跟硬件环境有关）
	条件2：该字段经常出现在where的后面，以条件的形式存在，也就是说这个字段经常被扫描
	条件3：该字段很少的DML(insert delete update)操作（因为DML之后，索引需要重新排序）
	建议：不要随意添加索引，因为索引也是需要维护的，太多的话反而会降低系统的性能，建议通过主键查询，通过unique约束的字段进行查询。
	
5. 创建、删除、查看索引
	create index 索引名 on 表名（字段名）
	drop index 索引名 on 表名
	explain select * from 表名
	
6. 索引失效情况
	6.1
	select * from 表名 where 字段名 like '%T'
	表中即使字段添加了索引，也不会走索引，因为是模糊匹配中以'%'开头了，经量避免模糊查询的时候以'%'开始，这是一种优化的手段/策略。
	
	6.2
	使用or的时候会失效，如果使用or那么要求or两边的条件字段都要有索引，才会走索引，如果其中一边有一个字段没有索引，那么另一个字段上的索引也会失效，所以这就是不建议使用or的原因。
	
	6.3
	使用复合索引的时候，没有使用左侧列查找，索引失效
	什么是复合索引？
		两个字段，或者更多字段联合起来添加设置一个索引，叫做复合索引。
	如：create index A_B_index on 表名(A,B)
	若使用A字段作条件 则走索引，若使用B字段作条件则不走
	
	6.4
	在where当中使用索引列参加运算，索引失效
	如：create index A_index on 表名(A)
		select * from 表名 where A+1 = 9
	
    6.5
    在where当中使用索引列来作函数参数，索引失效
    如：create index A_index on 表名(A)
		select * from 表名 where lower(A) = 'test'
		
7. 索引分类
	单一索引：一个字段上添加索引
	复合索引：两个字段或者更多字段上添加索引
	
	主键索引：主键上添加索引
	唯一性索引：具有unique约束得字段上添加索引（唯一性比较弱得字段上添加索引用处不大）
```

### 视图

```mysql
1. 什么是视图？
	view: 站在不同得角度去看待同一份数据

2. 如何创建、删除视图
	create view 视图名 as select * from xxx
	// 注意：只有DQL语句才能以view的形式创建
	create view 试图名 (字段1，字段2，字段3...) as select ... 其中的【字段】可以省略
	
	drop view 视图名

3. 有什么用？
	我们可以面向视图对象进行增删改查，对视图对象的增删改查会导致原表被操作（即影响到原表数据）
	主要就是为了缩短精简我们的sql语句
```

### DBA命令

```
导出导入
1. 数据导出
	注意：在windows的dos命令窗口中：
		mysqldump 数据库名>导出位置（如盘符路径D:\导出文件名称.sql） -u用户名 -p密码
	同样也可以导出指定表
		mysqldump 数据库名 表名>导出位置（如盘符路径D:\导出文件名称.sql） -u用户名 -p密码

2. 数据导入
	注意：需要登录到数据库服务器上
		2.1 首先创建数据库：create database 数据库名
		2.2 使用数据库：use 数据库名
		2.3 初始化数据库：soure 脚本文件路径
```

### grant命令

```mysql
grant 权限 on 数据库对象 to 用户 # 通过命令”show privileges;”可以查看
1. 对[testdb]库下给[common_user@]开头[拥护]赋予 查询、插入、更新、删除权限
	grant select, insert, update, delete on testdb.* to common_user@’%’
	grant select, insert, update, delete on testdb.orders to dba@localhost;
	
2. 创建表、索引、视图、存储过程、函数等
	grant create on testdb.* to developer@’192.168.0.%’;
    grant alter on testdb.* to developer@’192.168.0.%’;
    grant drop on testdb.* to developer@’192.168.0.%’;
    grant references on testdb.* to developer@’192.168.0.%’;
    
    grant create temporary tables on testdb.* to developer@’192.168.0.%’;
    grant index on testdb.* to developer@’192.168.0.%’;
    
    grant show view on testdb.* to developer@’192.168.0.%’;
    grant create view on testdb.* to developer@’192.168.0.%’;
    
3. 某个库或所有库权限
	grant all privileges on testdb to dba@’localhost’
	grant all on *.* to dba@’localhost’
```

### 建表后单独添加某个表外键

```mysql
alter table 表名 add constraint 外键名 foreign key (本表外键列名) references 主表名（主表主键列名）
```

## 2022.04.06

### 数据库设计三范式

```mysql
第一范式：
	要求任何一张表必须有主键，每一个字段原子性不可再分。

第二范式：
	建立在第一范式的基础上，要求所有非主键字段完全依赖主键，不要产生部分依赖
	
第三范式：
	建立在第二范式的基础上，要求所有非主键字段直接依赖主键，不要产生依赖传递
	
理论总结：
	一对多：
		"一对多，两张表，多的表加外键"
	多对多：
    	"多对多，三张表，关系表＋两个外键"
    一对一：
    	实际开发过程中，一张表字段太多，可能需要拆表。
    	"一对一，外键+unique表示唯一"
    	
实际：
	数据库设计三范式是理论上的；
	实践和理论有时候会有偏差；
	最终的目的都是为了满足客户的需求，有时候会拿冗余换执行速度；
	因为在sql中，表和表之间连接的次数越多，效率越低（笛卡尔积）；
	有的时候会冗余，但是为了减少表的连接次数，这样做也是合理的，并且对开发人员来说，sql语句的编写难度会降低。
```

## 2022.04.12

### 34道作业题

#### 部门表： dept

```mysql
+--------+------------+----------+
| DEPTNO | DNAME      | LOC      |
+--------+------------+----------+
|     10 | ACCOUNTING | NEW YORK |
|     20 | RESEARCH   | DALLAS   |
|     30 | SALES      | CHICAGO  |
|     40 | OPERATIONS | BOSTON   |
+--------+------------+----------+
```

#### 员工表：emp

```mysql
+-------+--------+-----------+------+------------+---------+---------+--------+
| EMPNO | ENAME  | JOB       | MGR  | HIREDATE   | SAL     | COMM    | DEPTNO |
+-------+--------+-----------+------+------------+---------+---------+--------+
|  7369 | SMITH  | CLERK     | 7902 | 1980-12-17 |  800.00 |    NULL |     20 |
|  7499 | ALLEN  | SALESMAN  | 7698 | 1981-02-20 | 1600.00 |  300.00 |     30 |
|  7521 | WARD   | SALESMAN  | 7698 | 1981-02-22 | 1250.00 |  500.00 |     30 |
|  7566 | JONES  | MANAGER   | 7839 | 1981-04-02 | 2975.00 |    NULL |     20 |
|  7654 | MARTIN | SALESMAN  | 7698 | 1981-09-28 | 1250.00 | 1400.00 |     30 |
|  7698 | BLAKE  | MANAGER   | 7839 | 1981-05-01 | 2850.00 |    NULL |     30 |
|  7782 | CLARK  | MANAGER   | 7839 | 1981-06-09 | 2450.00 |    NULL |     10 |
|  7788 | SCOTT  | ANALYST   | 7566 | 1987-04-19 | 3000.00 |    NULL |     20 |
|  7839 | KING   | PRESIDENT | NULL | 1981-11-17 | 5000.00 |    NULL |     10 |
|  7844 | TURNER | SALESMAN  | 7698 | 1981-09-08 | 1500.00 |    0.00 |     30 |
|  7876 | ADAMS  | CLERK     | 7788 | 1987-05-23 | 1100.00 |    NULL |     20 |
|  7900 | JAMES  | CLERK     | 7698 | 1981-12-03 |  950.00 |    NULL |     30 |
|  7902 | FORD   | ANALYST   | 7566 | 1981-12-03 | 3000.00 |    NULL |     20 |
|  7934 | MILLER | CLERK     | 7782 | 1982-01-23 | 1300.00 |    NULL |     10 |
+-------+--------+-----------+------+------------+---------+---------+--------+
```

#### 薪资等级表

```mysql
+-------+-------+-------+
| GRADE | LOSAL | HISAL |
+-------+-------+-------+
|     1 |   700 |  1200 |
|     2 |  1201 |  1400 |
|     3 |  1401 |  2000 |
|     4 |  2001 |  3000 |
|     5 |  3001 |  9999 |
+-------+-------+-------+
```

##### 1.找出每个部门最高薪资的人员名称

###### (若找出每个部门最高薪资，我们首先想到：以deptno分组，再聚合max(sal)可以得到每个部门最高薪资，此时select后面最多跟deptno和聚合函数，还要找人员名称，此时我们应该想到人员名称也就是emp，因此需要进行连接查询出名称，关键是必须以我们这个集合为主表，右关联出所有薪资等于最高薪资的人员名称，若以emp为主表就会查出所有的人员)

###### （当我们聚合完毕后还需要查对应聚合行的其他字段时，需要考虑使用连接查询）

```mysql
select 
 	e.ename, t.max_sal sal, t.deptno
 from 
 	emp e
 right join
 	(select deptno,max(p.sal) max_sal from emp p group by deptno) t 
 	on 
 	e.sal = t.max_sal
 	// error 少了个deptno相同条件
 	and
 	e.deptno = t.deptno;
+-------+---------+--------+
| ename | sal     | deptno |
+-------+---------+--------+
| FORD  | 3000.00 |     20 |
| SCOTT | 3000.00 |     20 |
| BLAKE | 2850.00 |     30 |
| KING  | 5000.00 |     10 |
+-------+---------+--------+
4 rows in set (0.00 sec) 	
```

##### 2.找出哪些人的薪资在部门的平均薪资之上

###### （利用了包含在where条件中的子查询）

```mysql
select 
	ename,sal 
from 
	emp 
where 
	sal > (select avg(sal) from emp) 
order by 
	sal desc;
+-------+---------+
| ename | sal     |
+-------+---------+
| KING  | 5000.00 |
| SCOTT | 3000.00 |
| FORD  | 3000.00 |
| JONES | 2975.00 |
| BLAKE | 2850.00 |
| CLARK | 2450.00 |
+-------+---------+
// error
这题理解有问题：找出那些人的薪资在其对应部门的平均薪资之上？
select
	t.x, e.ename, e.sal
from 
	emp e
join
	(select deptno,avg(sal) avg_sal from emp group by deptno) t
on
	e.deptno = t.deptno
	and
	e.sal > t.avg_sal;
```

##### 3.找出部门中（所有人的）平均的薪资等级

###### （既然所有人的，则考虑使用员工表作主表进行左关联，且是一个非等值连接，再以deptno分组，再针对分组进行平均等级的聚合）

```mysql
select 
	e.deptno, avg(s.grade) 
from 
	emp e 
left join 
	salgrade s 
on 
	e.sal between s.losal and s.hisal 
group by
	e.deptno
order by 
	e.deptno;
+--------+-----------+
| deptno | avg_garde |
+--------+-----------+
|     10 |    3.6667 |
|     20 |    2.8000 |
|     30 |    2.5000 |
+--------+-----------+
```

##### 4.找出员工表中的最高薪资（不用组函数max）多解法

###### (不用max那么就考虑以sal排倒序取第一个)

###### (解法2：采用自连接，条件是a中的sal是否小于b中的sal，这样除了最大薪资都会被筛选出来，再去个重，最后使用not in收尾)

```mysql
解法1：
select 
	sal
from 
	emp
order by 
	sal desc
limit 1;
+---------+
| sal     |
+---------+
| 5000.00 |
+---------+

// error
select
	sal
from 
	emp
where
	sal not in (
        select distinct a.sal 
        from 
        	emp a 
        join 
        	emp b 
        on 
    		a.sal < b.sal // 过滤出非最高薪资集合
    ) // 这手not in 集合是我没想到的 我还想怎么转换成逗号分隔的字符串再使用
```

##### 5.找出平均薪水最高的部门的部门编号 多解法

###### （同理上面，以deptno分组后，以平均薪资排倒序，取第一个）

```mysql
解法1：
select
	deptno
from 
	emp
group by
	deptno
order by 
	avg(sal) desc
limit 1;
+--------+
| deptno |
+--------+
|     10 |
+--------+
```

##### 6.找出平均薪资最高的部门的部门名称

###### （以员工表与部门表进行连接，再以deptno进行分组，再以平均薪资作倒序排，取第一个，关联出dname）

###### （利用where条件子查询，先取出平均薪资最高的部门deptno，再where条件查询部门表，找出名称，但效率不高）

```mysql
解法1：
select 
	d.dname
from 
	emp e
join
	dept d
on 
	e.deptno = d.deptno
group by e.deptno
order by 
	avg(e.sal) desc
limit 1;
+------------+
| dname      |
+------------+
| ACCOUNTING |
+------------+
1 row in set (0.00 sec)

解法2：
select 
	dname
from 
	dept
where deptno = (select
	deptno
from 
	emp
group by
	deptno
order by 
	avg(sal) desc
limit 1;)
+------------+
| dname      |
+------------+
| ACCOUNTING |
+------------+
1 row in set (0.01 sec)
```

##### 7.找出平均薪资的等级最低的部门的部门名称

###### (首先两个字段则表示使用连接，部门表示以deptno分组，再以分组集合进行求平均排倒序，取第一个的dname，每次这种我都是使用排序取1的方法，感觉还是没找到更优解)

```mysql
select
	d.dname
from 
	emp e
join 
	dept d
on 
	e.deptno = d.deptno
group by
	e.deptno
order by
	avg(e.sal)
limit 1;
+-------+
| dname |
+-------+
| SALES |
+-------+
1 row in set (0.00 sec)

// error 特么的 又是审题失败
select
 	t.*, s.grade
from 
	(select 
     	d.dname,avg(sal) avg_sal
     from 
     	emp e
     join
     	dept d
     on
     	e.deptno = d.deptno
     group by
     	d.dname
    ) 
join
	salgrade s
on 
	t.avg_sal bewteen s.losal and s.hisal
where 
	s.grade = (
    	select grade from salgrade where (
        	select avg(sal) avg_sal 
            from
            	emp
            group by 
            	deptno
            order by
            	avg_sal limit 1
            
        ) between losal and hisal
    )
```

##### 8.找出比普通员工（员工编码没有在mgr字段上出现的即为普通员工）的最高薪资还要高的领导人名称

###### (此题没做出来，原因是没搞懂in or not in语法，一直以为后面只能跟逗号分隔的字符串，结果in or not in后面跟的是集合，不知道是不是我把oracle用法搞混了)

###### （但需要注意not in后面跟的集合中不能包含有为null的行数据，不然整个结果都为空，需要手动排除为Null的行数据）

```mysql
select 
	sal 
from 
	emp 
where sal > (
    select 
    	max(sal)
    from 
    	emp
    where 
    	empno not in (
        select distinct mgr from emp where mgr is not null // 所有领导
    )
)
```

##### 9.找出薪资最高得前五名员工

```mysql
select 
	ename, sal
from 
	emp
order by 
	sal desc
limit 
	5;
+-------+---------+
| ename | sal     |
+-------+---------+
| KING  | 5000.00 |
| SCOTT | 3000.00 |
| FORD  | 3000.00 |
| JONES | 2975.00 |
| BLAKE | 2850.00 |
+-------+---------+
5 rows in set (0.00 sec)
```

##### 10.找出薪资最高得第六到第十名员工

```mysql
select 
	ename,sal
from 
	emp
order by
	sal desc
limit 
	5,5 // (5,5] 从第五位起不包括，长度5
+--------+---------+
| ename  | sal     |
+--------+---------+
| CLARK  | 2450.00 |
| ALLEN  | 1600.00 |
| TURNER | 1500.00 |
| MILLER | 1300.00 |
| WARD   | 1250.00 |
+--------+---------+
5 rows in set (0.00 sec)
```

##### 11.找出最后入职的5名员工

```mysql
select 
	ename, hiredate
from 
	emp
order by
	hiredate desc
limit 5;
+--------+------------+
| ename  | hiredate   |
+--------+------------+
| ADAMS  | 1987-05-23 |
| SCOTT  | 1987-04-19 |
| MILLER | 1982-01-23 |
| JAMES  | 1981-12-03 |
| FORD   | 1981-12-03 |
+--------+------------+
5 rows in set (0.00 sec)
```

##### 12.找出每个薪资等级有多少名员工

```mysql
select
	s.grade, count(1)
from 
	emp e
left join
	salgrade s
on 
	e.sal between s.losal and s.hisal
group by 
	s.grade;
+-------+----------+
| grade | count(1) |
+-------+----------+
|     1 |        3 |
|     3 |        2 |
|     2 |        3 |
|     4 |        5 |
|     5 |        1 |
+-------+----------+
5 rows in set (0.00 sec)	
```

##### 14.找出所有员工及领导的姓名

```mysql
select 
	e.ename, ifnull(p.ename,'没有上级')
from
	emp e
left join 
	emp p
on 
	e.mgr = p.empno;
+--------+--------+
| ename  | name   |
+--------+--------+
| SMITH  | FORD   |
| ALLEN  | BLAKE  |
| WARD   | BLAKE  |
| JONES  | KING   |
| MARTIN | BLAKE  |
| BLAKE  | KING   |
| CLARK  | KING   |
| SCOTT  | JONES  |
| KING   | ?????? |
| TURNER | BLAKE  |
| ADAMS  | SCOTT  |
| JAMES  | BLAKE  |
| FORD   | JONES  |
| MILLER | CLARK  |
+--------+--------+
14 rows in set, 1 warning (0.00 sec)
```

##### 15.找出受雇日期早于其直接上级的 所有员工的编号、姓名、部门名称

```mysql
select 
	e.empno, e.ename, d.dname
from 
	emp e
join 
	emp p
on 
	e.mgr = p.empno and e.hiredate < p.hiredata
join
	dept d
on 
	e.deptno = d.deptno;
+-------+-------+------------+
| empno | ename | dname      |
+-------+-------+------------+
|  7369 | SMITH | RESEARCH   |
|  7499 | ALLEN | SALES      |
|  7521 | WARD  | SALES      |
|  7566 | JONES | RESEARCH   |
|  7698 | BLAKE | SALES      |
|  7782 | CLARK | ACCOUNTING |
+-------+-------+------------+
6 rows in set (0.00 sec)	
```

##### 16.找出部门名称和这些部门的员工信息，同时列出哪些没有员工的部门

###### (这里很明显的提示了需要列出没有员工的部门，此时我们应该以dept作为主表，查所有部门，顺便关联出包含员工的部门)

```mysql
select 
	d.dname,e.*
from 
	emp e
right join 
	dept d
on 
	e.deptno = d.deptno;
+------------+-------+--------+-----------+------+------------+---------+---------+--------+
| dname      | EMPNO | ENAME  | JOB       | MGR  | HIREDATE   | SAL     | COMM    | DEPTNO |
+------------+-------+--------+-----------+------+------------+---------+---------+--------+
| ACCOUNTING |  7934 | MILLER | CLERK     | 7782 | 1982-01-23 | 1300.00 |    NULL |     10 |
| ACCOUNTING |  7839 | KING   | PRESIDENT | NULL | 1981-11-17 | 5000.00 |    NULL |     10 |
| ACCOUNTING |  7782 | CLARK  | MANAGER   | 7839 | 1981-06-09 | 2450.00 |    NULL |     10 |
| RESEARCH   |  7902 | FORD   | ANALYST   | 7566 | 1981-12-03 | 3000.00 |    NULL |     20 |
| RESEARCH   |  7876 | ADAMS  | CLERK     | 7788 | 1987-05-23 | 1100.00 |    NULL |     20 |
| RESEARCH   |  7788 | SCOTT  | ANALYST   | 7566 | 1987-04-19 | 3000.00 |    NULL |     20 |
| RESEARCH   |  7566 | JONES  | MANAGER   | 7839 | 1981-04-02 | 2975.00 |    NULL |     20 |
| RESEARCH   |  7369 | SMITH  | CLERK     | 7902 | 1980-12-17 |  800.00 |    NULL |     20 |
| SALES      |  7900 | JAMES  | CLERK     | 7698 | 1981-12-03 |  950.00 |    NULL |     30 |
| SALES      |  7844 | TURNER | SALESMAN  | 7698 | 1981-09-08 | 1500.00 |    0.00 |     30 |
| SALES      |  7698 | BLAKE  | MANAGER   | 7839 | 1981-05-01 | 2850.00 |    NULL |     30 |
| SALES      |  7654 | MARTIN | SALESMAN  | 7698 | 1981-09-28 | 1250.00 | 1400.00 |     30 |
| SALES      |  7521 | WARD   | SALESMAN  | 7698 | 1981-02-22 | 1250.00 |  500.00 |     30 |
| SALES      |  7499 | ALLEN  | SALESMAN  | 7698 | 1981-02-20 | 1600.00 |  300.00 |     30 |
| OPERATIONS |  NULL | NULL   | NULL      | NULL | NULL       |    NULL |    NULL |   NULL |
+------------+-------+--------+-----------+------+------------+---------+---------+--------+
15 rows in set (0.00 sec)	
```

##### 17.找出至少有5个员工的所有部门

###### （首先以两张表关联出部门，再以部门分组且同时聚合判断个数是否大于等于5，就需要使用having 分组后的筛选条件）

```mysql
select 
	d.dname,count(1)
from 
	emp e
join 
	dept d
on 
	e.deptno = d.deptno
group by
	d.dname
having 
	count(1) >= 5;
+----------+----------+
| dname    | count(1) |
+----------+----------+
| RESEARCH |        5 |
| SALES    |        6 |
+----------+----------+	
```

##### 18.找出薪资比"smith"多的所有员工信息

###### (where条件下的子查询)

```mysql
select
	*
from 
	emp
where 
	sal > (select sal from emp where ename = 'smith');
+-------+--------+-----------+------+------------+---------+---------+--------+
| EMPNO | ENAME  | JOB       | MGR  | HIREDATE   | SAL     | COMM    | DEPTNO |
+-------+--------+-----------+------+------------+---------+---------+--------+
|  7499 | ALLEN  | SALESMAN  | 7698 | 1981-02-20 | 1600.00 |  300.00 |     30 |
|  7521 | WARD   | SALESMAN  | 7698 | 1981-02-22 | 1250.00 |  500.00 |     30 |
|  7566 | JONES  | MANAGER   | 7839 | 1981-04-02 | 2975.00 |    NULL |     20 |
|  7654 | MARTIN | SALESMAN  | 7698 | 1981-09-28 | 1250.00 | 1400.00 |     30 |
|  7698 | BLAKE  | MANAGER   | 7839 | 1981-05-01 | 2850.00 |    NULL |     30 |
|  7782 | CLARK  | MANAGER   | 7839 | 1981-06-09 | 2450.00 |    NULL |     10 |
|  7788 | SCOTT  | ANALYST   | 7566 | 1987-04-19 | 3000.00 |    NULL |     20 |
|  7839 | KING   | PRESIDENT | NULL | 1981-11-17 | 5000.00 |    NULL |     10 |
|  7844 | TURNER | SALESMAN  | 7698 | 1981-09-08 | 1500.00 |    0.00 |     30 |
|  7876 | ADAMS  | CLERK     | 7788 | 1987-05-23 | 1100.00 |    NULL |     20 |
|  7900 | JAMES  | CLERK     | 7698 | 1981-12-03 |  950.00 |    NULL |     30 |
|  7902 | FORD   | ANALYST   | 7566 | 1981-12-03 | 3000.00 |    NULL |     20 |
|  7934 | MILLER | CLERK     | 7782 | 1982-01-23 | 1300.00 |    NULL |     10 |
+-------+--------+-----------+------+------------+---------+---------+--------+
13 rows in set (0.00 sec)
```

##### 19.找出所有'clerk'(办事员)的姓名及其部门名称，部门人数

###### (单抽姓名和部门名时无非就是两个表关联查询，但是针对部门人数时，我们需要考虑select下的子查询，出现在select后的字段需要考虑子查询)

```mysql
select 
	e.ename, d.dname,
	(select count(1) from emp where deptno = d.deptno) 		cc
from 
	emp e
join 
	dept d
on 
	e.deptno = d.deptno
where 
	e.job = 'clerk'
+--------+------------+------+
| ename  | dname      | cc   |
+--------+------------+------+
| SMITH  | RESEARCH   |    5 |
| ADAMS  | RESEARCH   |    5 |
| JAMES  | SALES      |    6 |
| MILLER | ACCOUNTING |    3 |
+--------+------------+------+
4 rows in set (0.00 sec)	
```

##### 20.找出最低薪资大于1500的各种工作及从事次工作的全部雇员人数

###### (首先以工种分组，那么就会形成所有工种的分类，再利用having分组后的筛选操作选出每组的最低薪资来大于1500，求人数即再使用聚合函数count)

```mysql
select 
	e.job, count(1)
from
	emp e
group by e.job
having
	min(e.sal) > 1500;
+-----------+----------+
| job       | count(1) |
+-----------+----------+
| MANAGER   |        3 |
| ANALYST   |        2 |
| PRESIDENT |        1 |
+-----------+----------+
3 rows in set (0.00 sec)	
```

##### 21.找出在部门'sales'(销售部)工作的员工的姓名，假定不知道销售部的部门编号

```mysql
select
	e.ename
from 
	emp e
join 
	dept d
on 
	e.deptno = d.deptno
	and 
	d.dname = 'sales';
+--------+
| ename  |
+--------+
| ALLEN  |
| WARD   |
| MARTIN |
| BLAKE  |
| TURNER |
| JAMES  |
+--------+
6 rows in set (0.00 sec)	
```

##### 22.找出薪资高于公司平均薪资的所有员工，所在部门，上级领导，雇员工资的等级

###### (首先高于平均薪资我们应该想到使用where条件的子查询，后面多个字段来自不同的表则关联不同的表，且每张表弄清楚关联条件)

```mysql
select 
	e.ename, d.dname, p.ename, s.grade
from 
	emp e
left join
	dept d
on 
	e.deptno = d.deptno
left join
	emp p
on 
	e.mgr = p.empno
left join
	salgrade s
on 
	e.sal between s.losal and s.hisal
where 
	e.sal > (select avg(sal) from emp);
+-------+------------+-------+-------+
| ename | dname      | ename | grade |
+-------+------------+-------+-------+
| JONES | RESEARCH   | KING  |     4 |
| BLAKE | SALES      | KING  |     4 |
| CLARK | ACCOUNTING | KING  |     4 |
| SCOTT | RESEARCH   | JONES |     4 |
| KING  | ACCOUNTING | NULL  |     5 |
| FORD  | RESEARCH   | JONES |     4 |
+-------+------------+-------+-------+
6 rows in set (0.00 sec)	
```

##### 23.找出与'scott'(员工名称)从事相同工作(工种一致)的所有员工及部门名称

###### （首先需要找出scott的工种则考虑使用where条件的子查询，这里并没有说需要排除scott不，但如果需要排除则继续where的and条件）

```mysql
select
	e.ename, d.dname
from 
	emp e
join 
	dept d
on 	
	e.deptno = d.deptno
where
	e.job = (select job from emp where ename = 'scott') 
	and 
	e.ename <> 'scott';
+-------+----------+
| ename | dname    |
+-------+----------+
| FORD  | RESEARCH |
+-------+----------+
1 row in set (0.00 sec)	
```

##### 24.找出薪资等于部门30中员工的薪资的其他员工的姓名和薪资

###### （将非30部门的人员看作一张表a，30部门的人员看作一张表b，两者进行关联，条件就是表a每个人的薪资等于表b每个人薪资）

```mysql
select 
	*
from 
	(select sal from emp where deptno <> 30) a
join
	(select sal from emp where deptno = 30) b
on 
	a.sal = b.sal;
Empty set (0.00 sec)	
```

##### 25.找出薪资高于在部门30工作的所有员工的薪资的员工姓名和薪资、部门名称

```mysql
select 
	e.ename, e.sal, d.dname
from 
	emp e
left join
	dept d
on 
	e.deptno = d.deptno
where 
	e.sal > (select max(sal) from emp where deptno = 30);
+-------+---------+------------+
| ename | sal     | dname      |
+-------+---------+------------+
| JONES | 2975.00 | RESEARCH   |
| SCOTT | 3000.00 | RESEARCH   |
| KING  | 5000.00 | ACCOUNTING |
| FORD  | 3000.00 | RESEARCH   |
+-------+---------+------------+
4 rows in set (0.00 sec)
```

##### 26.找出在每个部门工作的员工数量、平均工资和平均服务期限(至2022年，取年)。

###### (此处主要使用了在select后面的单行处理函数如：round\substr\减法运算)

###### (此题涉及到了一个计算两个日期之间相差多少的函数，timestampdiff(year,date1,date2))

###### (还有个注意点就是我经常使用count，爱用count(1)或者count(*)，此题若用这两者则会发现40部门下根本没人按理说员工数为0，因此我们需要根据实际情况来count比如此题用count(e.ename)就能正确计数)

```mysql
select 
	count(e.ename) '员工数量',
	ifnull(round(avg(e.sal),2),0) '平均工资',
	d.dname '部门名称',
	-- round(avg(2022 - substr(e.hiredate,1,4))) '平均服务年限'
	ifnull(avg(timestampdiff(year,hiredate,now())),0) '平均服务年限'
from
	emp e
right join 
	dept d
on
	e.deptno = d.deptno
group by
	e.deptno;
+----------+----------+------------+--------------+
| 员工数量   | 平均薪资  | 部门名称       | 平均服务年限 |
+----------+----------+------------+--------------+
|        5 |     2175 | RESEARCH   |           39 |
|        6 |  1566.67 | SALES      |           41 |
|        3 |  2916.67 | ACCOUNTING |           41 |
+----------+----------+------------+--------------+
3 rows in set (0.00 sec)	
```

##### 27.找出所有员工的姓名、部门名称、工资

```mysql
select 
	e.ename, d.dname, e.sal
from 
	emp e
left join
	dept d
on 
	e.deptno = d.deptno;
+--------+------------+---------+
| ename  | dname      | sal     |
+--------+------------+---------+
| SMITH  | RESEARCH   |  800.00 |
| ALLEN  | SALES      | 1600.00 |
| WARD   | SALES      | 1250.00 |
| JONES  | RESEARCH   | 2975.00 |
| MARTIN | SALES      | 1250.00 |
| BLAKE  | SALES      | 2850.00 |
| CLARK  | ACCOUNTING | 2450.00 |
| SCOTT  | RESEARCH   | 3000.00 |
| KING   | ACCOUNTING | 5000.00 |
| TURNER | SALES      | 1500.00 |
| ADAMS  | RESEARCH   | 1100.00 |
| JAMES  | SALES      |  950.00 |
| FORD   | RESEARCH   | 3000.00 |
| MILLER | ACCOUNTING | 1300.00 |
+--------+------------+---------+
14 rows in set (0.00 sec)
```

##### 28.找出所有部门的详细信息和人数

###### （这题我拿到的时候思路就错了，我用dept表与emp表作左关联，结果部门40的人数居然是1。。。。其实要灵敏点儿，这里就无非多了个人数，则考虑select下的子查询条件就等于每次遍历的deptno再count起来收拾）

```mysql
select 
	t.*, 
	(select count(1) from emp e where e.deptno = t.deptno) '人数'
from 
	dept t;
+--------+------------+----------+------+
| DEPTNO | DNAME      | LOC      | 人数 |
+--------+------------+----------+------+
|     10 | ACCOUNTING | NEW YORK |    3 |
|     20 | RESEARCH   | DALLAS   |    5 |
|     30 | SALES      | CHICAGO  |    6 |
|     40 | OPERATIONS | BOSTON   |    0 |
+--------+------------+----------+------+
4 rows in set (0.00 sec)	
```

##### 29.找出各种工作的最低工资及从事此工作的雇员姓名

###### (此题关键就是先以job分组且聚合出最低工资作为主表，左关联emp再找雇员信息 条件就是工种相等且工资相等)

```mysql
select
	e.*
from 
	(select job,min(sal) min_sal from emp group by job) t
left join
	emp e
on
	t.job = e.job
	and
	t.min_sal = e.sal;
+-------+--------+-----------+------+------------+---------+---------+--------+
| EMPNO | ENAME  | JOB       | MGR  | HIREDATE   | SAL     | COMM    | DEPTNO |
+-------+--------+-----------+------+------------+---------+---------+--------+
|  7369 | SMITH  | CLERK     | 7902 | 1980-12-17 |  800.00 |    NULL |     20 |
|  7654 | MARTIN | SALESMAN  | 7698 | 1981-09-28 | 1250.00 | 1400.00 |     30 |
|  7521 | WARD   | SALESMAN  | 7698 | 1981-02-22 | 1250.00 |  500.00 |     30 |
|  7782 | CLARK  | MANAGER   | 7839 | 1981-06-09 | 2450.00 |    NULL |     10 |
|  7902 | FORD   | ANALYST   | 7566 | 1981-12-03 | 3000.00 |    NULL |     20 |
|  7788 | SCOTT  | ANALYST   | 7566 | 1987-04-19 | 3000.00 |    NULL |     20 |
|  7839 | KING   | PRESIDENT | NULL | 1981-11-17 | 5000.00 |    NULL |     10 |
+-------+--------+-----------+------+------------+---------+---------+--------+
7 rows in set (0.00 sec)	
```

##### 30.找出各个部门的manager(领导)的最低薪资

```mysql
select 
	deptno,min(sal)
from 
	emp
where 
	job = 'manager'
group by
	deptno;
+--------+----------+
| deptno | min(sal) |
+--------+----------+
|     20 |  2975.00 |
|     30 |  2850.00 |
|     10 |  2450.00 |
+--------+----------+
3 rows in set (0.00 sec)	
```

##### 31.找出所有员工的年工资，按年薪从低到高排序

```mysql
select
	ename, 12*sal year_sal
from 
	emp
order by
	year_sal;
+--------+----------+
| ename  | yearSal  |
+--------+----------+
| SMITH  |  9600.00 |
| JAMES  | 11400.00 |
| ADAMS  | 13200.00 |
| WARD   | 15000.00 |
| MARTIN | 15000.00 |
| MILLER | 15600.00 |
| TURNER | 18000.00 |
| ALLEN  | 19200.00 |
| CLARK  | 29400.00 |
| BLAKE  | 34200.00 |
| JONES  | 35700.00 |
| SCOTT  | 36000.00 |
| FORD   | 36000.00 |
| KING   | 60000.00 |
+--------+----------+
14 rows in set (0.00 sec)	
```

##### 32.找出员工领导的薪资超过3000的员工名称与领导名称

```mysql
select
	e.ename, p.ename
from 
	emp e
join
	emp p
on 
	e.mgr = p.empno
where 
	p.sal > 3000;
+-------+-------+
| ename | ename |
+-------+-------+
| JONES | KING  |
| BLAKE | KING  |
| CLARK | KING  |
+-------+-------+
3 rows in set (0.00 sec)	
```

##### 33.找出部门名字中带's'字符的部门员工的工资合计、部门人数

```mysql
select
	d.dname,
	ifnull(sum(e.sal),'') '工资合计',
	(select count(1) from emp where deptno = d.deptno) '员工人数'
from 
	emp e
right join
	dept d
where 
	d.dname like '%s%'
group by d.deptno;
+------------+----------+----------+
| dname      | 工资合计 | 员工人数 |
+------------+----------+----------+
| RESEARCH   | 10875.00 |        5 |
| SALES      | 9400.00  |        6 |
| OPERATIONS |          |        0 |
+------------+----------+----------+
3 rows in set (0.00 sec)
```

##### 34.给任职日期超过30年的员工加薪10%

###### (同理使用上面的timestampdiff函数)

```mysql
update 
	emp e 
set e.sal = e.sal * 1.1 
where 
	2022 - subtr(e.hiredate,1,4) > 30;
select ename,sal from emp;
+--------+---------+
| ename  | sal     |
+--------+---------+
| SMITH  |  880.00 |
| ALLEN  | 1760.00 |
| WARD   | 1375.00 |
| JONES  | 3272.50 |
| MARTIN | 1375.00 |
| BLAKE  | 3135.00 |
| CLARK  | 2695.00 |
| SCOTT  | 3300.00 |
| KING   | 5500.00 |
| TURNER | 1650.00 |
| ADAMS  | 1210.00 |
| JAMES  | 1045.00 |
| FORD   | 3300.00 |
| MILLER | 1430.00 |
+--------+---------+
14 rows in set (0.00 sec)
```

