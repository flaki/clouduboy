window.addEventListener('keypress', e => {
  let msg = {
    source: 'microcanvas_preview',
    type: 'keypress',
    value: e.key,
  };

  if (window.parent) {
    window.parent.postMessage(msg, '*');
    console.log(msg);
  }
});
