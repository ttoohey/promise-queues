import _discardQueue from "./discardQueue";
import _throttleQueue from "./throttleQueue";
import _chain from "./chain";
export { default as DiscardQueueError } from "./DiscardQueueError";

export const discardQueue = _discardQueue;
export const throttleQueue = _throttleQueue;
export const chain = _chain;

export default () => chain(discardQueue(), throttleQueue());
