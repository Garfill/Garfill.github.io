const { Promise } = require('./mini-promise.js');

const p1 = new Promise((res) => {
  setTimeout(() => {
    res(1)
  }, 1500);
})
const p2 = new Promise((res) => {
  setTimeout(() => {
    res(2)
  }, 2000);
})
const p3 = new Promise((res) => {
  setTimeout(() => {
    res(3)
  }, 3000);
})

const res = Promise.race([p1, p2, p3])
res.then((val) => {
  console.log(val)
})