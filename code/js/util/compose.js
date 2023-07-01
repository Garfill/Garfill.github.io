function compose(...fns) {
  return fns.reduce((f, g) => {
    return ((...arg) => f(g(...arg)))
  })
}

function compose2(...fns) {
  return (...args) => {
    let ret = args
    for (let i = fns.length - 1; i >= 0; i--) {
      ret = Array.isArray(ret) ? fns[i](...ret) : fns[i](ret)
    }
    return ret
  }
}


function add5(x) {
  return x + 5
}
function multi2(x) {
  return x * 2
}
function mini1(x) {
  return x -1
}
const test = compose2(mini1, multi2, add5)
console.log(test(5))