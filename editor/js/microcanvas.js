(function(exports) {
  'use strict';

  function ClouduboyMicroCanvas() {
  }


  function init () {
    document.querySelector('.toolbar button[name="build"]')
      .addEventListener('click', buildMicroCanvas);

    document.querySelector('.toolbar button[name="preview"]')
      .addEventListener('click', showPreview);
  }


  function buildMicroCanvas() {
    Clouduboy.API.fetch('/compile/flash')
      .then(r => r.json())
      .then(r => {
        // Success
        if (r.memory && 'program' in r.memory) {
          console.log('Program size: ', r.memory.program.bytes, 'bytes / ', r.memory.program.used, '%');
          console.log('Data size: ', r.memory.data.bytes, 'bytes / ', r.memory.data.used, '%');

        // Failed
        } else {
          let targetKey = (Object.keys(r.compiler).filter(k => k.match(/\.arduboy\.ino$/)))[0];
          let target = r.compiler[targetKey];

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

          arrange(target, ['type','in']).forEach(t => {
            console.log(`${t.type} (${t.items.length}):`);
            t.items.forEach(msg => {
              console.log( msg.in +'\n' +
                msg.items.map(e => `${e.line}:${e.col}: ${e.msg}`)
                .join('\n')
              );
            })
          })
        }
      })
      .then(Clouduboy.reinit.filesDropdown);
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
  }

  // Add plugin
  Clouduboy.on("contentloaded", init);
})(window);
