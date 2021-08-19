const { Promise } = require('./mini-promise.js');

let te = Promise.reject('error')

let a = Promise.resolve(te)

setTimeout(() => {
  console.log(a.status);
}, 5000);