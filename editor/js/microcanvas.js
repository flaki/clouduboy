(function(exports) {
  'use strict';

  function ClouduboyMicroCanvas() {
  }


  function init () {
    let emt

    emt = document.querySelector('.toolbar button[name="convert"]')
    if (emt) {
      emt.removeEventListener('click', buildMicroCanvas);
      emt.addEventListener('click', buildMicroCanvas);
    }

    emt = document.querySelector('.toolbar button[name="compile-and-flash"]')
    if (emt) {
      emt.removeEventListener('click', flashMicroCanvas);
      emt.addEventListener('click', flashMicroCanvas);
    }

    emt = document.querySelector('.toolbar button[name="preview"]')
    if (emt) {
      emt.addEventListener('click', showPreview);
    }

    window.removeEventListener("message", iframeEventHandler);
    window.addEventListener("message", iframeEventHandler, false);
  }


  function buildMicroCanvas() {
    let result;

    Clouduboy.API.fetch('/compile/convert')
      .then(r => r.json())
      .then( buildMessages )

      // Reload the "Files" dropdown and switch to the new target .ino file
      .then(r => {
        Clouduboy.reinit.filesDropdown().then(_ => Clouduboy.switchTo(r))
      })
  }

  function flashMicroCanvas() {
    let result;

    Clouduboy.API.fetch('/compile/flash')
      .then(r => r.json())
      .then( buildMessages )
  }



  function buildMessages(r) {
    sidebar.clearLog();

    // Arduino compiler messages
    if (r.compiler) {
      let targetKey = (Object.keys(r.compiler).filter(k => k.match(/\.arduboy\.ino$/)))[0];
      let target = r.compiler[targetKey];
      let messageList = arrange(target, ['type','in']);
      console.log(messageList);

      let out = messageList.map(t => {
       return `${t.type} (${t.items.length}):\n` + t.items.map(msg => {
         return (msg.in +'\n' +
           msg.items.map(e => `${e.line}:${e.col}: ${e.msg}`).join('\n')
         );
       })
      });
      sidebar.log(out, 'error');
    }

    // TODO: MicroCanvas compiler messages
    if (r.microcanvas) {
      r.microcanvas.forEach(e => sidebar.log(`[${e.lvl}] ${e.msg}`))
    }

    // Arduino build results
    if (r.memory && 'program' in r.memory) {
      sidebar.log(`
        Program size: ${r.memory.program.bytes} bytes / ${r.memory.program.used}%
        Data size: ${r.memory.data.bytes}+' bytes / ${r.memory.data.used}%
      `, 'notice');
    }

    return r
  }


  function showPreview() {
    let i = document.createElement('iframe');
    document.body.appendChild(i);
    i.className = 'preview';
    i.contentWindow.addEventListener('error', function(err) {
      console.log('Script error:', err);

      let activeFile = document.getElementById("codeeditor-filename").value;

      // Error in active file
      if (err.filename.match(new RegExp(activeFile.replace('.','\\.')))) {
        console.log('Line ', err.lineno, ': ', err.message);
      }
    });
    i.src = '/microcanvas.html';

    // Put (keyboard) focus on the iframe
    i.contentWindow.focus();
  }

  function dismissPreview() {
    Array.from( document.querySelectorAll('iframe.preview') ).forEach(iframe => iframe.parentNode.removeChild(iframe));
  }

  function iframeEventHandler(event) {
    let origin = event.origin || event.originalEvent.origin,
        data = event.data;

    if (origin && data.source === 'microcanvas_preview') {
      if (data.type === 'keypress' && data.value === 'Escape') {
        dismissPreview();
      }
    }
  }


  // Add plugin
  Clouduboy.on("contentloaded", init);




  function arrange(arr, field) {
    if (!field && typeof arr != 'object') {
      field = arr;
      arr = this;
    }

    let dict = {}, ret = [], fields;

    // Multiple level arrange
    if (typeof field === 'object' && field.length>0) {
      fields = field;
      field = fields[0];
    }

    // Arrange items
    arr.forEach( e => {
      let fn = e[field] ? e[field] : '…';
      if (!dict[fn]) {
        dict[fn] = [];
        ret.push({ [field]: fn, items: dict[fn] });
      }

      dict[fn].push(e);
    });

    // Multiple level deep arrange
    if (fields && fields.length>1) {
      fields = fields.slice(1);
      ret = ret.map(r => {
        r.items = arrange(r.items, fields);
        return r;
      });
    }

    return ret;
  }
})(window);
