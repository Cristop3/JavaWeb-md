

## 2022.10.23

### Redis简介

```java
1. Redis是一个开源的key-value存储系统
2. 支持存储的value类型包括：
    String(字符串)、List(链表)、Set(集合)、ZSet(sorted set - 有序集合)、Hash(哈希)
    且这些数据类型都支持push/pop、add/remove及取交集并集和差集及更丰富的操作，而且这些操作都是原子性的
3. Redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件，且在此基础上实现了master-slave(主从)同步
```

### 应用场景

```java
1.配合关系型数据库做高速缓存
    高频次，热门访问的数据，降低数据库IO
    分布式架构，做session共享
2.多样的数据结构存储持久化数据    
    2.1 最新N个数据 - 通过List实现按自然时间排序的数据
    2.2 排行榜、TopN - 利用zset（有序集合）
    2.3 时效性的数据、如手机验证码 - Expire过期时间
    2.4 计数器、秒杀 - 原子性、自增方法INCR\DECR
    2.5 去除大量数据中的重复数据 - 利用Set集合
    2.6 构建队列 - 利用List集合
    2.7 发布订阅消息系统 - pub/sub模式
```

### 安装

```java
我这边是装了个虚拟机安装了ubuntu系统
    1. 安装gcc编译器
    	sudo apt-get install gcc
    	gcc --version
    2. 官网下载redis放到/opt目录下
    	cp redis-6.2.7-tar.gz /opt/redis-6.2.7-tar.gz
    3. 解压redis包
    	tar -zxvf redis-6.2.7-tar.gz
    4. 进入redis-6.2.7的src目录
    	cd redis-6.2.7 
  	5. 安装make命令
    	sudo apt-get install make
    6. 进入src目录执行make命令（编译过程）
    	cd src && make
    7. 若报错则可执行
    	make distclean
    8. 执行安装
    	make install
    这里默认会安装到/usr/local/bin目录下
    
    redis-benchmark: 性能测试工具，可以在自己本子运行，看看自己本子性能如何
    redis-check-aof：修复有问题的AOF文件，rdb和aof后面讲
    redis-check-dump：修复有问题的dump.rdb文件
    redis-sentinel：Redis集群使用
    redis-server：Redis服务器启动命令 // 重点关注
    redis-cli：客户端，操作入口     // 重点关注
```

### 启动、停止、访问

```java
1. 前台启动（命令行窗口不能关闭，否则服务器停止）
    在安装目录下执行redis-server
2. 后台启动 
    2.1 备份一份redis.conf文件（实际就是以该文件作为配置文件来启动redis）
    	cp /opt/redis-6.2.7/redis-conf /myRedis.conf
    2.2 安装vim编辑器
    	sudo apt-get install vim
    2.4 设置vim编辑样式
    	sudo vim /etc/vim/vimrc
    	"
    	if has("syntax")
            syntax on
         endif
    	"
        若此代码被注释则主动放开
        在最后一行添加如下 // 按"I"进入编辑
          set nu // 设置左侧行号
          set tabstop=4 // 设置tab键长度为4
          set cursorline // 突出显示当前行
          set ruler // 在右下角显示光标位置的状态行
          set autoindent // 自动缩进
          set nobackup // 覆盖文件时不备份
            
       按"ESC"，并输入":wq"保存并退出
    2.5 修改redis.conf文件中的daemonize no改为yes，让服务在后台启动
           
    2.6 启动
        redis-server /myRedis.conf
            
3. 访问
    redis-cli
    redis-cli -p 6379 // 多端口
4. 停止
    进入终端后：shutdown
    未进入终端：redis-cli shutdown
    杀进程：ps -ef | grep redis
           kill -9 进程号
```

### Redis键（key）

