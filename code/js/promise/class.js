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
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
    // 待定状态下调用 then
    if (this.PromiseState === PENDING) {
      this.onFulfilledCallbacks.push(() => {
        // 回调函数应该在 then 被调用的那一轮事件循环 的下一个执行栈 中执行
        queueMicrotask(() => {
          onFulfilled(this.PromiseResult)
        })
      })
      this.onRejectedCallbacks.push(() => {
        queueMicrotask(() => {
          onRejected(this.PromiseResult)
        })
      })
    }
    if (this.PromiseState === FULFILLED) {
      queueMicrotask(() => {
        onFulfilled(this.PromiseResult)
      })
    }
    if (this.PromiseState === REJECTED) {
      queueMicrotask(() => {
        onRejected(this.PromiseResult)
      })
    }
  }
}



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