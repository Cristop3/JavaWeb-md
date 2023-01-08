## 20221128

### 整体内容

![微服务架构升级.png](https://s2.loli.net/2022/12/25/tfFjyIBZEg6dL8J.png)

#### springcloud微服务架构组件

#### 如何进行springboot、springcloud版本选择

```shell
# https://start.spring.io/actuator/info
```

#### Maven中dependencyManagement与denpendency区别

```shell
Maven 使用dependencyManagement 元素来提供了一种管理依赖版本号的方式。
	1. 通常会在一个组织或者项目的最顶层的父POM 中看到dependencyManagement 元素。
	2. 能让所有在子项目中引用一个依赖而不用显式的列出版本号。
	3. dependencyManagement里只是声明依赖，并不实现引入，因此子项目需要显示的声明需要用的依赖。
```

#### 常规下模块流程

```shell
1. 建模块
2. 改POM
3. 写YML
4. 主启动
5. 业务类
	5.1 建表
	5.2 实体类
	5.3 dao
	5.4 service
	5.5 controller
6. 测试
```

### 服务注册中心

#### 1. Eureka服务注册与发现 - 已被淘汰

![Eureke.png](https://s2.loli.net/2022/12/03/Nm97fTD2uFCrvZY.png)

##### 基础概念

```shell
1. 服务治理
	Spring Cloud 封装了 Netflix 公司开发的 Eureka 模块来实现服务治理
	在传统的rpc远程调用框架中，管理每个服务与服务之间依赖关系比较复杂，管理比较复杂，所以需要使用服务治理，管理服务于服务之间依赖关系，可以实现服务调用、负载均衡、容错等，实现服务发现与注册。
	
2. 服务注册与发现
	# Eureka机制
		Eureka采用了CS的设计架构，Eureka Server 作为服务注册功能的服务器，它是服务注册中心。而系统中的其他微服务，使用 Eureka的客户端连接到 Eureka Server并维持心跳连接。
	# 注册与发现
		1. 在服务注册与发现中，有一个注册中心。
		2. 当服务器启动的时候，会把当前自己服务器的信息 比如 服务地址通讯地址等以别名方式注册到注册中心上。另一方（消费者|服务提供者），以该别名的方式去注册中心上获取到实际的服务通讯地址，然后再实现本地RPC调用
		3. RPC远程调用框架核心设计思想：在于注册中心，因为使用注册中心管理每个服务与服务之间的一个依赖关系(服务治理概念)。在任何rpc远程框架中，都会有一个注册中心(存放服务地址相关信息(接口地址))
```

##### Eruka两组件

```shell
3. Eureka两组件
	3.1 Eureka Server 提供服务注册的服务
		比如有模块B 作为Eureka Server
		# pom
		   <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
            </dependency>
		# yml
			eureka:
                  instance:
                    hostname: localhost #eureka服务端的实例名称
                  client:
                    #false表示不向注册中心注册自己。
                    register-with-eureka: false
                    #false表示自己端就是注册中心，我的职责就是维护服务实例，并不需要去检索服务
                    fetch-registry: false
                    service-url:
                      #设置与Eureka Server交互的地址查询服务和注册服务都需要依赖这个地址。
                      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
          # 主启动
			@EnableEurekaServer
			
	3.2 Eureka Client 通过注册中心进行访问
		比如有模块A、模块C 若为Eureka Client
		# pom
			<dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
            </dependency>
         # yml
         	eureka:
              client:
                #表示是否将自己注册进EurekaServer默认为true。
                register-with-eureka: true
                #是否从EurekaServer抓取已有的注册信息，默认为true。单节点无所谓，集群必须设置为true才能配合ribbon使用负载均衡
                fetchRegistry: true
                service-url:
                  defaultZone: http://localhost:7001/eureka
         # 主启动
         	@EnableEurekaClient
```

##### 模拟集群搭建

```shell
4. 模拟集群构建
 	# 服务注册：将服务信息注册到注册中心
 	# 服务发现：从注册中心上获取服务信息，本质就是：存key(服务名名称) - 取value(实际调用地址)
 	# 流程：
 		1. 启动Eureka注册中心模块B
 		2. 启动服务Provider模块C（会把自身信息如服务地址以别名注册进Eureka）
 		3. 启动服务Consumer模块A（需要调用接口时，使用服务别名去注册中心获取实际的RPC远程调用地址）
 		4. Consumer获得调用地址后，会缓存到本地JVM内存中默认每隔30s更新一次服务调用地址，底层实际利用HttpClient技术作封装来实现远程调用
 		
 
 	# 多个注册中心（改hosts模拟多注册中心）
 		# yml
            instance:
            # hostname: localhost #eureka服务端的实例名称 集群下使用不同的ip 这里为了模拟改了hosts配置
            hostname: eureka7002.com	
            
           #defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/ 单机下可直接写死 模拟集群下写其他注册中心地址
      	   defaultZone: http://eureka7001.com:7001/eureka/
      	   
    # 多Provider（多个端口模拟多Provider）
    	# yml
    	server:
  			port: 8001 & 8002
  		    service-url:
      # defaultZone: http://localhost:7001/eureka # 单机下 可直接写死地址 模拟集群下 需逗号分割加入所有的注册中心地址
      defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka  # 集群版
      
    # Consumer
    	#yml
    		# defaultZone: http://localhost:7001/eureka # 单机下 可直接写死地址 模拟集群下 需逗号分割加入所有的注册中心地址
      		defaultZone: http://eureka7001.com:7001/eureka,http://eureka7002.com:7002/eureka  # 集群版
```

##### actuator显示Eureka

```shell
5. actuator显示Eureka微服务信息完善
	5.1 依赖包
	# pom.xml
    <dependency>
    	<groupId>org.springframework.boot</groupId>
    	<artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    5.2 Eureka注册中心管理页面Status下显示自定义名称（默认显示主机名称，如localhost:xxxx）
    # yml
    eureka:
  		instance:
    		instance-id: payment8001 #实例名称自定义
    5.3 Eureka注册中心管理页面Status下显示有IP信息
    eureka:
  		instance:
  		prefer-ip-address: true     #访问路径可以显示IP地址
```

##### 服务发现Discovery

```shell
6. 服务发现Discovery
	对于注册进Eureka里面的微服务，可以在任意一个微服务下通过服务发现来获得所有服务的信息
	# controller
	@Autowired
    private DiscoveryClient discoveryClient;
    @GetMapping(value = "/payment/discovery")
    public Object discovery() {
        List<String> services = discoveryClient.getServices();
        for (String element : services) {
            System.out.println(element);
        }

        List<ServiceInstance> instances = discoveryClient.getInstances("CLOUD-PAYMENT-SERVICE");
        for (ServiceInstance element : instances) {
            System.out.println(element.getServiceId() + "\t" + element.getHost() + "\t" + element.getPort() + "\t"
                    + element.getUri());
        }
        return this.discoveryClient;
    }
    # main主启动
   	@EnableDiscoveryClient
```

##### 自我保护及心跳配置等

```shell
7. 自我保护及心跳配置等
	默认的自我保护机制是当微服务发生异常时，Eruka会保留该异常服务
	# 注册中心EurekaServer端设置
	eureka:
  		server:
  			enable-self-preservation: false # 闭自我保护机制，保证不可用服务被及时踢除
  			eviction-interval-timer-in-ms: 2000
  	# 生产者EurekaClient客户端设置
  	eureka:
  		instance:
  			lease-renewal-interval-in-seconds: 1 # Eureka客户端向服务端发送心跳的时间间隔，单位为秒(默认是30秒)
  			lease-expiration-duration-in-seconds: 2 # Eureka服务端在收到最后一次心跳后等待时间上限，单位为秒(默认是90秒)，超时将剔除服务
```

![微服务信息显示.png](https://s2.loli.net/2022/12/20/9zKERUaXT1vgrBZ.png)
![微服务信息显示2.png](https://s2.loli.net/2022/12/20/ugOHPIox4zrTGQh.png)

## 20221221

#### 2. Zookeeper服务注册与发现

##### 基础概念

```shell
zookeeper是一个分布式协调工具，可以实现注册中心功能
```

##### docker下安装zookeeper

```shell
# 拉取镜像
docker pull zookeeper

# 运行容器
docker run -d --name "cloud-zookeeper" -p 2181:2181 zookeeper

# 进入容器
docker exec -it c2275b9c33a5 bash

# 客户端连接
./bin/zkCli.sh

# 查看当前节点
ls /
[zookeeper]
```

##### 创建Provider服务并注册进zookeeper

```shell
# pom.xml
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
</dependency>

# yml
server:
  port: 8004
spring:
  application:
    name: cloud-provider-payment
  cloud:
    zookeeper:
      connect-string: 192.168.163.128:2181
      
# 主启动类
@SpringBootApplication
@EnableDiscoveryClient  //该注解用于向使用consul或者zookeeper作为注册中心时注册服务
public class PaymentMain8004 {
    public static void main(String[] args) {
        SpringApplication.run(PaymentMain8004.class, args);
    }
}

# 测试controller
@RestController
public class PaymentController {
    @Value("${server.port}")
    private String serverPort;

    @GetMapping("/payment/zk")
    public String paymentZK() {
        return "spring cloud with zookeeper: " + serverPort + "\t" + UUID.randomUUID().toString();
    }
}

# 包冲突 见下面图片
由于spring-cloud-starter-zookeeper-discovery这包下自带了【3.5.3】的zookeeper包，而在docker里面我们的版本是【3.8.0】 因此需要单独排除子包而独立定义3.8.0版本的包
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
	<!--先排除自带的zookeeper3.5.3-->
	<exclusions>
		<exclusion>
			<groupId>org.apache.zookeeper</groupId>
			<artifactId>zookeeper</artifactId>
		</exclusion>
	</exclusions>
</dependency>
<!--添加zookeeper3.8.0版本-->
<dependency>
	<groupId>org.apache.zookeeper</groupId>
	<artifactId>zookeeper</artifactId>
	<version>3.8.0</version>
</dependency>

# 回到docker 
[zk: localhost:2181(CONNECTED) 0] ls /
[services, zookeeper]

# 进入services
[zk: localhost:2181(CONNECTED) 1] ls /services 
[cloud-provider-paymentZk]

# 进入服务
[zk: localhost:2181(CONNECTED) 2] ls /services/cloud-provider-paymentZk 
[2816779e-8c43-4d80-9aac-60fa3c5b2fd9]

# 获取节点详情
[zk: localhost:2181(CONNECTED) 3] get /services/cloud-provider-paymentZk/2816779e-8c43-4d80-9aac-60fa3c5b2fd9
{"name":"cloud-provider-paymentZk","id":"2816779e-8c43-4d80-9aac-60fa3c5b2fd9","address":"localhost","port":8004,"sslPort":null,"payload":{"@class":"org.springframework.cloud.zookeeper.discovery.ZookeeperInstance","id":"application-1","name":"cloud-provider-paymentZk","metadata":{}},"registrationTimeUTC":1671624409501,"serviceType":"DYNAMIC","uriSpec":{"parts":[{"value":"scheme","variable":true},{"value":"://","variable":false},{"value":"address","variable":true},{"value":":","variable":false},{"value":"port","variable":true}]}}

# 实际操作 发现 就算报错包不一致 但是依然可以注册进zk
```

![zk-error.png](https://s2.loli.net/2022/12/21/lSwmqrbzM4e68tv.png)

##### zookeeper服务节点是临时节点

```shell
当我们的服务宕机后，在几秒后zk会删除该节点，因此跟Eruka来比，zk会毫不留情
```

##### 创建Consumer服务并注册进zookeeper

```shell
# pom.xml
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-devtools</artifactId>
	<scope>runtime</scope>
	<optional>true</optional>
</dependency>

<dependency>
<groupId>org.projectlombok</groupId>
	<artifactId>lombok</artifactId>
	<optional>true</optional>
</dependency>

<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-test</artifactId>
	<scope>test</scope>
</dependency>

<!-- 引入自己定义的api通用包，可以使用Payment支付Entity -->
<dependency>
	<groupId>com.home.springcloud</groupId>
	<artifactId>cloud-api-commons</artifactId>
	<version>${project.version}</version>
</dependency>

<!-- SpringBoot整合zookeeper客户端 -->
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
	<!--先排除自带的zookeeper3.5.3-->
	<exclusions>
		<exclusion>
			<groupId>org.apache.zookeeper</groupId>
			<artifactId>zookeeper</artifactId>
		</exclusion>
	</exclusions>
</dependency>
<!--添加zookeeper3.8.0版本-->
<dependency>
	<groupId>org.apache.zookeeper</groupId>
	<artifactId>zookeeper</artifactId>
	<version>3.8.0</version>
</dependency>

# yml
server:
  port: 80

spring:
  application:
    name: cloud-consumer-orderZk80
  cloud:
    zookeeper:
      connect-string: 192.168.163.128:2181
      
# 主启动类
@SpringBootApplication
public class OrderMainZk80 {
    public static void main(String[] args) {
        SpringApplication.run(OrderMainZk80.class, args);
    }
}

# 配置RestTemplate
// config.ApplicationContextConfig.class
@Configuration
public class ApplicationContextConfig {
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
}

# controller
@RestController
public class OrderController {
    private static final String INVOKE_URL = "http://cloud-provider-paymentZk";

    @Resource
    private RestTemplate restTemplate;

    @GetMapping("/consumer/order/zk")
    public String test(){
        return restTemplate.getForObject(INVOKE_URL + "/provider/payment/zk", String.class);
    }
}
```

#### 3. Consul服务注册与发现

##### 基础概念

```shell
Consul 是一套开源的分布式服务发现和配置管理系统

提供了微服务系统中的服务治理、配置中心、控制总线等功能。这些功能中的每一个都可以根据需要单独使用，也可以一起使用以构建全方位的服务网格，总之Consul提供了一种完整的服务网格解决方案。

它具有很多优点。包括： 基于 raft 协议，比较简洁； 支持健康检查, 同时支持 HTTP 和 DNS 协议 支持跨数据中心的 WAN 集群 提供图形界面 跨平台，支持 Linux、Mac、Windows

# 服务发现
# 健康监测
# KV存储
# 多数据中心
# 可视化Web界面
```

##### docker下安装consul

```shell
# 拉取镜像
docker pull consul

# 运行容器
docker run -d --name "cloud-consul" -p 8500:8500 consul

# 访问hostname:8500
```

##### 创建Provider服务并注册到Consul

```shell
# pom.xml
# 注意spring-boot-starter-actuator基本跟web包 捆绑 注册中心会检测健康度
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
	<groupId>com.home.springcloud</groupId>
	<artifactId>cloud-api-commons</artifactId>
	<version>1.0-SNAPSHOT</version>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-devtools</artifactId>
	<scope>runtime</scope>
	<optional>true</optional>
</dependency>
<dependency>
	<groupId>org.projectlombok</groupId>
	<artifactId>lombok</artifactId>
	<optional>true</optional>
</dependency>
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-test</artifactId>
	<scope>test</scope>
</dependency>

<!-- SpringBoot整合consul客户端 -->
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-consul-discovery</artifactId>
</dependency>
# yml
server:
  port: 8006

spring:
  application:
    name: cloud-provider-paymentConsul
  cloud:
    consul:
      host: 192.168.163.128
      port: 8500
      discovery:
        hostname: 192.168.163.1
        service-name: ${spring.application.name}

# Main
@SpringBootApplication
@EnableDiscoveryClient
public class PaymentMainConsul8006 {
    public static void main(String[] args) {
        SpringApplication.run(PaymentMainConsul8006.class, args);
    }
}

# controller
@RestController
public class PaymentConsulController {
    @Value("${server.port}")
    private String serverPort;

    @GetMapping("/provider/payment/consul")
    public String test(){
        return "spring cloud with consul: " + serverPort + "\t" + UUID.randomUUID().toString();
    }
}
```

##### 创建Consumer服务并注册到Consul

```shell
# pom.xml
同上

# yml
server:
  port: 80

spring:
  cloud:
    consul:
      host: 192.168.163.128
      port: 8500
      discovery:
        service-name: ${spring.application.name}
        hostname: 192.168.163.1
  application:
    name: cloud-consumer-orderConsul80

# Main
@SpringBootApplication
@EnableDiscoveryClient
public class OrderMainConsul80 {
    public static void main(String[] args) {
        SpringApplication.run(OrderMainConsul80.class, args);
    }
}

# RestTemplate
@Configuration
public class ApplicationContextConfig {
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
}

# controller
@RestController
public class OrderController {
    private static final String INVOKE_URL = "http://cloud-provider-paymentConsul";

    @Resource
    private RestTemplate restTemplate;

    @GetMapping("/consumer/order/consul")
    public String test(){
        return restTemplate.getForObject(INVOKE_URL + "/provider/payment/consul", String.class);
    }
}
```

#### Eruka、Zookeeper、Consul异同点

```shell
# CAP
C:Consistency（强一致性）
A:Availability（可用性）
P:Partition tolerance（分区容错性）
CAP理论关注粒度是数据，而不是整体系统设计的策略
```

![CAP.png](https://s2.loli.net/2022/12/21/te3y4ZNWQbmCRrf.png)

![CAP-Eruka.png](https://s2.loli.net/2022/12/21/DhzY4cqFSwxeO2A.png)

![CAP-ZK&Consul.png](https://s2.loli.net/2022/12/21/o7Xx3NsJ91IOv6l.png)

## 20221224

### 服务调用

#### 1. Ribbon服务调用（注册中心获取服务实例+负载均衡）

##### 基础概念

```shell
1. Spring Cloud Ribbon是基于Netflix Ribbon实现的一套客户端负载均衡的工具。
2. 其主要功能是【客户端负载均衡】和【服务调用】
3. 在配置好需要进行负载均衡【Load Balance】的所有机器后，Ribbon会自动的让你基于某种规则去连接这些机器，当然也支持使用Ribbon其他规则来自定义负载均衡算法
```

##### 负载均衡

![Server-LB.png](https://s2.loli.net/2022/12/24/ljRfDVLC1ixNQKw.png)

```shell
# 理解
将所有请求先聚在一起，然后根据负载均衡算法分发请求达到合理分配请求，将服务器处理请求的效率达到最大化，从而到达HA（高可用）

# 服务器端负载均衡（集中式LB）在【消费方】与【提供方】之间使用【独立】的设施
	# 硬件方面 
	F5、Array
	# 软件方面
	LVS、Nginx
总结来说就是客户端如(浏览器)发送请求被服务端负载均衡拦截，根据负载均衡算法分发请求到具体的服务器上面来处理请求
【客户端】 -》 【负载均衡服务器】 -》 【服务端】

# 客户端负载均衡（进程内LB）将LB逻辑集成到【消费方】，由消费方配置的规则决定从众多的【服务方】地址中选取对应的
由于分布式Spring Cloud分布式框架出现，站在【消费者服务】角度来看，当存在有多个【提供者服务】时，如果去平衡消费者服务调用提供者服务，因此，就有了客户端负载均衡说法。
比如Ribbon，就在【消费者服务】本地下，在消费者调用【提供者服务】微服务接口时，它会在注册中心上获取注册信息服务列表后缓存到JVM本地，从而在本地实现RPC远程调用。
【客户端】 -》 【服务端】
在目前的知识背景下，就是使用Ribbon的LB + RestTemplate来RPC微服务
```

![Server-LB.png](https://s2.loli.net/2022/12/24/ljRfDVLC1ixNQKw.png)

![Client-LB.png](https://s2.loli.net/2022/12/24/f1ns4LgFqpDdaHJ.png)

##### Ribbon + Eureka + RestTemplate

```shell
# 搭配
首先Ribbon只是一个具有负载均衡功能的客户端组件（类库），它可以搭配Eureka【注册中心】和RestTemplate【http请求】来使用，也可以搭配其他组件一起使用

# 独立pom
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-ribbon</artifactId>
</dependency>

# Eureka自带了Ribbon组件
spring-cloud-starter-netflix-eureka-client包中 自带了spring-cloud-starter-netflix-ribbon组件，因此若我们在使用Eureka时不用再次引入Ribbon

# RestTemplate
Spring 封装的处理同步 HTTP 请求的类，后面Spring更推荐使用【WebClient】来替代【RestTemplate】尤其是在异步请求的场景上
```

##### Ribbon核心组件IRule

```shell
首先IRule是一个根接口，下面的【实现】就是从特定的算法中从微服务列表中选取一个需要访问的服务
# 轮询
RoundRobinRule
# 随机
RandomRule
# 重试
RetryRule - 先按照RoundRobinRule的策略获取服务，若服务获取失败则在指定时间内会进行重试，直到获取到可用服务
# 权重
WeightedResponseTimeRule - 对RoundRobinRule的扩展，响应速度越快的实例选择权重越大，越容易被选择
# 最可用
BestAvailableRule - 会优先过滤掉多次访问失败而处于断路器跳闸状态的服务，然后选择一个并发量最小的服务实例
# 过滤
AvailabilityFilteringRule - 先过滤掉有故障的实例，再选择并发较小的服务实例
# 区域选择
ZoneAvoidanceRule - 复合判断Server所在区域的性能和Server的可用性选择服务器

```

##### 如何配置使用其他规则

```shell
# 非当前服务@ComponentScan包扫描范围外创建新Rule配置项
默认的扫描包路径@ComponentScan是在该服务启动Main主程序类下所有包
package com.home.springcloud

# 规则配置项
package com.home.RibbonRule
@Configuration
public class OtherRule
{
    @Bean
    public IRule otherRule()
    {
        return new RandomRule();// 定义为随机模式
    }
}

# 在需要使用Ribbon-Rule的主启动类上加@RibbonClient注解
@SpringBootApplication
@EnableEurekaClient
@RibbonClient(name = "CLOUD-PAYMENT-SERVICE",configuration = OtherRule.class)
# 也可以定义多个
@RibbonClients(value = {
        @RibbonClient(name = "提供方服务名称",configuration = Rule配置类文件),
        @RibbonClient(name = "demo",configuration = DemoRibbonConfig.class)
})
public class OrderMain80
{
    public static void main(String[] args)
    {
        SpringApplication.run(OrderMain80.class,args);
    }
}

# 同时取消掉之前在Bean RestTemplate上的@LoadBalanced注解 来使用自定义其他规则的RibbonClinent
```

##### Ribbon负载均衡-轮询原理

```shell
rest接口【第几次请求数】 % 【服务器集群总数量】 = 【实际调用服务器位置下标】  ，每次服务重启动后rest接口计数从1开始。
```

#### 2. Feign和OpenFeign服务调用（集成Ribbon）

##### 基础概念

```shell
# Feign
1. Netflix Feign 是 Netflix 公司发布的一种实现负载均衡和服务调用的开源组件。Spring Cloud 将其与 Netflix 中的其他开源服务组件（例如 Eureka、Ribbon 以及 Hystrix 等）一起整合进 Spring Cloud Netflix 模块中，整合后全称为 Spring Cloud Netflix Feign。
2. Feign 对 Ribbon 进行了集成，利用 Ribbon 维护了一份可用服务清单，并通过 Ribbon 实现了客户端的负载均衡。
3. Feign 是一种声明式服务调用组件，它在 RestTemplate 的基础上做了进一步的封装。通过 Feign，我们只需要声明一个接口并通过注解进行简单的配置，可以像调用本地方法一样来调用远程服务，而完全感觉不到这是在进行远程调用。
4. Feign 支持多种注解，例如 Feign 自带的注解以及 JAX-RS 注解等，但遗憾的是 Feign 本身并不支持 Spring MVC 注解

# OpenFeign
OpenFeign 全称 Spring Cloud OpenFeign，它是 Spring 官方推出的一种声明式服务调用与负载均衡组件，对 Feign 的二次封装，它具有 Feign 的所有功能，并在 Feign 的基础上增加了对 Spring MVC 注解的支持，例如 @RequestMapping、@GetMapping 和 @PostMapping 等。

# 两者相同点
1. Feign 和 OpenFeign 都是 Spring Cloud 下的远程调用和负载均衡组件。
2. Feign 和 OpenFeign 作用一样，都可以实现服务的远程调用和负载均衡。
3. Feign 和 OpenFeign 都对 Ribbon 进行了集成，都利用 Ribbon 维护了可用服务清单，并通过 Ribbon 实现了客户端的负载均衡。
4. Feign 和 OpenFeign 都是在服务消费者（客户端）定义服务绑定接口并通过注解的方式进行配置，以实现远程服务的调用。
5. 两者都是Rest Client，即都在【消费端】使用

# 两者不同点
1. Feign 和 OpenFeign 的依赖项不同，Feign 的依赖为 spring-cloud-starter-feign，而 OpenFeign 的依赖为 spring-cloud-starter-openfeign。
2. Feign 和 OpenFeign 支持的注解不同，Feign 支持 Feign 注解和 JAX-RS 注解，但不支持 Spring MVC 注解；OpenFeign 除了支持 Feign 注解和 JAX-RS 注解外，还支持 Spring MVC 注解。
```

##### 为什么出现

```shell
# Ribbon+RestTemplate
在前面，我们只使用了【Ribbon】+【RestTemplate】，其中利用RestTemplate对http请求的封装处理，再利用Ribbon对远程服务本地化清单和自我实现的本地化客户端负载均衡功能，形成了一套模板化的调用远程方法
# 缺点
往往实际开发中，针对同一个远程服务方法，可能在多处被调用，这样我们就会去写很多处的RestTemplate引入及调用
# Feign进化 -> OpenFeign
因此，Feign的实现下，我们只需要创建一个独立的远程服务方法【接口】并利用【注解】的方式来配置它，【接口方法】同【远程服务方法】（Controller层）完成绑定，接下来则可以直接像本地Controller调Service一样的调用Feign接口（类Service）所对应的远程服务。同时它也集成了Ribbon，一样的可以实现负载均衡。
```

##### 如何使用及原理

```shell
# pom.xml
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>

# yml
server:
  port: 80

eureka:
  client:
    register-with-eureka: false # 不把自己注册进Eureka
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka/,http://eureka7002.com:7002/eureka/
      
# 主入口
@SpringBootApplication
@EnableFeignClients # 开启OpenFeign组件
public class OrderOpenFeignMain80 {
    public static void main(String[] args) {
        SpringApplication.run(OrderOpenFeignMain80.class, args);
    }
}

# 远程服务接口本地定义
@FeignClient(value = "CLOUD-PAYMENT-SERVICES")
public interface PaymentOpenFeignService {
    @GetMapping("/provider/openFeign")
    public String useByOpenFeign();
}

# 本地Controller
@RestController
public class PaymentOpenFeignController {

    @Resource
    private PaymentOpenFeignService paymentOpenFeignService;

    @GetMapping("/consumer/payment/openFeign")
    public String test(){
        return paymentOpenFeignService.useByOpenFeign();
    }
}

# 原理
1. 添加@EnableFeignClients注解开启对OpenFeign下的Feign Client扫描加载处理
2. 根据Feign Client开发规范，定义接口并加@FeignClient注解
3. 当程序启动时，会进行包扫描，扫描所有@FeignClient注解的类，并注入到Spring IOC容器中
4. 当定义的Feign接口中的方法被调用时，通过JDK的动态代理方式，来生成具体的RequestTemplate。当生成代理时，Feign会为每个接口方法创建一个RequestTemplate对象，该对象封装了HTTP请求需要的全部信息，如请求参数名、请求方法等信息都在这个过程中确定
5. 然后由RequestTemplate生成Request，然后把这个Request交给client处理，这里指的Client可以是JDK原生的URLConnection、Apache的Http Client，也可以是Okhttp
6. 最后Client被封装到LoadBalanceClient类，这个类结合Ribbon负载均衡发起服务之间的调用。
```

##### OpenFeign超时控制

```shell
# 问题
OpenFeign 客户端的默认超时时间为 1 秒钟，如果服务端处理请求的时间超过 1 秒就会报错。为了避免这样的情况，我们需要对 OpenFeign 客户端的超时时间进行控制。

# 解决
客户端yml中配置
ribbon:
  ReadTimeout: 6000 #建立连接所用的时间，适用于网络状况正常的情况下，两端两端连接所用的时间
  ConnectionTimeout: 6000 #建立连接后，服务器读取到可用资源的时间
  
# 底层
由于 OpenFeign 集成了 Ribbon ，其服务调用以及负载均衡在底层都是依靠 Ribbon 实现的，因此 OpenFeign 超时控制也是通过 Ribbon 来实现的。
```

##### OpenFeign日志增强

```shell
# 使用
OpenFeign 提供了日志打印功能，我们可以通过配置调整日志级别，来了解请求的细节。Feign 为每一个 FeignClient 都提供了一个 feign.Logger 实例，通过它可以对 OpenFeign 服务绑定接口的调用情况进行监控。

# 日志分类
NONE：默认的，不显示任何日志；
BASIC：仅记录请求方法、URL、响应状态码及执行时间；
HEADERS：除了 BASIC 中定义的信息之外，还有请求和响应的头信息；
FULL：除了 HEADERS 中定义的信息之外，还有请求和响应的正文及元数据。

# 配置
1. 客户端yml中配置
logging:
  level:
    #feign 日志以什么样的级别监控该接口
    com.home.springcloud.service.PaymentOpenFeignService: debug
    #[全类路径名]：日志级别

2. 日志配置Bean
@Configuration
public class FeignConfig
{
    @Bean
    Logger.Level feignLoggerLevel()
    {
        return Logger.Level.FULL;
    }
}
```

## 20221231

### 断路器

#### 1. Hystrix

##### 分布式系统面临的问题

```shell
# 问题
复杂分布式体系结构中的应用程序有数十个依赖关系，每个依赖关系在某些时候将不可避免地失败。

# 服务雪崩
多个微服务之间调用的时候，假设微服务A调用微服务B和微服务C，微服务B和微服务C又调用其它的微服务，这就是所谓的“扇出”。如果扇出的链路上某个微服务的调用响应时间过长或者不可用，对微服务A的调用就会占用越来越多的系统资源，进而引起系统崩溃
```

##### 基础概念

```shell
# Hystrix是什么
Hystrix是一个用于处理分布式系统的【延迟】和【容错】的开源库，在分布式系统里，许多依赖不可避免的会调用失败，比如超时、异常等，Hystrix能够保证在一个依赖出问题的情况下，【不会导致整体服务失败，避免级联故障，以提高分布式系统的弹性】。

# Hystrix是如何处理
“断路器”本身是一种开关装置，当某个服务单元发生故障之后，通过断路器的故障监控（类似熔断保险丝），【向调用方返回一个符合预期的、可处理的备选响应（FallBack），而不是长时间的等待或者抛出调用方无法处理的异常】，这样就保证了服务调用方的线程不会被长时间、不必要地占用，从而避免了故障在分布式系统中的蔓延，乃至雪崩。

# Hystrix能提供哪些功能
1. 服务降级
2. 服务熔断
3. 接近实时的监控
```

##### 服务降级

```shell
# 那些情况下会触发服务降级
1. 程序运行时异常
2. 超时
3. 服务熔断 -> 触发服务降级
4. 线程池、信号量打满

# 服务降级时会怎么处理
向调用方返回一个符合预期的、可处理的备选响应 Fallback处理

# 在哪方配置降级
可同时在【服务方】和【消费方】作服务降级处理
1. 调用【服务方】- “超时”，【消费方】可降级
2. 调用【服务方】- “down机”，【消费方】可降级
3. 调用【服务方】- “异常”，【消费方】可降级
4. 调用【消费方】- 【服务方】“正常”，但【消费方】- “down机、设置超时较小或异常”，自身可降级

# 消费者80、服务者8001
1. 服务方8001
    # 关键pom
    <!--hystrix-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
    </dependency>
    <!--eureka client-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    # yml
    server:
      port: 8001
    spring:
      application:
        name: cloud-provider-hystrix-payment
    eureka:
      client:
        service-url:
          defaultZone: http://localhost:7001/eureka
    # 主启动
    @SpringBootApplication
    @EnableEurekaClient
    public class HystrixPaymentMain8001 {
        public static void main(String[] args) {
            SpringApplication.run(HystrixPaymentMain8001.class, args);
        }
    }
    # Service impl
    @Service
    public class HystrixPaymentServiceImpl implements HystrixPaymentService {
        @Override
        public String paymentOk(Integer id) {
            return "访问成功！当前线程池名称：" + Thread.currentThread().getName() + " paymentOk方法，传入id是：" + id;
        }
        @Override
        public String paymentTimeout(Integer id) {
            try{
                TimeUnit.SECONDS.sleep(3);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            return "访问成功！当前线程池名称：" + Thread.currentThread().getName() + " paymentTimeout方法，传入id是：" + id;
        }
    }
    # Controller 
    @RestController
    @Slf4j
    @RequestMapping("/provider/payment/hystrix")
    public class HystrixPaymentController {
        @Resource
        private HystrixPaymentService hystrixPaymentService;
        @Value("${server.port}")
        private String serverPort;
        @GetMapping("/ok/{id}")
        public String paymentOk(@PathVariable("id") Integer id) {
            String result = hystrixPaymentService.paymentOk(id);
            log.info("paymentOk----result", result);
            return result;
        }
        @GetMapping("/timeout/{id}")
        public String paymentTimeout(@PathVariable("id") Integer id) {
            String result = hystrixPaymentService.paymentTimeout(id);
            log.info("paymentTimeout----result", result);
            return result;
        }
    }
    
2. 消费方80
    # 关键pom
    <!--openfeign-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    <!--hystrix-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
    </dependency>
    <!--eureka client-->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    # yml
    server:
      port: 80

    eureka:
      client:
        service-url:
          defaultZone: http://localhost:7001/eureka
    # 主启动
    @SpringBootApplication
    @EnableEurekaClient
    @EnableFeignClients
    public class HystrixOrderMain80 {
        public static void main(String[] args) {
            SpringApplication.run(HystrixOrderMain80.class, args);
        }
    }
    # OpenFeign
    @Service
    @FeignClient("CLOUD-PROVIDER-HYSTRIX-PAYMENT")
    public interface PaymentHystrixService {
        @GetMapping("/ok/{id}")
        String paymentOk(@PathVariable("id") Integer id);

        @GetMapping("/timeout/{id}")
        String paymentTimeout(@PathVariable("id") Integer id);
    }
    # Controller
    @RestController
    @Slf4j
    @RequestMapping("/consumer/order/")
    public class OrderHystrixController {
        @Autowired
        private PaymentHystrixService paymentHystrixService;

        @GetMapping("/ok/{id}")
        public String orderOk(@PathVariable("id") Integer id){
            return paymentHystrixService.paymentOk(id);
        }

        @GetMapping("/timeout/{id}")
        public String orderTimeout(@PathVariable("id") Integer id){
            return paymentHystrixService.paymentTimeout(id);
        }
    }

# 如何配置
1. 服务者8001
    # 开启Hystrix的服务降级
    @SpringBootApplication
    @EnableEurekaClient
    @EnableCircuitBreaker # 切记需要开启
    public class HystrixPaymentMain8001 {
        public static void main(String[] args) {
            SpringApplication.run(HystrixPaymentMain8001.class, args);
        }
    }

    # Service Impl 配置降级fallback方法
    @Override
        @HystrixCommand(
        fallbackMethod = "paymentTimeout_fallback", # 降级方法名称
        commandProperties = {
                @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "3000") # 超时3秒后 自动调用fallbackMethod
        })
        public String paymentTimeout(Integer id) {
            try {
                TimeUnit.SECONDS.sleep(5); # 暂停5秒
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            return "访问成功！当前线程池名称：" + Thread.currentThread().getName() + " paymentTimeout方法，传入id是：" + id;
        }
        # 降级fallback方法
        public String paymentTimeout_fallback(Integer id) {
            return "调用paymentTimeout超时或者异常：" + "\t当前线程池名字：" + Thread.currentThread().getName() + "id:" + id;
        }
        
2. 消费者80
# yml 配置feign的hystrix开启
feign:
  hystrix:
    enabled: true
    
# 主启动 开启Hystrix
@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients
@EnableHystrix # 开启Hystrix
public class HystrixOrderMain80 {
    public static void main(String[] args) {
        SpringApplication.run(HystrixOrderMain80.class, args);
    }
}

# 由于使用OpenFeign则消费者在Controller层开启服务降级
@GetMapping("/timeout/{id}")
@HystrixCommand(
	fallbackMethod = "orderTimeout_fallback",
	commandProperties = {
		@HystrixProperty(
			name = "execution.isolation.thread.timeoutInMilliseconds",
			value = "1500"
		)
	}
)
public String orderTimeout(@PathVariable("id") Integer id) {
	return paymentHystrixService.paymentTimeout(id);
}

public String orderTimeout_fallback(Integer id) {
	return "消费者，fallback方法";
}

3. 以上存在的不优雅地方
	# 3.1 每个方法都对应了一个fallback方法 造成代码膨胀
		采用@DefaultProperties注解中的defaultFallback属性
		
		@DefaultProperties(
                defaultFallback = "orderTimeout_global_fallback",
                commandProperties = {
                    @HystrixProperty(
                            name = "execution.isolation.thread.timeoutInMilliseconds",
                            value = "4500"
                    )
        })
        public class OrderHystrixController {
            @GetMapping("/timeout/global/{id}")
            @HystrixCommand
            public String orderTimeoutGlobal(Integer id) {
                return paymentHystrixService.paymentTimeout(id);
            }

            public String orderTimeout_global_fallback() {
                return "我是公共的fallback方法";
            }
        }
        
	# 3.2 fallback逻辑同业务逻辑混在一起（消费方Feign接口）
		独立一个类，去实现Feign接口，重写的方法就是fallback方法
		@Component
            public class PaymentHystrixFallbackService implements PaymentHystrixService{
                @Override
                public String paymentOk(Integer id) {
                    return null;
                }

                @Override
                public String paymentTimeout(Integer id) {
                    return "单独fallback类实现Feign接口"; # 异常处理方法
                }
            }
            
          @Service
            @FeignClient(value = "CLOUD-PROVIDER-HYSTRIX-PAYMENT",fallback = PaymentHystrixFallbackService.class) # 指明fallback到具体类
            public interface PaymentHystrixService {
                @GetMapping("/ok/{id}")
                String paymentOk(@PathVariable("id") Integer id);

                @GetMapping("/timeout/{id}")
                String paymentTimeout(@PathVariable("id") Integer id);
            }
```

##### 服务熔断

```shell
# 熔断是什么
	熔断机制是应对雪崩效应的一种微服务链路保护机制。当扇出链路的某个微服务出错不可用或者响应时间太长时，会进行服务的降级，进而熔断该节点微服务的调用，快速返回错误的响应信息。【当检测到该节点微服务调用响应正常后，恢复调用链路】。
	在Spring Cloud框架里，熔断机制通过Hystrix实现。Hystrix会监控微服务间调用的状况，当失败的调用到一定阈值，缺省是5秒内20次调用失败，就会启动熔断机制。熔断机制的注解是【@HystrixCommand】。
	熔断在降级的基础上，增加了一种缓冲机制及最特殊的恢复调用，当open时也是走的降级。
	
# 熔断类型
	熔断打开（open）：请求不再进行调用当前服务，内部设置时钟一般为MTTR（平均故障处理时间)，当打开时长达到所设时钟则进入半熔断状态。
	熔断半开（halfOpen）：部分请求根据规则调用当前服务，如果请求成功且符合规则则认为当前服务恢复正常，关闭熔断。
	熔断关闭（close）：熔断关闭不会对服务进行熔断，恢复正常链路。
	
# 如何配置开启熔断功能
	@HystrixCommand(
		fallbackMethod = "paymentCircuitBreaker_fallback",
		commandProperties = {
		    # 1. 开启熔断
        	@HystrixProperty(name = "circuitBreaker.enabled",value = "true"),
        	# 2. 在具体的时间范围内有以下情况发生
        	@HystrixProperty(name = "circuitBreaker.sleepWindowInMilliseconds",value = "10000"),
        	# 3. 请求次数超过了峰值，将打开熔断
        	@HystrixProperty(name = "circuitBreaker.requestVolumeThreshold",value = "10"), 
        	# 4. 失败率达多少后，将打开熔断
        	@HystrixProperty(name = "circuitBreaker.errorThresholdPercentage",value = "60"),
	})
	
# 熔断在什么情况下起作用说明
	涉及到断路器的三个重要参数：【快照时间窗】、【请求总数阀值】、【错误百分比阀值】。
    1：快照时间窗【circuitBreaker.sleepWindowInMilliseconds】：断路器确定是否打开需要统计一些请求和错误数据，而统计的时间范围就是快照时间窗，默认为最近的10秒。
	2：请求总数阀值【circuitBreaker.requestVolumeThreshold】：在快照时间窗内，必须满足请求总数阀值才有资格熔断。默认为20，意味着在10秒内，如果该hystrix命令的调用次数不足20次，即使所有的请求都超时或其他原因失败，断路器都不会打开。
	3：错误百分比阀值【circuitBreaker.errorThresholdPercentage】：当请求总数在快照时间窗内超过了阀值，比如发生了30次调用，如果在这30次调用中，有15次发生了超时异常，也就是超过50%的错误百分比，在默认设定50%阀值情况下，这时候就会将断路器打开。	

# 熔断发生例子：
	1. 当满足一定的阀值的时候（默认10秒内超过20个请求次数）
	2. 当失败率达到一定的时候（默认10秒内超过50%的请求失败）
	3. 到达以上阀值，断路器将会开启
	4. 当开启的时候，所有请求都不会进行转发
	5. 一段时间之后（默认是5秒），这个时候断路器是半开状态，会让其中一个请求进行转发。
	6. 如果成功，断路器会关闭，若失败，继续开启。重复4和5
	
# 熔断恢复链路说明
	hystrix也为我们实现了自动恢复功能。当断路器打开，对主逻辑进行熔断之后，hystrix会启动一个休眠时间窗，在这个时间窗内，降级逻辑是临时的成为主逻辑，当休眠时间窗到期，断路器将进入半开状态，释放一次请求到原来的主逻辑上，如果此次请求正常返回，那么断路器将继续闭合，主逻辑恢复，如果这次请求依然有问题，断路器继续进入打开状态，休眠时间窗重新计时。
	
# 熔断参数配置
	# 设置隔离策略，THREAD 表示线程池 SEMAPHORE：信号池隔离
	@HystrixProperty(name = "execution.isolation.strategy", value = "THREAD")
	
	# 当隔离策略选择信号池隔离的时候，用来设置信号池的大小（最大并发数）
	@HystrixProperty(name = "execution.isolation.semaphore.maxConcurrentRequests", value = "10")
	
	# 配置命令执行的超时时间
	@HystrixProperty(name = "execution.isolation.thread.timeoutinMilliseconds", value = "10")
	
	# 是否启用超时时间
	@HystrixProperty(name = "execution.timeout.enabled", value = "true")
	
	# 执行超时的时候是否中断
	@HystrixProperty(name = "execution.isolation.thread.interruptOnTimeout", value = "true")
	
	# 执行被取消的时候是否中断
	@HystrixProperty(name = "execution.isolation.thread.interruptOnCancel", value = "true")
	
	# 允许回调方法执行的最大并发数
	@HystrixProperty(name = "fallback.isolation.semaphore.maxConcurrentRequests", value = "10")
	
	# 服务降级是否启用，是否执行回调函数
	@HystrixProperty(name = "fallback.enabled", value = "true")
	
	# 是否启用断路器
	@HystrixProperty(name = "circuitBreaker.enabled", value = "true")
	
	# 该属性用来设置在滚动时间窗中，断路器熔断的最小请求数。例如，默认该值为 20 的时候，如果滚动时间窗（默认10秒）内仅收到了19个请求， 即使这19个请求都失败了，断路器也不会打开
	@HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "20")
	
	# 属性用来设置在滚动时间窗中，表示在滚动时间窗中，在请求数量超过，默认50%
	@HystrixProperty(name = "circuitBreaker.errorThresholdPercentage", value = "50")
	
	# 该属性用来设置当断路器打开之后的休眠时间窗。 休眠时间窗结束之后，会将断路器置为 "半开" 状态，尝试熔断的请求命令，如果依然失败就将断路器继续设置为 "打开" 状态，如果成功就设置为 "关闭" 状态
	@HystrixProperty(name = "circuitBreaker.sleepWindowinMilliseconds", value = "5000")
	
	# 断路器强制打开
	@HystrixProperty(name = "circuitBreaker.forceOpen", value = "false")
	
	# 断路器强制关闭
	@HystrixProperty(name = "circuitBreaker.forceClosed", value = "false")
	
	# 滚动时间窗设置，该时间用于断路器判断健康度时需要收集信息的持续时间
	@HystrixProperty(name = "metrics.rollingStats.timeinMilliseconds", value = "10000")
	
	# 该属性用来设置滚动时间窗统计指标信息时划分"桶"的数量，断路器在收集指标信息的时候会根据。设置的时间窗长度拆分成多个 "桶" 来累计各度量值，每个"桶"记录了一段时间内的采集指标。比如 10 秒内拆分成 10 个"桶"收集这样，所以 timeinMilliseconds 必须能被 numBuckets 整除。否则会抛异常。
	@HystrixProperty(name = "metrics.rollingStats.numBuckets", value = "10")
	
	# 该属性用来设置对命令执行的延迟是否使用百分位数来跟踪和计算。如果设置为 false, 那么所有的概要统计都将返回 -1
	@HystrixProperty(name = "metrics.rollingPercentile.enabled", value = "false")
	
	# 该属性用来设置百分位统计的滚动窗口的持续时间，单位为毫秒。
	@HystrixProperty(name = "metrics.rollingPercentile.timeInMilliseconds", value = "60000")
	
	# 该属性用来设置百分位统计滚动窗口中使用 “ 桶 ”的数量。
	@HystrixProperty(name = "metrics.rollingPercentile.numBuckets", value = "60000")
	
	# 该属性用来设置在执行过程中每个 “桶” 中保留的最大执行次数。如果在滚动时间窗内发生超过该设定值的执行次数，就从最初的位置开始重写。例如，将该值设置为100, 滚动窗口为10秒，若在10秒内一个 “桶 ”中发生了500次执行，那么该 “桶” 中只保留 最后的100次执行的统计。另外，增加该值的大小将会增加内存量的消耗，并增加排序百分位数所需的计算时间。
	@HystrixProperty(name = "metrics.rollingPercentile.bucketSize", value = "100")
	
	# 该属性用来设置采集影响断路器状态的健康快照（请求的成功、 错误百分比）的间隔等待时间。
	@HystrixProperty(name = "metrics.healthSnapshot.intervalinMilliseconds", value = "500")
	
	# 是否开启请求缓存
	@HystrixProperty(name = "requestCache.enabled", value = "true")
	
	# HystrixCommand的执行和事件是否打印日志到 HystrixRequestLog 中
	@HystrixProperty(name = "requestLog.enabled", value = "true")
	
	# 线程池相关
	threadPoolProperties = {
		# 该参数用来设置执行命令线程池的核心线程数，该值也就是命令执行的最大并发量
		@HystrixProperty(name = "coreSize", value = "10")
		
		# 该参数用来设置线程池的最大队列大小。当设置为 -1 时，线程池将使用 SynchronousQueue 实现的队列，否则将使用 LinkedBlockingQueue 实现的队列
		@HystrixProperty(name = "maxQueueSize", value = "-1")
		
		# 该参数用来为队列设置拒绝阈值。 通过该参数， 即使队列没有达到最大值也能拒绝请求。该参数主要是对 LinkedBlockingQueue 队列的补充,因为 LinkedBlockingQueue，队列不能动态修改它的对象大小，而通过该属性就可以调整拒绝请求的队列大小了。
		@HystrixProperty(name = "queueSizeRejectionThreshold", value = "5")
	}
	
# Hystrix工作流程
	1. 创建 HystrixCommand（用在依赖的服务返回单个操作结果的时候） 或 HystrixObserableCommand（用在依赖的服务返回多个操作结果的时候） 对象。
	2. 	命令执行。其中 HystrixComand 实现了下面前两种执行方式；而 HystrixObservableCommand 实现了后两种执行方式：
		execute()：同步执行，从依赖的服务返回一个单一的结果对象， 或是在发生错误的时候抛出异常。		 queue()：异步执行， 直接返回 一个Future对象， 其中包含了服务执行结束时要返回的单一结果对象。
		observe()：返回 Observable 对象，它代表了操作的多个结果，它是一个 Hot Obserable（不论 "事件源" 是否有 "订阅者"，都会在创建后对事件进行发布，所以对于 Hot Observable 的每一个 "订阅者" 都有可能是从 "事件源" 的中途开始的，并可能只是看到了整个操作的局部过程）。
		toObservable()： 同样会返回 Observable 对象，也代表了操作的多个结果，但它返回的是一个Cold Observable（没有 "订阅者" 的时候并不会发布事件，而是进行等待，直到有 "订阅者" 之后才发布事件，所以对于 Cold Observable 的订阅者，它可以保证从一开始看到整个操作的全部过程）。
	3. 若当前命令的请求缓存功能是被启用的， 并且该命令缓存命中， 那么缓存的结果会立即以 Observable 对象的形式 返回。
	4. 	检查断路器是否为打开状态。如果断路器是打开的，那么Hystrix不会执行命令，而是转接到 fallback 处理逻辑（第 8 步）；如果断路器是关闭的，检查是否有可用资源来执行命令（第 5 步）。
	5. 线程池/请求队列/信号量是否占满。如果命令依赖服务的专有线程池和请求队列，或者信号量（不使用线程池的时候）已经被占满， 那么 Hystrix 也不会执行命令， 而是转接到 fallback 处理逻辑（第8步）。
	6. 	Hystrix 会根据我们编写的方法来决定采取什么样的方式去请求依赖服务。HystrixCommand.run() ：返回一个单一的结果，或者抛出异常。HystrixObservableCommand.construct()： 返回一个Observable 对象来发射多个结果，或通过 onError 发送错误通知。
	7. Hystrix会将 "成功"、"失败"、"拒绝"、"超时" 等信息报告给断路器， 而断路器会维护一组计数器来统计这些数据。断路器会使用这些统计数据来决定是否要将断路器打开，来对某个依赖服务的请求进行 "熔断/短路"。
	8. 当命令执行失败的时候， Hystrix 会进入 fallback 尝试回退处理， 我们通常也称该操作为 "服务降级"。而能够引起服务降级处理的情况有下面几种：第4步： 当前命令处于"熔断/短路"状态，断路器是打开的时候。第5步： 当前命令的线程池、 请求队列或 者信号量被占满的时候。第6步HystrixObservableCommand.construct() 或 HystrixCommand.run() 抛出异常的时候。
	9. 当Hystrix命令执行成功之后， 它会将处理结果直接返回或是以Observable 的形式返回。
	
	10. 如果我们没有为命令实现降级逻辑或者在降级处理逻辑中抛出了异常， Hystrix 依然会返回一个 Observable 对象， 但是它不会发射任何结果数据， 而是通过 onError 方法通知命令立即中断请求，并通过onError()方法将引起命令失败的异常发送给调用者。
```

![hystrix-熔断原理.png](https://s2.loli.net/2023/01/07/ufXQPAHtU6D3hjM.png)

![hystrix-熔断工作流程.png](https://s2.loli.net/2023/01/07/qL2MbXAVEZ5DJiw.png)

## 20230107

### 网关

#### 1. Zuul

##### 什么是网关

![Api网关.png](https://s2.loli.net/2023/01/08/VBJEcAoIKtTDUe5.png)

```shell
1. API网关为微服务架构中的服务提供了【统一的访问入口】，【客户端】通过API网关【访问相关服务】
2. API网关的定义类似于设计模式中的【门面模式】，它相当于整个微服务架构中的门面，所有【客户端的访问】都通过它来【进行路由及过滤】。它实现了【请求路由】、【负载均衡】、【校验过滤】、【服务容错】、【服务聚合】等功能。
```

##### 什么是Zuul

```shell
1. Zuul是一种提供动态路由、监视、弹性、安全性等功能的边缘服务。
2. Zuul是Netflix出品的一个基于JVM路由和服务端的负载均衡器。
3. Zuul具备代理+路由+过滤三大功能。
```

##### 网关的负载均衡

![Api网关-负载均衡.png](https://s2.loli.net/2023/01/08/JWE7N1ok9AqMsge.png)

```shell
1. 网关为入口，由网关与微服务进行交互，所以网关必须要实现负载均衡的功能；
2. 网关会获取微服务注册中心里面的服务连接地址，再配合一些算法选择其中一个服务地址，进行处理业务。
3. 这个属于客户端侧的负载均衡，由调用方去实现负载均衡逻辑。
```

##### 网关的灰度发布

![Api网关-灰度发布.png](https://s2.loli.net/2023/01/08/kqPEGNzlLIZDsAw.png)

```shell
在灰度发布开始后，先启动一个新版本应用，但是并不直接将流量切过来，而是测试人员对新版本进行线上测试，启动的这个新版本应用，就是我们的金丝雀。如果没有问题，那么可以将少量的用户流量导入到新版本上，然后再对新版本做运行状态观察，收集各种运行时数据，如果此时对新旧版本做各种数据对比，就是所谓的A/B测试。新版本没什么问题，那么逐步扩大范围、流量，把所有用户都迁移到新版本上面来。
```

##### Zuul路由配置

```shell
# pom.xml 由于只是作网关 因此不需要引入【web gav坐标】 否则提示错误
<!--        网关Zuul-->
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-netflix-zuul</artifactId>
</dependency>
<!--        网关也属于微服务 需要注册到注册中心-->
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

# yml
server:
  port: 9527

spring:
  application:
    name: cloud-zuul-gateway

eureka:
  client:
    service-url:
      defaultZone: http://localhost:7001/eureka
  instance:
    instance-id: zuul-9527.com
    prefer-ip-address: true
    
# 主启动
@SpringBootApplication
@EnableZuulProxy
public class ZuulGateWayMain9527 {
    public static void main(String[] args) {
        SpringApplication.run(ZuulGateWayMain9527.class, args);
    }
}

# Zuul配置
zuul:
  routes:
    api: # 路由节点名称 自定义 则url里面必须带api
      path: /api/** # 以api打头的 路由转发到CLOUD-PAYMENT-SERVICE下
      service-id: CLOUD-PAYMENT-SERVICE
      
# 测试
http://localhost:8001/provider/getServerPort # 8001
http://localhost:9527/api/provider/getServerPort # 8001

# 忽略原有真实服务名
zuul:
	ignored-services: cloud-provider-payment
    
# Zuul集成了Ribbon和Hystrix，因此天生支持负载均衡和服务容错能力
zuul:
  routes:
    api: # 路由节点名称 自定义 则url里面必须带api
      path: /api/** # 以api打头的 路由转发到CLOUD-PAYMENT-SERVICE下
      service-id: CLOUD-PAYMENT-SERVICE
    test:
      path：/test/**
      service-id: CLOUD-TEST-SERVICE

# 配置统一的前缀
zuul: 
  prefix: /gateWay
  ignored-services: "*"
  routes:
  	test1:
  		path: /api/**
  		service-id: CLOUD-PAYMENT-SERVICE
    test2:
    	path: /test2/**
    	service-id: CLOUD-TEST-SERVICE
```

##### 查看路由信息-actuator配合

```shell
# pom.xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

# yml
# 开启查看路由的端点
management:
  endpoints:
    web:
      exposure:
        include: 'routes' 
        
# 访问
http://localhost:9527/actuator/routes
```

##### Zuul过滤器

![Api网关-过滤器生命周期.png](https://s2.loli.net/2023/01/08/mPMrIVJzDFTWLUk.png)

```shell
# 作用
过滤功能负责对请求过程进行额外的处理，是请求校验过滤及服务聚合的基础。

# 过滤类型
	1. pre：在请求被路由到目标服务前执行，比如权限校验、打印日志等功能；
	2. routing：在请求被路由到目标服务时执行
	3. post：在请求被路由到目标服务后执行，比如给目标服务的响应添加头信息，收集统计数据等功能；
	4. error：请求在其他阶段发生错误时执行。
	
# 如何开启
	# 继承ZuulFilter
	@Component
    @Slf4j
    public class PreLogFilter extends ZuulFilter
    {
        @Override
        public String filterType()
        {
            return "pre"; # 过滤器类型
        }
        @Override
        public int filterOrder()
        {
            return 1; # 数字小的优先执行
        }
        @Override
        public boolean shouldFilter()
        {
            return true; # 是否开启过滤
        }
        @Override
        public Object run() throws ZuulException
        {
            # 业务逻辑
            return null;
        }
    }
    
    # yml配置
    zuul:
      PreLogFilter:
        pre:
          disable: true
```

#### 2. GateWay

##### 什么是gateway

```shell
1. Cloud全家桶中有个很重要的组件就是网关，在1.x版本中都是采用的Zuul网关；
但在2.x版本中，zuul的升级一直跳票，SpringCloud最后自己研发了一个网关替代Zuul，gateway是原zuul1.x版的替代。

2. Gateway是在Spring生态系统之上构建的API网关服务，基于Spring 5，Spring Boot 2和 Project Reactor等技术。Gateway旨在提供一种简单而有效的方式来对API进行路由，以及提供一些强大的过滤器功能， 例如：熔断、限流、重试等。为了提升网关的性能，SpringCloud Gateway是基于WebFlux框架实现的，而WebFlux框架底层则使用了高性能的Reactor模式通信框架Netty。
```

##### 能用来干嘛

![Api网关-gateway.png](https://s2.loli.net/2023/01/08/AspBkRKaD9zgZYl.png)

```shell
# 场景
1. 反向代理
2. 鉴权
3. 流量控制
4. 熔断
5. 日志监控
等等

# 特性
1. 基于Spring Framework 5, Project Reactor 和 Spring Boot 2.0 进行构建；
2. 动态路由：能够匹配任何请求属性；
3. 可以对路由指定 Predicate（断言）和 Filter（过滤器）；
4. 集成Hystrix的断路器功能；
5. 集成 Spring Cloud 服务发现功能；
6. 易于编写的 Predicate（断言）和 Filter（过滤器）；
7. 请求限流功能；
8. 支持路径重写。
```

##### Zuul与Gateway概念区别

```shell
1. Zuul 1.x，是一个基于阻塞 I/ O 的 API Gateway
2. Zuul 1.x 基于Servlet 2. 5使用阻塞架构它不支持任何长连接(如 WebSocket) Zuul 的设计模式和Nginx较像，每次 I/ O 操作都是从工作线程中选择一个执行，请求线程被阻塞到工作线程完成，但是差别是Nginx 用C++ 实现，Zuul 用 Java 实现，而 JVM 本身会有第一次加载较慢的情况，使得Zuul 的性能相对较差。
3. Zuul 2.x理念更先进，想基于Netty非阻塞和支持长连接，但SpringCloud目前还没有整合。 Zuul 2.x的性能较 Zuul 1.x 有较大提升。在性能方面，根据官方提供的基准测试， Spring Cloud Gateway 的 RPS（每秒请求数）是Zuul 的 1. 6 倍。

1. Spring Cloud Gateway 建立 在 Spring Framework 5、 Project Reactor 和 Spring Boot 2 之上， 使用非阻塞 API。
2. Spring Cloud Gateway 还 支持 WebSocket， 并且与Spring紧密集成拥有更好的开发体验
```

##### Zuul1.x模型和Gateway模型区别

```shell
# Zuul模型
Springcloud中所集成的Zuul版本，采用的是Tomcat容器，使用的是传统的Servlet IO处理模型。而Servlet的生命周期：servlet由servlet container进行生命周期管理。container启动时构造servlet对象并调用servlet init()进行初始化；container运行时接受请求，并为每个请求分配一个线程（一般从线程池中获取空闲线程）然后调用service()。container关闭时调用servlet destory()销毁servlet。
	# servlet缺点
	servlet是一个简单的网络IO模型，当请求进入servlet container时，servlet container就会为其绑定一个线程，在并发不高的场景下这种模型是适用的。但是一旦高并发(比如用jemeter压)，线程数量就会上涨，而线程资源代价是昂贵的（上线文切换，内存消耗大）严重影响请求的处理时间。在一些简单业务场景下，不希望为每个request分配一个线程，只需要1个或几个线程就能应对极大并发的请求，这种业务场景下servlet模型没有优势。
	
所以Zuul 1.X是基于servlet之上的一个阻塞式处理模型，即spring实现了处理所有request请求的一个servlet（DispatcherServlet）并由该servlet阻塞式处理处理。所以Springcloud Zuul无法摆脱servlet模型的弊端

# Gateway模型
传统的Web框架，比如说：struts2，springmvc等都是基于Servlet API与Servlet容器基础之上运行的。
但是
在Servlet3.1之后有了异步非阻塞的支持。而WebFlux是一个典型非阻塞异步的框架，它的核心是基于Reactor的相关API实现的。相对于传统的web框架来说，它可以运行在诸如Netty，Undertow及支持Servlet3.1的容器上。非阻塞式+函数式编程（Spring5必须让你使用java8）
Spring WebFlux 是 Spring 5.0 引入的新的响应式框架，区别于 Spring MVC，它不需要依赖Servlet API，它是完全异步非阻塞的，并且基于 Reactor 来实现响应式流规范。
```

##### Gateway三大核心

![Api网关-gateway过程.png](https://s2.loli.net/2023/01/08/bmwqFPnAVd94foi.png)

```shell
# 路由 Route
	路由是构建网关的基本模块，它由【ID】，目标【URI】，一系列的【断言】和【过滤器】组成，如果【断言为true】则【匹配该路由】。
	
# 断言 Predicate
	参考的是Java8的java.util.function.Predicate，开发人员可以【匹配HTTP请求中的所有内容】(例如请求头或请求参数)，如果【请求与断言相匹配】则进行路由。
	
# 过滤 Filter
	指的是Spring框架中GatewayFilter的实例，使用过滤器，可以在【请求被路由前】或者【之后】对【请求进行修改】。
	
# 总体流程
	web请求，通过一些匹配条件，定位到真正的服务节点。并在这个转发过程的前后，进行一些精细化控制。
	predicate就是我们的匹配条件；
	而filter，就可以理解为一个无所不能的拦截器。有了这两个元素，再加上目标uri，就可以实现一个具体的路由了。
```

##### Gateway工作流程

![Api网关-gateway工作过程.png](https://s2.loli.net/2023/01/08/Yu2DRXM7N9Vo3jJ.png)

```shell
1. 客户端向 Spring Cloud Gateway 【发出请求】。
2. 然后在 Gateway Handler Mapping 中找到【与请求相匹配的路由】，将其发送到 【Gateway Web Handler】。
3. Handler 再通过指定的【过滤器链】来将请求发送到我们【实际的服务执行业务逻辑】，然后返回。
4. 过滤器之间用虚线分开是因为过滤器可能会在【发送代理请求之前（“pre”）】或【之后（“post”）执行业务逻辑】。

# 总体来说，整个Gateway所做的事就是【对请求进行路由转发，并在这过程中执行过滤器链】
```

##### Gateway路由-yml配置方式

```shell
# pom.xml
<!--gateway-->
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<!--eureka-client-->
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

# 主启动
@SpringBootApplication
@EnableEurekaClient
public class GatewayMain9527 {
    public static void main(String[] args) {
        SpringApplication.run(GatewayMain9527.class, args);
    }
}

# yml
server:
  port: 9527
spring:
  application:
    name: cloud-gateway-gateway
  cloud:
    gateway:
      routes:
      - id: test-route-name # 路由id 唯一 任意取 最好跟服务挂钩
        uri: http://localhost:8001 # 映射到真实uri
        predicates:
        - Path=/provider/** # 断言 Path模式 匹配/provider/** 的映射到uri
eureka:
  client:
    service-url:
      defaultZone: http://localhost:7001/eureka
```

##### Gateway路由-基于配置类

```shell
# 配置类
@Configuration
public class GateWayConfig
{
    /**
     * 配置了一个id为route-name的路由规则，
     * 当访问地址 http://localhost:9527/guonei时会自动转发到地址：http://news.baidu.com/guonei
     * @param builder
     * @return
     */
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder)
    {
        RouteLocatorBuilder.Builder routes = builder.routes();
        routes.route("path_route_atguigu", r -> r.path("/guonei").uri("http://news.baidu.com/guonei")).build();
        return routes.build();

    }
}
```

##### Gateway路由-动态路由（通过微服务名）

```shell
# 上面的uri缺点
在上面的例子中，在yml的uri配置项上，我们直接使用http://localhost:8001这样的死路径

# 动态路由
默认情况下Gateway会根据注册中心注册的服务列表，以注册中心上微服务名为路径，创建动态路由进行转发，从而实现动态路由的功能。

# yml
server:
  port: 9527
spring:
  application:
    name: cloud-gateway-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true # 开启从注册中心动态创建路由的功能，利用微服务名进行路由
      routes:
      - id: test-route-name
        # uri: http://localhost:8001
        uri: lb://CLOUD-PAYMENT-SERVICE # 匹配后提供服务的路由地址,就是注册中心中的服务名称
        predicates:
        - Path=/provider/**
eureka:
  client:
    service-url:
      defaultZone: http://localhost:7001/eureka
      
需要注意的是uri的协议为lb，表示启用Gateway的负载均衡功能。lb://serviceName是spring cloud gateway在微服务中自动为我们创建的负载均衡uri。
```

##### Gateway断言-具体可看官网配置

```shell
# Route Predicate Factories
1. Spring Cloud Gateway将路由匹配作为Spring WebFlux HandlerMapping基础架构的一部分。
2. Spring Cloud Gateway包括许多内置的Route Predicate工厂。所有这些Predicate都与HTTP请求的不同属性匹配。多个Route Predicate工厂可以进行组合
3. Spring Cloud Gateway 创建 Route 对象时， 使用 RoutePredicateFactory 创建 Predicate 对象，Predicate 对象可以赋值给 Route。 Spring Cloud Gateway 包含许多内置的Route Predicate Factories。
4. 所有这些谓词都匹配HTTP请求的不同属性。多种谓词工厂可以组合，并通过逻辑and。

# 分类
1. After
2. Before
3. Between
4. Cookie
5. Header
6. Host
7. Method
8. Path
9. Query
```

##### Gateway过滤器-具体可看官网配置

```shell
# 何为Gateway过滤器
路由过滤器可用于修改进入的HTTP请求和返回的HTTP响应，路由过滤器只能指定路由进行使用。Spring Cloud Gateway 内置了多种路由过滤器，他们都由GatewayFilter的工厂类来产生。

# 过滤器生命周期
1. pre
2. post

# 过滤器种类
1. GatewayFilter
2. GlobalFilter

# 比如AddRequestParameter 过滤器
spring:
  application:
    name: cloud-gateway-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true # 开启从注册中心动态创建路由的功能，利用微服务名进行路由
      routes:
      - id: test-route-name
        # uri: http://localhost:8001
        uri: lb://CLOUD-PAYMENT-SERVICE # 匹配后提供服务的路由地址,就是注册中心中的服务名称
        predicates:
        - Path=/provider/**
        filters:
          - AddRequestParameter=X-Request-Id,1024 # 过滤器工厂会在匹配的请求头加上一对请求头，名称为X-Request-Id值为1024
          
# 自定义过滤器- 主要实现GlobalFilter和Ordered接口
# 通常可以用来全局日志记录，统一网关鉴权等等 场景
@Component
public class MyLogGateWayFilter implements GlobalFilter,Ordered
{
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain)
    {
    	# 填充自定义业务逻辑
        System.out.println("time:"+new Date()+"\t 执行了自定义的全局过滤器: "+"MyLogGateWayFilter"+"hello");
	    # 通过exchange取请求相关	
        String uname = exchange.getRequest().getQueryParams().getFirst("uname");
        if (uname == null) {
            System.out.println("****用户名为null，无法登录");
            # 同样通过exchange设置响应相关
            exchange.getResponse().setStatusCode(HttpStatus.NOT_ACCEPTABLE);
            return exchange.getResponse().setComplete();
        }
        # 过滤链执行
        return chain.filter(exchange);
    }

    @Override
    public int getOrder()
    {
        return 0; # 执行顺序 越小越先执行
    }
}
```

