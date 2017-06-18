(function(exports) {
  'use strict';

  let currentOperation = {};


  function ClouduboySprites() {
  }

  function init() {
    markSprites();

    // Create preview iframe
    let i = document.createElement('iframe');

    i.id = "codeplugin";
    i.className = "pixeleditor";
    i.style.display = "none";

    document.body.appendChild(i);
    // TODO: create on-demand?

    window.addEventListener("message", iframeEventHandler, false);

    // Make sure we re-render the document
    setTimeout(_ => Clouduboy.editor.refresh(), 100)
  }

  function replaceSprite(start, end, sObj) {
    var sid;
    var repl;
    var sprite;
    var pdata;
    var canvas;

    // Create replacement element
    sprite = document.createElement('span');
    canvas = document.createElement("canvas");
    sprite.appendChild(canvas);

    // Create marker
    repl = new CodePlugin(Clouduboy.editor, start,end, { element: sprite, title: sObj.id+' - click to edit sprite' });

    // Set marker initial data
    pdata = sObj instanceof PixelData ? sObj : new PixelData(sObj);
    sid = pdata.id;


    // Customize replacement element
    repl.onchange = function() {
      pdata = new PixelData(repl.editor.getRange(repl.pos.start,repl.pos.end));
      console.log("PData changed", pdata.pif);
    }

    repl.onseal = function() {
      /* Replacement element customization */
      sprite.className = "sprite";
      sprite.dataset.width = pdata.w;
      sprite.dataset.height = pdata.h;
      sprite.dataset.pif = pdata.pif;

      /* Canvas thumbnail previews */
      canvas.width = pdata.w;
      canvas.height = pdata.h;
      //canvas.getContext("2d").putImageData(new ImageData(pdata.rgba, pdata.w,pdata.h*(pdata.frames||1)) ,0,0);
      canvas.getContext("2d").putImageData(new ImageData(pdata.toRGBA([0,0,0,255]), pdata.w,pdata.h*(pdata.frames||1)) ,0,0);
      console.log("Seal sprite updated: " + sid);
    }

    //repl.onchange();
    repl.onseal();

    function selectSprite() {
      let active = ! sprite.classList.contains('active')

      // Deselect all sprites
      Array.from(document.querySelectorAll('.sprite.active')).forEach( s => {
        s.classList.remove('active')
        s.firstElementChild.style.height = ''
      })

      sprite.classList.toggle('active', active)
      sprite.firstElementChild.style.height = active ? (pdata.h*2)+'px' : ''

      // Make sure we update the line height - note the transition is async
      // TODO: more precise timing?
      setTimeout(function() {
        repl.marker.changed()
      },333)
    }

    function editSprite(e) {
      Clouduboy.API.fetch('/sprite', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          { sprite: pdata.serialize() }
        )
      }).then(function() {
        sprite.classList.add("editing");
        document.body.classList.add("pixel-editor");

        // Set up iframe
        let frame = document.querySelector("iframe.pixeleditor");

        // Put keyboard focus on the iframe
        frame.onload = function() {
          frame.contentWindow.focus()
        };

        // Load & show
        frame.src="/editor/painter";
        frame.style.display="block";

        currentOperation.save = editSaveSprite.bind(this);

      }).catch(function(e) {
        console.error(e);
      });
    }

    function editSaveSprite(e) {
      document.body.classList.remove("pixel-editor");
      document.querySelector("iframe.pixeleditor").style.display="none";

      //sprite.removeEventListener("click", editSaveSprite);
      sprite.addEventListener("click", editSprite);

      Clouduboy.API.fetch('/sprite').then(function(r) { return r.json(); }).then(function(sprite) {
        var pdata = new PixelData(sprite);
        //var sdata = ' /*'+pdata.w+'x'+pdata.h+'*/ '+pdata.bytes.map(function(i) { return '0x'+i.toString(16); }).join(', ')+' ';
        var sdata = pdata.pif;

        // Update editor contents
        repl.editor.operation(function() {
          // Remove outdated marker
          repl.marker.clear();

          // Change code contents
          repl.editor.replaceRange(sdata, repl.pos.start, repl.pos.end);

          // Recreate marker widget
          var newstart = repl.editor.indexFromPos(repl.pos.start);
          replaceSprite(newstart, newstart+sdata.length, pdata);
        });
      });
    }

    // Event handling
    sprite.addEventListener("click", editSprite);
    //sprite.addEventListener('click', selectSprite)

    return repl;
  }

  //var RX_SPRITES = /PROGMEM const unsigned char (\w+)\[\][\s\r\n]*=(?:[\s\r\n]|\r?\n\/\/[^\n]*)*{([^\}]+)}/g;
  var RX_SPRITES = /(?:\/\/[^\n]+\n)?PROGMEM const unsigned char (\w+)\[\][\s\r\n]*=[^{;]*{([^\}]+)}/g;
  var RX_SPRITES_JS = /load(?:Graphics|Sprite)\([\s\n\r]*`([^`]+)`[\s\n\r]*\)/g;

  function markSprites(src) {
    var e;
    var editor = Clouduboy.editor;
    var src = src || editor.getValue();
    var pdata, markers = [];

    // Detect C-sprites
    console.log('Detecting sprites in `' + Clouduboy.currentFile.cmode + '` mode...')
    switch (Clouduboy.currentFile.cmode) {
      case 'clike':
        while ((e = RX_SPRITES.exec(src)) !== null) {
          pdata = new PixelData(e[0]);

          // Add marker
          markers.push(replaceSprite(
            (RX_SPRITES.lastIndex - 1 - e[2].length),
            (RX_SPRITES.lastIndex - 1),
            pdata
          ));
        }
        break;

      case 'javascript':
        // Detect sprites in MicroCanvas
        while ((e = RX_SPRITES_JS.exec(src)) !== null) {
          let px = new PixelData(e[1])
          console.log('MicroCanvas Pixelsprite detected', px)

          // Add marker
          let idx = RX_SPRITES_JS.lastIndex -e[0].length +e[0].indexOf(e[1])
          markers.push(replaceSprite(
            idx,
            idx +e[1].length,
            px
          ));
        }
        break;
    } // switch
  }

  function dismissPreview() {
    Array.from( document.querySelectorAll('iframe.pixeleditor') ).forEach(iframe => iframe.style.display="none");
  }

  function iframeEventHandler(event) {
    let origin = event.origin || event.originalEvent.origin,
        data = event.data;

    if (origin && data.source === 'microcanvas_preview') {
      if (data.type === 'keypress' && data.value === 'Escape') {
        dismissPreview();
      }
      if (data.type === 'keypress' && data.value === 'Enter') {
        if (typeof currentOperation.save === 'function') currentOperation.save();
      }
    }
  }


  // Expose
  exports.ClouduboySprites = ClouduboySprites;

  // Add plugin
  Clouduboy.on("contentloaded", init);
})(window);
