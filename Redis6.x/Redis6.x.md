

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

### Redis-Jedis

```java
1. maven 依赖包
    <dependency>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
        <version>3.2.0</version>
    </dependency>
    
 2. 本地虚拟机测试时
    禁用Linux的防火墙：Linux(CentOS7)里执行命令
    systemctl stop/disable firewalld.service   
    redis.conf中注释掉bind 127.0.0.1 ,然后 protected-mode no
    
 3. 测试代码
    import redis.clients.jedis.Jedis;
    public class Test {
        public static void main(String[] args) {
            Jedis jedis = new Jedis("ip",6379);
            String pong = jedis.ping();
            System.out.println("连接成功："+pong);
            jedis.close();
        }
    }

 4. API
     // keys
     Set<String> keys = jedis.keys("*");
	// String set get
	jedis.set("k1", "v1");
	System.out.println(jedis.get("k1"));
	// mset
	jedis.mset("str1","v1","str2","v2","str3","v3");
	// mget
    System.out.println(jedis.mget("str1","str2","str3"));
	// list
	List<String> list = jedis.lrange("mylist",0,-1);
    for (String element : list) {
    	System.out.println(element);
    }
	// set
	jedis.sadd("x", "x1");
    jedis.sadd("x", "x2");
    Set<String> smembers = jedis.smembers("x");
    for (String x : smembers) {
    	System.out.println(x);
    }
	// hash
	jedis.hset("hash1","userName","lisi");
    System.out.println(jedis.hget("hash1","userName"));
    Map<String,String> map = new HashMap<String,String>();
    map.put("telphone","13810169999");
    map.put("address","atguigu");
    map.put("email","abc@163.com");
    jedis.hmset("hash2",map);
    List<String> result = jedis.hmget("hash2", "telphone","email");
    for (String element : result) {
    	System.out.println(element);
    }
	// zset
	jedis.zadd("zset01", 100d, "z3");
    jedis.zadd("zset01", 90d, "l4");
    jedis.zadd("zset01", 80d, "w5");
    jedis.zadd("zset01", 70d, "z6");

    Set<String> zrange = jedis.zrange("zset01", 0, -1);
    for (String e : zrange) {
    	System.out.println(e);
    }
```

### Redis-SpringBoot

```java
1. maven依赖包
	<!-- redis -->
    <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>

    <!-- spring2.X集成redis所需common-pool2-->
    <dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
    <version>2.6.0</version>
    </dependency>
    
2. application.properties
    #Redis服务器地址
    spring.redis.host=xxx.xxx.xxx.xxx
    #Redis服务器连接端口
    spring.redis.port=6379
    #Redis数据库索引（默认为0）
    spring.redis.database= 0
    #连接超时时间（毫秒）
    spring.redis.timeout=1800000
    #连接池最大连接数（使用负值表示没有限制）
    spring.redis.lettuce.pool.max-active=20
    #最大阻塞等待时间(负数表示没限制)
    spring.redis.lettuce.pool.max-wait=-1
    #连接池中的最大空闲连接
    spring.redis.lettuce.pool.max-idle=5
    #连接池中的最小空闲连接
    spring.redis.lettuce.pool.min-idle=0
    
3. RedisConfig配置类
    @EnableCaching
    @Configuration
    public class RedisConfig extends CachingConfigurerSupport {
        @Bean
        public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
            RedisTemplate<String, Object> template = new RedisTemplate<>();
            RedisSerializer<String> redisSerializer = new StringRedisSerializer();
            Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);
            ObjectMapper om = new ObjectMapper();
            om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
            om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
            jackson2JsonRedisSerializer.setObjectMapper(om);
            template.setConnectionFactory(factory);
    //key序列化方式
            template.setKeySerializer(redisSerializer);
    //value序列化
            template.setValueSerializer(jackson2JsonRedisSerializer);
    //value hashmap序列化
            template.setHashValueSerializer(jackson2JsonRedisSerializer);
            return template;
        }
        @Bean
        public CacheManager cacheManager(RedisConnectionFactory factory) {
            RedisSerializer<String> redisSerializer = new StringRedisSerializer();
            Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);
    //解决查询缓存转换异常的问题
            ObjectMapper om = new ObjectMapper();
            om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
            om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
            jackson2JsonRedisSerializer.setObjectMapper(om);
    // 配置序列化（解决乱码的问题）,过期时间600秒
            RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofSeconds(600))       .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(redisSerializer))                 .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jackson2JsonRedisSerializer))
                    .disableCachingNullValues();
            RedisCacheManager cacheManager = RedisCacheManager.builder(factory)
                    .cacheDefaults(config)
                    .build();
            return cacheManager;
        }
    }

4. 使用
    @RestController
    @RequestMapping("/redisTest")
    public class RedisTestController {
        @Autowired
        private RedisTemplate redisTemplate;
        @GetMapping
        public String testRedis() {
            //设置值到redis
            redisTemplate.opsForValue().set("x1","x2");
            //从redis获取值
            String x1 = (String)redisTemplate.opsForValue().get("x1");
            return x1;
        }
    } 
```

