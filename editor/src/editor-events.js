// Currently loaded plugins
let plugins = {}


// Subscribe to a specific "event" with a callback to be called
export function on(e, callback) {
  if (!(e in plugins)) plugins[e] = [];

  plugins[e].push(callback);
}

// Remove event listener/callback
export function off(e, callback) {
  if (!(e in plugins)) plugins[e] = [];

  // Find event listener
  let idx = arr.indexOf(callback);

  // If found, remove from the list
  if (idx >= 0) arr.splice( idx, 1 );
}

// Run callbacks for a specified event
// All callbacks receive the optional "data" parameter, if specified
export function emit(e, data) {
  // Callbacks may return promises in which case
  // RunCallbacksFor resolves when all those promise is settled
  // (that is, the returned value is either a primitive value,
  //  or a promise, and the promise either resolves or rejects)
  if (plugins[e]) {
    // Resolves when all promise resolves
    let ret = Promise.all(
      // Map callbacks to return values
      plugins[e].map((cb) => {
        // Make sure all promises "resolve" so Promise.all doesn't reject
        // Wrap rejected promises as well, return reject reason
        return Promise.resolve( cb(data) ).catch(e => e);
      })
    );

    // Return promise
    return ret;
  }
}
