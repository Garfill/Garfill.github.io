/**
 * 1. class
 * 2. 代表一个异步操作
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

    func(this.resolve.bind(this), this.reject.bind(this)) // 立即执行主体
  }

  resolve(result) {
    if (this.PromiseState === PENDING) {
      this.PromiseState = FULFILLED
      this.PromiseResult = result
    }
  }

  reject(reason) {
    if (this.PromiseState === PENDING) {
      this.PromiseState = REJECTED
      this.PromiseResult = reason
    }
  }
}

let p0 = new MyPromise((resolve, reject) => {
  resolve('ok') // 运行时确定this，这里this = undifined，需要在promise内部绑定 this
})