### Redis-事务

```java
1. 何为Redis事务
    Redis事务是一个单独的隔离操作：事务中的所有命令都会序列化、按顺序地执行。事务在执行的过程中，不会被其他客户端发送来的命令请求所打断。Redis事务的主要作用就是串联多个命令防止别的命令插队。
    
2. 事务命令
    multi // 组队
    discard // 取消组队
    exec // 执行组队命令
    
    > multi // 开启事务
    > set k v // 命令1
    > set k2 v2 // 命令2
    > exec // 按顺序执行命令1、命令2
    > discard // 撤销组队阶段 如上撤销命令1、命令2
    
3. 错误机制
    3.1 组队中某个命令出现了报告错误，执行时整个的所有队列都会被取消
    3.2 如果执行阶段某个命令报出了错误，则只有报错的命令不会被执行，而其他的命令都会执行，不会回滚
    
4. 悲观锁
    悲观锁(Pessimistic Lock), 顾名思义，就是很悲观，每次去拿数据的时候都认为别人会修改，所以每次在拿数据的时候都会上锁，这样别人想拿这个数据就会block直到它拿到锁。传统的关系型数据库里边就用到了很多这种锁机制，比如行锁，表锁等，读锁，写锁等，都是在做操作之前先上锁。
    
5. 乐观锁
    乐观锁(Optimistic Lock), 顾名思义，就是很乐观，每次去拿数据的时候都认为别人不会修改，所以不会上锁，但是在更新的时候会判断一下在此期间别人有没有去更新这个数据，可以使用版本号等机制。乐观锁适用于多读的应用类型，这样可以提高吞吐量。Redis就是利用这种check-and-set机制实现事务的。
    
    watch key [key ...]
    在执行multi之前，先执行watch key1 [key2],可以监视一个(或多个) key ，如果在事务执行之前这个(或这些) key 被其他命令所改动，那么事务将被打断
    unwatch 
    取消 WATCH 命令对所有 key 的监视
    如果在执行 WATCH 命令之后，EXEC 命令或DISCARD 命令先被执行了的话，那么就不需要再执行UNWATCH 了
    
6. 事务三特性
    6.1 单独的隔离操作 
	  事务中的所有命令都会序列化、按顺序地执行。事务在执行的过程中，不会被其他客户端发送来的命令请求所打断。 
	6.2 没有隔离级别的概念 
	   队列中的命令没有提交之前都不会实际被执行，因为事务提交前任何指令都不会被实际执行
	6.3 不保证原子性 
    	事务中如果有一条命令执行失败，其后的命令仍然会被执行，没有回滚
```

### Redis-持久化-RDB（Redis DataBase）

```java
在指定的时间间隔内将内存中的数据集快照写入磁盘， 也就是行话讲的Snapshot快照，它恢复时是将快照文件直接读到内存里
    
Redis会单独创建（fork）一个子进程来进行持久化，会先将数据写入到 一个临时文件中，待持久化过程都结束了，再用这个临时文件替换上次持久化好的文件。 整个过程中，主进程是不进行任何IO操作的，这就确保了极高的性能 如果需要进行大规模数据的恢复，且对于数据恢复的完整性不是非常敏感，那RDB方式要比AOF方式更加的高效。RDB的缺点是最后一次持久化后的数据可能丢失。
    
1. fork
    Fork的作用是复制一个与当前进程一样的进程。新进程的所有数据（变量、环境变量、程序计数器等） 数值都和原进程一致，但是是一个全新的进程，并作为原进程的子进程
	在Linux程序中，fork()会产生一个和父进程完全相同的子进程，但子进程在此后多会exec系统调用，出于效率考虑，Linux中引入了“写时复制技术”
	一般情况父进程和子进程会共用同一段物理内存，只有进程空间的各段的内容要发生变化时，才会将父进程的内容复制一份给子进程。
    
2. dump.rdb
    在redis.conf中配置文件名称，默认为dump.rdb
    rdb文件的保存路径，也可以修改。默认为Redis启动时命令行所在的目录下 dir "/xxx"
    
3. 保持策略
    配置文件中去配置save或bgsave
    3.1 save
    	save 秒钟 写操作次数；save时只管保存，其它不管，全部阻塞。手动保存。不建议。
    	默认是1分钟内改了1万次，或5分钟内改了10次，或15分钟内改了1次（这里得次指的是操作了key）
    
    3.2 bgsave：Redis会在后台异步进行快照操作， 快照同时还可以响应客户端请求。
可以通过lastsave 命令获取最后一次成功执行快照的时间
    
    stop-writes-on-bgsave-error yes // 当Redis无法写入磁盘的话，直接关掉Redis的写操作
    rdbcompression yes // 对于存储到磁盘中的快照，可以设置是否进行压缩存储。如果是的话，redis会采用LZF算法进行压缩
    rdbchecksum yes // 在存储快照后，还可以让redis使用CRC64算法来进行数据校验
    
4. rdb备份
    1. 拷贝复制一份rdb文件
    2. 恢复时：关闭Redis；先把备份的文件拷贝到工作目录下并更名为dump.rdb；启动Redis, 备份数据会直接加载
    
5. 优缺点
    适合大规模的数据恢复；
    对数据完整性和一致性要求不高更适合使用；
    节省磁盘空间；
    恢复速度快。
    
    Fork的时候，内存中的数据被克隆了一份，大致2倍的膨胀性需要考虑；
    虽然Redis在fork时使用了写时拷贝技术,但是如果数据庞大时还是比较消耗性能；
    在备份周期在一定间隔时间做一次备份，所以如果Redis意外down掉的话，就会丢失最后一次快照后的所有修改。
```