```java
keys *  // 查看当前库所有key    (匹配：keys *1)
exists key // 判断某个key是否存在
type key // 查看你的key是什么类型
del key       // 删除指定的key数据
unlink key   // 根据value选择非阻塞删除 仅将keys从keyspace元数据中删除，真正的删除会在后续异步操作。
expire key 10   // 10秒钟：为给定的key设置过期时间
ttl key // 查看还有多少秒过期，-1表示永不过期，-2表示已过期

select 0 // 默认在0号数据库 select 1 命令切换数据库
dbsize // 查看当前数据库的key的数量
flushdb // 清空当前库
flushall // 通杀全部库
```

### Redis值 - String类型

```java
String是Redis最基本的类型，一个key对应一个value
    
String类型是二进制安全的，意味着Redis的string可以包含任何数据，比如jpg图片或者序列化的对象，一个Redis中字符串value最多可以是512M。

NX : 当数据库中key不存在时，可以将key-value添加数据库    
XX : 当数据库中key存在时，可以将key-value添加数据库，与NX参数互斥
EX : key的超时秒数
PX : key的超时毫秒数，与EX互斥
    
set <key> <value> [EX seconds | PX milliseconds | KEEPTTL ] [NX | XX] // 添加键值对
get <key> // 查询对应键值
append <key> <value> // 将给定的<value> 追加到原值的末尾
strlen <key> // 获得值的长度
setnx  <key> <value> // 只有在 key 不存在时设置key的值
incr <key> // 原子性 将 key 中储存的数字值增1 只能对数字值操作 如果为空，新增值为1
decr <key> // 原子性 将 key 中储存的数字值减1 只能对数字值操作 如果为空，新增值为-1
incrby / decrby  <key> <步长> // 将key中储存的数字值增减，自定义步长。
    
mset  <key1> <value1> <key2> <value2>  ..... // 同时设置一个或多个 key-value对
mget  <key1> <key2> <key3> ..... // 同时获取一个或多个 value
msetnx <key1> <value1> <key2> <value2>  ..... // 同时设置一个或多个 key-value 对，当且仅当所有给定 key 都不存在
    
getrange  <key> <起始位置> <结束位置> // 获得值的范围，类似java中的substring，前包，后包
setrange  <key> <起始位置> <value> // 用 <value>  覆写<key>所储存的字符串值，从<起始位置>开始(索引从0开始)
    
setex  <key> <过期时间> <value> // 设置键值的同时，设置过期时间，单位秒
getset <key> <value> // 以新换旧，设置了新值同时获得旧值
    
Redis中的String类型所对应的数据结构
    String的数据结构为简单动态字符串(Simple Dynamic String,缩写SDS)。是可以修改的字符串，内部结构实现上类似于Java的ArrayList，采用预分配冗余空间的方式来减少内存的频繁分配。内部为当前字符串实际分配的空间capacity一般要高于实际字符串长度len。当字符串长度小于1M时，扩容都是加倍现有的空间，如果超过1M，扩容时一次只会多扩1M的空间。需要注意的是字符串最大长度为512M。
```

### Redis值 - List

```java
List在Redis中是"单键多值"
Redis 列表是简单的字符串列表，按照插入顺序排序。你可以添加一个元素到列表的头部（左边）或者尾部（右边）
    
lpush/rpush  <key> <value1> <value2> <value3> .... // 从左边/右边插入一个或多个值
lpop/rpop  <key> // 从左边/右边吐出一个值。值在键在，值光键亡
rpoplpush  <key1> <key2> // 从<key1>列表右边吐出一个值，插到<key2>列表左边
lrange <key> <start> <stop> // 按照索引下标获得元素(从左到右)
lrange mylist 0 -1 // 0左边第一个，-1右边第一个，（0-1表示获取所有）
lindex <key> <index> // 按照索引下标获得元素(从左到右)
llen <key> // 获得列表长度 
linsert <key>  before <value> <newvalue> // 在<value>的后面插入<newvalue>插入值
lrem <key> <n> <value> // 从左边删除n个value(从左到右)
lset <key> <index> <value> // 将列表key下标为index的值替换成value
   
Redis中的List类型所对应的数据结构
    List的数据结构为快速链表quickList，首先在列表元素较少的情况下会使用一块连续的内存存储，这个结构是ziplist，也即是压缩列表。它将所有的元素紧挨着一起存储，分配的是一块连续的内存，当数据量比较多的时候才会改成quicklist。Redis将链表和ziplist结合起来组成了quicklist。也就是将多个ziplist使用双向指针串起来使用。这样既满足了快速的插入删除性能，又不会出现太大的空间冗余。
```

