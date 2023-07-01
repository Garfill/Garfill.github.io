// 防抖
export function debounce(func, delay, context) {
  let timer = null
  return function() {
    context = context || this; // 复制执行上下文的副本，因为 setTimeout 总是在window 下
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, arguments)
    }, delay);
  }
}

// 节流
export function throttle(func, wait, context) {
  let timer = null;
  return function() {
    context = context || this;
    if (!timer) {
      func.apply(context, arguments)
      timer = setTimeout(() => {
        timer = null;
      }, wait);
    }
  }
}