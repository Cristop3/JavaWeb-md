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
        // 参数1：声明的队列名称
        // 参数2：是否将该队列中的消息持久化
        // 参数3：是否将该队列只供一个消费者进行消费
        // 参数4：其他参数
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
        // 参数1：订阅的队列名称
        // 参数2：是否自动应答
        // 参数3：消息接收成功回调
        // 参数4：消息取消回调
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

1. 主动应答    
// 在之前我们在消费者端设置了autoAck：true
channel.basicConsume(QUEUE_NAME, true,....)
    
2. 手动应答
    2.1 肯定回复
    	Channel.basicAck(deliveryTag:消息体,multiple:是否批量应答) // 用于肯定确认,MQ收到后清楚知道该消息已被成功处理，可以将其丢弃
    2.2 否定回复
    	Channel.basicNack(deliveryTag:消息体,multiple:是否批量应答,requeue是否重新放回队列) // 用于否定确认 可丢弃
    	Channel.basicReject(deliveryTag:消息体,requeue是否重新放回队列) // 拒绝该消息 可丢弃

3. 消息重新入队
    如果消费者由于某些原因失去连接(其通道已关闭，连接已关闭或 TCP 连接丢失)，导致消息未发送 ACK 确认，RabbitMQ 将了解到消息未完全处理，并将对其重新排队。如果此时其他消费者可以处理，它将很快将其重新分发给另一个消费者。这样，即使某个消费者偶尔死亡，也可以确保不会丢失任何消息。
```

##### 持久化

```java
有消息重新入队机制下，当消费者挂掉后，消息依然不会丢失，但是当我们的MQ挂了后，因此，我们需要同时设置【队列】、【消息】两者均持久化
    
1. 队列持久化
    是在我们声明队列时候，标识出其持久化（这样如果MQ重启，该队列依然存在）
    boolean durable = true // 是否将队列设置为持久化
    channel.queueDeclare(queueName, durable, false, false, null)
    而且我们在RabbitMQ提供的管理界面中选择queue，即可看到该[queueName]的【features】出现了一个【D】
    
2. 消息持久化
    要想消息持久化，需要我们在生产者发送消息时进行声明该消息设置为持久化
    // 第三个参数 设置MessageProperties.PERSISTENT_TEXT_PLAIN
    channel.basicPublish("",queueName,MessageProperties.PERSISTENT_TEXT_PLAIN,message)
    
    该设置存在一个问题：当我们让RabbitMQ给消息保存到磁盘，正要保存时，RabbitMQ挂了，所以并未将消息真正的写入到磁盘中
```

##### 不公平分发

```java
在之前的1个发布者2个消费者中，都是平均的让消息依次传递给2个消费者，但当其中有个消费者处理速度很快，另一个很慢时，很快的这个就在下一次的分发中处于等待状态，浪费资源，因此，可以通过不公平分发。
// Producer.java    
channel.basicQos(1)
当我们设置为1时，表示此通道到消费者之间至少有1条消息被该消费者处理了，才会继续给该消费者发送消息，而此时RabbitMQ就可以又给处理的快的消费者发送消息而不用等待慢消费者
```

##### 预取值

```java
本身消息的发送就是异步发送的，所以在任何时候，channel 上肯定不止只有一个消息另外来自消费者的手动确认本质上也是异步的。因此这里就存在一个未确认的消息缓冲区。

也因此我们能限制此缓冲区的大小，以避免缓冲区里面无限制的未确认消息问题。以通过使用 basic.qos 方法设置“预取计数”值来完成的。该值定义通道上允许的未确认消息的最大数量。一旦数量达到配置的数量，
RabbitMQ 将停止在通道上传递更多消息，除非至少有一个未处理的消息被确认。
// Producer.java
channel.basicQos(5) 允许5条消息排队待处理
    
上面的不公平分发也属于预取值
```

#### RabbitMQ-发布确认

```java
在上面中，我们基本上在讨论【MQ】与【消费者】之间的通信，比如主动、手动应答
 
