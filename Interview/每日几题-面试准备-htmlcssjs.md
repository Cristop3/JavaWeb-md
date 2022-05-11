### 2021.03.17

   1. Promise实现

      ```js
      const PENDING = 'pending';
      const FULFILLED = 'fulfilled';
      const REJECTED = 'rejected';
      function Promise2(executor) {
          let self = this;
          self.status = PENDING;
          self.onFulfilled = []; //成功的回调
          self.onRejected = []; //失败的回调
          //PromiseA+ 2.1
          function resolve(value) {
              if (self.status === PENDING) {
                  self.status = FULFILLED;
                  self.value = value;
                  self.onFulfilled.forEach(fn => fn()); //PromiseA+ 2.2.6.1
              }
          }
      
          function reject(reason) {
              if (self.status === PENDING) {
                  self.status = REJECTED;
                  self.reason = reason;
                  self.onRejected.forEach(fn => fn()); //PromiseA+ 2.2.6.2
              }
          }
      
          try {
              executor(resolve, reject);
          } catch (e) {
              reject(e);
          }
      }
      
      Promise2.prototype.then = function (onFulfilled, onRejected) {
          //PromiseA+ 2.2.1 / PromiseA+ 2.2.5 / PromiseA+ 2.2.7.3 / PromiseA+ 2.2.7.4
          onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
          onRejected =
              typeof onRejected === 'function'
              ? onRejected
          : reason => {
              throw reason;
          };
          let self = this;
          //PromiseA+ 2.2.7
          let promise2 = new Promise2((resolve, reject) => {
              if (self.status === FULFILLED) {
                  //PromiseA+ 2.2.2
                  //PromiseA+ 2.2.4 --- setTimeout
                  setTimeout(() => {
                      try {
                          //PromiseA+ 2.2.7.1
                          let x = onFulfilled(self.value);
                          resolvePromise(promise2, x, resolve, reject);
                      } catch (e) {
                          //PromiseA+ 2.2.7.2
                          reject(e);
                      }
                  });
              } else if (self.status === REJECTED) {
                  //PromiseA+ 2.2.3
                  setTimeout(() => {
                      try {
                          let x = onRejected(self.reason);
                          resolvePromise(promise2, x, resolve, reject);
                      } catch (e) {
                          reject(e);
                      }
                  });
              } else if (self.status === PENDING) {
                  self.onFulfilled.push(() => {
                      setTimeout(() => {
                          try {
                              let x = onFulfilled(self.value);
                              resolvePromise(promise2, x, resolve, reject);
                          } catch (e) {
                              reject(e);
                          }
                      });
                  });
                  self.onRejected.push(() => {
                      setTimeout(() => {
                          try {
                              let x = onRejected(self.reason);
                              resolvePromise(promise2, x, resolve, reject);
                          } catch (e) {
                              reject(e);
                          }
                      });
                  });
              }
          });
          return promise2;
      };
      
      function resolvePromise(promise2, x, resolve, reject) {
          let self = this;
          //PromiseA+ 2.3.1
          if (promise2 === x) {
              reject(new TypeError('Chaining cycle'));
          }
          if ((x && typeof x === 'object') || typeof x === 'function') {
              let used; //PromiseA+2.3.3.3.3 只能调用一次
              try {
                  let then = x.then;
                  if (typeof then === 'function') {
                      //PromiseA+2.3.3
                      then.call(
                          x,
                          y => {
                              //PromiseA+2.3.3.1
                              if (used) return;
                              used = true;
                              resolvePromise(promise2, y, resolve, reject);
                          },
                          r => {
                              //PromiseA+2.3.3.2
                              if (used) return;
                              used = true;
                              reject(r);
                          }
                      );
                  } else {
                      //PromiseA+2.3.3.4
                      if (used) return;
                      used = true;
                      resolve(x);
                  }
              } catch (e) {
                  //PromiseA+ 2.3.3.2
                  if (used) return;
                  used = true;
                  reject(e);
              }
          } else {
              //PromiseA+ 2.3.3.4
              resolve(x);
          }
      }
      
      ```

      2.Promise例子分析

      ```js
      new Promise2(function (resolve, reject) { 
          // 执行executor函数 打印1
          // 执行resolve函数传参11
          // 1. 内部状态：{status:'pending',onFulfilled:[],onRejected:[]} -- "Promsie1"
          console.log(1);
          resolve(11);
          // 2. 内部状态：{status:'fulfilled',onFulfilled:[],onRejected:[],value:11}  执行了resolve后 状态已更改为fulfilled
      })
      // 3. 跟到执行then方法
      // 获取then的两个参数 onFulfilled即第一个参数（ok=>console.log(ok)） onRejected即第二个参数 (err => console.log(err))
      // 定义self = this 而该this指向前一个Promise 即  ---    "Promise1"
      // 这时重新new 一个Promise 内部状态：{status:'pending',onFulfilled:[],onRejected:[]} -- "Promise2"
      // 在Promise2的executor函数里面 执行判断
      // 判断上一个Promise实例（也就是Promise1）的状态 -- 因为Promise1执行了resolve了状态已变更为fulfilled 
      // 因此 将当前then的执行onFulfilled函数及resolvePromise函数  压入setTimeout 异步队列 -----------------------------  1. 注意这是第一次压入队列 ①
      // 返回当前Promise2
          .then( 
          ok => {
              console.log(ok);
              return {a:1}
          },
          err => {
              console.log(err);
          }
      )
      // 4. 由于上面返回了Promise2 即继续执行then方法
      // 获取then的两个参数 onFulfilled即第一个参数（ok=>console.log(ok2);return '我是第二个then 返回值'） onRejected即第二个参数 (err2 => console.log(err2))  
      // 定义self = this 而该this指向前一个Promise 即  ---    "Promise2"
      // 这时重新new 一个Promise 内部状态：{status:'pending',onFulfilled:[],onRejected:[]} -- "Promise3"
      // 在Promise3的executor函数里面 执行判断
      // 判断上一个Promise实例（也就是Promise2）的状态 -- 因为Promise2被压入了异步队列 所以当前状态为pending
      // 因此 将当前then的执行onFulfilled函数及resolvePromise函数 压入setTimout 异步队列 注意这里外层还包裹了一层函数 实际并没执行 执行时才算压入队列
      // 压入上一次也就是"Promise2"的onFulfilled数组中 ---即“Promise2”的内部状态：{status:'pending',onFulfilled:["下一次then执行resolve逻辑"],onRejected:["下一次then执行reject逻辑"]}
      // 返回当前Promise3
          .then(
          ok2 => {
              console.log(ok2);
              return new Promise2((resolve,reject) => {
                  console.log('我是返回值为Promise')
                  resolve()
              }).then(ok => {
                  console.log('我是返回值为Promise 得第一个then')
              }).then(ok => {
                  console.log('我是返回值为Promise 得第二个then')
              }).then(ok => {
                  console.log('我是返回值为Promise 得第三个then')
              })
          },
          err2 => {
              console.log(err2);
          }
      )
      // 5. 由于上面返回了Promise3 即继续执行then方法
      // 获取then的两个参数 onFulfilled即第一个参数（ok=>console.log(ok3);又来一个promise） onRejected即第二个参数 (默认参数)
      // 定义self = this 而该this指向前一个Promise 即  ---    "Promise3"
      // 这时重新new 一个Promise 内部状态：{status:'pending',onFulfilled:[],onRejected:[]} -- "Promise4"
      // 在Promise4的executor函数里面 执行判断
      // 判断上一个Promise实例（也就是Promise3）的状态 -- {status:'pending',onFulfilled:[],onRejected:[]}
      // 因此 将当前then的执行onFulfilled函数及resolvePromise函数 压入setTimout 异步队列 注意这里外层还包裹了一层函数 实际并没执行 执行时才算压入队列
      // 压入上一次也就是"Promise3"的onFulfilled数组中 ---即“Promise3”的内部状态：{status:'pending',onFulfilled:["下一次then执行resolve逻辑"],onRejected:["下一次then执行reject逻辑"]}
      // 返回当前Promise4
          .then(ok3 => {
          console.log(ok3);
          new Promise2((resolve, reject) => {
              console.log('then内部嵌套promise');
              resolve();
          })
              .then(() => {
              console.log('内部then1');
          })
              .then(() => {
              console.log('内部then2');
          }).then(() => {
              console.log('内部then3')
          })
      })
      // 6. 由于上面返回了Promise4 即继续执行then方法
      // 获取then的两个参数 onFulfilled即第一个参数（ok=>console.log(end)） onRejected即第二个参数 (默认参数)
      // 定义self = this 而该this指向前一个Promise 即  ---    "Promise4"
      // 这时重新new 一个Promise 内部状态：{status:'pending',onFulfilled:[],onRejected:[]} -- "Promise5"
      // 在Promise5的executor函数里面 执行判断
      // 判断上一个Promise实例（也就是Promise4）的状态 -- {status:'pending',onFulfilled:[],onRejected:[]}
      // 因此 将当前then的执行onFulfilled函数及resolvePromise函数 压入setTimout 异步队列 注意这里外层还包裹了一层函数 实际并没执行 执行时才算压入队列
      // 压入上一次也就是"Promise4"的onFulfilled数组中 ---即“Promise4”的内部状态：{status:'pending',onFulfilled:["下一次then执行resolve逻辑"],onRejected:["下一次then执行reject逻辑"]}
      // 返回当前Promise5
          .then(() => {
          console.log('end');
      })
      // 7. 由于上面返回了Promise5 即继续执行then方法
      // 获取then的两个参数 onFulfilled即第一个参数（ok=>console.log(end2)） onRejected即第二个参数 (默认参数)
      // 定义self = this 而该this指向前一个Promise 即  ---    "Promise5"
      // 这时重新new 一个Promise 内部状态：{status:'pending',onFulfilled:[],onRejected:[]} -- "Promise6"  
      // 在Promise6的executor函数里面 执行判断
      // 判断上一个Promise实例（也就是Promise5）的状态 -- {status:'pending',onFulfilled:[],onRejected:[]}
      // 因此 将当前then的执行onFulfilled函数及resolvePromise函数 压入setTimout 异步队列 注意这里外层还包裹了一层函数 实际并没执行 执行时才算压入队列
      // 压入上一次也就是"Promise5"的onFulfilled数组中 ---即“Promise5”的内部状态：{status:'pending',onFulfilled:["下一次then执行resolve逻辑"],onRejected:["下一次then执行reject逻辑"]}
      // 返回当前Promise6  
          .then(() => {
          console.log('end2');
      });
      
      // 8. 至此 我们的同步代码全部执行完成 可以发现其实就只有第一个then回调方法 进入了异步队列 在前面代码163行
      
      // --------------------------------------------------  执行第一个then ------------------------------------------
      // 所以 反过去执行 “第一个then的resolve方法”
      // 执行代码167行 打印值 11 返回 undefined 至此 第一个then的fulfilled 状态已执行完成 --- 为了链式操作理念 --- 需要传递到下一个then方法
      // 执行代码62行 resolvePromise(promise2,x,resolve,reject) --- 这里的promise2 指的是“Promise2” x指的是前面返回的 undefined
      // 判断x是否等于当前promise2 判断x是否为一个object对象 或者一个function函数
      // 若无  则执行Promise的resolve方法  执行这个方法 是为了将当前Promise状态（即Promise2）改变 因为 当前代码已执行完 需要执行下一个then方法
      // 这里很关键的代码就是这里遍历Promise2的onFulfilled数组 并执行其中方法  说穿了 就是开始执行之前push进去的下一个then方法 --------------------------  注意第一次压入队列的方法执行完毕
      
      // 这里非常需要注意 执行数组方法的时候 又是一个压入setTimeout异步队列 并未开始执行 ------------- 2. 注意这是第二次压入队列
      // 异步过后 执行内容 ------------- 注意第二次压入队列的方法执行完毕
      
      // -------------------------------------------------- 执行第二个then -------------------------------------------
      // 执行代码184行 打印 undefined
      // 执行代码185行 返回 '我是第二个then 返回值'
      // 执行代码83行 resolvePromise(promise2,x,resolve,reject) --- 这里的promise2 指的是“Promise3” x指的是前面返回的 '我是第二个then 返回值'
      // 判断x是否等于当前promise2 判断x是否为一个object对象 或者一个function函数
      // 若无  则执行Promise的resolve方法  执行这个方法 是为了将当前Promise状态（即Promise3）改变 因为 当前代码已执行完 需要执行下一个then方法
      // 这里很关键的代码就是这里遍历Promise2的onFulfilled数组 并执行其中方法  说穿了 就是开始执行之前push进去的下一个then方法 
      
      // 这里非常需要注意 执行数组方法的时候 又是一个压入setTimeout异步队列 并未开始执行 ------------- 3. 注意这是第三次压入队列
      // 异步过后 执行内容 ------------- 注意第三次压入队列的方法执行完毕
      
      // -------------------------------------------------- 执行第三个then -------------------------------------------
      // 执行代码201行 打印 ‘我是第二个then 返回值’
      // 执行代码202行 这里又是一个新的Promise （这里很关键的认知就是此时 我们并没有代码逻辑在异步队列当中） 那么按照前面的思路执行Promise
      // 执行executor函数 生成一个新的Promise 当前状态 {status:'pending',onFulfilled:[],onRejected:[]} --- "Promise7"
      // 执行代码203行 打印 ‘then内部嵌套promise’
      // 执行resolve 即当前"Promise7"状态为 fulfilled
      
      // ------------------------------------------------- 执行三then内部的第一个then -------------------------
      // 如同上面第一个then 状态为 fulfilled 即 将当前then的执行onFulfilled函数及resolvePromise函数  压入setTimeout 异步队列 --------------------------  4. 注意这是第四次压入队列 ① 
      // 返回Promise7
      
      // ------------------------------------------------- 执行三then内部的第二个then -------------------------
      // 如同上面操作 生成一个新的"Promise8"
      // 因为上个状态还是pending 即压入 Promise7的回调数组
      // 返回 “Promise8”
      
      // 至此 第三个then里面的resolve已执行完成 
      // 执行代码83行 resolvePromise(promise2,x,resolve,reject) --- 这里的promise2 指的是“Promise4” x指的是前面返回的 undefined
      // 执行 resolve 将当前状态置为 fulfilled
      // 这里很关键的代码就是这里遍历Promise2的onFulfilled数组 并执行其中方法  说穿了 就是开始执行之前push进去的下一个then方法
      
      // 注意 这里很关键 我们现在存在第四次压入队列的异步操作 也就是三then的第一个then 这里执行回调数组执行 又是将 下一次then 说穿了就是console.log('end')
      // 这个操作放入了setTimeout 异步 队列 ----------------------------------- 5. 注意这是第五次压入队列
      
      
      // 至此 第三个then中的所有同步代码已执行完成
      // 开始执行 异步队列中的代码
      
      // -------------------------------------------------- 执行三then内部的第一个then的异步队列 逻辑 --------------
      // 执行代码207行 打印 ‘内部then1’ 返回 undefined
      // 此时 x = undefined 即继续执行 resolvePromise 更改当前Promise状态 并执行回调数组 即将下一次执行 压入setTimeout 队列 ------------- 6. 注意这是第六次压入队列
      // 至此 第四次压入队列的方法执行完毕
      
      // -------------------------------------------------- 执行第四个then ---------------------------------------------- 
      // 执行代码223行 打印end1
      // 至此 第五次压入队列的方法执行完毕
      
      // -------------------------------------------------- 执行三then内部的第二个then的异步队列 逻辑 --------------
      // 打印 '内部then2'
      // 至此 第六次压入队列的方法执行完毕
      
      // 至此 剩余一个 onFulfilled数组 执行 ------------------------ 7.   注意这是第七次压入队列    
      
      // 打印'end2'
      // 至此 第七次压入队列的方法执行完毕
      ```

      3.Promise相关实现

      ```js
      // 1. Promise.resolve 实现
      // 1.1 如果 value 是个 thenable 对象，返回的promise会“跟随”这个thenable的对象，采用它的最终状态,注意这是个异步模拟！
      // 1.2 如果传入的value本身就是promise对象，那么Promise.resolve将不做任何修改、原封不动地返回这个promise对象。
      // 1.3 其他情况，直接返回以该值为成功状态的promise对象。
      Promise.resolve = (param) => {
          // 1.1
          if(param instanceof Promise) return param;
          return new Promise((resolve,reject) => {
              if(param && param.then && typeof param.then === 'function'){
                  // 1.2 注意是个异步操作
                  setTimeout(() => {
                      param.then(resolve,reject)
                  })
              }else{
                  // 1.3 正常处理
                  resolve(param)
              }
          })
      }
      ```

      ```js
      // 2. Promise.reject 实现
      // 2.1 Promise.reject方法和Promise.resolve不同，Promise.reject()方法的参数，会原封不动地作为reject的理由，变成后续方法的参数。
      Promise.reject = (param) => {
          return new Promise((resolve,reject) => {
              reject(param)
          })
      }
      ```

      ```js
      // 3. Promise.prototype.catch 实现
      // 3.1 catch其实是then方法的简写 then方法的第一个参数为null 只需要第二个reject错误函数
      Promise.prototype.catch = (cb) => {
          return this.then(null,cb);
      }
      ```

      ```js
      // 4. Promise.prototype.finally 实现
      // 4.1 前一步 不管成功还是失败，都会走到finally中
      // 4.2 并且在finally后，还可以继续执行then,并将前一步值传递给后面的then
      Promise.prototype.finally = (cb) => {
          return this.then(success => {
              // 4.1 上一步 成功
              return Promise.resolve(cb()).then(() => {
                  // 4.2 继续then
                  return success
              })
          },error => {
              // 4.2 上一步 失败
              return Promise.resolve(cb()).then(() => {
                  // 4.2 继续then
                  return error
              })
          })
      }
      ```

      ```js
      // 5. Promise.all 实现
      // 5.1 返回一个Promise对象
      // 5.2 如果传入的参数是一个空的可迭代对象，那么此promise对象回调完成(resolve),只有此情况，是同步执行的，其它都是异步返回的。
      // 5.3 如果传入的参数不包含任何 promise，则返回一个异步完成。
      // 5.4 如果参数中有一个promise失败，那么Promise.all返回的promise对象失败。
      Promise.all = (promises) => {
          // 5.1
          return new Promise((resolve,reject) => {
              let index = 0
              let result = []
              let len = promises.length
              if(len === 0){
                  // 5.2
                  return result
              }
              for(let i=0;i<len;i++){
                  // 5.3
      			Promise.resolve(promises[i]).then(data => 			  {
                      result[i] = data
                      if(++index === len){
                          resolve(result)
                      }
                  }, err => {
                      // 5.4
                      reject(err)
                      return
                  })
              }
          }) 
      }
      ```

      ```js
      // 6. Promise.race 实现
      // 6.1 返回一个Promise
      // 6.2 若参数数组为空 则返回Promise一直等待
      // 6.3 它将与第一个传递的 promise 相同的完成方式被完成。它可以是完成（ resolves），也可以是失败（rejects），这要取决于第一个完成的方式是两个中的哪个。
      Promise.race = (promises) => {
          // 6.1
          return new Promise((resolve,reject) => {
              // 6.2
              if(promises.length === 0) return
              for(let i=0;i<promises.length;i++){
                  // 6.3
                  Promise.resolve(promises[i]).then(data => 			{
                      resolve(data)
                      return
                  }, error => {
                      reject(error)
                      return
                  }) 
              }
      
          })
      }
      ```

      

