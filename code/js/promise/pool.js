async function asyncPool(plist, limit) {
  const ret = []
  const executing = new Set()
  for (const item of plist) {
    const promisify = i => Promise.resolve().then(() => i())
    const promise = promisify(item)
    ret.push(promise)
    executing.add(promise)

    const clean = () => executing.delete(promise)
    promise.finally(clean)

    if (executing.size >= limit) {
      await Promise.race(executing)
    } 
  }
  return Promise.all(ret)
}

async function sleep(time) {
  return new Promise((resolve) => {
    console.log('sleep promise')
    setTimeout(() => {
      resolve(time)
    }, time);
  })
}

asyncPool([
  () => sleep(1000),
  () => sleep(2000),
  () => sleep(3000),
], 2).then(res => console.log(res))