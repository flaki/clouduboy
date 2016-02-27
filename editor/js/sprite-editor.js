(function() {
  'use strict';

  // Initial pixel data (TODO: do we still need this?)
  window.pixels = new PixelData(`:empty:::::::::::
    ........
    ........
    ........
    ........
    ........
    ........
    ........
    ........`);


  // Drawing canvas
  let canvas = document.getElementById("draw");

  resizeCanvas(); // strech to fullscreen

  // Canvas colors
  const CANVAS_PAINT_COLOR = "#eee";
  const CANVAS_PINCH_COLOR = "#9e8";

  // Canvas context
  let C = canvas.getContext("2d");


  // Block size (size of a single pixel, a.k.a. Zoom Level)
  let bs = Math.floor( Math.min( canvas.width/pixels.w, canvas.height/pixels.h ) );

  // Canvas paint origin
  let oX = 5, oY = 5;


  // Send XHR updates with the modified sprite data
  let newstate;
  function postState() {
    if (!newstate) return;

    // Image dimensions
    let w = pixels.w, h = pixels.h;

    // Create bytestream
    let bytes = pixels.bytes;

    // Build transfer string
    let transfer = pixels.serialize();

    // Update sprite data in output textarea
    //document.getElementById("spriteoutput").textContent = "// w: " +pixels.w+ " h: " +pixels.h
    //  + "\nPROGMEM const unsigned char " +pixels.id.replace(/\W/g,'_')+ "[] = { " +pixels.sprite+ " };\n";

    //console.log(pixels.pif);
    //console.log("Dimensions:\n", pixels.w, "x", pixels.h);
    //console.log("Sprite data:\n", "{ " +pixels.sprite+ " }");
    //console.log("Transfer data:\n", JSON.stringify(transfer));


    // Reset state
    newstate = null;

    // Post bytedata
    let r = new XMLHttpRequest();

    r.open("POST", "/sprite");
    r.setRequestHeader("Content-Type", "application/json");
    r.onreadystatechange = function () { if (r.readyState != 4 || r.status != 200) return; };

    r.send(
      JSON.stringify({ sprite: transfer })
    );
  }


  // Paint the sprite
  function display() {
    let x,y;
    C.clearRect(0,0,canvas.width,canvas.height);
    C.fillStyle = pinchstate ? CANVAS_PINCH_COLOR : CANVAS_PAINT_COLOR;

    y = 0;
    while (y < pixels.h) {
      x = 0;
      while (x < pixels.w) {
        if (pixels.bitmap[y][x]) {
          C.fillRect( oX+ bs*x , oY+ bs*y, bs-1,bs-1);
        } else {
          C.clearRect(oX+ bs*x , oY+ bs*y, bs-1,bs-1);
        }
        ++x;
      }
      ++y;
    }

    window.requestAnimationFrame(display);
  }


  // XHR poll for sprite data updates
  function update() {
    // Don't update if drawing
    if (paintstate) return;

    // Post bytedata
    let r = new XMLHttpRequest();

    r.open("GET", "/sprite");
    r.setRequestHeader("Content-Type", "application/json");
    r.onreadystatechange = function () {
      if (r.readyState != 4 || r.status != 200) return;

      // Don't update if drawing
      if (paintstate) return;

      // Update bitmap
      try {
        update = new PixelData(JSON.parse(r.responseText));
      }
      catch(e) {
        console.log(e);
        return;
      }

      // No changes
      if (pixels.equals(update)) return;

      // Update canvas dimensions/blocksize
      if (pixels.w !== update.w || pixels.h !== update.h) {
        // Update blocksize
        bs = update.w > update.h
          ? Math.floor( canvas.width / update.w )
          : Math.floor( canvas.height / update.h );
      }

      // Store updated bitmap data
      pixels = update;

      //console.log("Bitmap updated:\n", pixels.pif);

      // Update sprite data in output textarea
      //document.getElementById("spriteoutput").textContent = "// w: " +pixels.w+ " h: " +pixels.h
      //  + "\nPROGMEM const unsigned char " +pixels.id.replace(/\W/g,'_')+ "[] = { " +pixels.sprite+ " };\n";
     };

    r.send();

  }


  // Tranlate screen coordinates into bitmap position/color information
  function pixelAt(x,y) {
    let ret = { // TODO: object creation in here should be avoided, use obj pool
      x: Math.floor((x-oX)/bs),
      y: Math.floor((y-oY)/bs),
      color: pixels.bitmap[ Math.floor((y-oY)/bs) ][ Math.floor((x-oX)/bs) ]
    };

    return ret;
  }


  // Input handlers
  let lastupdate;
  let paintstate;
  let pinchstate = false;

  function ptrStart(e) {
    let px = pixelAt(e.targetTouches[0].pageX, e.targetTouches[0].pageY);

    // Draw or erase on whole stroke depending on pixel under finger
    // on the initial touch
    if (!paintstate) {
      paintstate = px.color ? "erase" : "paint";
    }

    ptrUpdate(e);
  }

  function ptrEnd(e) {
    lastupdate = null;

    // Reset paint state
    paintstate = null;

    // Update output
    if (newstate) {
      window.requestAnimationFrame(postState);
    }
  }

  function ptrUpdate(e) {
    let px;

    // Not drawing yet
    if (!paintstate) return;

    // Fetch pixel info under pointer
    //px = pixelAt(e.clientX, e.clientY);
    px = pixelAt(e.targetTouches[0].pageX, e.targetTouches[0].pageY);

    // Check if crossed pixel boundaries, if not, do not do anything
    if (lastupdate && lastupdate.x == px.x && lastupdate.y == px.y ) return;

    // Update pixel under finger according to current paint state
    pixels.bitmap[px.y][px.x] = ( paintstate === "paint" ? 1 : 0 );

    // Last updated pixel
    lastupdate = px;

    newstate = 1;
  }


  // Input handling
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault(); e.stopPropagation();
    initgesture(e);
    ptrStart(e);
    gesture(e);
  }, true);

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault(); e.stopPropagation();
    gesture(e);
  }, true);

  canvas.addEventListener('touchend', function(e) {
    ptrEnd();
    pinchstate = false;
  });

  // TODO: is this neccessary?
  //window.addEventListener('touchmove',function(e) { e.preventDefault(); },false);

  // Pinch start state variables
  let sx1, sx2, sy1, sy2, ssize, sox, soy;

  // Block size pinch scale
  const BS_PINCH_SCALE = 8;

  function initgesture(e) {
    let ttl = e.targetTouches && e.targetTouches.length;

    sx1 = sy1 = sx2 = sy2 = void 0;
    ssize = sox = soy = void 0;
  }

  function gesture(e) {
    let ttl = e.targetTouches && e.targetTouches.length;
    let x1, x2, y1, y2;
    let angle, size, dx, dy;

    // Two-finger (or more) touch
    if (ttl > 1) {
      x1 = e.targetTouches[0].pageX-e.target.offsetLeft;
      y1 = e.targetTouches[0].pageY-e.target.offsetTop;
      x2 = e.targetTouches[1].pageX-e.target.offsetLeft;
      y2 = e.targetTouches[1].pageY-e.target.offsetTop;

      // Angle of two-finger gesture (unused)
      angle = Math.atan((y2-y1)/(x2-x1));
      //if (Math.abs(angle)>=3) { // jumped 180 degrees due to my poor math skills
      //	angle = angle-Math.PI;
      //}

      // Initialize delta state
      if (typeof sox === 'undefined') {
        sox = oX;
        soy = oY;
        sx1 = x1;
        sx2 = x2;
        sy1 = y1;
        sy2 = y2;
      }

      // Two-finger delta (averaging finger position for panning)
      if (typeof sx1 !== 'undefined') {
        dx = (x1 + x2)/2 - (sx1 + sx2)/2;
        dy = (y1 + y2)/2 - (sy1 + sy2)/2;

        oX = Math.floor( sox + dx );
        oY = Math.floor( soy + dy );
      }



      // Current istance of fingers (pinch-spread)
      size = Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );

      // Initial pinch-spread distance
      if (typeof ssize === 'undefined' && size > 0) {
        ssize = bs*BS_PINCH_SCALE - size;
      }

      // Adjust block-size (zoom level) via two-finger pinch/spread
      bs = Math.floor( (ssize+size)/BS_PINCH_SCALE ); // TODO: add deadzone

      // Pinching (changes color)
      pinchstate = true;

    // Simple touch
    } else {
      x1 = e.targetTouches[0].pageX;
      y1 = e.targetTouches[0].pageY;

      pinchstate = false;

      // TODO: put a slight delay in here, in case this is a pinch/pan
      ptrUpdate(e);
    }
  }


  // Stretch canvas to full screen size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Update canvas size whenever window is resized (incl. device rotate)
  window.addEventListener("resize", resizeCanvas);

  // Start updating the canvas
  window.requestAnimationFrame(display);

  // Fetch sprite data & set up XHR polling for updates
  update();
  setInterval(update, 2000);
})();
