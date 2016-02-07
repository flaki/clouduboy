'use strict';

(function () {
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

  function cursorBetween(editor, start, end) {
    var cur = editor.getCursor();

    // Different line
    if (cur.line < start.line || cur.line > end.line) return false;

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
