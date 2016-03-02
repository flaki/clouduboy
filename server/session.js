"use strict";

const nedb = require('nedb');
const Storage = new nedb({
  filename: __dirname+'/data/session.db',
  timestampData: true
});

// Sessions expire in
const SESSION_EXPIRE_LIMIT = 7*24; // hours -> one week

// Purge old session entries
Storage.ensureIndex({ fieldName: 'updatedAt', expireAfterSeconds: SESSION_EXPIRE_LIMIT*60*60 }, function (err) {} );

// Load database from disk
Storage.loadDatabase(function(err) {
  if (err) {
    console.log("Error purging sessions: ", err);
  }

  // List all documents, and remove all expired ones
  Storage.find({}, function(err) {
    // Persist changes
    Storage.persistence.compactDatafile();
  });
});

// Dictionary to use for visual session ID names
const DICTIONARY = [
  [ 'rough', 'silly', 'rabid', 'cheeky', 'cunning', 'pesky', 'shiny', 'weird', 'noisy', 'rapid', 'cold', 'quick', 'wacky', 'rare', 'happy', 'wicked' ],
  [ 'muffin', 'donut', 'cookie', 'fish', 'tiger', 'kitten', 'hamster', 'carrot', 'puppy', 'pancake', 'plush', 'unicorn', 'sugar', 'hamburger', 'nut', 'banana' ],
  [ 'farmer', 'pocket', 'island', 'polish', 'butt', 'cake', 'wizard', 'log', 'tower', 'wig', 'maker', 'nose', 'poop', 'monster', 'god', 'princess' ]
];

const DICT_BITS = DICTIONARY.reduce(function(bits,b) {
  return bits + Math.log2(b.length);
} ,0);

function newSid() {
  return Math.floor( Math.random() * (1 << DICT_BITS) );
}

function hexSid(sid) {
  if (typeof sid == 'undefined') sid = newSid();
  return '000'.concat(sid.toString(16)).substr(-3);
}

function dictSid(sid, raw) {
  if (typeof sid == 'undefined') sid = newSid();

  // MSB first (0xacf is {a}-{c}-{f})
  let w2 = (sid & 15), w1 = ((sid >> 4) & 15), w0 = ((sid >> 8) & 15);

  let ret = [ DICTIONARY[0][w0], DICTIONARY[1][w1], DICTIONARY[2][w2] ];

  // If "raw" is set, return as array, else return as single string
  return (raw ? ret : ret.join('-'));
}

function parseSid(sid) {
  // Number already
  if (typeof sid == "number") return (sid) & ((1 << DICT_BITS) - 1);

  // Hex string?
  if (typeof sid == "string" && sid.length < 12) return parseInt(sid, 16);

  // Dictionary-encoded string
  try {
    return sid
      .split('-')
      .reduce(function (sum, item, n) {
        return (sum << Math.log2(DICTIONARY[n].length)) | DICTIONARY[n].indexOf(item);
      } ,0);
  }

  // Not a valid SID
  catch(e) {}

  return void 0;
}

/* Generate a random available session ID */
function availableSession() {
  return new Promise(function(resolve, reject) {
    // List all sessions
    Storage.find({}, function(err, d) {
      var data = d.map(i => i._id); // only care about IDs
      var n = 100; // Number of tries

      // Limit tries
      while (--n) {
        // Create random new SID
        let next = newSid();

        // Available?
        if (data.indexOf(next) === -1) {
          resolve(next);
        }
      }

      // Couldn't generate a session ID
      reject("Couldn't create session ID");
    });

  });

}


// Constructor
function Session(sid) {
  // Already has a session ID
  if (typeof sid != "undefined") {
    this._id = parseSid(sid);
  }
}

Session.prototype = Object.create(null, {
  // hex-formatted session ID
  hexid: { get: function() { return hexSid(this._id); } },
  // dictionary-encoded session ID
  strid: { get: function() { return dictSid(this._id); } },
});

// Load session data
Session.prototype.load = loadPrepped;
Session.prototype.save = commit;
Session.prototype.set = update;


// Exposed constants
Session.DICT_BITS = DICT_BITS;


// Create a new Session
// Since it involves checking that the created SID is not taken already
// (and that is an asynchronous operation) we return a Promise, and resolve
// the promise with the created session once
const RETRY_COUNT = 5;

Session.create = function() {
  let session = new Session();
  let retries = RETRY_COUNT;

  return new Promise(function(resolve, reject) {
    // Try creating a new session with a new random id
    let tryCreate = function() {

      // Generate new random id
      session._id = newSid();

      // Make session tag
      session.tag = dictSid(session._id);

      // Try inserting with generated random id.
      // This might fail in case of a clash (id already taken), in this case
      // try again a few more times with different id-s before giving up
      Storage.insert(session, function(err) {
        if (err) {
          console.log("ERR:", err, retries);
          // Try again
          if (--retries) {
            return tryCreate();
          // Give up
          } else {
            return reject(err);
          }
        }

        // Session created successfully
        //console.log(session, "created");
        resolve(session);
      });
    }

    tryCreate();
  });
}

// "preps" the session to be loaded but doesn't load it right away
Session.init = function(sid) {
  let session = new Session(sid);

  return session;
}

// Similar to Create, this one loads the session
Session.load = function(sid) {
  let session = new Session(sid);

  return session.load();
}

// Async load a prepped session
function loadPrepped() {
  let session = this;

  return new Promise(function(resolve, reject) {
    Storage.findOne({ _id: session._id}, function(err, s) {
      if (err) return reject(err);

      // Session not found
      if (!s) return reject(new Error("Session not found - "+session._id));

      // Load stored session data into the "session" object and return it
      Object.assign( session, s );

      //console.log("Session loaded: ", session);
      resolve(session);
    });
  });
}

// Saves modified session data into DB
function commit() {
  let session = this;

  return new Promise(function(resolve, reject) {
    Storage.update({ _id: session._id}, session, function(err) {
      if (err) return reject(err);

      // Success!
      //console.log("Session data updated.");
      resolve(session);
    });
  });
}

// Updates field values in a session
function update(fields) {
  let session = this;

  return new Promise(function(resolve, reject) {
    Storage.update({ _id: session._id}, { $set: fields }, function(err) {
      if (err) return reject(err);

      // Success!
      //console.log("Session data updated.");

      // Load changes
      resolve(session.load());
    });
  });
}

// Save the session tag to a cookie for a request
Session.dropCookie = function(req, res) {
  res.cookie('session', req.$session.tag);
}


// Initialize session for incoming request if it has a session cookie
// This call just initializes session, one still needs to call
//   req.$session.load()
// to actually load session data from the DB & use it
Session.cookieHandler = function(req, res, next) {
  if (req.cookies.session) {
    req.$session = Session.init(req.cookies.session);
  }

  next();
}

// Session logging
Session.log = (function(label, log) {
  return console.log.apply('['+label+']', [].splice.call(arguments,1));
}).bind(null, 'session');


// Expose functions
Session.parseSid = parseSid;
Session.stringifySid = dictSid;
Session.availableSession = availableSession;

module.exports = Session;