### Redis-持久化-AOF（Redis DataBase）

```java
以日志的形式来记录每个写操作（增量保存），将Redis执行过的所有写指令记录下来(读操作不记录)， 只许追加文件但不可以改写文件，redis启动之初会读取该文件重新构建数据，换言之，redis 重启的话就根据日志文件的内容将写指令从前到后执行一次以完成数据的恢复工作
    
1. 流程
（1）客户端的请求写命令会被append追加到AOF缓冲区内；
（2）AOF缓冲区根据AOF持久化策略[always,everysec,no]将操作sync同步到磁盘的AOF文件中；
（3）AOF文件大小超过重写策略或手动重写时，会对AOF文件rewrite重写，压缩AOF文件容量；
（4）Redis服务重启时，会重新load加载AOF文件中的写操作达到数据恢复的目的；
    
2. 文件名称及路径设置
    可以在redis.conf中配置文件名称，默认为 appendonly.aof
	AOF文件的保存路径，同RDB的路径一致。
    
    AOF和RDB同时开启，系统默认取AOF的数据（数据不会存在丢失）
    
3. 开启、修复及恢复
    3.1 appendonly yes // 设置配置文件 开启
    3.2 如遇到AOF文件损坏，通过/usr/local/bin/redis-check-aof--fix appendonly.aof进行恢复 // 修复
    3.3 同rdb，备份-重名-重启 // 恢复
    
4. 同步频率
    appendfsync always
    始终同步，每次Redis的写入都会立刻记入日志；性能较差但数据完整性比较好
    
    appendfsync everysec
    每秒同步，每秒记入日志一次，如果宕机，本秒的数据可能丢失。
    
    appendfsync no
    redis不主动进行同步，把同步时机交给操作系统。
    
5. 优缺点
    备份机制更稳健，丢失数据概率更低。
    可读的日志文本，通过操作AOF稳健，可以处理误操作。
    
     比起RDB占用更多的磁盘空间。
	恢复备份速度要慢。
	每次读写都同步的话，有一定的性能压力。
	存在个别Bug，造成恢复不能。
    
6. rdb、aof选用哪个
    官方推荐两个都启用。如果对数据不敏感，可以选单独用RDB。不建议单独用 AOF，因为可能会出现Bug。如果只是做纯内存缓存，可以都不用。
```

### Redis-分布式锁

