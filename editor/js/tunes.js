function ClouduboyTunes() {
  // create web audio api context
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // create main gain node
  var gainNode = audioCtx.createGain();

  gainNode.connect(audioCtx.destination);
  gainNode.gain.value = .4;

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

    osc.start((delay + at)/1000);

    if (typeof length !== 'undefined') {
      osc.stop((delay + at + length)/1000);
    }

    return osc;
  }

  function ctxStopNote(osc, at) {
    osc.stop((delay + at)/1000);
  }


  // Ported from: audio.cpp & audio.h
  function ArduboyTunes(score) {
    // Table of midi note frequencies * 2
    //   They are times 2 for greater accuracy, yet still fits in a word.
    //   Generated from Excel by =ROUND(2*440/32*(2^((x-9)/12)),0) for 0<x<128
    // The lowest notes might not work, depending on the Arduino clock frequency
    // Ref: http://www.phy.mtu.edu/~suits/notefreqs.html
    var _midi_note_frequencies = [
      16,17,18,19,21,22,23,24,26,28,29,31,33,35,37,39,41,44,46,49,52,55,58,62,65,
      69,73,78,82,87,92,98,104,110,117,123,131,139,147,156,165,175,185,196,208,220,
      233,247,262,277,294,311,330,349,370,392,415,440,466,494,523,554,587,622,659,
      698,740,784,831,880,932,988,1047,1109,1175,1245,1319,1397,1480,1568,1661,1760,
      1865,1976,2093,2217,2349,2489,2637,2794,2960,3136,3322,3520,3729,3951,4186,
      4435,4699,4978,5274,5588,5920,6272,6645,7040,7459,7902,8372,8870,9397,9956,
      10548,11175,11840,12544,13290,14080,14917,15804,16744,17740,18795,19912,21096,
      22351,23680,25088
    ];

    var TUNE_OP_PLAYNOTE = 0x90;  /* play a note: low nibble is generator #, note is next byte */
    var TUNE_OP_STOPNOTE = 0x80;  /* stop a note: low nibble is generator # */
    var TUNE_OP_RESTART  = 0xe0;  /* restart the score from the beginning */
    var TUNE_OP_STOP     = 0xf0;  /* stop playing */

    // Current score position
    var score_cursor = score_start = 0;

    // Current play context time
    var playhead = 0;

    // Concurrent channels (2)
    var chn = [];

    // Update delay
    delay = audioCtx.currentTime + 100;

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

    while (score_cursor < score.length) {
      step();
    }
  }

  return {
    play: function(scoreString) {
      score = scoreString.split(/,/).map(function(n) { return parseInt(n); });
      ArduboyTunes(score);
    }
  }
}
