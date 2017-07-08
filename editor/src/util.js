// Promise timeout/delay
export function wait(ms) {
  return input => new Promise(resolve => setTimeout(_ => resolve(input), ms))
}


// Throttle callback with a set delay
export function throttle(callback, delay) {
  var lastRequest = null
  var lastArgs = []
  var timeout

  var fulfill = function() {
    lastRequest = null
    timeout = null
    callback.call(null, ...lastArgs)
  }

  return function(...args) {
    lastArgs = args

    // Restart throttle
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(fulfill, delay)
    lastRequest = Date.now()
  }
}
