/**
 * 1. class
 * 2. 异步操作
 * 3. 从pending 转换到 funfilled 或者 rejected 
 * 4. this 作用域问题
 * 5. 链式调用
 * 6. 值穿透
 */

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

/**
 * Promise 解决过程 [[Resolve]](promise2, x) 实现
 * promise1 调用 then 回调返回值，之后 resolve promise2
 * @param {promise} promise promise1调用 then 返回的promise2
 * @param {*} x promise1 的then中 onfulfilled 或者 onrejected 的返回值
 * @param {*} resolve promise2 !!! 中的 resolve
 * @param {*} reject promise2 !!! 中的 reject
 */
function resolvePromise(promise, x, resolve, reject) {
  if (x === promise) {
    // promise1 回调then返回的是 promise2 自身
    // 循环引用，引发类型错误
    throw new TypeError('Chaning cycle detected for promise')
  }
  if (x instanceof MyPromise) {
    // 返回值是个promise
    x.then(y => {
      resolvePromise(promise, y, resolve, reject)
    }, reject)
  } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // x 非空，为对象或者函数， 属于thenable 
    let then
    try {
      then = x.then
    } catch (e) {
      return reject(e)
    }
    if (typeof then === 'function') {
      // 调用标识，防止多次调用
      // 防止多次调用 下面then中的 两个回调函数
      let called = false
      try {
        then.call(
          x,
          y => {
            if (called) return
            called = true
            resolvePromise(promise, y, resolve, reject)
          },
          r => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } catch (error) {
        if (called) return
        called = true
        reject(error)
      }
    } else {
      // then 不是函数
      resolve(x)
    }
  } else {
    // x 不是对象或者函数
    return resolve(x)
  }
}

class MyPromise {
  constructor(func) {
    this.PromiseState = PENDING // 状态
    this.PromiseResult = null // 内部值

    // pending 状态下 缓存的回调函数列表
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    try {
      // 立即执行主体
      // 主体函数执行错误，直接执行 reject
      func(this.resolve.bind(this), this.reject.bind(this))
    } catch (error) {
      this.reject(error)
    }
  }

  resolve(result) {
    if (this.PromiseState === PENDING) {
      this.PromiseState = FULFILLED
      this.PromiseResult = result
      this.onFulfilledCallbacks.forEach(callback => {
        callback(result)
      })
    }
  }

  reject(reason) {
    if (this.PromiseState === PENDING) {
      this.PromiseState = REJECTED
      this.PromiseResult = reason
      this.onRejectedCallbacks.forEach(callback => {
        callback(reason)
      })
    }
  }

