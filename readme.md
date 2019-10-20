# promise-queues

Run asnyc/promise-returning functions in series with:

- rate limiting
- debouncing

## Install

```
npm install @ttoohey/promise-queues
```

## Usage

An example

```js
import PromiseQueue from "@ttoohey/promise-queues";
const queue = PromiseQueue();

const start = Date.now();
// seconds since start to 1 decimal place
function timestamp() {
  return Number(Math.round((Date.now() - start) / 100) / 10).toFixed(1);
}

// an example Promise-returning function, delays 1 second and returns [x, timestamp]
function testPromise(x) {
  return new Promise(resolve =>
    setTimeout(() => resolve([x, timestamp()]), 1000)
  );
}

// run 3 instances of testPromise in a queue.
// the first runs, but is discarded
// the second is discarded without running
// the third runs, and is the final result
for (let i = 1; i <= 3; i++) {
  queue(() => testPromise(i))
    .then(result => console.log(timestamp(), i, result))
    .catch(error => {
      console.log(timestamp(), i, error.toString());
    });
}
console.log(timestamp(), "ready");

// Expected output:
// 0.0 ready
// 1.0 1 Error: Promise response discarded
// 1.0 2 Error: Promise discarded
// 2.0 3 [ 3, '2.0' ]
```
