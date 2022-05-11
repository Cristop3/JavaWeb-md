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