  then(onFulfilled, onRejected) {
    // 参数校验，如果某个参数为空应该默认是忽略
    // 实现异步链式调用 then 后，不需要校验
    // onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    // onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    // 返回一个新的promise
    // 当 上一个promsie的then 回调函数之后调用新的promise
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.PromiseState === FULFILLED) {
        // fulfilled
        queueMicrotask(() => {
          try {
            if (typeof onFulfilled !== 'function') {
              resolve(this.PromiseResult)
            } else {
              let x = onFulfilled(this.PromiseResult)
              resolvePromise(promise2, x, resolve, reject)
            }
          } catch (e) {
            // 前一个 promise1 的 回调函数  中执行错误，下一个promise2直接 reject
            reject(e)
          }
        })
      } else if (this.PromiseState === REJECTED) {
        // rejected
        queueMicrotask(() => {
          try {
            if (typeof onRejected !== 'function') {
              reject(this.PromiseResult)
            } else {
              let x = onRejected(this.PromiseResult)
              resolvePromise(promise2, x, resolve, reject)
            }
          } catch (e) {
            reject(e)
          }
        })
      } else if (this.PromiseState === PENDING) {
        // 待定状态下调用 then
        this.onFulfilledCallbacks.push(() => {
          // 回调函数应该在 then 被调用的那一轮事件循环 的下一个执行栈 中执行，不是直接回调循环执行
          queueMicrotask(() => {
            try {
              if (typeof onFulfilled !== 'function') {
                resolve(this.PromiseResult)
              } else {
                let x = onFulfilled(this.PromiseResult)
                resolvePromise(promise2, x, resolve, reject)
              }
            } catch (e) {
              // 前一个 promise1 的 回调函数  中执行错误，下一个promise2直接 reject
              reject(e)
            }
          })
        })
        this.onRejectedCallbacks.push(() => {
          queueMicrotask(() => {
            try {
              if (typeof onRejected !== 'function') {
                reject(this.PromiseResult)
              } else {
                let x = onRejected(this.PromiseResult)
                resolvePromise(promise2, x, resolve, reject)
              }
            } catch (e) {
              reject(e)
            }
          })
        })
      }

    })

    // 返回
    return promise2
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  finally(callback) {
    // 无论什么状态也要执行这个回调函数
    return this.then(callback, callback)
  }

  // A+ 测试使用
  static deferred() {
    let result = {}
    result.promise = new MyPromise((resolve, reject) => {
      result.resolve = resolve
      result.reject = reject
    })
    return result
  }

  // 静态方法实现
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value
    } else if (typeof value === 'object' && 'then' in value) {
      return new MyPromise((resolve, reject) => {
        value.then(resolve, reject)
      })
    }
    return new MyPromise((resolve, reject) => {
      resolve(value)
    })
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason)
    })
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let length = promises.length
        let result = []
        if (length === 0) {
          return resolve(promises)
        }
        promises.forEach((promise, index) => {
          // if (promise instanceof MyPromise || (typeof promise === 'object' && 'then' in promise)) {
          //   MyPromise.resolve(promise).then(
          //     value => {
          //       length--
          //       result[index] = value
          //       length === 0 && resolve(result)
          //     },
          //     reason => {
          //       reject(reason)
          //     }
          //   )
          // } else {
          //   length--
          //   result[index] = promise
          //   length === 0 && resolve(result)
          // }
          MyPromise.resolve(promise).then(
            value => {
              length--
              result[index] = value
              length === 0 && resolve(result)
            },
            reason => {
              reject(reason)
            }
          )
        })
      } else {
        return reject(new TypeError('Arguments is not iterable for Promise.all'))
      }
    })
  }

  static allSettled(promises) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        let result = []
        let length = promises.length
        if (length === 0) {
          return resolve(promises)
        }
        promises.forEach((item, index) => {
          MyPromise.resolve(item).then(
            value => {
              length--
              result[index] = { status: 'fulfilled', value }
              length === 0 && resolve(result)
            },
            reason => {
              length--
              result[index] = { status: 'rejected', reason }
              length === 0 && resolve(result)
            }
          )
        })
      } else {
        return reject(new TypeError('Not iterable for Pomise.allSettled'))
      }
    })
  }

  static any(promises) {
    return new MyPromise((resolve,reject) => {
      if (Array.isArray(promises)) {
        let length = promises.length
        let error = []
        promises.forEach((item, index) => {
          MyPromise.resolve(item).then(
            value => {
              resolve(value)
            },
            reason => {
              length--
              error[index] = reason
              length === 0 && reject(new Error(error))
            }
          )
        })
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (Array.isArray(promises)) {
        promises.forEach(item => {
          MyPromise.resolve(item).then(
            resolve,
            reject
          )
        })
      } else {
        return reject(new TypeError('Argument is not iterable'))
      }
    })
  }
}

module.exports = MyPromise


// 测试用例

let p0 = new MyPromise((resolve, reject) => {
  resolve('ok') // 运行时确定this，这里this = undifined，需要在promise内部绑定 this
})
console.log("====================")
let p1 = new MyPromise((resolve, reject) => {
  resolve(1)
})
p1.then(res => {
  console.log('p1.res ', res)
})
p1 = new MyPromise((resolve, reject) => {
  reject('error1')
})
p1.then(null, error => {
  console.log('p1.error ', error)
})
console.log("====================")
let p2 = new MyPromise((resolve, reject) => {
  throw new Error('白嫖失败')
})
p2.then(
  result => console.log('fulfilled: ', result),
  reason => console.log('rejected: ', reason.message)
)
console.log("====================")
let p3 = new MyPromise((resolve, reject) => {
  reject('这次一定');
})
p3.then(
  undefined,
  (reason) => console.log(reason)
)
console.log("====================")
console.log('>>>>>>>1')
let p4 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('ok')
    console.log('>>>>>>>>3')
  })
})
p4.then(res => {
  console.log('p4 result ', res)
})
console.log('>>>>>>>2')
console.log("====================")
let p5 = new MyPromise((resolve, reject) => {
  resolve('p5')
})
let pp5 = p5.then()
pp5.then(res => console.log('pp5: ', res))