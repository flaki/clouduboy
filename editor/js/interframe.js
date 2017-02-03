window.addEventListener('keypress', e => {
  if (window.parent) window.parent.postMessage({
    source: 'microcanvas_preview',
    type: 'keypress',
    value: e.key,
  }, '*');
});
