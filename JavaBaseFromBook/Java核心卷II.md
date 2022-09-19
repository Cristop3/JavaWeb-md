#### Java8流库

```java

```

## 2022.08.24

#### JavaIO体系

##### 分类

```java
1. 传输方式
    从数据传输方式或者说运输方式角度看，可将IO类分为：
    	1.1 字节流
    		它是以"一个字节"单位来传输
    		主要用来处理"二进制文件"（如图片、mp3、视频文件）
    
    		1.1.1 InputStream
    				- ByteArrayInputStream
    				- PipedInputStream
    				- FilterInputStream
    					- BufferedInputStream
    					- DataInputStream
    				- FileInputStream
    				- ObjectInputStream
    
    		      OutputStream
    				- ByteArrayOutputStream
    				- PipedOutputStream
    				- FilterOutputStream
    					- BufferedOutputStream
    					- DataOutputStream
    					- PrintStream
    				- FileOutputStream
    				- ObjectOutputStream

    	1.2 字符流
    		它是以"单个字符(即多个字节)"单位来传输，其中一个字符又根据编码的不同，对应的字节也不同，如UTF-8编码中，中文是3个字节，而GBK中是2个字节
    		主要用来处理"文本文件"（其实也是二进制文件，只是使用了某种编码而方便人类来阅读）
    		1.2.1 Reader
    				- CharArrayReader
    				- PipedReader
    				- FilterReader
    				- BufferedReader
    				- InputStreamReader
    					- FileReader
    			  Writer
    				- CharArrayWriter
    				- PipedWriter
    				- FilterWriter
    				- BufferdWriter
    				- OutputStreamWriter
    					- FileWriter
    				- PrintWriter

2. 从数据操作上
    2.1 文件(file)
    	- FileInputStream
    	- FileOutputStream
    	- FileReader
    	- FileWriter
    2.2 数组([])
    	字节数组(byte[])
    		- ByteArrayInputStream
    		- ByteArrayOutputStream
    	字符数组(char[])
    		- CharArrayReader
    		- CharArrayWriter
    2.3 管道操作
    	- PipedInputStream
    	- PipedOutputStream
    	- PipedReader
    	- PipedWriter
    2.4 基本数据类型
    	- DataInputStream
    	- DataOutputStream
    2.5 缓冲操作
    	- BufferedInputStream
    	- BufferedOutputStream
    	- BufferedReader
    	- BufferedWriter
    2.6 打印
    	- PrintStream
    	- PrintWriter
    2.7 对象序列化反序列化
    	- ObjectInputStream
    	- ObjectOutputStream
    2.8 相互转换
    	- InputStreamReader 字节流 -> 字符流
    	- OutputStreamWriter 字符流 -> 字节流
```

##### 装饰者模式

```java
1. 如何理解
    在JavaIO中包括了三者，分别是
    "装饰组件"（Decorator）- 装饰具体组件，动态扩展被装饰者(具体组件)的功能；也有自己的方法也可以调用被装饰者(具体组件)方法
    "具体组件"（ConcreteComponent）- 有自己的基础方法，但某些情况下不够用，因此需要被装饰下，来增强功能
    "顶层组件"（Component）
    装饰者和具体功能组件都继承自顶层组件
    
2. 例子
    InputStream - 抽象组件 - "顶层组件"
    FileInputStream - 继承自InputStream - "具体组件" - 提供了字节流的输入操作
    FilterInputStream -  抽象装饰组件 - "装饰组件" - 用于装饰具体组件，为具体组件提供额外的功能
    
    若需要实例化一个具有缓存功能的字节流对象时，只需要在FileInputStream对象上再套一层BufferedInputStream对象
    FileInputStream fileInputStream = new FileInputStream(filePath);
	BufferedInputStream bufferedInputStream = new BufferedInputStream(fileInputStream); 
```

##### 常见类使用

