/*
rateLimitQueue

Enforce a rate limit on asynchronous promises to prevent network overload.

The default settings are set to throttle at 60 api requests minute.

Usage:
myQueue = throttleQueue()
myQueue(myPromiseFunction).then(...).catch(...)
myQueue(myPromiseFunction).then(...).catch(...)
myQueue(myPromiseFunction).then(...).catch(...)

 */

export default function throttleQueue(config = {}) {
  const {
    period = 1000, // 1 per second
    retention = 60000, // 1 minute
    threshold = 10 // first ten are free
  } = config;
  let active = false;
  let times = [];
  const queue = [];
  const begin = () => {
    active = queue.length > 0;
    return active;
  };
  const end = () => {
    active = false;
  };
  const next = () =>
    begin() &&
    run(queue.shift())
      .then(end)
      .then(next);
  const at = time =>
    new Promise(resolve => setTimeout(() => resolve(), time - Date.now()));
  const delay = () => (times.length > threshold ? period : 0);
  const push = time => {
    times = times.filter(ms => ms > time - retention);
    times.push(time);
    return time;
  };
  const now = () => push(Date.now());
  const run = ({ callback, callbackResolve, callbackReject }) =>
    new Promise(resolve => {
      const start = now();
      callback()
        .then(response => {
          callbackResolve(response);
          at(start + delay()).then(resolve);
        })
        .catch(reason => {
          callbackReject(reason);
          at(start + delay()).then(resolve);
        });
    });
  return callback =>
    new Promise((resolve, reject) => {
      queue.push({
        callback,
        callbackResolve: resolve,
        callbackReject: reject
      });
      !active && next();
    });
}
