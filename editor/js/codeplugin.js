(function () {
  'use strict';

  const PixelSprite = (function() {
    function PixelSprite() {};

    PixelSprite.prototype = new PixelSprite();

    // Getters for transitive dependent properties
    Object.defineProperty(PixelSprite.prototype, 'rows',      { get: function() { return this.h+7 >> 3; }});  // === Math.ceil(h/8)
    Object.defineProperty(PixelSprite.prototype, 'framesize', { get: function() { return this.rows * this.w; }});

    // Render PixelSprite content to canvas context
    PixelSprite.prototype.render = function(ctx, options = {}) {
      // Pixeldata properties
      let { data, w, h, rows, framesize, highlight } = this;

      // Overridable properties
      framesize = options.framesize || framesize;
      highlight = (options && 'highlight' in options ? options.highlight : highlight) || {};


      // Rendered frame based on requested (r.frame) or highlighted (p.highlight) frame
      let f = options.frame|(highlight&&highlight.byte/framesize)|0;


      // Clear frame
      ctx.clearRect(0,0, w,h);

      // Draw frame
      ctx.fillStyle = 'white';
      for (let y=0; y<h; ++y) {
        for (let x=0; x<w; ++x) {
          if (data[w * (f*rows + (y >> 3)) + x] & (1 << (y % 8))) {
            ctx.fillRect( x, y, 1, 1 );
          }
        }
      }

      // Draw highlight
      if (highlight.byte) {
        ctx.fillStyle = 'rgba(0,255,0,.3)';

        let highlightX = highlight.byte % w;
        let seg = ((highlight.byte - f*framesize)/w)|0;

        for (let y = 0; y < 8; ++y) {
          if ((seg<<3)+y >= h) break;
          ctx.fillRect( highlightX, seg*8+y, 1, 1 );
        }
      }
    }


    // PixelSprite factory
    PixelSprite.from = function(statement) {
      let pdata = Object.create(PixelSprite.prototype);

      pdata.data = util.cleanComments(statement)
        .trim().replace(/,\s*$/,'') // get rid of useless whitespace and trailing commas
        .split(',') // get values
          .map(function(n) { return parseInt(n); }); // parse values

      // Pixelsprite dimensions can be declared in comments besides the
      // binary pixeldata in the format WWWxHHH where WWW and HHH are both
      // integer pixel values for width/height
      // eg.: PROGMEM ... sprite[] = { /*128x64*/ 0xa3, 0x... }
      // Optionally, a single pixelsprite can contain...
      var m = statement.match(/(?:\/\/|\/\*)\s*(\d+)x(\d+)(?:x(\d+))?/);
      if (m && m[1] && m[2]) {
        pdata.w = parseInt(m[1],10);
        pdata.h = parseInt(m[2],10);
        pdata.frames = m[3] ? parseInt(m[3],10) : 0;
        pdata.ambiguous = false;
      }

      return pdata;
    }

    return PixelSprite;
  }());


  function CodePlugin(editor, start, end, options) {
    options = options || {};
    this.editor = editor;
    this.element = options.element || document.createElement('span');

    this.idx = { start: start, end: end };
    this.pos = { start: editor.posFromIndex(start), end: editor.posFromIndex(end) };

    this.seal = (function() {
      console.log("Marker sealed", this.pos.start, this.pos.end);

      this.marker = editor.markText(
        this.pos.start,
        this.pos.end,
        { replacedWith: this.element, clearOnEnter: true, title: options.title }
      );

      // Reseal callback
      if (typeof this.onseal === "function") {
        this.onseal();
      }

      // Track marker pop-open
      this.marker.on("clear", this.clearTracker);

      // Clean up PixelSprite preview window
      cleanUpPreview();
    }).bind(this);


    // Track cursor, when enters the gadget pop it open & keep open while inside
    this.clearTracker = (function() {
      console.log("Marker opened", this.pos.start, this.pos.end);

      this.marker = editor.markText(
        this.pos.start,
        this.pos.end,
        { className: "open-marker" }
      );

      this.marker.off("clear", this.clearTracker);

      this.editor.on("cursorActivity", this.resealTracker);
      this.editor.on("change", this.changeTracker);

      // Content change callback
      if (typeof this.onopen === "function") {
        this.onopen();
      }
    }).bind(this);

    // Track cursor while inside marker, close it up again once it exits
    this.resealTracker = (function() {
      if (! cursorBetween(this.editor, this.pos.start, this.pos.end) ) {
        this.editor.off("cursorActivity", this.resealTracker);
        this.editor.off("change", this.changeTracker);

        this.seal();
      }
    }).bind(this);

    // Track marker content changes
    this.changeTracker = (function(editor, change) {
      // Update source code positions
      this.pos.end = CodeMirror.adjustForChange(this.pos.end, change);
      this.idx.end = this.editor.indexFromPos(this.pos.end);

      // Content change callback
      if (typeof this.onchange === "function") {
        this.onchange();
      }
    }).bind(this);

    this.seal();
  }


  let pP, pCanvas;

  function cleanUpPreview(p) {
    if (pP) document.querySelector('.sidebar .bitmap').removeChild(document.querySelector('.pspreview'));
    pCanvas = null;
    pP = p;
  }

  function previewPixelSprite(p) {
    if (!pP || pP.w !== p.w || pP.h !== p.h) cleanUpPreview(p);

    pCanvas = pCanvas || (_ => {
      let c = document.createElement('canvas');
      let zoomlevel = 8;
      c.className = 'pspreview';
      c.width = p.w; c.height = p.h;
      c.style = `width: ${p.w*zoomlevel}px; height: ${p.h*zoomlevel}px;`;

      document.querySelector('.sidebar .bitmap').appendChild(c);
      return c;
    })();
    let pCtx = pCanvas.getContext('2d');
    p.render(pCtx);

    {
      let stripCtx = document.getElementById('framestrip').getContext('2d');
      stripCtx.save();
      p.render(stripCtx, { highlight: null, frame: 0 });
      stripCtx.translate(11, 0);
      p.render(stripCtx, { highlight: null, frame: 1 });
      stripCtx.restore();
    }
  }

  function cursorBetween(editor, start, end) {
    var cur = editor.getCursor();

    // Different line
    if (cur.line < start.line || cur.line > end.line) return false;

    let cIdx = editor.indexFromPos(cur) - editor.indexFromPos(start);
    let cont = editor.getRange(start,end);
    let meta = PixelSprite.from(cont);

    cont = cont
      .replace(/\/\*[^*]+?\*\//g,e => ' '.repeat(e.length)) // blank out comments
      .replace(/,(\s+$)/,' $1'); // blank out trailing comma
    let byte;

    // Find current/closest array element around the cursor
    if (cIdx < cont.length && cIdx > 0) {
      --cIdx;
      while (cIdx>0 && cont[cIdx]!==',') --cIdx;
      while (cIdx< cont.length && !cont[cIdx].match(/[\dxa-f]/)) ++cIdx;

      // Get element value
      byte = parseInt(cont.substr(cIdx, 9));

      // Element index for original array (count commas)
      let eIdx = cont.substr(0, cIdx).split(',').length - 1;
      meta.highlight = { byte: eIdx };
      // TODO: cache this data as a map and only recalculate on input/change

      /*
      if (!isNaN(byte)) console.log(
        (eIdx < 10 ? '0' : '') + eIdx,
        '|'+'.'.repeat(8 - (Math.log2(byte)|0))+byte.toString(2).split('').map(e => e==='1'?'#':'.').join('')+'|',
        cIdx,
        '0x'+byte.toString(16),
        byte,
        byte.toString(2),
        meta
      );
      */

      previewPixelSprite(meta);
    }

    // One line, check character positions
    if (start.line === end.line && start.line === cur.line) return (cur.ch >= start.ch && cur.ch <= end.ch);

    // Multiple lines, cursor somewhere in the middle
    if (cur.line > start.line && cur.line < end.line ) return true;

    // Multiple lines, on start/end lines, check character positions
    if ((cur.line === start.line && cur.ch >= start.ch) || (cur.line === end.line && cur.ch <= end.ch)) return true;

    return false;
  }





  CodePlugin.prototype = Object.create(CodePlugin);

  self.CodePlugin = CodePlugin;
})();
