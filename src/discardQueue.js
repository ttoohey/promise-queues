/*
discardQueue()

Prevent asynchronous promises from running concurrently.

Intermediate promises are discarded so that only the final one in
an overlapping sequence will return with it's usual promise results.

Usage:
    myQueue = discardQueue()
    myQueue(myPromiseFunction).then(...).catch(...)
    myQueue(myPromiseFunction).then(...).catch(...)
    myQueue(myPromiseFunction).then(...).catch(...)
 */

import DiscardQueueError from "./DiscardQueueError";

export const DISCARD = "DISCARD";
export const DISCARD_RESOLVE = "DISCARD_RESOLVE";
export const DISCARD_REJECT = "DISCARD_REJECT";

export default function discardQueue() {
  let seq = 0;
  let active = false;
  const queue = [];
  const next = () => !active && queue.length && run(queue.shift());
  const run = ({ runSeq, callback, resolve, reject }) => {
    if (runSeq !== seq) {
      reject(new DiscardQueueError());
      next();
    } else {
      active = true;
      callback()
        .then(response => {
          active = false;
          if (runSeq !== seq) {
            reject(new DiscardQueueError(null, response));
          } else {
            resolve(response);
          }
          next();
        })
        .catch(reason => {
          active = false;
          if (runSeq !== seq) {
            reject(new DiscardQueueError(reason));
          } else {
            reject(reason);
          }
          next();
        });
    }
  };
  return callback =>
    new Promise((resolve, reject) => {
      queue.push({ runSeq: ++seq, callback, resolve, reject });
      next();
    });
}
