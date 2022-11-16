## 20221113

#### MQ

```js
1. 含义
本质是个队列，FIFO 先入先出，只不过队列中存放的内容是message 而已，还是一种跨进程的通信机制，用于上下游传递消息。

2. 常用场景
	2.1 流量消峰
    2.2 应用解耦
    2.3 异步处理
```

#### RabbitMQ-4大核心概念

```js
1 生产者（Producer）
	产生数据发送消息的程序是生产者
    
2 交换机（Exchange）
    一方面它接收来自生产者的消息，另一方面它将消息推送到队列中。交换机必须确切知道如何处理它接收到的消息，是将这些消息推送到特定队列还是推送到多个队列，亦或者是把消息丢弃，这个得有交换机类型决定
    
3 队列（Queue）	
    消息只能存储在队列中。队列仅受主机的内存和磁盘限制的约束，本质上是一个大的消息缓冲区。许多生产者可以将消息发送到一个队列，许多消费者可以尝试从一个队列接收数据
    
4 消费者（Consumer）
    消费与接收具有相似的含义。消费者大多时候是一个等待接收消息的程序。请注意生产者，消费
    者和消息中间件很多时候并不在同一机器上。同一个应用程序既可以是生产者又是可以是消费者。
```

![1.png](https://s2.loli.net/2022/11/13/smDUghcP6QkboIe.png)

#### RabbitMQ-核心名词

```js
1. Broker
	接收和分发消息的应用，RabbitMQ Server 就是 Message Broker
    
2. Virtual host
	出于多租户和安全因素设计的，把 AMQP 的基本组件划分到一个虚拟的分组中，类似于网络中的 namespace 概念。当多个不同的用户使用同一个 RabbitMQ server 提供的服务时，可以划分出多个 vhost，每个用户在自己的 vhost 创建 exchange／queue 等

3. Connection
	publisher／consumer 和 broker 之间的 TCP 连接
    
4. Channel
	如果每一次访问 RabbitMQ 都建立一个 Connection，在消息量大的时候建立 TCP
Connection 的开销将是巨大的，效率也较低。Channel 是在 connection 内部建立的逻辑连接，如果应用程
序支持多线程，通常每个 thread 创建单独的 channel 进行通讯，AMQP method 包含了 channel id 帮助客
户端和 message broker 识别 channel，所以 channel 之间是完全隔离的。Channel 作为轻量级的Connection 极大减少了操作系统建立 TCP connection 的开销 

5. Exchange
	message 到达 broker 的第一站，根据分发规则，匹配查询表中的 routing key，分发消息到 queue 中去。常用的类型有：direct (point-to-point), topic (publish-subscribe) and fanout(multicast)

6. Queue
	消息最终被送到这里等待 consumer 取走
    
7. Binding
	exchange 和 queue 之间的虚拟连接，binding 中可以包含 routing key，Binding 信息被保存到 exchange 中的查询表中，用于 message 的分发依据
```

#### RabbitMQ-1个生产者一个消费者

![2.png](https://s2.loli.net/2022/11/16/1ISPXJK5AhEtWVw.png)

```java
// RabbitUtils.java
package com.home.mq.utils;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import java.io.IOException;
import java.util.concurrent.TimeoutException;

public class RabbitUtils {
    public static Channel getChannel() throws IOException, TimeoutException {
        ConnectionFactory connectionFactory = new ConnectionFactory();
        connectionFactory.setHost("ip");
        connectionFactory.setUsername("用户名");
        connectionFactory.setPassword("密码");
        Channel channel;
        Connection connection = connectionFactory.newConnection();
        channel = connection.createChannel();
        return channel;
    }
}

// Producer.java
package com.home.mq.rabbit1;
import com.home.mq.utils.RabbitUtils;
import com.rabbitmq.client.Channel;
import java.io.IOException;
import java.util.Scanner;
import java.util.concurrent.TimeoutException;

public class Producer {
    private static final String QUEUE_NAME = "rabbitOne";
    public static void main(String[] args) throws IOException, TimeoutException {
        Channel channel = RabbitUtils.getChannel();
        channel.queueDeclare(QUEUE_NAME, false, false, false, null);
        System.out.println("消息Producer已启动....");
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNext()) {
            String message = scanner.next();
            channel.basicPublish("", QUEUE_NAME, null, message.getBytes());
            System.out.println("消息已发送");
        }
    }
}

// Consumer.java
package com.home.mq.rabbit1;
import com.home.mq.utils.RabbitUtils;
import com.rabbitmq.client.Channel;
import java.io.IOException;
import java.util.concurrent.TimeoutException;
public class Consumer {
    public static final String QUEUE_NAME = "rabbitOne";
    public static void main(String[] args) throws IOException, TimeoutException {
        Channel channel = RabbitUtils.getChannel();
        System.out.println("消息Consumer已启动....");
        channel.basicConsume(QUEUE_NAME, true, (consumerTag, delivery) -> {
            String message = new String(delivery.getBody());
            System.out.println("接收的消息" + message);
        }, (consumerTag) -> {
            System.out.println(consumerTag + "消费者取消消费接口回调逻辑");
        });
    }
}
```

#### RabbitMQ-Work Queues（工作队列）

##### 轮询分发-1个发布者2个消费者多条消息由消费者依次轮询接受处理

![image-20221116215436047](C:\Users\admin\AppData\Roaming\Typora\typora-user-images\image-20221116215436047.png)

```java
假设有2个消费者A\B，其接收消息的顺序A\B或者B\A，一直这样轮询接收ABABAB... | BABABA....
// Producer.java
public class Producer {
    private static final String QUEUE_NAME = "rabbitTwo";
    public static void main(String[] args) throws IOException, TimeoutException {
        Channel channel = RabbitUtils.getChannel();
        channel.queueDeclare(QUEUE_NAME, false, false, false, null);
        System.out.println("消息Producer已启动....");
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNext()) {
            String message = scanner.next();
            channel.basicPublish("", QUEUE_NAME, null, message.getBytes());
            System.out.println("消息已发送");
        }
    }
}

// ConsumerOne.java
public class ConsumerOne {
    public static final String QUEUE_NAME = "rabbitTwo";
    public static void main(String[] args) throws IOException, TimeoutException {
        Channel channel = RabbitUtils.getChannel();
        System.out.println("消息ConsumerOne - 已启动....");
        channel.basicConsume(QUEUE_NAME, true, (consumerTag, delivery) -> {
            String message = new String(delivery.getBody());
            System.out.println("ConsumerOne - 接收的消息" + message);
        }, (consumerTag) -> {
            System.out.println(consumerTag + "消费者取消消费接口回调逻辑");
        });
    }
}

// ConsumerTwo.java
public class ConsumerTwo {
    public static final String QUEUE_NAME = "rabbitTwo";
    public static void main(String[] args) throws IOException, TimeoutException {
        Channel channel = RabbitUtils.getChannel();
        System.out.println("消息ConsumerTwo - 已启动....");
        channel.basicConsume(QUEUE_NAME, true, (consumerTag, delivery) -> {
            String message = new String(delivery.getBody());
            System.out.println("ConsumerTwo - 接收的消息" + message);
        }, (consumerTag) -> {
            System.out.println(consumerTag + "消费者取消消费接口回调逻辑");
        });
    }
}

// console
// Producer
消息Producer已启动....
A
消息已发送
V
消息已发送
B
消息已发送
C
消息已发送
F
消息已发送
W
消息已发送
// ConsumerOne 
消息ConsumerOne - 已启动....
ConsumerOne - 接收的消息A
ConsumerOne - 接收的消息B
ConsumerOne - 接收的消息F
// ConsumerTwo
消息ConsumerTwo - 已启动....
ConsumerTwo - 接收的消息V
ConsumerTwo - 接收的消息C
ConsumerTwo - 接收的消息W

```

##### 消息应答

```java
默认情况下，MQ一旦将消息发送给消费者后，便立即将该消息标记为删除，若此时消费者出问题了，没有接收到该消息，造成消息的丢失。因此MQ引入了消息应答机制：消费者在接收到消息并且处理该消息之后，告诉 rabbitmq 它已经处理了，rabbitmq 可以把该消息删除了。
```



#### RabbitMQ-发布确认

```java

```

#### RabbitMQ-交换机（Exchanges）

```java
1. 模式
	在上面的例子中，我们都是一条消息对应一个消费者，而不能一条消息对应多个消费者 因此当我们需要将消息分发给不同的消费者时，需要采用“发布/订阅”模式

2. 消息核心    
	在RabbitMQ中，【生产者生产的消息不会直接发送到队列上面】，而是【发送到交换机中，由交换机来决定该消息需要发送到哪些队列或者丢弃它们】
    
3. 交换机类型    
     直接(路由)模式【direct】
     主题模式【topic】
     扇出模式【fanout】
     标题模式【headers】

4. 默认交换机
    在之前发布者发送消息时，在调用【channel.basicPublish("", QUEUE_NAME, null, message.getBytes());】我们的第一个参数是空字符串，此时表明【无指定名称交换机，采用默认交换机】且绑定到【QUEUE_NAME】队列上
    
5. 临时队列
    在消费者断开与队列的连接时，队列就自动删除。在之前我们并没有设置持久化队列，在调用【channel.queueDeclare(QUEUE_NAME, false, false, false, null);】第二个参数设置为false，此时则表明该队列是个临时队列且名称叫【QUEUE_NAME】，还有一种生成临时队列的方式直接由RabbitMQ来创建队列名称，如：【String queueName = channel.queueDeclare().getQueue()】
    
6. 绑定BindingKey【routingKey】 
    绑定是指我们需要将【哪个交换机】跟【哪个队列】进行绑定，则生产者发送消息后会根据【交换机->队列】关系发送到对应的队列中
```

##### RabbitMQ-交换机（Fanout）模式

```java

```

##### RabbitMQ-交换机（Direct路由）模式

```java

```

##### RabbitMQ-交换机（Topic）模式

```java

```

#### RabbitMQ-死信队列

```java
1. 概念
    producer 将消息投递到 broker 或者直接到queue 里了，consumer 从 queue 取出消息进行消费，但某些时候由于特定的原因导致 queue 中的某些消息无法被消费，这样的消息如果没有后续的处理，就变成了死信，有死信自然就有了死信队列。
    
2. 来源
    消息 TTL 过期
	队列达到最大长度(队列满了，无法再添加数据到 mq 中)
	消息被拒绝(basic.reject 或 basic.nack)并且 requeue=false （不放回队列）
```

#### RabbitMQ-延迟队列

```java

```

