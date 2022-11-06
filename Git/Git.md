## 20221106

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

```js
git reflog	
简易查看提交历史
按时间倒叙展示

7位版本号 commit 内容
...

git log
详细查看提交历史
按时间倒叙展示

commit 完整版本号
Author: 配置的用户签名 name & email
Date: 提交时间
提交内容说明
```



#### 