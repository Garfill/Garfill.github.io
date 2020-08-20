/**
 * 手写Promise实现
 */

// 定义全局状态变量
const PENDING = 'pending', FULFILLED = 'fulfilled', REJECTED = 'rejected';

/**
 * Promise 构造函数
 * @param {Function} executor 
 */
function Promise(executor) {
  let self = this;
  self.status = PENDING;
  self.fulFilledCallback = [];
  self.rejectedCallback = [];

  self.value = undefined;
  self.reason = undefined;

  // 内部定义的 resolve 函数
  function resolve(value) {
    if (self.status !== PENDING) return
    self.status = FULFILLED;
    self.value = value;
    if (self.fulFilledCallback.length > 0) {
      // Promise 的回调为 微任务 回调，这里用 宏任务 的setTimeout 来模拟
      setTimeout(() => {        
        self.fulFilledCallback.forEach(fn => {
          fn(self.value)
        });
      }, 0);
    }
  }

  // 内部定义的 reject 函数
  function reject(reason) {
    if (self.status !== PENDING) return
    self.status = REJECTED;
    self.reason = reason
    if (self.rejectedCallback.length > 0) {
      setTimeout(() => {
        self.rejectedCallback.forEach(fn => {
          fn(self.reason)
        });
      }, 0);
    }
  }

  // 定义Promise的时候会立刻执行一次传入的执行函数 executor
  try {
    executor(resolve, reject);
  } catch(e) {
    reject(e);
  }
}

/**
 * then 方法，支持传入成功回调和失败回调
 * @param {Function} onFulFilled 
 * @param {Function} onRejected 
 * @return 一个新的Promise对象  
 */
Promise.prototype.then = function(onFulFilled, onRejected) {
  const self = this
  onFulFilled = typeof onFulFilled === 'function' ? onFulFilled : value => value
  onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
  return new Promise((resolve, reject) => {

    /**
     * then 内部对于回调的封装
     * @param {Function} callback 回调函数
     */
    function handler(callback) {
      try {
        const result = callback(self.value);
        const isPromise = result instanceof Promise;
        if (isPromise) {
          result.then(
            value => resolve(value),
            reason => reject(reason)
          )
        } else {
          resolve(result);
        }
      } catch (e) {
        reject(e)
      }
    }
    
    if (self.status === PENDING) {
      self.fulFilledCallback.push(onFulFilled);
      self.rejectedCallback.push(onRejected);
    } else if (self.status === FULFILLED) {
      setTimeout(() => {
        handler(onFulFilled)
      }, 0);
    } else (self.status === REJECTED) {
      setTimeout(() => {
        handler(onRejected)
      }, 0);
    }
  })
}

/**
 * 失败回调
 * @param {Function} onRejected
 * @return 一个新的Promise对象   
 */
Promise.prototype.catch = function(onRejected) {
  return this.then(undefined, onRejected)
}

/**
 * Promise 函数对象的 resolve
 * @param {Any} value 成功的返回
 * @return 返回一个指定value的成功的Promise对象  
 */
Promise.resolve = function(value) {
  return new Promise((resolve, reject) => {
    if (value instanceof Promise) { // 等 value 执行结束之后重新回来更新这个 Promise 的状态，再传递给链的下一个
      value.then(resolve, reject)
    } else {
      resolve(value)
    }
  })
}

/**  
 * Promise函数对象的reject 
 * @param value 失败的返回  
 * @return 返回一个指定reason的失败的Promise对象  
 */
Promise.reject = function(reason) {
  return new Promise((_, reject) => {
    reject(reason)
  })
}

/**  
 * Promise函数对象的all 
 * @param {Array} promises 数组/promise对象的数组  
 * @return 只有全部promise都成功了才成功，注意是！！！全部
 */  
Promise.all = function(promises) {
  const promiseCount = promises.length;
  const resolveResult = new Array(promiseCount);
  let resolvedCount = 0;
  return new Promise((resolve, reject) => {
    promises.forEach((item, index) => {
      Promise.resolve(item).then(
        value => {
          resolvedCount++;
          resolveResult[index] = value;
          if (resolvedCount >= promiseCount) { // 所有item 均已经触发回调的情况下
            resolve(resolvedCount);
          }
        },
        reason => {
          reject(reason)
        }
      )
    })
  })
}

/**  
 * Promise函数对象的race 
 * @param {Array} promises 数组/promise对象的数组  
 * @return 返回一个promise对象,其结果由第一个完成的promise决定  
 */
Promise.race = function(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach((item) => {
      Promise.resolve(item).then( // 一旦有一个item 完成，触发回调，则会改变 Promise 状态
        value => resolve(value),
        reason => reject(reason)
      )
    })
  })
}