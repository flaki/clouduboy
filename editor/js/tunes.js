(function(exports) {
  function ClouduboyTunes() {
  }

  // Table of midi note frequencies * 2
  //   They are times 2 for greater accuracy, yet still fits in a word.
  //   Generated from Excel by =ROUND(2*440/32*(2^((x-9)/12)),0) for 0<x<128
  // The lowest notes might not work, depending on the Arduino clock frequency
  // Ref: http://www.phy.mtu.edu/~suits/notefreqs.html
  var NOTES = [
    16,17,18,19,21,22,23,24,26,28,29,31,33,35,37,39,41,44,46,49,52,55,58,62,65,
    69,73,78,82,87,92,98,104,110,117,123,131,139,147,156,165,175,185,196,208,220,
    233,247,262,277,294,311,330,349,370,392,415,440,466,494,523,554,587,622,659,
    698,740,784,831,880,932,988,1047,1109,1175,1245,1319,1397,1480,1568,1661,1760,
    1865,1976,2093,2217,2349,2489,2637,2794,2960,3136,3322,3520,3729,3951,4186,
    4435,4699,4978,5274,5588,5920,6272,6645,7040,7459,7902,8372,8870,9397,9956,
    10548,11175,11840,12544,13290,14080,14917,15804,16744,17740,18795,19912,21096,
    22351,23680,25088
  ];

  // create web audio api context
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // create main gain node
  var gainNode = audioCtx.createGain();

  gainNode.connect(audioCtx.destination);
  gainNode.gain.value = .33;

  // Context delay the main score (ms)
  var delay = 0;

  function ctxPlayNote(freq, at, length) {
    var osc;

    // set options for the oscillator & wire it up to the main gain
    osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.connect(gainNode);

    // schedule note
    osc.frequency.value = freq;

    if (typeof at !== 'undefined') {
      osc.start(delay + at/1000);

      if (typeof length !== 'undefined') {
        osc.stop(delay + (at+length)/1000);
      }

    // start right now
    } else {
      osc.start();
    }

    return osc;
  }

  function ctxStopNote(osc, at) {
    // schedule stop
    if (typeof at !== 'undefined') {
      osc.stop(delay + at/1000);

    // stop playing right away
    } else {
      osc.stop();
    }
  }


  // Ported from: audio.cpp & audio.h
  function ArduboyTunes(s) {
    // Note frequencies (from audio.cpp)
    var _midi_note_frequencies = NOTES;

    // Synth control commands (from audio.h)
    var TUNE_OP_PLAYNOTE = 0x90;  /* play a note: low nibble is generator #, note is next byte */
    var TUNE_OP_STOPNOTE = 0x80;  /* stop a note: low nibble is generator # */
    var TUNE_OP_RESTART  = 0xe0;  /* restart the score from the beginning */
    var TUNE_OP_STOP     = 0xf0;  /* stop playing */


    // Currently played score
    var score,
        // Current score position
        score_cursor, score_start;

    // Current play context time
    var playhead;

    // Concurrent channels (2)
    var chn = [];


    // Init & play
    //function playScore(s) {
      score = s;
      score_cursor = score_start = playhead = 0;
    //}

    function pgm_read_byte(i) {
      //console.log(((1*score[i])<16?'0':'')+(1*score[i]).toString(16)); //, 'pgm['+i+'] = '+score[i]);
      return score[i];
    }
    function playNote(channel, note) {
      var freq = _midi_note_frequencies[note>127?127:note]/2;
      chn[channel] = ctxPlayNote(freq, playhead);
      //console.log('   #'+channel+'  |> ', note, freq);
    }
    function stopNote(channel) {
      if (chn[channel]) ctxStopNote(chn[channel], playhead);
      chn[channel] = null;
      //console.log('   #'+channel+'  -- ');
    }
    function wait(ms) {
      playhead += ms;
      //console.log('   (+'+ms+')', playhead);
    }
    function step() {
      var command, opcode, chan;
      var duration;

      while (1) {
        command = pgm_read_byte(score_cursor++);
        opcode = command & 0xf0;
        chan = command & 0x0f;
        if (opcode == TUNE_OP_STOPNOTE) { /* stop note */
          stopNote(chan);
        }
        else if (opcode == TUNE_OP_PLAYNOTE) { /* play note */
          playNote(chan, pgm_read_byte(score_cursor++));
        }
        else if (opcode == TUNE_OP_RESTART) { /* restart score */
          score_cursor = score_start;
        }
        else if (opcode == TUNE_OP_STOP) { /* stop score */
          tune_playing = false;
          break;
        }
        else if (opcode < 0x80) { /* wait count in msec. */
          duration = (command << 8) | (pgm_read_byte(score_cursor++));
          wait(duration);
          //wait_toggle_count = ((unsigned long) wait_timer_frequency2 * duration + 500) / 1000;
          //if (wait_toggle_count == 0) wait_toggle_count = 1;
          break;
        }
      }
    }

    // Play whole song
    while (score_cursor < score.length) {
      step();
    }

    // Total duration
    return playhead;
  }

  ClouduboyTunes.play = function(scoreString) {
    // Parse score data
    var score = scoreString.split(/,/).map(function(n) {
      return parseInt(n);
    });

    // Update delay
    delay = audioCtx.currentTime + .1;

    // Let's rock!
    return ArduboyTunes(score);
  }


  // Mark tunes and let the user play them
  var RX_TUNES = /const byte PROGMEM (\w+)\s*\[\][\s\r\n]*=[^{;]*{([^\}]+)}/g;
  var markers = [];

  function markTunes() {
    var e;
    var editor = Clouduboy.editor;
    var src = src || editor.getValue();
    var pS,pE, marker;
    var rx = RX_TUNES;

    var play = function() {
      var p = this.find(),
          tunes = editor.getRange(p.from, p.to);

      var duration = ClouduboyTunes.play(tunes);

      var marker = this.replacedWith,
          markerbg = marker.lastElementChild;

      marker.classList.add('play');
      markerbg.style.transition = duration+"ms all linear";

      setTimeout(function() {
        markerbg.classList.add('playing');
      }, 200);
      setTimeout(function() {
        markerbg.style.transition = "";
        marker.classList.remove('play');
        markerbg.classList.remove('playing');
      }, duration+500);
    };
    var unfold = function() {
      this.clear();
    };

    while ((e = rx.exec(src)) !== null) {
      pE = editor.posFromIndex(rx.lastIndex - 1);
      pS = editor.posFromIndex(rx.lastIndex - 1 - e[2].length);
      //console.log(RX_SPRITES.lastIndex, pS,pE, e);

      // Arduboy audio music data markers
      marker = document.createElement('span');
      marker.className = "tune";
      marker.innerHTML = '<i class="bg"></i>'
      markers.push(
        editor.markText({ line: pS.line, ch: pS.ch },{ line: pE.line, ch: pE.ch }, { replacedWith: marker, clearOnEnter: true })
      );

      // Play tune on click
      marker.onclick = play.bind(markers[markers.length-1]);

      // Clear marker on double click - TODO: pop up composer instead
      marker.ondblclick = unfold.bind(markers[markers.length-1]);
    }
  }

  // Expose
  exports.ClouduboyTunes = ClouduboyTunes;

  // Add plugin
  Clouduboy.on("contentloaded", markTunes);

  // Handle piano keys
  Clouduboy.on("init", function() {
    var keys = document.querySelector('.keys');
    var osc = [], ckey = [];

    // Editable
    //s = document.createElement('span');
    //s.innerHTML = '🎹';
    //Clouduboy.editor.addLineWidget(4, s, {coverGutter: true, noHScroll: true});


    function start(e) {
      var n = [].indexOf.call(e.target.parentNode.children, e.target);
      var ch = (e.changedTouches ? e.changedTouches[0].identifier+1 : 0);
      if (n) {
        e.preventDefault();
        console.log('start', e.target.dataset.note, n);
        osc[ch] = ctxPlayNote(NOTES[n]/2);

        ckey[ch] = e.target;
        ckey[ch].classList.add('dn');
      }

      if (ch) console.log(e.changedTouches, ch);
    }

    function stop(e) {
      var ch = (e.changedTouches ? e.changedTouches[0].identifier+1 : 0);

      console.log('stop', e.target.dataset.note);
      if (osc[ch]) {
        e.preventDefault();
        ctxStopNote(osc[ch]);
        osc[ch] = null;

        ckey[ch] = e.target;
        ckey[ch].classList.remove('dn');
      }

      if (ch) console.log(e.changedTouches, ch);
    }

    function change(e) {
      var ch = (e.changedTouches ? e.changedTouches[0].identifier+1 : 0);

      var n = [].indexOf.call(e.target.parentNode.children, e.target);
      if (n && osc[ch]) {
        console.log('change', e.target.dataset.note, n);
        osc[ch].frequency.value = NOTES[n]/2;
      }

      if (ch) console.log(e.changedTouches, ch);
    }

    if (keys) {
      keys.addEventListener('mousedown', start);
      keys.addEventListener('touchstart', start);

      keys.addEventListener('mouseup', stop);
      keys.addEventListener('touchend', stop);

      keys.addEventListener('mousemove', change);
      //keys.addEventListener('touchmove', change);
    }
  });

})(window);