发布确认就是【MQ】与【生产者】之间的通信
    
生产者将信道设置成 confirm 模式，一旦信道进入 confirm 模式，所有在该信道上面发布的消息都将会被指派【一个唯一的 ID(从 1 开始)】，一旦消息被投递到所有匹配的队列之后，broker 就会发送一个确认给生产者(包含消息的唯一 ID)，这就使得生产者知道消息已经正确到达目的队列了、confirm 模式最大的好处在于他是异步的，一旦发布一条消息，生产者应用程序就可以在等信道返回确认的同时继续发送下一条消息，当消息最终得到确认之后，生产者应用便可以通过回调方法来处理该确认消息，如果 RabbitMQ 因为自身内部错误导致消息丢失，就会发送一条 nack 消息，生产者应用程序同样可以在回调方法中处理该 nack 消息。
    
注意：是当【生产者消息】到【队列】后，RabbitMQ就会给生产者确认，存在一个确认回调；当未到达时，也存在一个未确认回调
    
1. 开启发布确认
    // Producer.java
    channel.confirmSelect()
    
    // 是否已确认
    boolean flag = channel.waitForConfirms()
    
2. 单个发布确认
    就是每次发了一个消息就开始等待确认

3. 批量发布确认
    将消息分为比如100个为一组，进行批量确认，但是无法确认出是哪个消息没成功到队列导致的发布确认失败
    
4. 异步发布确认
    // Producer.java
    
    // 开启确认发布
    channel.confirmSelect();
 	// 线程安全的一个map用于存消息序列号和消息体
	ConcurrentSkipListMap<Long, String> outstandingConfirms = new
ConcurrentSkipListMap<>();	
	// 确认回调
	ConfirmCallback ackCallback = (sequenceNumber, multiple) -> {
        if (multiple) {
            //返回的是小于等于当前序列号的未确认消息 是一个 map
            ConcurrentNavigableMap<Long, String> confirmed =
                outstandingConfirms.headMap(sequenceNumber, true);
            //清除该部分未确认消息
            confirmed.clear();
        }else{
            //只清除当前序列号的消息
            outstandingConfirms.remove(sequenceNumber);
        }
    };
	// 非确认回调
    ConfirmCallback nackCallback = (sequenceNumber, multiple) -> {
        String message = outstandingConfirms.get(sequenceNumber);
        System.out.println("发布的消息"+message+"未被确认，序列号"+sequenceNumber);
    };
	// 添加确认及非确认回调监听
	channel.addConfirmListener(ackCallback, nackCallback);

	for (int i = 0; i < 1000; i++){
        String message = "消息" + i;
        /**
        * channel.getNextPublishSeqNo()获取下一个消息的序列号
         * 通过序列号与消息体进行一个关联
         * 全部都是未确认的消息体
         */
        outstandingConfirms.put(channel.getNextPublishSeqNo(), message);
        channel.basicPublish("", queueName, null, message.getBytes());
    }
```

#### RabbitMQ-交换机（Exchanges）

![4.png](https://s2.loli.net/2022/11/17/RMXZqPfFIpdiYLg.png)

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

![5.png](https://s2.loli.net/2022/11/17/g8bJ1edXH4SoULw.png)

```java
Fanout模式就是【广播】模式，但凡在此【交换机】与此【队列】的订阅者都会接收到同样的消息
// Consumer1.java
channel.exchangeDeclare("EName", "fanout"); // 声明一个名字叫EName的fanout模式的交换机
String queueName = channel.queueDeclare().getQueue(); // 声明一个临时队列1
// 在信道中进行队列名和交换机名的绑定,绑定值bindingKey为""
channel.queueBind(queueName, "EName", "");
// 消费者与队列关联一个自动应答确认
channel.basicConsume(queueName, true,  (consumerTag, delivery) -> { }, consumerTag -> { });
// Consumer2.java 同上

指定交换机与队列的绑定都从消费者方来进行绑定，因为只有消费者才能确认，我到底想从哪个交换机哪个队列中获取想要的消息，而发布者通过第一个参数交换机名和第二个参数bindingKey来指定，它想要将哪个消息发送到哪个交换机哪个队列中。

