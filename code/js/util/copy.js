// 简单版
// target 中包含 函数属性，无法拷贝函数属性
// target 原型链上的属性和方法无法拷贝
function easyCopy(target) {
  return JSON.parse(JSON.stringify(target))
}

// 浅拷贝
// 内部的嵌套对象无法拷贝，在内存中仍是同一个内存空间
function shallowCopy(source, target = {}) {
  let key;
  for (key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target
}

// 深拷贝
// 遍历target，判断每个属性值的数据类型
// 不是对象类型，就直接赋值；对象复制则递归调用深拷贝函数
function deepCopy(source) {
  let target = Array.isArray(source) ? [] : {};
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = (typeof source[key] === 'object') ? deepCopy(source[key]) : source[key]
    }
  }
  return target
}
