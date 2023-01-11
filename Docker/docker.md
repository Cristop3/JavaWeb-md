## 20221119

#### centos7下常用目录解释

```shell
# / 根目录
这就是根目录。对你的电脑来说，有且只有一个根目录。所有的东西，我是说所有的东西都是从这里开始
# /etc 
这里主要存放了系统配置方面的文件。举个例子：你安装了docker这个套件，当你想要修改docker配置文件的时候，你会发现它们(配置文件)就在/etc/docker目录下
# /home
普通用户的家目录，该目录中保存了绝大多数的用户文件(用户自己的配置文件，定制文件，文档，数据等)，root用户除外。
# /tmp
这是临时目录。对于某些程序来说，有些文件被用了一次两次之后，就不会再被用到，像这样的文件就放在这里。有些linux系统会定期自动对这个目录进行清理，因此，千万不要把重要的数据放在这里。	
# /var
内容经常变化的目录,此目录下文件的大小可能会改变，如缓冲文件，日志文件，缓存文件，等一般都存放在这里。 /var 这个目录的内容是经常变动的，看名字就知道，我们可以理解为vary的缩写，/var下有/var/log 这是用来存放系统日志的目录。/var/www目录是定义Apache服务器站点存放目录；/var/lib 用来存放一些库文件，比如MySQL的，以及MySQL数据库的的存放地；/var/log 系统日志存放，分析日志要看这个目录的东西；
/var/spool 打印机、邮件、代理服务器等假脱机目录；
# /usr
在这个目录下，你可以找到那些不适合放在/bin或/etc目录下的额外的工具。比如像游戏啊，一些打印工具等等。
	# /usr/lib
	目标库文件，包括动态连接库加上一些通常不是直接调用的可执行文件的存放位置。这个目录功能类似/lib目录，理说，这里存放的文件应该是/bin目录下程序所需要的库文件的存放地
	# /usr/bin 
	一般使用者使用并且不是系统自检等所必需可执行文件的目录。此目录相当于根文件系统下的对应目录（/bin，非启动系统，非修复系统以及非本地安装的程序一般都放在此目录下）
	# /usr/local
	安装本地程序的一般默认路径。这个目录主要存放那些手动安装的软件，一般是用来存放用户自编译安装软件的存放目录；或者一般是通过源码包安装的软件，如果没有特别指定安装目录的话，一般是安装在这个目录中。
```

#### docker-centos7下安装（内网走代理）

```shell
# yum install -y yum-utils
#  yum-config-manager \
	> --add-repo \
	> https://mirrors.163.com/docker-ce/linux/centos/docker-ce.repo // 使用网易源 阿里云源我会报错

# yum install docker-ce docker-ce-cli containerd.io
# systemctl start docker
# docker version // 出现东西就表示安装成功

由于是在公司内网，我在主机centos中设置了代理，但是在pull镜像的时候，一直拉不下来东西，感觉是daemon这个守护进程并没有获取我主机centos中设置的代理，因此需要单独设置docker的代理

1. 切换守护进程daemon的镜像源
# vim /etc/docker/daemon.json
// daemon.json
{
        "registry-mirrors": [
                                "https://hub-mirror.c.163.com",
                                "https://mirror.baidubce.com"
                            ]
}

2. 添加代理
# cd /etc/systemd/system
# mkdir docker.service.d
# cd docker.service.d
# vim http-proxy.conf

// http-proxy.conf
[Service]
Environment="HTTP_PROXY=http://ip:port/" // 免密的话直接配置ip|port
Environment="HTTPS_PROXY=http://ip:port/" // 注意这里若代理无https则配置成http一模一样 否则Pull会报错
Environment="NO_PROXY=10.*,11.*" // 过滤

3. 重启
# systemctl daemon-reload
# systemctl restart docker

4. 检查
# docker info
或者
# systemctl show docker --property Environment // 有打印配置项就表示设置成功
```

#### docker基本组成

