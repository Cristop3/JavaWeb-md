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