### Redis值 - Set

```java
Set在Redis中，提供的功能与list类似是一个列表的功能，特殊之处在于set是可以自动排重的。并且set提供了判断某个成员是否在一个set集合内的重要接口，这个也是list所不能提供的。
    
sadd <key><value1><value2> ..... // 将一个或多个 member 元素加入到集合 key 中，已经存在的 member 元素将被忽略
smembers <key> // 取出该集合的所有值
sismember <key> <value> // 判断集合<key>是否为含有该<value>值，有1，没有0
scard <key> // 返回该集合的元素个数
    
srem <key> <value1> <value2> .... // 删除集合中的某个元素。
spop <key> // 随机从该集合中吐出一个值。
srandmember <key><n> // 随机从该集合中取出n个值。不会从集合中删除 。
smove <source> <destination> value // 把集合中一个值从一个集合移动到另一个集合
sinter <key1> <key2> // 返回两个集合的交集元素。
sunion <key1> <key2> // 返回两个集合的并集元素。
sdiff <key1> <key2> // 返回两个集合的差集元素(key1中的，不包含key2中的)
    
Redis中的Set类型所对应的数据结构
    Set数据结构是dict字典，字典是用哈希表实现的。Java中HashSet的内部实现使用的是HashMap，只不过所有的value都指向同一个对象。Redis的set结构也是一样，它的内部也使用hash结构，所有的value都指向同一个内部值。
```

### Redis值 - Hash

```java
Hash在Redis中，提供了一个String类型的field 和 value的映射表，适合用于存储对象，类似Java里面的Map<String,Object>，当我们需要存储一个对象时，如以userId为key，用户明细信息为value有以下几种方式：
    1. key  -  value
       userId - 序列化后的value对象 // 比如JSON字符串
       缺点：每次修改用户的某个属性需要，先反序列化改好后再序列化回去。开销较大
    
    2. key  		-  value
       userId + name -  zhangsan
       userId + age  -  18
       userId + birth - 20221023
      缺点： 用户ID数据冗余
    
    3. key  - value(Hash)
       key - field  value
       userId - name - zhangsan
                age - 18
    		   birth - 20221023
    通过 key(用户ID) + field(属性标签) 就可以操作对应属性数据了，既不需要重复存储数据，也不会带来序列化和并发修改控制的问题
    

hset <key> <field> <value> // 给<key>集合中的  <field>键赋值<value>
hget <key1> <field> // 从<key1>集合<field>取出 value 
hmset <key1> <field1> <value1> <field2> <value2>... // 批量设置hash的值
hexists <key1> <field> // 查看哈希表 key 中，给定域 field 是否存在。 
hkeys <key> // 列出该hash集合的所有field
hvals <key> // 列出该hash集合的所有value
hincrby <key> <field> <increment> // 为哈希表 key 中的域 field 的值加上增量 1   -1
hsetnx <key> <field> <value> // 将哈希表 key 中的域 field 的值设置为 value ，当且仅当域 field 不存在
    
Redis中的Hash类型所对应的数据结构
    Hash类型对应的数据结构是两种：ziplist（压缩列表），hashtable（哈希表）。当field-value长度较短且个数较少时，使用ziplist，否则使用hashtable。
```

### Redis值 - Zset(sorted set)

