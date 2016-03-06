'use strict';

/* Load new template/document source for editing
*/
module.exports = {
  get: all,
  post: [ require('body-parser').urlencoded({ extended: true }), post ],
};


// Dependencies
const CFG = require('../cfg.js');

const Build = require('../build.js');


function post(req, res) {
  let newtarget = req.body.target;

  // Update target
  if (newtarget) {
    // This automatically takes care of loading the session
    return req.$session.set({
      activeTarget: newtarget
    })

    .then(_ => {
      console.log('New target: ', newtarget);

      // Serve updated
      return all(req, res);
    })

    // Catch any errors
    .catch(function(err) {
      console.log("Request failed: ", err);
      res.sendStatus(500);
    });
  }
}

function all(req, res) {
  req.$session.load().then(function() {
    res.json({
      targets: CFG.TARGETS,
      activeTarget: req.$session.activeTarget || CFG.TARGETS[0].id
    });
  })

  // Error
  .catch(function(err) {
    console.log("Request failed: ", err);
    res.sendStatus(500);
  });
}
