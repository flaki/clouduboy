"use strict";

const nedb = require('nedb');
const Storage = new nedb({
  filename: __dirname+'/data/session.db',
  timestampData: true,
  autoload: true
});

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
  return sid
    .split('-')
    .reduce(function (sum, item, n) {
      return (sum << Math.log2(DICTIONARY[n].length)) | DICTIONARY[n].indexOf(item);
    } ,0);
}



function Session() {
}

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

      console.log(session, "...");

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
        console.log(session, "created");
        resolve(session);
      });
    }

    tryCreate();
  });
}

// Similar to Create, this one loads a session
Session.load = function(sid) {
  let session = new Session();

  // If session was a string, parse it
  sid = parseSid(sid);

  // Async load
  return new Promise(function(resolve, reject) {
    Storage.findOne({ _id: sid}, function(err, s) {
      if (err) return reject(err);

      // Session not found
      console.log(s);
      if (!s) return reject(new Error("Session not found - "+sid));

      // Load stored session data into the "session" object and return it
      Object.assign( session, s ),
      resolve(session);
    });
  });
}

Session.DICT_BITS = DICT_BITS;

module.exports = Session;
