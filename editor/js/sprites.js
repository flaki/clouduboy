(function(exports) {
  function ClouduboySprites() {
  }

  //var RX_SPRITES = /PROGMEM const unsigned char (\w+)\[\][\s\r\n]*=(?:[\s\r\n]|\r?\n\/\/[^\n]*)*{([^\}]+)}/g;
  var RX_SPRITES = /(?:\/\/[^\n]+\n)?PROGMEM const unsigned char (\w+)\[\][\s\r\n]*=[^{;]*{([^\}]+)}/g;

  function markSprites(src) {
    var e;
    var editor = Clouduboy.editor;
    var src = src || editor.getValue();
    var pS,pE, sprite, markers = [];

    while ((e = RX_SPRITES.exec(src)) !== null) {
      var data = e[2].split(',').map(function(n) { return parseInt(n) });
      var w = parseInt( (e[0].match(/w\:\s*(\d+)[^\n]+/) || [])[1] );
      var h = Math.floor(data.length / w) * 8;

      pE = editor.posFromIndex(RX_SPRITES.lastIndex - 1);
      pS = editor.posFromIndex(RX_SPRITES.lastIndex - 1 - e[2].length);
      //console.log(RX_SPRITES.lastIndex, pS,pE, e);

      // Image editor sprite markers
      sprite = document.createElement('span');
      sprite.className = "sprite";
      sprite.dataset.width = w;
      sprite.dataset.pif = new PixelData( {id:e[1],data:data,w:w,h:h} ).pif;
      var lastMarker = editor.markText({ line: pS.line, ch: pS.ch },{ line: pE.line, ch: pE.ch }, { replacedWith: sprite, clearOnEnter: true })
      markers.push(lastMarker);

      // Clear marker on double click - TODO: pop up pixel-editor instead
      sprite.ondblclick = (function() { this.clear(); }).bind(markers[markers.length-1]);

      (function(sprite, start, end, marker) {
        sprite.onclick = function(e) {
          fetch('/sprite', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(
              { sprite: new PixelData(e.target.dataset.pif).serialize() }
            )
          }).then(function() {
            document.querySelector("iframe").style.display="block";
            document.querySelector("iframe").src="/painter-window.html";

            sprite.onclick = function() {
              document.querySelector("iframe").style.display="none";
              marker.clear();

              fetch('/sprite').then(function(r) { return r.json(); }).then(function(sprite) {
                console.log("updated!", sprite);
                editor.replaceRange(new PixelData(sprite).bytes.join(', '), start, end);
              });
            }
            console.log(e.target.dataset.pif);
          }).catch(function(e) {
            console.error(e);
          });
        }
      })(sprite, { line: pS.line, ch: pS.ch }, { line: pE.line, ch: pE.ch }, lastMarker);
    }
  }

  // Expose
  exports.ClouduboySprites = ClouduboySprites;

  // Add plugin
  Clouduboy.on("contentloaded", markSprites);
})(window);
