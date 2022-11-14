20221106

#### 设置用户签名

```js
git config --global user.name = 用户名
git config --global user.email = 邮箱 // 虚拟邮箱即可 不会校验真假

用户签名的作用是区分不同的操作者，它会显示在每一个版本的提交信息中，以此来确认本次提交是哪个做的。

首次安装Git，必须设置用户签名，否则无法提交代码。

这里的用户签名完全只为了显示是who提交的，跟其他远程仓库账户无关

cat ~/.gitconfig
[user]
	name = xxx
	email = xxx
在C:\Users\admin(当前window用户目录)\.gitconfig中可以查看设置的用户签名
```

#### git init

```js
git init
初始化本地库
// 默认创建.git的隐藏文件夹 windows下
```

#### git status

![gitStatus.png](https://s2.loli.net/2022/11/12/bXSsBuH4taZYMz7.png)

![gitStatus2.png](https://s2.loli.net/2022/11/12/3i7HJfzGwU1KhqT.png)

```js
git status
On branch master // 显示当前分支
Your branch is up to date with 'origin/main'. // 有过远程推送则显示远程推送

// 存在修改文件没提交本地库的
Changes not staged for commit:

// 新创建文件，未跟踪的
Untracked files:
```

#### git add

```js
git add 文件路径/文件名
git add . // 添加所有到暂存区
```

#### git restore --staged

```js
git restore --staged 文件路径/文件名
将已提交至暂存区的文件，退回到工作区
```

#### git commit -m "本次提交说明"

```git
git commit -m "本次提交说明"
```

#### git reflog  |  git log

![gitReflog.png](https://s2.loli.net/2022/11/12/w2HshWZORNPe6ca.png)

![gitLog.png](https://s2.loli.net/2022/11/12/mPASLdtg2kipTrw.png)

```js
git reflog	
简易查看提交历史
按时间倒叙展示

7位版本号 commit 内容
...
// 说明一点 显示的(HEAD -> main) HEAD@{0}:commit: 最新的一次提交说明
// 当前版本指向HEAD{0}

git log
详细查看提交历史
按时间倒叙展示

commit 完整版本号
Author: 配置的用户签名 name & email
Date: 提交时间
提交内容说明
```

#### git reset --hard 版本号

```js
该命令用于作版本穿梭，假如我们commit了三次，即git reflog下大致显示
2342344 (HEAD -> master) HEAD@{0}: commit: 第三次提交 // 最新版本位置
e34d332 HEAD@{1}: commit: 第二次提交
fg34232 HEAD@{2}: commit: 第一次提交

回到第二次提交时
git reset --hard e34d332
2342344 HEAD@{0}: commit: 第三次提交 
e34d332 (HEAD -> master) HEAD@{1}: commit: 第二次提交 // 最新版本位置
fg34232 HEAD@{2}: commit: 第一次提交

回到第一次提交时
git reset --hard fg34232
2342344 HEAD@{0}: commit: 第三次提交 
e34d332 HEAD@{1}: commit: 第二次提交 
fg34232 (HEAD -> master)HEAD@{2}: commit: 第一次提交 // 最新版本位置

底层就是移动了（HEAD -> 当前分支）这一整体指针指向的提交版本
```

#### 分支

```js
// 查看当前分支
git branch -v 
git branch

// 创建分支
git branch feature-xxx

// 切换分支
git checkout feature-xxx

// 合并分支
git merge 要合并到当前分支的分支名

// 分支冲突
合并分支时，两个分支在【同一个文件的同一个位置】有两套完全不同的修改，Git无法判断究竟使用哪一个因此需要人为手动决定
<<<<< HEAD
	// 这整体是当前分支内容
==========
    // 这整体是合并分支内容
>>>>> feature-xxx
```