Producer: message -> [exchangeName + bindingKey] -> RabbitMQ
Consumer: RabbitMQ -> [exchangeName + bindingKey] -> message
双方只需各自定义好自己想做的事，其余事情均交给RabbitMQ这个中间人来做

// Producer.java
channel.exchangeDeclare("EName", "fanout"); // 声明一个名字叫EName的fanout模式的交换机
// 之前是第二个参数队列名，先在传入第一个参数交换机名
channel.basicPublish("EName", "", null, "消息ABC");
```

##### RabbitMQ-交换机（Direct路由）模式

![6.png](https://s2.loli.net/2022/11/17/bX3OUo2hRdcuFIr.png)

```java
路由模式，就是升级版的fanout模式，在fanout中，我们的bindingKey都设置成一样，则消息进行广播式发送，在Direct直接模式中，我们可以设置不同的bindingKey来绑定交换机和队列，使其功能更上升一层
    
// Consumer1.java
channel.exchangeDeclare("EName1", BuiltinExchangeType.DIRECT);
channel.queueDeclare("DL1", false, false, false, null);
channel.queueBind("DL1", "EName1", "D1");
channel.basicConsume("DL1", true,  (consumerTag, delivery) -> { }, consumerTag -> { });
// Consumer3.java
channel.exchangeDeclare("EName1", BuiltinExchangeType.DIRECT);
channel.queueDeclare("DL3", false, false, false, null);
channel.queueBind("DL3", "EName1", "D3");
channel.queueBind("DL3", "EName1", "D4");
channel.basicConsume("DL3", true,  (consumerTag, delivery) -> { }, consumerTag -> { });

// Producer.java
channel.exchangeDeclare("EName1", BuiltinExchangeType.DIRECT);
channel.basicPublish("EName1","D1", null,"我发送给key-D1");
channel.basicPublish("EName1","D3", null,"我发送给key-D3");
channel.basicPublish("EName1","D4", null,"我发送给key-D4");

// console
消费者1：我发送给key-D1
消费者3: 我发送给key-D3
    	我发送给key-D4
```

##### RabbitMQ-交换机（Topic）模式

```java
路由模式的局限性就是如果我们要新增一个其他类型就得再次声明绑定，不太灵活，因此主题模式来了，同样需要设置bindingKey，但它必须满足一定得要求，必须是一个单词列表且以点号分隔开，如：time.date.calendar
提供了通配符的匹配

1. *号 - 可以替代一个单词
    *.date.* 绑定中间带[date]的三个单词
    
2. #号 - 可以替代0个或者多个单词
    calendar.# 绑定第一个单词是calendar的多个单词
    
3. 当Topic是一个【#】号时，类比 【fanout】模式
   当Topic中没有出现【#】或者【*】，类比【direct】模式
```

#### RabbitMQ-死信队列

![7.png](https://s2.loli.net/2022/11/17/6M91ZretG7DNdIU.png)

```java
1. 概念
    producer 将消息投递到 broker 或者直接到queue 里了，consumer 从 queue 取出消息进行消费，但某些时候由于特定的原因导致 queue 中的某些消息无法被消费，这样的消息如果没有后续的处理，就变成了死信，有死信自然就有了死信队列。
    
2. 来源
    消息 TTL 过期
	队列达到最大长度(队列满了，无法再添加数据到 mq 中)
	消息被拒绝(basic.reject 或 basic.nack)并且 requeue=false （不放回队列）
    
// Consumer2.java
// 声明死信交换机（备用机）
channel.exchangeDeclare("EName2", BuiltinExchangeType.DIRECT); 
// 声明死信队列（备用队列）
channel.queueDeclare("DL1", false, false, false, null);
// 绑定死信交换机和死信队列
channel.queueBind("DL1", "EName2", "D5");

