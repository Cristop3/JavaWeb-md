## 2022.06.20

#### yaml文件

```java
YAML 是 "YAML Ain't Markup Language"（YAML 不是一种标记语言）的递归缩写。在开发的这种语言时，YAML 的意思其实是："Yet Another Markup Language"（仍是一种标记语言）。
```

#### 基本语法

```java
● key: value；kv之间有空格
● 大小写敏感
● 使用缩进表示层级关系
● 缩进不允许使用tab，只允许空格
● 缩进的空格数不重要，只要相同层级的元素左对齐即可
● '#'表示注释
● 字符串无需加引号，如果要加，''与""表示字符串内容 会被 转义/不转义
```

#### 数据类型

```yaml
1. 字面量（单个的、不可再分的值。date、boolean、string、number、null）
	k: v
	
2. 对象（键值对的集合。map、hash、set、object） 
	k:
	  k1: v1
	  k2: v2
	  k3: v3
	# 或者
    k: {k1:v1,k2:v2,k3:v3}
    
3. 数组（一组按次序排列的值。array、list、queue）    
	k:
	  - v1
	  - v2
	  - v3
	# 或者
	k: [v1,v2,v3]
```

#### 配置提示信息

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>

<build>
     <plugins>
         <plugin>
             <groupId>org.springframework.boot</groupId>
             <artifactId>spring-boot-maven-plugin</artifactId>
             <configuration>
                 <excludes>
                     <exclude>
                         <groupId>org.springframework.boot</groupId>
                         <artifactId>spring-boot-configuration-processor</artifactId>
                     </exclude>
                 </excludes>
             </configuration>
         </plugin>
     </plugins>
</build>
```

