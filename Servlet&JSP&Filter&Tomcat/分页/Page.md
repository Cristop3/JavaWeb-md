## 2022.05.09

#### 分页参数

```java
pageNo   当前页码
    当前页码由客户端进行传递

pageSize  每页显示数量
    每页显示数量由两种因素决定
        1. 客户端进行传递
        2. 由页面布局决定

pageCountTotal 总记录数
    可由sql语句求出
    select count(*) from 表名

pageNoTotal  总页码
    由总记录数 / 每页数量求出
    若总记录数%每页数量>0,则总页码+1
    
items  当前页数据
    可由sql求出
    select* from 表名 limit begin,pageSize;
    begin公式：(pageNo - 1) * pageSize
```
