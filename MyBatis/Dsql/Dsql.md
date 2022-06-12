## 2022.06.12

#### 动态SQL

```java
动态sql是一种根据特定条件来"拼装"sql语句的功能，是为了解决拼接sql语句字符串的问题
```

#### if

```xml-dtd
if标签可以通过"test"属性的表达式进行判断，若为true，则拼接标签中的内容，反之不会拼接
    <select id="xxx" resultType="Xxx">
    	select * from t_students where 1 = 1
        <if test="studentName != null and studentName != ''">
        	and student_name = #{studentName}
            -- student_name = #{studentName} and 
        </if>
        <if test="studentAge != null and studentAge != ''">
        	and student_age = #{studentAge}
            -- student_age = #{studentAge}
        </if>
    </select>

	注意：
		1. if标签中的"and"或者"or"关键字拼接在前面或者后面均可
		2. 当studentName|studentAge均无时，此时只留下where，sql语法不通过，因此我们可以先在前面写上where 1 = 1让其能执行sql
```

#### where

```xml-dtd
由于在上面的where关键字后面我们手动的补充了1=1的条件，这样显的不是很优雅，因此还有<where>标签
    <select id="xxx" resultType="Xxx">
    	select * from t_students 
        <where>
            <if test="studentName != null and studentName != ''">
                and student_name = #{studentName}
                -- student_name = #{studentName} and 
            </if>
            <if test="studentAge != null and studentAge != ''">
                and student_age = #{studentAge}
                -- student_age = #{studentAge} and
            </if>
        </where>
    </select>
    
    注意：
    	1. where标签一般和if标签一起结合使用
    	2. 若where标签中的if条件均不满足时，则Mybatis不会单独的将where关键字拼接在sql中
    	3. 若where标签中的if条件满足时，则Mybatis会自动的添加where关键字并将条件"最前方"多余的and|or去掉，如上面的 and student_name = #{studentName}中的and关键字
    	4. 特别需要注意：where标签不能自动的去掉条件后面的and|or 如上面的 -- student_name = #{studentName} and 
    	5. 因此在写where&if时将拼接关键字写在条件的前方最好
```

#### trim

```xml-dtd
在上面使用where的过程中，我们建议把and|or写在条件的前方，因此Mybatis还提供了trim标签，配置合理后，写在前写在后均可,但需要我们在trim上设置对应的属性
	<select id="xxx" resultType="Xxx">
    	select * from t_students 
        <trim prefix="where" suffixOverrides="and">
            <if test="studentName != null and studentName != ''">
                -- and student_name = #{studentName}
                student_name = #{studentName} and 
            </if>
            <if test="studentAge != null and studentAge != ''">
                -- and student_age = #{studentAge}
                student_age = #{studentAge}
            </if>
        </where>
    </select>

	注意：
		1. trim标签的作用是：用来"去掉"或者"添加"标签中的内容
		2. prefix: 在"trim"标签中的内容"前方"添加指定内容
				  如上面prefix="where"在前面添加指定的where关键字

		   suffix: 在"trim"标签中的内容"后方"添加指定内容

		   prefixOverrides: 在"trim"标签中的内容"前方"去掉指定内容

		   suffixOverrides: 在"trim"标签中的内容"后方"去掉指定内容
				           如上面的suffixOverrides="and"，若无studentAge，则去掉studentName后面多出来的and关键字
```

#### choose\when\otherwise

```xml-dtd
choose、when、otherwise相当于if...else if..else | choose标签中的内容只会执行(拼接)一个条件
	<select id="xxx" resultType="Xxx">
    	select * from t_students 
        <where>
			<choose>
                <when test="studentName != null and studentName != ''">
                    student_name = #{studentName} 
                </when>
                <when test="studentAge != null and studentAge != ''">
                    student_age = #{studentAge}
                </when>
                <otherwise>
                    sid = 1
                </otherwise>
             </choose>
        </where>
    </select>
	
	注意：
		1. choose类似父级根标签，无属性设置
		2. when标签同if标签 需要test属性表达式
		3. 整套choose标签最终返回1个sql片段作为拼接
		4. when标签最小1个，而otherwise标签最多1个
```

#### foreach

```xml
循环遍历生成需要拼接的sql片段，一般多用于批量删除，或者批量插入中
1. 批量删除
	1.1 in关键字写法
		<delete id="xxx">
			delete from t_students where sid 
            	in
            		<foreach collection="sids" item="sid" separator"," open="(" close = ")">				   		#{sid}
            		</foreach>
		</delete>
	1.2 or关键字写法
		<delete id="xxx">
			delete from t_students where 
            <foreach collection="sids" item="sid" separator"or">				   						sid = #{sid}
            </foreach>
		</delete>

2. 批量插入
	<insert id="xxx">
		insert into t_students values
        	<foreach collection="students" item="student" separator=",">
                (null,#{student.studentName},#{student.studentAge})
        	</foreach>
	</insert>

	注意：
		1. collection： 设置要遍历的数组或者集合
						若没使用@Param注解指定参数，则数组对应array,而List集合对应list
						若设置了注解，则使用注解参数，若上面的 sids
		2. item: 数组或者集合中的每项
		3. separator: 设置每个循环体之间的分割符，若上面的逗号分隔
		4. open：设置foreach标签内容的开始符，如上面的in后面跟括号
		5. close: 设置foreach标签内容的结束符
```

#### sql片段

```xml
记录一段公共的sql片段，在需要使用的地方使用include标签进行引入
<sql id="commonSql">
	sid, student_name, student_age, tid
</sql>
<select id="xxx" resultType="Student">
	select 
    	<include refid="commonSql"/>
    from 
    	t_students
</select>
```