```java
Zset在Redis中，与普通集合set非常相似，是一个没有重复元素的字符串集合，不同之处是有序集合的每个成员都关联了一个评分（score）,这个评分（score）被用来按照从最低分到最高分的方式排序集合中的成员。集合的成员是唯一的，但是评分可以是重复。
    
zadd  <key> <score1> <value1> <score2> <value2> … // 将一个或多个 member 元素及其 score 值加入到有序集 key 当中。
zrange <key><start><stop>  [WITHSCORES]   // 返回有序集 key 中，下标在<start><stop>之间的元素 带WITHSCORES，可以让分数一起和值返回到结果集。
zrangebyscore key minmax [withscores] [limit offset count] // 返回有序集 key 中，所有 score 值介于 min 和 max 之间(包括等于 min 或 max )的成员。有序集成员按 score 值递增(从小到大)次序排列。 
zrevrangebyscore key maxmin [withscores] [limit offset count] // 同上，改为从大到小排列。 
zincrby <key><increment><value> // 为元素的score加上增量
zrem  <key><value> // 删除该集合下，指定值的元素 
zcount <key><min><max> // 统计该集合，分数区间内的元素个数 
zrank <key><value> // 返回该值在集合中的排名，从0开始。
    
Redis中的Zset类型所对应的数据结构
    SortedSet(zset)是Redis提供的一个非常特别的数据结构，一方面它等价于Java的数据结构Map<String, Double>，可以给每一个元素value赋予一个权重score，另一方面它又类似于TreeSet，内部的元素会按照权重score进行排序，可以得到每个元素的名次，还可以通过score的范围来获取元素的列表。
    底层使用了两个数据结构
    	1. hash，hash的作用就是关联元素value和权重score，保障元素value的唯一性，可以通过元素value找到相应的score值
    	2. 跳跃表，跳跃表的目的在于给元素value排序，根据score的范围获取元素列表
```

### redis.conf

```java
1. Units 单位
	配置大小单位,开头定义了一些基本的度量单位，只支持bytes，不支持bit大小写不敏感
	
2. INCLUDES 包含
	类似jsp中的include，多实例的情况可以把公用的配置文件提取出来

3. 网络配置
    3.1 bind
    	默认情况bind=127.0.0.1只能接受本机的访问请求,不写的情况下，无限制接受任何ip地址的访问,生产环境肯定要写你应用服务器的地址；服务器是需要远程访问的，所以需要将其注释掉
    3.2 protected-mode
    	默认true，将本机访问保护模式设置no，如果开启了protected-mode，那么在没有设定bind ip且没有设密码的情况下，Redis只允许接受本机的响应
    3.3 port
    	端口号，默认 6379
    3.4 tcp-backlog
    	默认511，设置tcp的backlog，backlog其实是一个连接队列，backlog队列总和=未完成三次握手队列 + 已经完成三次握手队列。在高并发环境下你需要一个高backlog值来避免慢客户端连接问题
    3.5 timeout
    	默认0，一个空闲的客户端维持多少秒会关闭，0表示关闭该功能。即永不关闭
    3.6 tcp-keepalive
    	默认300，对访问客户端的一种心跳检测，每个n秒检测一次。单位为秒，如果设置为0，则不会进行Keepalive检测，建议设置成60
    
4. GENERAL 通用
    4.1 daemonize
    	默认no，是否为后台进程，设置为yes，守护进程，后台启动
    4.2 pidfile
    	默认/var/rn/redis_6379.pid，存放pid文件的位置，每个实例会产生一个不同的pid文件
    4.3 loglevel
    	默认notice，指定日志记录级别，Redis总共支持四个级别：debug、verbose、notice、warning
    4.4 logfile
    	默认空，日志文件名称
    4.5 databases
    	设定库的数量 默认16，默认数据库为0，可以使用SELECT <dbid>命令在连接上指定数据库id
   
5. SECURITY 安全
    访问密码的查看、设置和取消
    
6. LIMITS 限制
    6.1 maxclients
    	默认情况下为10000个客户端，设置redis同时可以与多少个客户端进行连接
    6.2 maxmemory <bytes>
    	最大内存量建议必须设置，否则，将内存占满，造成服务器宕机
    6.3 maxmemory-policy
        volatile-lru：使用LRU算法移除key，只对设置了过期时间的键；（最近最少使用）
        allkeys-lru：在所有集合key中，使用LRU算法移除key
        volatile-random：在过期集合中移除随机的key，只对设置了过期时间的键
        allkeys-random：在所有集合key中，移除随机的key
        volatile-ttl：移除那些TTL值最小的key，即那些最近要过期的key
        noeviction：不进行移除。针对写操作，只是返回错误信息
    6.4 maxmemory-samples
    	设置样本数量，LRU算法和最小TTL算法都并非是精确的算法，而是估算值，所以你可以设置样本的大小，redis默认会检查这么多个key并选择其中LRU的那个。一般设置3到7的数字，数值越小样本越不准确，但性能消耗越小
```