channel.exchangeDeclare("EName1", BuiltinExchangeType.DIRECT);
Map<String, Object> params = new HashMap<>();
params.put("x-dead-letter-exchange", "EName2");
params.put("x-dead-letter-routing-key", "D5");
channel.queueDeclare("DL2", false, false, false, params);
channel.queueBind("DL2", "EName1", "D2");

channel.basicConsume("DL2", true,  (consumerTag, delivery) -> { }, consumerTag -> { });

// Consumer4.java 
channel.exchangeDeclare("EName2", BuiltinExchangeType.DIRECT); 
channel.queueDeclare("DL1", false, false, false, null);
channel.queueBind("DL1", "EName2", "D5");

channel.basicConsume("DL1", true,  (consumerTag, delivery) -> { }, consumerTag -> { });

// Producer.java
channel.exchangeDeclare("EName1", BuiltinExchangeType.DIRECT); 
// 1. TTL过期时间
new AMQP.BasicProperties().builder().expiration("10000").build();
channel.basicPublish("EName1","DL2", properties,"TTL过期时间");
// 2. 队列到达最大长度
for (int i = 0; i <10 ; i++) {
	channel.basicPublish("EName1","DL2", null,"队列到达最大长度");
}
	// Consumer2.java
	params.put("x-max-length", 5); // 最多5个消息
// 3. 消息被拒
	// Consumer2.java
	channel.basicConsume("DL2", true,  (consumerTag, delivery) -> {
        // 拒绝消息 且不放回队列中 则走死信队列到 消费者4中
    	channel.basicReject(delivery.getEnvelope().getDeliveryTag(), false);
    }, consumerTag -> { });
```

#### RabbitMQ-延迟队列

![8.png](https://s2.loli.net/2022/11/19/hNvVfgKbSukXw8d.png)

```java
1. 概念
    队列内部是有序的，最重要的特性就体现在它的延时属性上，延时队列中的元素是希望在指定时间到了以后或之前取出和处理，延时队列就是用来存放需要在指定时间被处理的元素的队列
    
2. 使用场景
    1.订单在十分钟之内未支付则自动取消
    2.新创建的店铺，如果在十天内都没有上传过商品，则自动发送消息提醒。
    3.用户注册成功后，如果三天内没有登陆则进行短信提醒。
    4.用户发起退款，如果三天内没有得到处理则通知相关运营人员。
    5.预定会议后，需要在预定的时间点前十分钟通知各个与会人员参加会议

3. TTL
    TTL在MQ中指的是一个【消息】或者【队列】的属性，表明【一条消息】或者【该队列中所有消息】的最大存货时间
    3.1 队列设置TTL
    	map.put("x-message-ttl", 20000)
    	缺点：这样每增加一个延时需求就会增加一个队列
    
    3.2 消息设置TTL
    	同样配合死信队列做；
    	correlationData.getMessageProperties().setExpiration(10000)
    	缺点：消息可能并不会按时“死亡“，因为 RabbitMQ 只会检查第一个消息是否过期，如果过期则丢到死信队列，如果第一个消息的延时时长很长，而第二个消息的延时时长很短，第二个消息并不会优先得到执行。
    
4. rabbitmq_delayed_message_exchange 
    通过插件实现延迟队列
```

##### SpringBoot整合RabbitMQ - TTL实现延迟队列

```java
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
    
