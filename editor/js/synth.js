'use strict';

(function () {

  // Table of midi note frequencies * 2
  //   They are times 2 for greater accuracy, yet still fits in a word.
  //   Generated from Excel by =ROUND(2*440/32*(2^((x-9)/12)),0) for 0<x<128
  // The lowest notes might not work, depending on the Arduino clock frequency
  // Ref: http://www.phy.mtu.edu/~suits/notefreqs.html
  // From: Arduboy's audio.cpp
  // https://github.com/Arduboy/Arduboy/blob/master/audio.cpp @ bac3ae9 on Jun 2 2015
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

  function ClouduboySynth() {
    // create web audio api context
    var ctx = new (window.AudioContext || window.webkitAudioContext)();

    // create main gain node
    var mainGain = ctx.createGain();

    mainGain.connect(ctx.destination);
    mainGain.gain.value = .33;

    // Access to audioContext (TODO: is this needed?)
    Object.defineProperty(this, 'audioCtx', {
      enumerable: true,
      get: function() { return ctx; }
    });

    // Current time in audioContext
    Object.defineProperty(this, 'playHead', {
      enumerable: true,
      get: function() { return ctx.currentTime; }
    });

    // Create a new Oscillator and pipe it into the main gain
    this.osc = function(freq, type) {
      var osc = ctx.createOscillator();

      osc.type = type || 'square';
      osc.frequency.value = freq;

      osc.connect(mainGain);
      return osc;
    }
  }

  ClouduboySynth.prototype = Object.create(null);

  ClouduboySynth.prototype.pause = function() {
    this.audioCtx.pause();
  }
  ClouduboySynth.prototype.play = function() {
    this.audioCtx.resume();
  }
  ClouduboySynth.prototype.stop = function() {
    this.audioCtx.close();
  }

  ClouduboySynth.prototype.playNote = function(note, at, length) {
    var osc,
        freq = NOTES[ note>127 ? 127 : note ]/2;

    // Create oscillator w/ freq frequency (default type is 'square')
    osc = this.osc(freq);

    // Start note at the 'at' playhead-position
    if (typeof at !== 'undefined') {
      // Start now
      if (at === 0) at = this.playHead;

      osc.start(at);

      // Stop note at after 'length' ms
      if (typeof length !== 'undefined') {
        osc.stop(at+length);
      }

    // start right now
    } else {
      osc.start();
    }

    return osc;
  }

  ClouduboySynth.prototype.stopNote = function(osc, at) {
    // Stop note at the 'at' playhead-position
    if (typeof at !== 'undefined') {
      osc.stop(at);

    // stop playing right now
    } else {
      osc.stop();
    }
  }

  ClouduboySynth.freq = function(note) {
    return NOTES[ note>127 ? 127 : note ]/2;
  }

  self.ClouduboySynth = ClouduboySynth;
})();
