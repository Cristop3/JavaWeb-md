/**
 *   Promise源码解析
 *
 *
 */

/**
 * 1. 构造函数作类
 * @param {*} fn
 * @returns
 */
function Promise(fn) {
  if (typeof this !== 'object') {
    // TODO：这里判断是否用new Promise生成 若没使用那么这个this会指向window 使用new则指向Promise这个构造函数
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    // TODO：要求参数必须是一个函数类型
    throw new TypeError("Promise constructor's argument is not a function");
  }
  // TODO：Promise内部私有变量
  this._deferredState = 0;
  this._state = 0;
  this._value = null;
  this._deferreds = null;
  if (fn === noop) return; // TODO：若为一个空函数 则return
  doResolve(fn, this); // TODO：调用doResolve 传入fn函数及构造函数Promise
}

/**
 * 2. doResolve函数
 * @param {*} fn 在 new Promise传入的函数
 * @param {*} promise  Promise类
 */
function doResolve(fn, promise) {
  var done = false; // TODO: 内部是否完成标识符
  /**
   *  从3解析可以看出 new Promise后 会同步执行参数函数fn内部逻辑 而两个参数就是我们常写的'resolve','reject'
   *  在a,b函数里面 我们可以看出 任何一个回调调用了 那么其他都不会调用了 因为if(done) return
   *  所以在很多面试题里面 经常看到考察在fn函数内部中 先调用a() 又调用b() 又调用a()此类操作 统统都只会执行第一个
   *  而且a函数接收一个value参数 就是我们经常使用的传递到then的回调函数1的前值
   *  而b函数接收一个reason参数 就是我们经常使用的传递到then或catch的回调函数2的原因
   */
  var res = tryCallTwo(
    fn,
    function (value) {
      // TODO: 传入fn 及带2个回调函数
      if (done) return; // TODO: 任意执行一次
      done = true;
      resolve(promise, value);
    },
    function (reason) {
      if (done) return; // TODO: 任意执行一次
      done = true;
      reject(promise, reason);
    }
  );
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

/**
 * 3. tryCallTwo函数
 * 其实就是给fn传入a,b两个函数作为参数调用fn 外层包裹try catch
 * 这里就可以解释 平时我们在new Promise(function(resolve,reject){ console.log(1) }) 会立马执行打印1
 * 代码会先执行传给Promise这个参数函数 因为内部执行了fn(a,b) 而resolve就是a函数 reject就是b函数 回到2
 *
 * @param {*} fn 在 new Promise传入的函数
 * @param {*} a 2.中的回调函数1
 * @param {*} b 2.中的回调函数2
 * @returns
 */
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

/**
 * 4. 先来分析 假如fn函数执行resolve fn函数内部 手动调用resolve
 * @param {*} self  Promise类 
 * @param {*} newValue resolve的value值
 * @returns 
 */
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(self, new TypeError('A promise cannot be resolved with itself.'));
  }
  if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (then === self.then && newValue instanceof Promise) {
      self._state = 3;
      self._value = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._state = 1; // TODO: 当前状态置为1 fulfilled 
  self._value = newValue; // TODO: 带上value值
  finale(self);
}

/**
 * 5. resolve&reject 最后都会调该函数
 * @param {*} self Promise对象
 */
function finale(self) {
  if (self._deferredState === 1) {
    handle(self, self._deferreds);
    self._deferreds = null;
  }
  if (self._deferredState === 2) {
    for (var i = 0; i < self._deferreds.length; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }
}

