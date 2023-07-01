function pipe(...fns) {
  return function(...args) {
    let ret = args
    for (let i = 0; i < fns.length; i++) {
      ret = Array.isArray(ret) ? fns[i](...ret) : fns[i](ret)
    }
    return ret
  }
}

function pipe2(...fns) {
  return fns.reduce((c,n) => {
    return (...args) => n(c(...args))
  })
}

function add(x) {
  return x + 5;
};
function multyply(x) {
  return x * 5;
}
function minus(x) {
  return x - 5;
}


const test = pipe2(add, multyply, minus)
console.log(test(3))