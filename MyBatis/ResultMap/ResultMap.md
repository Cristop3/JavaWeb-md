## 2022.06.11

#### resultType与resultMap

```java
1. resultType 
    当数据库表字段与java实体类属性一一对应时，我们只需设置resultType即可
2. resultMap
    当数据库表字段与java实体类属性不能一一对应时，我们需要设置resultMap
```

#### 通过sql别名满足字段与实体类映射

```java
1. 未处理（其它能对应的字段有值，未对应的字段无值）
    // CourseMapper.java
    public interface CourseMapper {
        // 通过sql 别名方式来处理处理字段名和实体类中的属性的映射关系 getAllCourse
        List<Course> getAllCourse();
    }

    // CourseMapper.xml
	<!--    通过sql 别名方式来处理处理字段名和实体类中的属性的映射关系 getAllCourse-->
    <select id="getAllCourse" resultType="course">
        select tc.*
        from t_courses tc
    </select>
        
    // test
    List<Course> courseList = courseMapper.getAllCourse();
    courseList.forEach(course -> System.out.println(course));    

    // console
	Course{cid=1, courseName='null'}
	Course{cid=2, courseName='null'}

2. 使用别名
    // CourseMapper.xml
    <select id="getAllCourse" resultType="course">
        select tc.cid, tc.course_name as courseName
        from t_courses tc
    </select>
    
    // console
    Course{cid=1, courseName='chinese'}
    Course{cid=2, courseName='english'}
```

#### 开启Mybatis核心配置mapUnderscoreToCamelCase选项

```java
针对这种下划线和驼峰，我们可以严格按照约定这样我们开启配置后，不用再使用别名
// mybatis-config.xml
    <!--    5. 核心配置项-->
    <settings>
        <!--        5.1 开启将数据库表中字段名称中的下划线自动转换为驼峰格式-->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
    </settings>
```

#### resultMap属性值及其作用

```sql
1. 属性说明
resultMap : 设置自定义映射
    其属性：
        id : 表示自定义映射的唯一标识(对应到select标签中的resultMap)
        type ： 查询的数据要映射的"实体类的类型"
    其子标签：
        <id> : 设置主键的映射关系 （一般为数据库表主键字段）
        <result> : 设置普通字段的映射关系
	    <association> : 设置多对一的映射关系
		<collection> : 设置一对多的映射关系
            其属性：
            	property : 设置映射关系中实体类中的属性名
	            column ： 设置映射关系中表中的字段名
 
2. 学生表和老师表 sql
   CREATE DATABASE /*!32312 IF NOT EXISTS*/`mybatis` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
    USE `mybatis`;
    /*Table structure for table `t_students` */
    DROP TABLE IF EXISTS `t_students`;
    CREATE TABLE `t_students` (
      `sid` int NOT NULL AUTO_INCREMENT,
      `student_name` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
      `student_age` int DEFAULT NULL,
      `tid` int DEFAULT NULL,
      PRIMARY KEY (`sid`)
    ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    /*Data for the table `t_students` */
    insert  into `t_students`(`sid`,`student_name`,`student_age`,`tid`) values 
    (1,'Tom',20,1),
    (2,'Jerry',21,2),
    (3,'Bob',22,1),
    (4,'Cindy',23,2),
    (5,'Jake',24,3),
    (6,'Oliver',25,3);
    /*Table structure for table `t_teachers` */
    DROP TABLE IF EXISTS `t_teachers`;
    CREATE TABLE `t_teachers` (
      `tid` int NOT NULL AUTO_INCREMENT,
      `teacher_name` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
      PRIMARY KEY (`tid`)
    ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    /*Data for the table `t_teachers` */
    insert  into `t_teachers`(`tid`,`teacher_name`) values 
    (1,'T1'),
    (2,'T2'),
    (3,'T3');
    
3. 实体类
	// student.java
	public class Student {
        private Integer sid;
        private String studentName;
        private Integer studentAge;
        // 多对一 用类型
        private Teacher teacher;
        public Student() {
        }
        public Student(Integer sid, String studentName, Integer studentAge) {
            this.sid = sid;
            this.studentName = studentName;
            this.studentAge = studentAge;
        }
        public Integer getSid() {
            return sid;
        }
        public void setSid(Integer sid) {
            this.sid = sid;
        }
        public String getStudentName() {
            return studentName;
        }
        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }
        public Integer getStudentAge() {
            return studentAge;
        }
        public void setStudentAge(Integer studentAge) {
            this.studentAge = studentAge;
        }
        @Override
        public String toString() {
            return "Student{" +
                    "sid=" + sid +
                    ", studentName='" + studentName + '\'' +
                    ", studentAge=" + studentAge +
                    ", teacher=" + teacher +
                    '}';
        }
    }
    // Teacher.java
    public class Teacher {
    private Integer tid;
    private String teacherName;
    // 一对多 使用集合
    private List<Student> students;
    public Teacher() {
    }
    public Teacher(Integer tid, String teacherName) {
        this.tid = tid;
        this.teacherName = teacherName;
    }
    public Integer getTid() {
        return tid;
    }
    public void setTid(Integer tid) {
        this.tid = tid;
    }
    public String getTeacherName() {
        return teacherName;
    }
    @Override
    public String toString() {
        return "Teacher{" +
                "tid=" + tid +
                ", teacherName='" + teacherName + '\'' +
                ", students=" + students +
                '}';
    }
    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }
}
```

#### 多对一映射关系设置resultMap