```java
分布式锁主流的实现方案：
1. 基于数据库实现分布式锁
2. 基于缓存（Redis等）
3. 基于Zookeeper
    
每一种分布式锁解决方案都有各自的优缺点：
1. 性能：redis最高
2. 可靠性：zookeeper最高
    
分布式过程
    1. 多个客户端同时获取锁
    2. 获取成功，执行业务逻辑{从db获取数据，放入缓存}，执行完成释放锁（del）
    3. 其他客户端等待重试
    
分布式锁方案一（给key上锁释放锁）
    // 命令行
	在redis命令中，以String类型为例，我们可以使用setnx来加锁；  
    使用del key来释放锁
    
    // Java代码
    在Java代码中，我们使用setIfAbsent(key,value)方法来加锁
    使用delete(key)来释放锁
    
    @GetMapping("testLock")
    public void testLock(){
        //1获取锁，setne
        Boolean lock = redisTemplate.opsForValue().setIfAbsent("lock", "111");
        //2获取锁成功、查询num的值
        if(lock){
            Object value = redisTemplate.opsForValue().get("num");
            //2.1判断num为空return
            if(StringUtils.isEmpty(value)){
                return;
            }
            //2.2有值就转成成int
            int num = Integer.parseInt(value+"");
            //2.3把redis的num加1
            redisTemplate.opsForValue().set("num", ++num);
            //2.4释放锁，del
            redisTemplate.delete("lock");
        }else{
            //3获取锁失败、每隔0.1秒再获取
            try {
                Thread.sleep(100);
                testLock();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
方案一的问题：
    setnx|setIfAbsent 刚好获取到锁，业务逻辑出现异常，导致锁无法释放
方案一解决：
    设置过期时间，自动释放锁
    
分布式锁方案二（加过期时间，主动释放锁）
    由于redis命令不保证原子性，因此将加过期时间命令和设置key命令最好合并成一条命令
    // 命令行
	setnx key value 3000
    
    // Java代码
    setIfAbsent(key,value,3,TimeUnit.Seconds)
    
    @GetMapping("testLock")
    public void testLock(){
        //1获取锁，setne
        Boolean lock = redisTemplate.opsForValue().setIfAbsent("lock", "111",3,TimeUnit.Seconds);
        //2获取锁成功、查询num的值
        if(lock){
            Object value = redisTemplate.opsForValue().get("num");
            //2.1判断num为空return
            if(StringUtils.isEmpty(value)){
                return;
            }
            //2.2有值就转成成int
            int num = Integer.parseInt(value+"");
            //2.3把redis的num加1
            redisTemplate.opsForValue().set("num", ++num);
            //2.4释放锁，del
            redisTemplate.delete("lock");
        }else{
            //3获取锁失败、每隔0.1秒再获取
            try {
                Thread.sleep(100);
                testLock();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

方案二的问题：
    可能会释放其他服务器的锁
方案二解决：
    获取锁时，设置一个指定的唯一值（例如：uuid）；释放前获取这个值，判断是否自己的锁
    
分布式锁方案三（加uuid，判断自己锁才释放锁）
    @GetMapping("testLock")
    public void testLock(){
    	// uuid设置锁value
    	String uuid = UUID.randomUUID().toString();
    	
        //1获取锁，setne
        Boolean lock = redisTemplate.opsForValue().setIfAbsent("lock", uuid,3,TimeUnit.Seconds);
        //2获取锁成功、查询num的值
        if(lock){
            Object value = redisTemplate.opsForValue().get("num");
            //2.1判断num为空return
            if(StringUtils.isEmpty(value)){
                return;
            }
            //2.2有值就转成成int
            int num = Integer.parseInt(value+"");
            //2.3把redis的num加1
            redisTemplate.opsForValue().set("num", ++num);
            
            // 自己锁自己释放
            if(uuid.equals((String)redisTemplate.opsForValue().get("lock"))){
                //2.4释放锁，del
            	redisTemplate.delete("lock");
            }
        }else{
            //3获取锁失败、每隔0.1秒再获取
            try {
                Thread.sleep(100);
                testLock();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

方案三的问题：
    删除操作缺乏原子性，误删了其他锁
方案三解决：
    Lua脚本
    
分布式锁方案四（Lua脚本）
    @GetMapping("testLockLua")
    public void testLockLua() {
        //1 声明一个uuid ,将做为一个value 放入我们的key所对应的值中
        String uuid = UUID.randomUUID().toString();
        //2 定义一个锁：lua 脚本可以使用同一把锁，来实现删除！
        String skuId = "25"; // 访问skuId 为25号的商品 100008348542
        String locKey = "lock:" + skuId; // 锁住的是每个商品的数据

        // 3 获取锁
        Boolean lock = redisTemplate.opsForValue().setIfAbsent(locKey, uuid, 3, TimeUnit.SECONDS);

        // 如果true
        if (lock) {
            // 执行的业务逻辑开始
            // 获取缓存中的num 数据
            Object value = redisTemplate.opsForValue().get("num");
            // 如果是空直接返回
            if (StringUtils.isEmpty(value)) {
                return;
            }
            // 不是空 如果说在这出现了异常！ 那么delete 就删除失败！ 也就是说锁永远存在！
            int num = Integer.parseInt(value + "");
            // 使num 每次+1 放入缓存
            redisTemplate.opsForValue().set("num", String.valueOf(++num));
            /*使用lua脚本来锁*/
            // 定义lua 脚本
            String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
            // 使用redis执行lua执行
            DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
            redisScript.setScriptText(script);
            // 设置一下返回值类型 为Long
            // 因为删除判断的时候，返回的0,给其封装为数据类型。如果不封装那么默认返回String 类型，
            // 那么返回字符串与0 会有发生错误。
            redisScript.setResultType(Long.class);
            // 第一个要是script 脚本 ，第二个需要判断的key，第三个就是key所对应的值。
            redisTemplate.execute(redisScript, Arrays.asList(locKey), uuid);
        } else {
            // 其他线程等待
            try {
                // 睡眠
                Thread.sleep(1000);
                // 睡醒了之后，调用方法。
                testLockLua();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
```

