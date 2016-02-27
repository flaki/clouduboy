(function(exports) {
  'use strict';

  function ClouduboySprites() {
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
      pdata = new PixelData(codeToPif(repl.editor.getRange(repl.pos.start,repl.pos.end), sid));
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
      canvas.getContext("2d").putImageData(new ImageData(pdata.rgba, pdata.w,pdata.h) ,0,0);
      console.log("Seal sprite updated", sid);
    }

    repl.onchange();
    repl.onseal();


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
        document.querySelector("iframe").style.display="block";
        document.querySelector("iframe").src="/editor/painter";

        sprite.removeEventListener("click", editSprite);
        sprite.addEventListener("click", editSaveSprite);
      }).catch(function(e) {
        console.error(e);
      });
    }

    function editSaveSprite(e) {
      document.body.classList.remove("pixel-editor");
      document.querySelector("iframe").style.display="none";

      sprite.removeEventListener("click", editSaveSprite);
      sprite.addEventListener("click", editSprite);

      Clouduboy.API.fetch('/sprite').then(function(r) { return r.json(); }).then(function(sprite) {
        var pdata = new PixelData(sprite);
        var sdata = ' /*'+pdata.w+'x'+pdata.h+'*/ '+pdata.bytes.map(function(i) { return '0x'+i.toString(16); }).join(', ')+' ';

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

    return repl;
  }

  //var RX_SPRITES = /PROGMEM const unsigned char (\w+)\[\][\s\r\n]*=(?:[\s\r\n]|\r?\n\/\/[^\n]*)*{([^\}]+)}/g;
  var RX_SPRITES = /(?:\/\/[^\n]+\n)?PROGMEM const unsigned char (\w+)\[\][\s\r\n]*=[^{;]*{([^\}]+)}/g;

  function markSprites(src) {
    var e;
    var editor = Clouduboy.editor;
    var src = src || editor.getValue();
    var pdata, markers = [];

    while ((e = RX_SPRITES.exec(src)) !== null) {
      pdata = codeToPif(e[2], e[1], e[0]);

      // Add marker
      markers.push(replaceSprite(
        (RX_SPRITES.lastIndex - 1 - e[2].length),
        (RX_SPRITES.lastIndex - 1),
        pdata
      ));
    }
  }

  // Translate source code into Pixelsprite image descriptor
  function codeToPif(contents, label, statement) {
    var pdata = {};
    statement = statement || contents;

    // Pixelsprite id (label)
    pdata.id = label;

    // Serialized binary Pixelsprite data in PROGMEM format
    pdata.data = util.cleanComments(contents).split(',').map(function(n) { return parseInt(n); });

    // Try to guess image width/height
    pdata.w = parseInt( (statement.match(/w\:\s*(\d+)[^\n]+/) || [])[1] );
    pdata.h = Math.floor(pdata.data.length / pdata.w) * 8;
    pdata.ambiguous = true;

    // Pixelsprite dimensions can be declared in comments besides the
    // binary pixeldata in the format WWWxHHH where WWW and HHH are both
    // integer pixel values for width/height
    // eg.: PROGMEM ... sprite[] = { /*128x64*/ 0xa3, 0x... }
    var m = statement.match(/(?:\/\/|\/\*)\s*(\d+)x(\d+)/);
    if (m && m[1] && m[2]) {
      pdata.w = parseInt(m[1],10);
      pdata.h = parseInt(m[2],10);
      pdata.ambiguous = false;
    }

    console.log(pdata);
    return pdata;
  }


  // Expose
  exports.ClouduboySprites = ClouduboySprites;

  // Add plugin
  Clouduboy.on("contentloaded", markSprites);
})(window);
