(function() {
  'use strict';

  var RX_CLEANCOMMENTS = /(\/\/[^\n]*\n|\/\*(.*?\*\/))/g;

  // Removes line & block comments, without changing the length of the string
  // (replaces them with spaces)
  function cleanComments(str) {
    return str.replace(
      RX_CLEANCOMMENTS,
      function(i) { return " ".repeat(i.length); }
    );
  }

  self.util = {
    cleanComments: cleanComments
  };


  self.sidebar = (function() {
    var sidebarEmt =document.querySelector('.sidebar > .logs')
    return ({
      log: function(msg, type) {
        let e = document.createElement('div');
        e.textContent = msg;
        if (type) e.className = type;
        sidebarEmt.appendChild(e);
      }
    })
  })()
})();
