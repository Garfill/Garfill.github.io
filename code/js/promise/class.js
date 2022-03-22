const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

let uid = 0

class MyPromise {

  static resolve(param) {
    if (param instanceof MyPromise) {
      return param
    }
    return new MyPromise((resolve, reject) => {
      resolve(param)
    })
  }

  static reject(param) {
    return new MyPromise((resolve, reject) => {
      reject(param)
    })
  }

  static all(promises) {
    let promiseLength = promises.length
    let result = new Array(promiseLength)
    let count = 0
    return new MyPromise((resolve, reject) => {
      promises.forEach((item, index) => {
        MyPromise.resolve(item).then(
          value => {
            count++
            result[index] = value
            if (count >= promiseLength) {
              resolve(result)
            }
          },
          reason => {
            reject(reason)
          }
        )
      })
    })
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(item => {
        MyPromise.resolve(item).then(
          value => resolve(value),
          reason => reject(reason)
        )
      })
    })
  }

  constructor(executor) {
    this.uid = ++uid;

    this.status = PENDING;
    this.value = null; // 成功结果
    this.reason = null; // 失败原因
    this.fulfilledCb = [];
    this.rejectedCb = []
    // 传入handler先执行
    if (executor && typeof executor === 'function') {
      try {
        // 绑定 resolve, reject 上下文
        // 这样可以传入箭头函数
        executor(this.resolve.bind(this), this.reject.bind(this))
      } catch (e) {
        this.reject(e)
      }
    }
  }

  resolve(value) {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      while (this.fulfilledCb.length) {
        // 绑定回调函数上下文
        this.fulfilledCb.shift()(value)
      }
    }
  }

  reject(error) {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = error;
      while (this.rejectedCb.length) {
        this.rejectedCb.shift()(error)
      }
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : error => { throw error };

    const ret = new MyPromise((resolve, reject) => {    
      
      function resolvePromise(result) {
        if (result === ret) {
          return reject('self callback')
        }
        if (typeof result === 'object' || typeof result === 'function') {
          if (result === null) return resolve(result)

          let _then;
          try {
            _then = result.then
          } catch (e) {
            return reject(e)
          }

          if (typeof _then === 'function') {
            let called = false;
            try {
              _then.call(result, value => {
                if (called) return
                called = true
                resolvePromise(value)
              }, error => {
                if (called) return
                called = true
                reject(error)
              })
            } catch (e) {
              if (called) return
              called = true
              reject(e)
            }
          } else {
            resolve(result)
          }
        } else {
          resolve(result)
        }
      }

      if (this.status === FULFILLED) {
        queueMicrotask(() => {
          try {
            const result = onFulfilled(this.value)
            resolvePromise(result)
          } catch (e) {
            reject(e)
          }
        })
      } else if (this.status === REJECTED) {
        queueMicrotask(() => {
          try {
            const result = onRejected(this.reason)
            resolvePromise(result)
          } catch (e) {
            reject(e)
          }
        })
      } else if (this.status === PENDING) {

        this.fulfilledCb.push(() => {
          queueMicrotask(() => {
            try {
              const result = onFulfilled(this.value)
              resolvePromise(result)
            } catch (e) {
              reject(e)
            }
          })
        })

        this.rejectedCb.push(() => {
          queueMicrotask(() => {
            try {
              const result = onRejected(this.reason)
              resolvePromise(result)
            } catch (e) {
              reject(e)
            }
          })
        })

      }
    });
    return ret
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }
}



let p = MyPromise.resolve('success')
let p2 = p.then(val => {
  console.log(val)
  return {
    test: 'test'
  }
})
setTimeout(() => {
  console.log(p2)
}, 0);