### 2021.01.13

1. **定义对象使用Object.create(null)跟{}有什么区别？**

   ① 在看vue源码的时候 会多时多处看到作者在声明对象的时候 都会使用Object.create(null)来声明 但是我平时全部使用的是{}来声明 这两者的区别到底是什么

   ② 粗略的解释就是使用Object.create(null)来创建的对象是一个纯对象很干净 没继承Object原型上的属性和方法等 在后续的判断中可以快速判断比如`let a = Object.create(null) if(a.toString){...}` 而使用{}来创建的对象就会继承有Object原型上的属性和方法 具体更详情的区别看下面链接文章

   [https://juejin.cn/post/6844903589815517192](详解Object.create(null))
   
   ③ Object.create(proto)方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__ 
   
   <img src="https://i.loli.net/2021/01/25/I2EKl8N7rPsWobL.png" alt="ObjectCreate.png" style="zoom:67%;" />
   
   ```
   1.使用对象字面量创建对象 原型对象__proto__指向Object
   2.Object.create(null) 会创建一个纯对象无杂质
   3.Object.create({a:1}) 会创建一个空对象 这里的空是指当前对象的原型对象__proto__指向{a:1}这个对象 而{a:1}里面的原型对象__proto__指向Object
   ```
   
   

### 2021.01.11

1. **vue2.0兼容IE哪个版本以上吗？**

   因为vue响应式原理是基于es5的Object.defineProperty，不支持ie8及其以下

2. **如何更改浏览器左上角title图标?**

   准备".ico"格式图片

```html
<link rel="shortcut icon" href="xxx.ico" />
```

### 2021.01.07

1. ###### call，apply方法有何不同且如何手动实现call，apply方法？
   ① call,apply两个方法都是能直接修改函数内部this的指向并执行函数。

   ② call,apply唯一的区别在于参数的不同：

      Call接收一系列参数，第一个参数为需要更改为的this指向，后续参数为调用函数所需的形参

      Apply接收2个参数，第一个参数为需要更改为的this指向，第二个参数为数组即为调用调用函数所需的形参

   ③ 实现原理特点：

      第一步：将当前正在调用的函数设置为入参数对象的一个属性

      第二步：基于入参对象来执行调用函数

      第三步：删除入参对象的该属性即删除第一步赋值在入参对象上的函数方法

      第四步：返回调用函数的结果集

    ④ 处理入参：

      函数默认参数arguments这个是个类数组；

      ES5：这里call和apply不同的地方就是call需要从arguments的第二个参数开始拿（通过循环arguments拿到每个参数，遍历形成参数集合数组）而apply直接取第二个参数（通过循环第二个参数，遍历形成参数集合数组）,再执行通过eval将字符串解析成变量参数的函数得到结果集。

      ES6：使用扩展运算符来操作入参，即不用遍历arguments，这里call和apply不同的地方就是call需要拿到从第二位开始的入参即：[…arguments].slice(1)而apply只需要展开第二个入参[…arr]即分别拿到函数所需的形参参数。

   ⑤ 分别实现：

      ES5:

   ```js
   Function.prototype._call = function(obj){
   ​      var newObj = obj ? Object(obj) : window // 未传入时默认指向window对象
   ​      var args = [] // 用来承载传入的参数
   ​      for(var i=1;i<arguments.length;i++){
      			args.push(“arguments[”+i+”]”)
   	   }
   ​      newObj.fn = this // 此时的this指向执行函数
   ​      let result = eval(“newObj.fn(“+args+”)”) // eval解析且执行该函数
   ​      delete newObj.fn // 删除该属性
   ​      return result // 返回结果集
   }
   Function.prototype._apply = function(obj,arr){
       var newObj = obj ? Object(obj) : window
       newObj.fn = this
       var result
       if(!!arr){
          let args = []
          for(var i=0;i<arr.length;i++){
          	args.push(“arr[”+i+”]”)
          }
          result = eval(“newObj.fn(”+args+”)”)
       }else{
           result = newObj.fn()
       }
       return result
   }
   ```

   ES6:

   ```js
   Function.prototype._call = function(obj){
       let newObj = obj ? Object(obj) : window
       newObj.fn = this
       let args = [...arguments].slice(1)
       let result = newObj.fn(...args)
       delete newObj.fn
       return result
   }
   
   Funtion.prototype._apply = function(obj,arr){
       let newObj = obj ? Object(obj) : window
       newObj.fn = this
       let result
       if(!arr){
           result = newObj.fn
       }else{
           result = newObj.fn(...arr)
       }
       delete newObj.fn
       return result
   }
   ```

   ⑥ 例子：

   ```js
   var name = '上酸菜'
   var obj = {
       name:'翠花'
   }
   function test(x,y){
       console.log(`${x}${y}${this.name}`)
   }
   test._call(obj,'我的','名字是') // '我的名字是翠花'
   test._call(null,'我的','名字是') // '我的名字是上酸菜'
   test._apply(obj,'我的','名字是') // '我的名字是翠花'
   test._apply(null,'我的','名字是') // '我的名字是上酸菜'
   ```

### 2020.12.31

1. **H5如何与APP交互？有哪些方式？**

   http://www.fly63.com/article/detial/2824

   https://zhuanlan.zhihu.com/p/139510850

   简化说就是：

   App丢在webview的window上面，h5丢在window上面，相互调用；

   建个iframe通过src一个指定的url，app端拦截请求，回调函数。

2. **js写一个方法操作css变量？**

   其实就是官方提供了类似sass的&foo变量，less中的@foo变量，官方为--foo为变量。

   ```js
   const isSupported = window.CSS && window.CSS.supports && window.CSS.supports('--a', 0);
   if (isSupported) {
    /* supported */
   } else {
    /* not supported */
   }
   // 设置变量
   document.body.style.setProperty('--primary', '#7F583F');
   // 读取变量
   document.body.style.getPropertyValue('--primary').trim();
   // '#7F583F'
   // 删除变量
   document.body.style.removeProperty('--primary');
   ```

   