```java
javaIO的使用可以分为以下几类：
    1. 磁盘操作：File
    	File类用于表示文件和目录的信息，但是不表示文件的内容
    	// File dir
    	dir.exists()
    	dir.isFile()
    	dir.getName()
    	dir.listFiles()
    
    2. 字节流操作：InputStream | OutputStream 
    	FileInputStream fin = new FileInputStream(filePath);
		FileOutputStream fout = new FileOutputStream(targetPath);
		byte[] buffer = new byte[20 * 1024];
         while(fin.read(buffer,0,buffer.length) != -1){
             fout.write(buffer);
         }
		fin.close();
         fout.close();

    3. 字符流操作：Reader | Writer
        逐行输出文本文件内容
        FileReader fileReader = new FileReader(filePath);
	    BufferedReader bufferedReader = new BufferedReader(fileReader);
		String line;
		while((line = bufferedReader.readLine()) != null){
            System.out.println(line);
        }
		bufferedReader.close();

    4. 对象序列化操作：Serializable & transient
        就是将一个"对象"转换成"字节序列"，方便存储和传输
        序列化：ObjectOutputStream.writeObject()
        反序列化：ObjectInputStream.readObject()
        
        不会对静态变量进行序列化，因为序列化只是保存对象的状态，而静态变量属于类的状态
        transient关键字可以使一些属性不会被序列化。
        
    5. 网络操作
        InetAddress: 用于表示网络上的硬件资源，即IP地址
        URL：统一资源定位符
        Sockets：使用TCP协议实现网络通信
        Datagram：使用UDP协议实现网络通信
```

##### Unix IO模型

```java
一个输入操作通常包括两个阶段
    1. 等待数据准备好
    2. 从内核向进程复制数据
对于一个套接字上的输入操作，第一步通常涉及等待数据从网络中到达，当所有分组到达时，它被复制到内核中的某个缓冲区，第二步就是把数据从内核缓冲区复制到应用进程缓冲区。
    
五种I/O模型
    1. 同步I/O
        1.1 阻塞式I/O
                应用进程被阻塞，直到数据复制到应用进程缓冲区中才返回。
                这种模型的执行效率会比较高。

        1.2 非阻塞式I/O
                应用进程执行系统调用之后，内核返回一个错误码。应用进程可以继续执行，但是需要不断的执行系统调用来获知 I/O 是否完成，这种方式称为轮询(polling)。
                这种模型是比较低效的。

        1.3 I/O复用（select和poll）
                使用 select 或者 poll 等待数据，并且可以等待多个套接字中的任何一个变为可读，这一过程会被阻塞，当某一个套接字可读时返回。之后再使用 recvfrom 把数据从内核复制到进程中。它可以让单个进程具有处理多个 I/O 事件的能力。又被称为 Event Driven I/O，即事件驱动 I/O。

        1.4 信号驱动式I/O（SIGIO）
                应用进程使用 sigaction 系统调用，内核立即返回，应用进程可以继续执行，也就是说等待数据阶段应用进程是非阻塞的。内核在数据到达时向应用进程发送 SIGIO 信号，应用进程收到之后在信号处理程序中调用 recvfrom 将数据从内核复制到应用进程中。
    
    2. 异步I/O（AIO）
        进行 aio_read 系统调用会立即返回，应用进程继续执行，不会被阻塞，内核会在所有操作完成之后向应用进程发送信号。 异步 I/O 与信号驱动 I/O 的区别在于，异步 I/O 的信号是通知应用进程 I/O 完成，而信号驱动 I/O 的信号是通知应用进程可以开始 I/O。 
```

##### Java BIO

```java
同步并阻塞，服务器实现模式为一个连接一个线程，即客户端有连接请求时服务器端就需要启动一个线程进行处理，如果这个连接不做任何事情会造成不必要的线程开销，当然可以通过线程池机制改善。
```

##### Java NIO

```java
同步非阻塞，服务器实现模式为一个请求一个线程，即客户端发送的连接请求都会注册到多路复用器上，多路复用器轮询到连接有I/O请求时才启动一个线程进行处理。
```

