(function() {
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
})();