// 交换机、队列、bindingKey配置
@Configuration
public class RabbitMqConfig {
    public static final String EXCHANGE_A = "A";
    public static final String EXCHANGE_B = "B";
    public static final String QUEUE_a = "a";
    public static final String QUEUE_b = "b";
    public static final String QUEUE_c = "c";
    public static final String BINDING_Aa = "Aa";
    public static final String BINDING_Ab = "Ab";
    public static final String BINDING_Bc = "Bc";
    @Bean
    public DirectExchange AExchange() {
        return new DirectExchange(EXCHANGE_A);
    }
    @Bean
    public DirectExchange BExchange() {
        return new DirectExchange(EXCHANGE_B);
    }
    @Bean
    public Queue queue_a() {
        Map<String, Object> map = new HashMap<>();
        // 在队列中绑定死信交换机、路由key及设置自身的TTL队列过期时间
        // 这里只需声明死信交换机和死信交换机的路由key
        map.put("x-dead-letter-exchange", EXCHANGE_B);
        map.put("x-dead-letter-routing-key", BINDING_Bc);
        map.put("x-message-ttl", 10000);
        return QueueBuilder.durable(QUEUE_a).withArguments(map).build();
    }
    @Bean
    public Binding queue_aBindingA(Queue queue_a, DirectExchange AExchange) {
        return BindingBuilder.bind(queue_a).to(AExchange).with(BINDING_Aa);
    }
    @Bean
    public Queue queue_b() {
        Map<String, Object> map = new HashMap<>();
        // 在队列中绑定死信交换机、路由key及设置自身的TTL队列过期时间
        // 这里只需声明死信交换机和死信交换机的路由key
        map.put("x-dead-letter-exchange", EXCHANGE_B);
        map.put("x-dead-letter-routing-key", BINDING_Bc);
        map.put("x-message-ttl", 20000);
        return QueueBuilder.durable(QUEUE_b).withArguments(map).build();
    }
    @Bean
    public Binding queue_bBindingA(Queue queue_b, DirectExchange AExchange) {
        return BindingBuilder.bind(queue_b).to(AExchange).with(BINDING_Ab);
    }
    @Bean
    public Queue queue_c() {
        return QueueBuilder.durable(QUEUE_c).build();
    }
    @Bean
    public Binding queue_cBindingB(Queue queue_c, DirectExchange BExchange) {
        return BindingBuilder.bind(queue_c).to(BExchange).with(BINDING_Bc);
    }
}
// Producer
@Slf4j
@RestController
@RequestMapping("home")
public class Producer {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @GetMapping("/send")
    public void producer2Msg(String msg) {
        log.info("当前时间：{},发送一条信息给两个 TTL 队列:{}", new Date(), msg);
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE_A, RabbitMqConfig.BINDING_Aa, msg.getBytes(StandardCharsets.UTF_8));
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE_A, RabbitMqConfig.BINDING_Ab, msg.getBytes(StandardCharsets.UTF_8));
    }
}
// Consumer
@Slf4j
@Component
public class Consumer {
    @RabbitListener(queues= RabbitMqConfig.QUEUE_c)
    public void consumerMsg(Message msg)  throws IOException {
        String msgs = new String(msg.getBody());
        log.info("当前时间：{},收到队列c信息{}", new Date(), msgs);
    }s
}
// console
当前时间：Sat Nov 19 09:50:08 CST 2022,发送一条信息给两个 TTL 队列:123	
    当前时间：Sat Nov 19 09:50:18 CST 2022,收到队列c信息123
    当前时间：Sat Nov 19 09:50:28 CST 2022,收到队列c信息123s
```

#### RabbitMQ-发布确认-无法到达交换机时通知发布者-SpringBoot

```java
1. 开启发布确认
    spring:rabbitmq:publisher-confirm-type: correlated

2. 定义交换机、队列、路由key
    public static final String EXCHANGE_D = "D";
    public static final String QUEUE_d = "d";
    public static final String BINDING_Dd = "Dd";
    @Bean
    public DirectExchange DExchange() {
        return new DirectExchange(EXCHANGE_D);
    }
    @Bean
    public Queue queue_d() {
        return QueueBuilder.durable(QUEUE_d).build();
    }
    @Bean
    public Binding queue_dBindingD(Queue queue_d, DirectExchange DExchange) {
        return BindingBuilder.bind(DExchange).to(DExchange).with(BINDING_Dd);
    }

3. 确认回调实现RabbitTemplate.ConfirmCallback接口（成功失败均会走该回调）
    @Component
    @Slf4j
    public class ConfirmCb implements RabbitTemplate.ConfirmCallback {
        @Override
        public void confirm(CorrelationData correlationData, boolean ack, String cause) 		{
            String id = correlationData != null ? correlationData.getId() : "";
            if (ack) {
                // 交换机已收到消息
                log.info("交换机已经收到 id 为:{}的消息", id);
            } else {
                // 交换机未收到消息
                log.info("交换机还未收到 id 为:{}消息,由于原因:{}", id, cause);
            }
        }
    }

