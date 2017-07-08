import * as API from './api.js'

// State storage
let S = {}



// Append/override active state
export function set(newstate, path) {
  // Path inside of state specified
  if (path) {
    let pathElements = path.split('/')
    if (pathElements.length > 1) {
      // TODO: ...
    } else {
      if (!S[path] || typeof S[path] != 'object') {
        S[path] = {}
      }

      Object.assign(S[path], newstate)
    }

  // No path, toplevel assign
  } else {
    Object.assign(S, newstate)
  }
}

// Return current state or key
export function get(key, fallback) {
  let ret = null;

  // Return specified key only
  if (key) {
    // If fallback specified, use that if key does not exist
    if (key in S === false) {
      ret = fallback

    // Return the object for the given key
    } else {
      ret = S[key]
    }

  // Return the whole state object
  } else {
    ret = S
  }

  // Protected state, return a copy to avoid external tampering with state object
  return typeof ret == 'object' ? Object.freeze(Object.assign({}, ret)) : ret
}

// Sync local state with the API, ensure we have the key present but
// do not force-update it unless explicitly requested
export function sync(uri, postData, force = false) {
  let req

  // if PostData is a string it's a state key
  if (typeof postData == 'string') {
    // TODO: multiple keys split (e.g. "foo/bar/contents")
    let key = postData
    postData = { [key]: get(key) }
  }

  // POST data provided (two-way sync)
  if (typeof postData == 'object') {
    req = API.fetch(uri, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    })

  // No POST data provided (one way sync - pull)
  } else {
    req = API.fetch(uri)
  }

  // TODO: take note of synced datasets, do not reload
  return req
    .then(r => r.json())
    .then(r => {
      set(r) //if (r.result == 'ok') set(r.data)
      // TODO: make result: and data: fields in the API
      return r
    })
    .catch(err => {
      console.log(err)
      throw err
    })
}

// Same as above but allways reloads local data from the server
export function reload(uri, postData) {
  return sync(uri, postData, true)
}
