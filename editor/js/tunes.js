(function(exports) {
  'use strict';

  function ClouduboyTunes() {
  }

  // Mark tunes and let the user play them
  var RX_TUNES = /const byte PROGMEM (\w+)\s*\[\][\s\r\n]*=[^{;]*{([^\}]+)}/g;
  var RX_NUMDATA = /0x[a-zA-Z0-9]+|\d+/g;
  var RX_CCOMM = /\/\/[^\n]*\n/g;
  var markers = [];

  // Removes line comments, without changing the length of the string
  // (replaces them with spaces)
  function cleanComments(str) {
    return str.replace(
      RX_CCOMM,
      function(i) { return " ".repeat(i.length); }
    );
  }

  function markTunes() {
    var e;
    var editor = Clouduboy.editor;
    var src = src || editor.getValue();
    var iS,iE, pS,pE, marker;
    var rx = RX_TUNES;

    var player;

    var play = function() {
      var p = this.find(),
          tunes = editor.getRange(p.from, p.to);

      if (player) player.stop();
      player = new ArduboyScore(tunes).play();
      var tab = player.tab;

      var duration = tab[tab.length-1].playhead;

      var marker = this.replacedWith,
          markerbg = marker.lastElementChild;

      var keyboard = document.querySelector('.keyboard');
      var keys = document.querySelector('.keyboard .keys');

      marker.classList.add('play');
      markerbg.style.transition = duration+"ms all linear";

      // Show played notes on the keyboard
      var t = 0;
      var cue = function cue() {
        var ct = player.synth.playHead * 1000;

        while (tab[t]) { // end of score?
          if (!tab[t].time && ++t) continue; // skip nodes with no contexttime
          if (tab[t].time > ct) break; // too early to play this

          // Start note
          if (tab[t].op === 'play-note') {
            keys.children[ tab[t].note ].classList.add('ch'+tab[t].ch);
          // Stop note
          } else if (tab[t].op === 'stop-note') {
            keys.children[ tab[t].stops.note ].classList.remove('ch'+tab[t].ch);
          }

          ++t;
        }
        window.requestAnimationFrame(cue);
      }
      cue();

      setTimeout(function() {
        markerbg.classList.add('playing');

        if (keyboard) keyboard.classList.add('full');
      }, 200);
      setTimeout(function() {
        markerbg.style.transition = "";
        marker.classList.remove('play');
        markerbg.classList.remove('playing');

        if (keyboard) keyboard.classList.remove('full');
      }, duration+500);
    };
    var unfold = function(score, iS, iE) {
      this.clear();

      editor.operation(function(){
        score = cleanComments(score);

        var tabsrc = [];
        while(o = RX_NUMDATA.exec(score)) {
          tabsrc.push(RX_NUMDATA.lastIndex - 1 - o[0].length);
        }

        //var m = document.createElement('b');
        //  m.className = "tdata";
        //  m.innerHTML = score.substr(tabsrc[tabsrc.length-2],tabsrc[tabsrc.length-1]);
        //  editor.markText( editor.posFromIndex(iS+tabsrc[tabsrc.length-2]),editor.posFromIndex(iS+tabsrc[tabsrc.length-1]), { replacedWith: m, clearOnEnter: true });

        console.log(tabsrc);
      });
    };

    while ((e = rx.exec(src)) !== null) {
      iE = rx.lastIndex - 1;
      iS = rx.lastIndex - 1 - e[2].length;
      pE = editor.posFromIndex(iE);
      pS = editor.posFromIndex(iS);
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
      marker.ondblclick = unfold.bind(markers[markers.length-1], e[2], iS, iE);
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
    var synth = new ClouduboySynth();
    var score = [], basetime, lasttime;

    // Editable
    //s = document.createElement('span');
    //s.innerHTML = '🎹';
    //Clouduboy.editor.addLineWidget(4, s, {coverGutter: true, noHScroll: true});


    function start(e) {
      var n = [].indexOf.call(e.target.parentNode.children, e.target);
      var ch = (e.changedTouches ? e.changedTouches[0].identifier+1 : 0);
      var time = performance.now();

      if (n) {
        e.preventDefault();
        //console.log('start', e.target.dataset.note, n);
        osc[ch] = synth.playNote(n);

        ckey[ch] = e.target;
        ckey[ch].classList.add('dn');

        if (!basetime || (time - lasttime) > 3000) { // reset recorder
          console.log(ArduboyScore.make(score));
          basetime = time;
          score = [];
        }
        lasttime = time;
        score.push({ note: n, state: true, t: time });
      }

      console.log(n, '@', ch, e);
    }

    function stop(e) {
      var n = [].indexOf.call(e.target.parentNode.children, e.target);
      var ch = (e.changedTouches ? e.changedTouches[0].identifier+1 : 0);
      var time = performance.now();


      //console.log('stop', e.target.dataset.note);
      if (osc[ch]) {
        e.preventDefault();
        synth.stopNote(osc[ch]);
        osc[ch] = null;

        ckey[ch] = e.target;
        ckey[ch].classList.remove('dn');

        lasttime = time;
        score.push({ note: n, state: false, t: time });
      }
    }

    function change(e) {
      var ch = (e.changedTouches ? e.changedTouches[0].identifier+1 : 0);

      var n = [].indexOf.call(e.target.parentNode.children, e.target);
      if (n && osc[ch]) {
        //console.log('change', e.target.dataset.note, n);
        osc[ch].frequency.value = ClouduboySynth.freq(n);
      }
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