4. 发布者
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private ConfirmCb confirmCb;
    
    // 依赖注入 rabbitTemplate 之后再设置它的回调对象
    @PostConstruct
    public void initConstruct(){
        rabbitTemplate.setConfirmCallback(confirmCb);
       
    }

    @GetMapping("/confirm")
    public void producerConfirm2Msg(String msg) {
        // 成功消息 设置消息id
        CorrelationData s = new CorrelationData("1");
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE_D, RabbitMqConfig.BINDING_Dd, msg.getBytes(StandardCharsets.UTF_8)+ "-success", s);

        // 模拟失败消息 交换机设置错误
        CorrelationData f = new CorrelationData("2");
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE_D+"fail", RabbitMqConfig.BINDING_Dd, msg.getBytes(StandardCharsets.UTF_8) + "-fail", f);
    }

5. 订阅者
    @RabbitListener(queues = RabbitMqConfig.QUEUE_d)
    public void confirmConsumerMsg(Message msg){
        String msgs = new String(msg.getBody());
        log.info("当前时间：{},收到 交换机D-队列d 信息{}", new Date(), msgs);
    }

6. console
    交换机已经收到 id 为:1的消息
    当前时间：Sat Nov 19 13:35:48 CST 2022,收到 交换机D-队列d 信息
        
    交换机还未收到 id 为:2的消息,由于原因:channel error; protocol method:
```

#### RabbitMQ-发布确认-交换机无法路由到队列时通知发布者-SpringBoot

```java
在仅开启了生产者确认机制的情况下，交换机接收到消息后，会直接给消息生产者发送确认消息，如果发现该消息不可路由，那么消息会被直接丢弃，此时生产者是不知道消息被丢弃这个事件的

1. 开启回退消息通知
	spring:rabbitmq:template:mandatory: true
        
2. 回退回调实现RabbitTemplate.ReturnsCallback接口（无法路由到队列会走该回调）
    @Component
    @Slf4j
    public class ReturnCb implements RabbitTemplate.ReturnsCallback {
        @Override
        public void returnedMessage(ReturnedMessage returned) {
            log.error(" 消 息 {}, 被 交 换 机 {} 退 回 ， 退 回 原 因 :{}, 路 由 key:{}", new String(returned.getMessage().getBody()), returned.getExchange(), returned.getReplyText(), returned.getRoutingKey());
        }
    }

3. 发布者
    @Autowired
    private ReturnCb returnCb;
    @PostConstruct
    public void initConstruct(){
       rabbitTemplate.setReturnsCallback(returnCb);
    }
    @GetMapping("/returns")
    public void producerReturn2Msg(String msg) {
        // 成功消息 设置消息id
        CorrelationData s = new CorrelationData("3");
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE_D, RabbitMqConfig.BINDING_Dd, msg.getBytes(StandardCharsets.UTF_8), s);

        // 模拟失败消息 路由key设置错误
        CorrelationData f = new CorrelationData("4");
        rabbitTemplate.convertAndSend(RabbitMqConfig.EXCHANGE_D, RabbitMqConfig.BINDING_Dd+"fail", msg.getBytes(StandardCharsets.UTF_8), f);
    }
```

#### RabbitMQ-发布确认-备份交换机-SpringBoot

```java
设置回退消息后，我们需要手动的处理该消息，是不太优雅，可以给当前交换机准备一个【备用交换机】，当有不可路由或者无法投递的消息时，可以分发到备用交换机，再由备用交换机作其他队列优雅处理

// 声明交换机、备用交换机
ExchangeBuilder exchangeBuilder = ExchangeBuilder.directExchange("ENameA")
.durable(true).withArgument("alternate-exchange", "ENameBackUp"); //设置该交换机的备份交换机
return (DirectExchange)exchangeBuilder.build();
```