### Redis发布和订阅

```java
Redis 发布订阅 (pub/sub) 是一种消息通信模式：发送者 (pub) 发送消息，订阅者 (sub) 接收消息。

Redis 客户端可以订阅任意数量的频道
    
// 客户端A
    subscribe channel1 // 客户端A订阅频道 1
// 客户端B
    publish channel1 iamB  // 客户端B向频道 1 发送 iamB 消息
// 客户端A
    "message"
    "channel1"
	"iamB"
    
发布的消息没有持久化，如果在订阅的客户端收不到hello，只能收到订阅后发布的消息
```

### Redis新值 - Bitmaps

```java
Bitmaps本身不是一种数据类型， 实际上它就是字符串（key-value） ， 但是它可以对字符串的位进行操作

Bitmaps单独提供了一套命令， 所以在Redis中使用Bitmaps和使用字符串的方法不太相同。 可以把Bitmaps想象成一个以位为单位的数组， 数组的每个单元只能存储0和1， 数组的下标在Bitmaps中叫做偏移量
    
setbit <key> <offset> <value> // 设置Bitmaps中某个偏移量的值（0或1） offset:偏移量从0开始
getbit <key> <offset> // 获取Bitmaps中某个偏移量的值
bitcount <key> [start end] // 统计字符串从start字节到end字节比特值为1的数量
bitop  and(or/not/xor) <destkey> [key…] // bitop是一个复合操作， 它可以做多个Bitmaps的and（交集） 、 or（并集） 、 not（非） 、 xor（异或） 操作并将结果保存在destkey中
```

### Redis新值 - HyperLogLog

```java
在工作当中，我们经常会遇到与统计相关的功能需求，比如统计网站PV（PageView页面访问量）,可以使用Redis的incr、incrby轻松实现。
但像UV（UniqueVisitor，独立访客）、独立IP数、搜索记录数等需要去重和计数的问题如何解决？这种求集合中不重复元素个数的问题称为基数问题。
解决基数问题有很多种方案：
（1）数据存储在MySQL表中，使用distinct count计算不重复个数
（2）使用Redis提供的hash、set、bitmaps等数据结构来处理
    
比如数据集 {1, 3, 5, 7, 5, 7, 8}， 那么这个数据集的基数集为 {1, 3, 5 ,7, 8}, 【基数】(不重复元素)为5
    
pfadd <key> <element> [element ...]   // 添加指定元素到 HyperLogLog 中    
pfcount <key> [key ...] // 计算HLL的近似基数
pfmerge <destkey> <sourcekey> [sourcekey ...]  // 将一个或多个HLL合并后的结果存储在另一个HLL中
```

### Redis新值 - Geospatial

```java
Redis 3.2 中增加了对GEO类型的支持。GEO，Geographic，地理信息的缩写。该类型，就是元素的2维坐标，在地图上就是经纬度。redis基于该类型，提供了经纬度设置，查询，范围查询，距离查询，经纬度Hash等常见操作
 
geoadd <key> <longitude> <latitude> <member> [longitude latitude member...]   // 添加地理位置（经度，纬度，名称）
geopos <key> <member> [member...]  // 获得指定地区的坐标值
geodist <key> <member1> <member2>  [m|km|ft|mi ]  // 获取两个位置之间的直线距离
georadius <key> <longitude> <latitude> radius  m|km|ft|mi   // 以给定的经纬度为中心，找出某一半径内的元素
```

