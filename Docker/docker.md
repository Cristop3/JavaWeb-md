## 20221119

#### docker基本组成

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
    
2. 镜像命令
	docker images # 查看所有本地主机上的镜像
	docker image ls # 查看所有本地主机上的镜像
	
	docker images -a | docker images --all # 列出所有镜像
	docker images -q | docker images --quiet # 列出所有镜像的id
	docker images -aq
	
	docker search [要搜索的镜像名] # 搜索镜像
	
	docker pull [要下载的镜像名] # 下载镜像
	docker image pull [要下载的镜像名] # 下载镜像
	
	docker rmi -f [要删除的镜像id] # 删除镜像指定id镜像
	docker rmi -f $(docker images -aq) # 删除全部镜像
```

