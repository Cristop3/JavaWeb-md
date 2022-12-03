## 20221128

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

#### Eureka服务注册与发现 - 已被淘汰

![Eureke.png](https://s2.loli.net/2022/12/03/Nm97fTD2uFCrvZY.png)

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