```xml
1. 级联方式设置
    // StudentMapper.java
    // 查询Jerry学生及老师信息 getStudentAndTeacherByName
    Student getStudentAndTeacherByName(@Param("studentName") String studentName);

    // StudentMapper.xml
    <resultMap id="stResultMap" type="Student">
        <id property="sid" column="sid"/>
        <result property="studentName" column="student_name"/>
        <result property="studentAge" column="student_age"/>
        <!--        级联-->
        <result property="teacher.tid" column="tid"/>
        <result property="teacher.teacherName" column="teacher_name"/>
    </resultMap>
    <select id="getStudentAndTeacherByName" resultMap="stResultMap">
        select *
        from t_students ts
                 left join t_teachers tt on ts.tid = tt.tid
        where ts.student_name = #{studentName}
    </select>

	注意级联主要体现在：
        <result property="teacher.tid" column="tid"/>
        <result property="teacher.teacherName" column="teacher_name"/>

        private Teacher teacher; <!--实体类属性-->

        1. 其中property设置为我们Student实体类中的teacher属性的子属性，如：teacher.tid,teacher.teacherName 而column属性设置为下面sql执行所查出的字段名，如：tid,teacher_name

2. 使用子标签association设置
	// StudentMapper.xml
    <resultMap id="stResultMap2" type="Student">
        <id property="sid" column="sid"/>
        <result property="studentName" column="student_name"/>
        <result property="studentAge" column="student_age"/>
        <!--       子标签association -->
        <association property="teacher" javaType="Teacher">
            <id property="tid" column="tid"/>
            <result property="teacherName" column="teacher_name"/>
        </association>
    </resultMap>
    <select id="getStudentAndTeacherById" resultMap="stResultMap2">
        select *
        from t_students ts
                 left join t_teachers tt on ts.tid = tt.tid
        where ts.sid = #{sid}
    </select>
	
	private Teacher teacher; <!--实体类属性-->

	注意：
		1. association标签中的property对应实体类中的属性名，如teacher（需要处理多对的映射关系的属性名），而设置的javaType则表示当前属性的实体类型，如Teacher （该属性的类型）
		2. 而association标签中，就有点类似上面兄弟标签有id,有result，其中的property，column属性设置一样

3. 分布查询设置
	目前两张表作关联能查询出学生及老师的信息，而分布查询就是将一个sql，拆分为两个独立的sql，一个通过条件查询出学生，而根据这个学生的tid再去查询出老师
	// StudentMapper.xml 
	<!-- 第一步查询学生 -->
	<resultMap id="stResultMap3" type="Student">
        <id property="sid" column="sid"/>
        <result property="studentName" column="student_name"/>
        <result property="studentAge" column="student_age"/>
        <!--        分布设置 -->
        <association property="teacher" select="com.home.mybatis.mapper.TeacherMapper.getTeacherById"
                     column="tid"></association>
    </resultMap>
    <select id="getStudentAndTeacherByAge" resultMap="stResultMap3">
        select ts.*
        from t_students ts
        where ts.student_age = #{studentAge}
    </select>
	
	// TeacherMapper.xml
	<!-- 第二步查询老师 -->
	<resultMap id="ttResultMap" type="Teacher">
        <id column="tid" property="tid"/>
        <result column="teacher_name" property="teacherName"/>
    </resultMap>
    <select id="getTeacherById" resultMap="ttResultMap">
        select tt.*
        from t_teachers tt
        where tt.tid = #{tid}
    </select>
	
	注意此时association标签所需要设置的属性：
		1. property：ssociation标签中的"property"对应实体类中的属性名，如teacher（需要处理多对的映射关系的属性名）
		2. select: 设置分步查询，查询某个属性的值的sql的标识（namespace.sqlId）
		3. column: 将sql以及查询结果中的某个字段设置为分步查询的条件
		4. fetchType: 当开启了全局的延迟加载之后，可通过此属性手动控制延迟加载的效果 lazy表示延迟加载，eager表示立即加载
	
	3.1 分布查询中延迟加载
		如目前我们有2个sql，但是当我们不开启延迟加载时，默认会执行所有sql即2次，当我们只需要获取结果集中的某个属性值，比如学生的名称，那么此时根本不需要去查找老师
		// mybatis-config.xml
		<!--    5. 核心配置项-->
        <settings>
            <!--        5.1 开启将数据库表中字段名称中的下划线自动转换为驼峰格式-->
            <setting name="mapUnderscoreToCamelCase" value="false"/>
            <!--        5.2 开启延迟加载-->
            <setting name="lazyLoadingEnabled" value="true"/>
        </settings>
```

#### 一对多映射关系设置resultMap

```xml
// 一对多 使用集合
    private List<Student> students; <!--实体类属性-->
    
1. collection标签设置
	// TeacherMapper.xml
	<resultMap id="ttResultMap2" type="Teacher">
        <id column="tid" property="tid"/>
        <result column="teacher_name" property="teacherName"/>
        <!--        一对多-->
        <collection property="students" ofType="Student">
            <id column="sid" property="sid"/>
            <result column="student_name" property="studentName"/>
            <result column="student_age" property="studentAge"/>
        </collection>
    </resultMap>
    <select id="getTeacherAndStudentByName" resultMap="ttResultMap2">
        select tt.*, ts.*
        from t_teachers tt
                 left join t_students ts on tt.tid = ts.tid
        where tt.teacher_name = #{teacherName}
    </select>
    
    注意 collection标签属性：
        1. property： 为当前实体类中的属性名，如students
        2. ofType: 设置collection标签所处理的集合属性中存储数据的类型，如集合中为学生类Student
        
2. 分布查询设置（原理同上）
```

