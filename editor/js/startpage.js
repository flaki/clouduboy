(function() {
  'use strict';

  function randomString() {
    return (+new Date * Math.random()).toString(36).substring(0,Math.random()*3+6);
  }

  function get() {
    var SG, sg1, sg2, sg3, interv, f;

    SG = document.querySelector('.sid-generator .generator');
    sg1 = SG.children[0]; sg2 = SG.children[1]; sg3 = SG.children[2];

    sg1.className = 'sidgen sg1 roll';
    sg2.className = 'sidgen sg2 roll';
    sg3.className = 'sidgen sg3 roll';

    f = fetch('/session/generate', {credentials: 'same-origin'})
      .then(function(r) { return r.json(); })
      .then(function(sid) {
        sg1.firstChild.textContent = sid[0];
        sg2.firstChild.textContent = sid[1];
        sg3.firstChild.textContent = sid[2];

        document.querySelector('input[name="new-session-id"]').value = sid.join('-');

        setTimeout(function() { sg1.className='sidgen sg1 reveal'; }, 300);
        setTimeout(function() { sg2.className='sidgen sg2 reveal'; }, 600);
        setTimeout(function() { sg3.className='sidgen sg3 reveal'; }, 900);
      });
  }

  document.querySelector('button[name="get-sid"]').addEventListener('click', function(e) {
    get();
  });

  get();

  // Download button
  document.querySelector('button[name="use-sid"]').addEventListener('click', function(e) {
    var sid = document.querySelector('input[name="sid"]').value;

    // Replace spaces with dashes
    sid = sid.replace(/\s/g, '-');

    // Go!
    window.location.href = '/'+sid+'/editor';
  });

  // Download button
  document.querySelector('button[name="download-osx"]').addEventListener('click', function(e) {
    window.open('/download/ClouduboyFlasher.dmg');
  });
})();