![docker运行架构.png](https://s2.loli.net/2022/11/21/M9UOsjz1XktPvFT.png)

```java
1. 镜像（image）
    1.1 概念
        类比是一个目标，可以通过该目标来创建容器服务，比如：Tomcat镜像 -> run -> 容器（提供Tomcat服务器）并且通过这个镜像可以创建多个容器（最终服务运行或者项目运行就是在这些容器中）
        镜像是一种轻量级、可执行的独立软件保，用来打包软件运行环境和基于运行环境开发的软件，他包含运行某个软件所需的所有内容，包括代码、运行时库、环境变量和配置文件。将所有的应用和环境，直接打包为docker镜像，就可以直接运行。
    1.2 加载原理
    	docker的镜像实际上由一层一层的文件系统组成，这种层级的文件系统UnionFS。Union文件系统（UnionFs）是一种分层、轻量级并且高性能的文件系统，他支持对文件系统的修改作为一次提交来一层层的叠加，同时可以将不同目录挂载到同一个虚拟文件系统下。一次同时加载多个文件系统，但从外面看起来，只能看到一个文件系统，联合加载会把各层文件系统叠加起来，这样最终的文件系统会包含所有底层的文件和目录。
    	boots(boot file system）主要包含 bootloader和 Kernel, bootloader主要是引导加 kernel,
Linux刚启动时会加bootfs文件系统，在 Docker镜像的最底层是 boots。这一层与我们典型的Linux/Unix系统是一样的，包含boot加載器和内核。当boot加载完成之后整个内核就都在内存中了，此时内存的使用权已由 bootfs转交给内核，此时系统也会卸载bootfs。
		rootfs（root file system),在 bootfs之上。包含的就是典型 Linux系统中
的/dev,/proc,/bin,/etc等标准目录和文件。 rootfs就是各种不同的操作系统发行版，比如 Ubuntu,
Centos等等
    1.3 分层
    	采用这种分层的结构最大的好处，我觉得莫过于资源共享了！比如有多个镜像都从相同的Base镜像构建而来，那么宿主机只需在磁盘上保留一份base镜像，同时内存中也只需要加载一份base镜像，这样就可以为所有的容器服务了，而且镜像的每一层都可以被共享。
    	docker inspect [容器id] 中的RootFS项 可看分层详细信息
    	所有的 Docker镜像都起始于一个基础镜像层，当进行修改或培加新的内容时，就会在当前镜像层之
上，创建新的镜像层。比如我们下载了个ubuntu镜像作为第一层【镜像层】在此镜像上添加了一个mysql应用，则mysql及后续添加的东西叫【容器层】
    	此时若我们使用docker commit -m="描述该镜像信息" -a="作者" [容器id] [你所自定义的镜像名]:[Tag|版本标识]来生成一个自定义的镜像
    
2. 容器（container）
    通过镜像来创建，可以独立运行一个或者一组应用
    
3. 仓库（repository）
    存放镜像的地方
```

![docker-image.png](https://s2.loli.net/2022/11/22/ZKdrtxyqIYk4GjH.png)

#### docker常用命令

```shell
1. 帮助命令
    docker [命令] --help
    docker version # 显示docker的版本信息
    docker info # 显示docker的系统信息，包括镜像和容器的数量
    
2. 镜像命令 # https://hub.docker.com/ 拿不清楚的 直接到docker hub上去搜索对应的镜像 可看详情
	2.1 查看镜像
        docker images # 查看所有本地主机上的镜像
        docker image ls [镜像名]# 查看所有本地主机上的镜像可执行参看某个镜像

        docker images -a | docker images --all # 列出所有镜像
        docker images -q | docker images --quiet # 列出所有镜像的id
        docker images -aq
	
	2.2 搜索镜像
		docker search [要搜索的镜像名] # 搜索镜像
	
	2.3 下载镜像
        docker pull [要下载的镜像名] # 下载镜像
        docker image pull [要下载的镜像名] # 下载镜像
	
	2.4 删除镜像(注意与删除容器区别 镜像：rmi 容器：rm)
        docker rmi -f [要删除的镜像id] # 删除镜像指定id镜像
        docker rmi -f $(docker images -aq) # 删除全部镜像
	
3. 容器命令
	3.1 查看容器
        docker container ls # 查看当前所有运行的容器
        docker ps [可选参数] # 查看当前所有运行的容器
            [可选参数]（常用）
            -a | --all # 查看当前所有运行的容器
            -n | --last int # 查看当前所有运行的容器到倒数第n个 默认-1
            -q | --quiet # 简要显示 只显示容器id
            
        docker stats [容器名] # 查看某个容器内存\cpu等信息    
	
	3.2 启动容器
        docker run [可选参数] [要启动的镜像名称] [命令]
        或者
        docker container run [可选参数] [要启动的镜像名称] [命令]
        [可选参数]（常用）
        --name="Name" # 容器的名称 主要用于区分每个容器
        -d # 将容器以后台方式启动
        -it # 使用交互方式运行，可进入容器查看容器内容 其中-i指交互式操作;-t终端
        -p # 指定容器的端口 如-p 8080(主机):8080(容器内)
            -p ip:主机端口:容器内端口
            -p 主机端口:容器内端口
            -p 容器内端口
        -P # 随机一个容器内端口 
        -rm # 这个参数是说容器退出后随之将其删除。默认情况下，为了排障需求，退出的容器并不会立即删除，除非手动 docker rm。我们这里只是随便执行个命令，看看结果，不需要排障和保留结果，因此使用 --rm 可以避免浪费空间
        [命令]
        bash # 以一个交互式的shell，bash启动容器

        # 1. 如下pull一个ubuntu镜像并以此为容器启动
        docker pull ubuntu
        [root@localhost /]# docker image ls
        REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
        ubuntu       latest    a8780b506fa4   2 weeks ago   77.8MB
        [root@localhost /]# docker run -it ubuntu bash
        root@c5983bc12cc4:/# ls // 看root@后面的内容已经不是localhost则表示进入了容器ubuntu
        bin   dev  home  lib32  libx32  mnt  proc  run   srv  tmp  var
        boot  etc  lib   lib64  media   opt  root  sbin  sys  usr
        root@c5983bc12cc4:/# exit // 退出当前容器
        exit
        [root@localhost /]# // 回到主机中

        # 2. 后台启动
        docker run -d ubuntu
        [root@localhost /]# docker run -d ubuntu
        5409e725c53842497c5f042cf2518c84bf6717ac7d30041f93e25881468cc8b4
        # 3. 查看容器
        [root@localhost /]# docker container ls
        CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
        会发现无，是因为Docker容器后台运行，必须有一个前台进程。容器运行的命令如果不是那些一直挂起的命令（比如运行ping，sleep），就是会自动退出的
        # 4. 测试一直挂起
        [root@localhost /]# docker run -d ubuntu sleep 999999
        8c694909d0c499431ab96ea3e90b0f168688f5d472a8a5c84f665bb613e22a73
        [root@localhost /]# docker container ls
        CONTAINER ID   IMAGE     COMMAND          CREATED         STATUS         PORTS     NAMES
        8c694909d0c4   ubuntu    "sleep 999999"   4 seconds ago   Up 3 seconds             compassionate_mestorf
        # 5. 停止当前容器
        [root@localhost /]# docker stop 8c694909d0c4
        8c694909d0c4
        [root@localhost /]# docker container ls
        CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
        [root@localhost /]# 
    
    3.3 启停容器
        docker stop [要停止的容器id]
        docker start [要启动的容器id]
        docker restart [要重启的容器id]
        docker kill [要强制停止的容器id]
    
    3.4 退出容器
        exit # 退出当前容器
        Ctrl + P + Q # 容器不停止退出
        
        [root@localhost /]# docker run -it ubuntu bash
        # 执行Ctrl + P + Q
        root@8ecf381fac48:/# [root@localhost /]# docker ps
        CONTAINER ID   IMAGE     COMMAND   CREATED          STATUS          PORTS     NAMES
        8ecf381fac48   ubuntu    "bash"    16 seconds ago   Up 15 seconds             wonderful_borg
        [root@localhost /]#
   	
    3.5 删除容器(注意与删除镜像区别  容器：rm 镜像：rmi)
        docker rm [容器id] # 删除非运行状态的容器
        docker rm -f [容器id] # 强制删除容器
        docker rm -f $(docker ps -aq)
        docker ps -a -q | xargs docker rm
   	
   	3.6 查看容器日志
   		docker logs [可选参数] [容器id]
   		[可选参数]（常用）
   		-tf #显示日志信息（一直更新）
        --tail number #需要显示日志条数
        
        docker logs -t --tail n 容器id #查看n行日志
        docker logs -ft 容器id #跟着日志
        
    3.7 查看容器在当前主机中的进程    
    	docker top [容器id]
    	[root@localhost /]# docker top 29e084e7dc70
        UID                 PID                 PPID                C                   STIME               TTY                 TIME                CMD
        root                7171                7150                0                   22:18               pts/0               00:00:00            bash
        [root@localhost /]# 
        
    3.7 查看容器元数据
    	docker inspect [容器id]
    
    3.8 进入后台模式的容器
    	docker exec -it [容器id] [方式] # 进入当前容器后开启一个新的终端，可以在里面操作。
    	[root@localhost /]# docker exec -it 29e084e7dc70 bash
        root@29e084e7dc70:/# ls
        bin   dev  home  lib32  libx32  mnt  proc  run   srv  tmp  var
        boot  etc  lib   lib64  media   opt  root  sbin  sys  usr
        # Ctrl + P + Q
        
        docker attach [容器id] # 进入容器正在执行的终端
        [root@localhost /]# docker attach 29e084e7dc70
        root@29e084e7dc70:/# ls
        bin   dev  home  lib32  libx32  mnt  proc  run   srv  tmp  var
        boot  etc  lib   lib64  media   opt  root  sbin  sys  usr
        
    3.9 从容器内拷贝东西到主机
    	docker cp [容器id]:[需要操作的路径] [需要拷贝到主机的目录]
    	# 容器内建测试文件（容器启动起在哈）
    	 docker attach [容器id]
    	 cd /usr/local
    	 echo "test" > test.txt
    	# 退出
    	 exit
    	# 主机上 
    	 docker cp [容器id]:/usr/local/test.txt /var/local/
    	 cat /var/local/test.txt
    	 test
```

![docker-command.png](https://s2.loli.net/2022/11/21/9nLjoZqDRtdVAsv.png)

#### docker安装Nginx

```shell
docker pull nginx
docker run -d --name "myNginx" nginx -p 4455:80
# 这里当我们退出启动的myNginx容器后 它其实还在 下次启动若名称也取myNginx会报错告诉有个容器存在了
# 因此我们可以跟上 --rm 当我们退出时 则会摧毁容器 跟下次不冲突
# docker run -d -p 4456:80  --rm --name "myNginx" nginx
docker container ls
docker exec -it myNginx bash
cd /usr/nginx && ls

# 启动的时候-p 参数说明 将[主机4455端口]映射到[容器内的80端口]
# 则访问主机地址的4455 会看到nginx welcome
```

#### docker安装Tomcat

```shell
docker pull tomcat
docker run -d -p 4456:8080 --rm --name "myTomcat" tomcat
docker ps
Ctrl + P + Q
docker exec -it myTomcat bash

# 这里我们会发现/usr/local/tomcat/webapps中没有东西
# 直接访问主机地址:4456会发现404
cp -r webapps.dist/* webapps
# 将webapps.dist下面所有文件拷贝到webapps 再次访问就会看到tomcat欢迎页
```

#### docker数据卷 -【 容器】与【主机】之间文件挂载关联

```shell
1. 用途
	容器之间可以有一个数据共享的技术，Docker容器中产生的数据，同步到本地，目录的挂载，将我们容器内的目录，挂载到Linux上面，以实现容器内数据的持久化和同步操作且容器间也是可以数据共享的
	
2. 命令
	# docker run -v [主机路径]:[容器内路径] | -v [主机路径]:[容器内路径] ...
	# docker run --volume [主机路径]:[容器内路径] | --volume [主机路径]:[容器内路径] ...
	
3. 测试
	docker pull mysql
	docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=[你的mysql root密码] 
	-v /home/mysql/conf:/etc/mysql/conf.d 
	-v /home/mysql/data:/var/lib/mysql 
	--name "myMysql" 
	mysql
	docker ps
	docker inspect [当前mysql容器id]
	# 会看到卷挂载具体信息
	"Mounts": [
        {
        "Type": "bind",
        "Source": "/home/mysql/data",
        "Destination": "/var/lib/mysql",
        "Mode": "",
        "RW": true,
        "Propagation": "rprivate"
        },
        {
        "Type": "bind",
        "Source": "/home/mysql/conf",
        "Destination": "/etc/mysql/conf.d",
        "Mode": "",
        "RW": true,
        "Propagation": "rprivate"
        }
    ],
    # 此时若我们在主机上操作/home/mysql/conf/conf.d文件，容器内的/etc/mysql/conf.d文件同步更新，或者在容器内操作/var/lib/mysql下文件，主机的/home/mysql/data下同步更改
    # 且不论容器是否启动 修改主机的都会自动同步容器文件 这样就到达了【数据持久化】及不用【进入容器操作配置文件】等好处
    
4. 匿名挂载、具名挂载、指定路径挂载
	匿名：docker run -d -P -v [容器内路径] [应用]
	具名：docker run -d -P -v [给挂载取一个名字]:[容器内路径] [应用]
	# 以上两种方式 可通过 docker volume ls查看
	# 且默认存在在/var/lib/docker/volumes/[xxxx]下
	指定：docker run -d -P -v [主机路径]:[容器路径] [应用]
	# 这种方式 docker volume ls查看不到
```

#### docker数据卷容器 -【 容器】与【容器】之间文件挂载关联

```shell
1. 概念
	可以在多个容器之间同步数据，而且容器之间的配置信息的传递，数据卷容器的生命周期一直持续到没有容器使用为止。但是一旦你持久化到了本地，这个时候，本地的数据是不会删除的！
	
2. 命令
	docker run -it --name [需要挂载的容器名称] --volumes-from [被挂载的容器(也可称为数据卷容器或者父容器)] [镜像名] 
	
3. 测试
	# 启动一个名称叫做【mysqlFather】且端口【3306映射3306】且将【主机/home/testV目录】挂载到【容器内根目录下/testV】
	docker run -d --name "mysqlFather" -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -v /home/testV/:/testV/ mysql
	docker exec -it 6c64169f bash
	# 查看是否存在testV并进入目录创建一个内容为"hello i am from father"的share.txt文件
	bash-4.4# ls
    bin   dev                         entrypoint.sh  home  lib64  mnt  proc  run   srv  【testV】  usr
    boot  docker-entrypoint-initdb.d  etc            lib   media  opt  root  sbin  sys  tmp    var
    cd testV && echo "hello i am from father" > share.txt
    # 退回主机查看/home/testV
    [root@localhost testV]# ls
	share.txt
	----------------- 以上是容器卷-v命令的持久化内容 -----------------
	# 启动一个名称叫做【mysqlSon】且端口【3307映射3306】且将挂载到【父容器名称mysqlFather】下
	docker run -d --name "mysqlSon" -p 3307:3306 -e MYSQL_ROOT_PASSWORD=root --volumes-from mysqlFather  mysql
	docker exec -it 688d12da6594 bash
	# 发现根目录下同样存在testV及其下的share.txt文件
	bash-4.4# cat share.txt
	hello i am from father
	# 在子容器中修改该文件
	echo "hello i am from father; hi i change by son" > share.txt
	# 回到主机 查看
	[root@localhost testV]#  cat share.txt 
	hello i am from father; hi i change by son
    # 查看父容器
    [root@localhost testV]# docker exec -it 6c64169f2f4a bash
    bash-4.4# cat share.txt 
	hello i am from father; hi i change by son
	----------------- 以上是容器与容器之间--volumes-from命令的同步内容 -----------------
```

#### Dockerfile及制作

```shell
1. 概念
	dockerfile 是用来构建docker镜像的文件，命令参数脚本。
	
2. 构建步骤
	2.1 编写DockerFile文件
	2.2 docker build 构建镜像
	2.3 docker run 运行镜像
	2.4 docker push 发布镜像
	
3. DockerFile编写规范
    3.1 每个保留关键字(指令）都是必须是大写字母
    3.2 执行从上到下顺序
    3.3 #表示注释
    3.4 每一个指令都会创建提交一个新的镜像曾，并提交！
    
4. DockerFile常用指令
    FROM # 基础镜像，一切从这里开始构建
    MAINTAINER # 镜像是谁写的， 姓名+邮箱
    RUN # 镜像构建的时候需要运行的命令
    ADD # 步骤，tomcat镜像，这个tomcat压缩包！添加内容 添加同目录
    WORKDIR # 镜像的工作目录
    VOLUME # 挂载的目录
    EXPOSE # 保留端口配置
    CMD # 指定这个容器启动的时候要运行的命令，只有最后一个会生效，可被替代。
    ENTRYPOINT # 指定这个容器启动的时候要运行的命令，可以追加命令
    ONBUILD # 当构建一个被继承 DockerFile 这个时候就会运行ONBUILD的指令，触发指令。
    COPY # 类似ADD，将我们文件拷贝到镜像中
    ENV # 构建的时候设置环境变量！
    
    CMD # 指定这个容器启动的时候要运行的命令，只有最后一个会生效（前面的命令无效），可被替代。
    ENTRYPOINT # 指定这个容器启动的时候要运行的命令，可以追加命令
    
5. 完整交付
    DockerFile：构建文件，定义了一切的步骤，源代码
    DockerImages：通过DockerFile构建生成的镜像，最终发布和运行产品。
    Docker容器：容器就是镜像运行起来提供服务。	
```

#### DockerFile-构建一个具备vim命令的ubuntu

```shell
# 目前安装的ubuntu不带vim命令 构建一个具备vim的自定义ubuntu
[root@localhost /]# docker run -it a8780b506fa4 bash
root@ae462a952854:/# ls
bin   dev  home  lib32  libx32  mnt  proc  run   srv  tmp  var
boot  etc  lib   lib64  media   opt  root  sbin  sys  usr
root@ae462a952854:/# vim
bash: vim: command not found

# 主机下创建DockerFile文件
[root@localhost /]# cd /home && mkdir dockerfiles && cd dockerfiles && touch Dockerfile
[root@localhost dockerfiles]# ls
DockerFile
[root@localhost dockerfiles]# vim Dockerfile 

#基于ubuntu构建
FROM ubuntu
#作者信息
MAINTAINER caristop3<qq@qq.com>
#配置环境变量
ENV MYPATH /usr/local
#设置工作目录（也就是进入容器后的默认目录，使用$引用变量）
WORKDIR $MYPATH
#镜像构建的时候需要运行的命令
RUN apt-get install vim
#启动容器时执行的命令
CMD echo $MYPATH
CMD echo "-----done-----"
CMD ["bash"]

docker build -f [需要build的dockerfile文件名] -t [打包成为镜像的名称]:[Tag]
若你的dockerfile文件名就是【Dockerfile】则可以省略 -f 参数 直接
docker build -t [打包成为镜像的名称]:[Tag]
```

#### DockerFile-构建一个Tomcat web服务器

```shell
FROM centos #

MAINTAINER cheng<1204598429@qq.com>

COPY README /usr/local/README # 复制文件

ADD jdk-8u231-linux-x64.tar.gz /usr/local/ # 复制解压
ADD apache-tomcat-9.0.35.tar.gz /usr/local/ # 复制解压

RUN yum -y install vim

ENV MYPATH /usr/local # 设置环境变量

WORKDIR $MYPATH # 设置工作目录

ENV JAVA_HOME /usr/local/jdk1.8.0_231 # 设置环境变量
ENV CATALINA_HOME /usr/local/apache-tomcat-9.0.35 # 设置环境变量
ENV PATH $PATH:$JAVA_HOME/bin:$CATALINA_HOME/lib # 设置环境变量 分隔符是：

EXPOSE 8080 # 设置暴露的端口

CMD /usr/local/apache-tomcat-9.0.35/bin/startup.sh && tail -F /usr/local/apache-tomcat-9.0.35/logs/catalina.out # 设置默认命令
```

#### docker网络

```shell
1. 查看当前网络
	ip addr
	# 一般情况下会出现3个网卡
	1: lo # 本地回环地址
	2: ens33 # 虚拟机网卡 因人而异
	3: docker0 ip(172.17.0.1) # docker创建的网卡
	
2. 启动任意一个镜像 再查看网络
	docker run -d --name "tomcat1" -P tomcat
	ip addr
	# 会发现多了一组网络
	5: vethe9c1e0a@if4
	# 再启动一个镜像
	docker run -d --name "tomcat2" -P tomcat
	# 会发现又多了一组网络
	7: veth05e2ecd@if6
	# 分别inspect两个容器 查看对应的ip
	tomcat1 : ip(172.17.0.3) getway(172.17.0.1) # 均使用docker0作为网关
	tomcat2 : ip(172.17.0.2) getway(172.17.0.1) # 均使用docker0作为网关
	
	# 从主机ping容器内ip 均能ping通
	ping 172.17.0.3
	ping 172.17.0.2
	# 分别从容器内ping主机 均能ping通
	
	# 从容器1ping容器2 或者 容器2ping容器1 均能ping通
	
	docker会将docker0作为路由器，所有的容器不指定网络的情况下，都是docker0路由的，docker会给我们的容器分配一个默认的可用ip。且不论怎么ping指定ip（主机到容器&容器到主机&容器到容器）均可通	
	
3. 原理
	我们每启动一个docker容器，docker就会给docker容器分配一个ip，我们只要按照了docker，
就会有一个docker0桥接模式，使用的技术是veth-pair技术！veth-pair 就是一对的虚拟设备接口，他们都是成对出现的，一端连着协议，一端彼此相连正因为有这个特性 veth-pair 充当一个桥梁，连接各种虚拟网络设备的
OpenStac,Docker容器之间的连接，OVS的连接，都是使用evth-pair技术。见下图：
```

![docker-network.png](https://s2.loli.net/2022/11/23/afixnyE5ZL1eOwh.png)

```shell
4. 如何使用容器名称来代替ip
	在上面的容器ping容器中我们一直使用的是固定ip，在集群环境中，显然不可靠。
	4.1 --link命令
		docker run -d -P --name "tomcat1" tomcat
		docker run -d -P --name "tomcat2" --link tomcat1 tomcat
		# 将tomcat2连接到tomcat1下 实际就是在tomcat2中的host中添加了tomcat1地址作映射
		root@9e5f110a2560:/usr/local/tomcat# cat /etc/hosts
        127.0.0.1       localhost
        172.17.0.2      tomcat1 f0c01ba73742 # 此处
        172.17.0.3      9e5f110a2560
        # 但是在tomcat1下的hosts中没有tomcat2ip
        因此，现在从tomcat2 ping tomcat1能通，反过来tomcat1 ping tomcat2不通
        
        # 同时我们用docker inspect tomcat2容器id
        "Links": [
                "/tomcat1:/tomcat2/tomcat1"
         ]
    # 默认使用docker0 作桥接模式的缺陷就是无法天然支持通过容器名连接访问（备选使用--link太麻烦）
    
    4.2 自定义网络
    	# docker network命令
    	[root@localhost ~]# docker network ls
        NETWORK ID     NAME      DRIVER    SCOPE
        dab60d638ac5   bridge    bridge    local
        da05f4096574   host      host      local
        abf93f58cc98   none      null      local
        
    	bridge ：桥接 docker（默认，自己创建也是用bridge模式）
        none ：不配置网络，一般不用
        host ：和所主机共享网络
        container ：容器网络连通（用得少！局限很大）
        
        # 平时我们run一个镜像跑起来的容器，默认就是使用bridge模式 --net [模式]
        docker run -d -P --name tomcat1 tomcat
        docker run -d -P --name tomcat1 --net bridge tomcat
        
        # 自定义
        [root@localhost ~]# docker network create --driver bridge --subnet 192.168.0.0/16 --gateway 192.168.0.1 diynet
        873e415298a3316348276d2264ad3d2fc2900ddeaa1802e98d8e05022917d037
        [root@localhost ~]# docker network ls
        NETWORK ID     NAME      DRIVER    SCOPE
        dab60d638ac5   bridge    bridge    local
        873e415298a3   diynet    bridge    local
        da05f4096574   host      host      local
        abf93f58cc98   none      null      local
        
        # 以自定义网络启动容器
        docker run -d -P --name tomcat1 --net diynet tomcat
        docker run -d -P --name tomcat2 --net diynet tomcat
        # 这样不论在容器1连接容器2，还是反过来，均能连接。因为我们自定义的网络docker当我们维护好了对应的关系
        
   4.3 不同网段的容器之间连接
   		# 在上面中，我们启动的两个容器均是在同一网段192.168因此直接使用自定义网络均能打通
   		若在不同网段的容器之间连接，则我们要使用docker network connect 命令
   		docker network connect [OPTIONS] [自定义网络名称] [需要连接的容器名称]
   		docker network connect diynet tomcat2
```

