(function () {
  'use strict';

  // Synth control command constants (from audio.h)
  var TUNE_OP_PLAYNOTE = 0x90;  /* play a note: low nibble is generator #, note is next byte */
  var TUNE_OP_STOPNOTE = 0x80;  /* stop a note: low nibble is generator # */
  var TUNE_OP_RESTART  = 0xe0;  /* restart the score from the beginning */
  var TUNE_OP_STOP     = 0xf0;  /* stop playing */

  // Ported from: Arduboy's audio.cpp & audio.h
  // https://github.com/Arduboy/Arduboy/blob/master/audio.h @ 7ddb720 on Dec 3 2015
  // https://github.com/Arduboy/Arduboy/blob/master/audio.cpp @ bac3ae9 on Jun 2 2015
  function ArduboyScore(score) {
    // Tab is a parsed score, represents the more flexible in-memory
    // representation of the binary score/score data
    var tab;

    // Score speed ratio, allows one to stretch/compress the score
    // TODO: currently unimplemented/not exposed
    var speed = 1;

    // Create tab
    tab = parse(score);

    // Access to "tab" via this.tab
    Object.defineProperty(this, 'tab', {
      enumerable: true,
      get: function() { return tab; }
    });


    // Parses string/binary score data into internal "tab" representation
    function parse(score) {
      // Binary score data
      var pgm_read_byte;

      // Already in binary format
      if (score instanceof Array) {
        pgm_read_byte = score;

      // Parse score into binary format
      } else {
        pgm_read_byte = util.cleanComments(score).split(/,/).map(function(n) {
          return parseInt(n);
        });
      }

      // TODO: create index for source data

      // Current score position
      var score_cursor, score_start, tune_playing;

      // Current play context time
      var playhead;

      // Concurrent channels (3)
      var chn = [];

      // Init & play
      var tab = [],
          tabch = [];

      score_cursor = score_start = playhead = 0;
      tune_playing = true;

      // Play whole song
      while (score_cursor < pgm_read_byte.length) {
        step();
      }

      // Done
      return tab;



      /* Functions used for parsing */
      function __play_note(channel, note) {
        tab.push(
          { op: "play-note", note: note, freq: ClouduboySynth.freq(note), ch: channel, score: [score_cursor-2, score_cursor-1], time: playhead }
        );

        // latest note in channel
        tabch[ channel ] = tab[ tab.length-1 ];
      }

      function __stop_note(channel) {
        tab.push(
          { op: "stop-note", stops: tabch[channel], ch: channel, score: [score_cursor-1, score_cursor-1], time: playhead }
        );

        // link stop-note to the start-note
        if (tabch[channel]) {
          tabch[channel].stop = tab[tab.length-1];
          tabch[channel] = null;
        }
      }

      function __wait(ms) {
        ms *= speed; // speed up/slow down TODO: expose this

        tab.push(
          { op: "wait", duration: ms, score: [score_cursor-2, score_cursor-1], time: playhead }
        );

        // Advance playhead
        playhead += ms;
      }

      // Ported from: audio.cpp
      function step() {
        var command, opcode, chan;
        var duration;

        while (score_cursor < pgm_read_byte.length) {
          command = pgm_read_byte[score_cursor++];
          opcode = command & 0xf0;
          chan = command & 0x0f;
          if (opcode == TUNE_OP_STOPNOTE) { /* stop note */
            __stop_note(chan);
          }
          else if (opcode == TUNE_OP_PLAYNOTE) { /* play note */
            __play_note(chan, pgm_read_byte[score_cursor++]);
          }
          else if (opcode == TUNE_OP_RESTART) { /* restart score */
            score_cursor = score_start;
          }
          else if (opcode == TUNE_OP_STOP) { /* stop score */
            tune_playing = false;
            break;
          }
          else if (opcode < 0x80) { /* wait count in msec. */
            duration = (command << 8) | (pgm_read_byte[score_cursor++]);
            __wait(duration);
            //wait_toggle_count = ((unsigned long) wait_timer_frequency2 * duration + 500) / 1000;
            //if (wait_toggle_count == 0) wait_toggle_count = 1;
            break;
          }
        }
      } // step()

    } // parse()
  } // ArduboyScore constructor


  ArduboyScore.prototype = Object.create(null);

  ArduboyScore.prototype.play = function() {
    var ch = [];

    // Create new synth, close old one if one exists
    if (this.synth) this.synth.close();
    var synth = this.synth = new ClouduboySynth();

    // Play score from tab data
    this.tab.forEach(function(t) {
      // Play note
      if (t.op === 'play-note') {
        ch[t.ch] = synth.playNote(t.note, t.time/1000);
        // TODO: explore ommiting this, by scheduling the note in the 'stop-note'
        // handler, via the .starts link right before scheduling the stop
        // (catch: what if a note is never stopped?)

      // Stop note
      } else if(t.op === 'stop-note') {
        if (ch[t.ch]) synth.stopNote(ch[t.ch], t.time/1000);
        ch[t.ch] = null;

      } // ignore all other tab nodes
    });

    return this;
  }

  ArduboyScore.prototype.pause = function() {
    this.synth.pause();
  }
  ArduboyScore.prototype.resume = function() {
    this.synth.resume();
  }
  ArduboyScore.prototype.stop = function() {
    this.synth.stop();
  }

  // Global non-instance methods
  ArduboyScore.make = function(inputs) {
    var score = [];
    var PLAY = "0x"+TUNE_OP_PLAYNOTE.toString(16);
    var STOP = "0x"+TUNE_OP_STOPNOTE.toString(16);
    var END = "0x"+TUNE_OP_STOP.toString(16);

    var basetime, time, d;

    if (!inputs.length) return "";
    basetime = inputs[0].t;
    time = basetime;

    for (var i of inputs) {
      if (i.t > time) {
        d = Math.round(i.t - time);
        score.push(d >> 8, d & 255);
      }
      time = i.t;

      if (i.state) {
        score.push(PLAY);
        score.push(i.note);
      } else {
        score.push(STOP);
      }
    }

    score.push(END);
    console.log( score.join(', ') );
    return JSON.stringify(inputs);
  }

  // Expose
  self.ArduboyScore = ArduboyScore;
})();
