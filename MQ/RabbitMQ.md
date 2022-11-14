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

#### RabbitMQ-1对1

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

