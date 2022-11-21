## 20221119

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
    类比是一个目标，可以通过该目标来创建容器服务，比如：Tomcat镜像 -> run -> 容器（提供Tomcat服务器）并且通过这个镜像可以创建多个容器（最终服务运行或者项目运行就是在这些容器中）
    
2. 容器（container）
    通过镜像来创建，可以独立运行一个或者一组应用
    
3. 仓库（repository）
    存放镜像的地方
```

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
	
	2.4 删除镜像
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
   	
    3.5 删除容器
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

