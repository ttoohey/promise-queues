export default class DiscardQueueError extends Error {
  constructor(originalError = null, response = null) {
    const message =
      originalError instanceof Error
        ? originalError.message
        : originalError
        ? originalError.toString()
        : response
        ? "Promise response discarded"
        : "Promise discarded";
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DiscardQueueError);
    }
    this.originalError = originalError;
    this.response = response;
  }
}
