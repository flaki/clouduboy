(function(exports) {
  function ClouduboySprites() {
  }

  //var RX_SPRITES = /PROGMEM const unsigned char (\w+)\[\][\s\r\n]*=(?:[\s\r\n]|\r?\n\/\/[^\n]*)*{([^\}]+)}/g;
  var RX_SPRITES = /PROGMEM const unsigned char (\w+)\[\][\s\r\n]*=[^{;]*{([^\}]+)}/g;

  function markSprites(src) {
    var e;
    var editor = Clouduboy.editor;
    var src = src || editor.getValue();
    var pS,pE, sprite, markers = [];

    while ((e = RX_SPRITES.exec(src)) !== null) {
      pE = editor.posFromIndex(RX_SPRITES.lastIndex - 1);
      pS = editor.posFromIndex(RX_SPRITES.lastIndex - 1 - e[2].length);
      //console.log(RX_SPRITES.lastIndex, pS,pE, e);

      // Image editor sprite markers
      sprite = document.createElement('span');
      sprite.className = "sprite";
      markers.push(
        editor.markText({ line: pS.line, ch: pS.ch },{ line: pE.line, ch: pE.ch }, { replacedWith: sprite, clearOnEnter: true })
      );

      // Clear marker on double click - TODO: pop up pixel-editor instead
      sprite.ondblclick = (function() { this.clear(); }).bind(markers[markers.length-1]);
    }
  }

  // Expose
  exports.ClouduboySprites = ClouduboySprites;

  // Add plugin
  Clouduboy.on("contentloaded", markSprites);
})(window);
