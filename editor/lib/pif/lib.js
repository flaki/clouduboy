/* PixelData manipulation and storage library
*/
(function() {
  'use strict'

function PixelData(input) {
  console.log('new PixelData('+typeof input+'):', input)
  // Buffer object - should be some binary image file.
  // Supported import formats: BMP
  if (typeof input === 'object' && typeof Buffer !== 'undefined' && input instanceof Buffer) {
    try {
      this.bitmap = bmp2bitmap(input);
      this.w = this.bitmap[0].length;
      this.h = this.bitmap.length;
      return;
    } catch(e) {

    }

    // Not any of the supported binary formats, convert to string
    input = input.toString();
  }

  // Could be serialized JSON
  if (typeof input === 'string') {
    try {
      input = JSON.parse(input);
    } catch (e) {
      // don't fret, could still be a PIF
    }
  }

  // Object, should have w/h set and some data field
  // If object data is not byte data continue with that data as input
  if (typeof input === 'object' && input.data instanceof Array) {
    if (typeof input.data[0] === 'number') {
      this.bitmap = bytes2bitmap(input.data, input.w, input.h, input.frames, (input.w && input.h && "explicit-size") );
      this.frames = input.frames;
      this.w = this.bitmap[0].length / (input.frames||1);
      this.h = this.bitmap.length;
      this.id = input.id;
      return;
    } else {
      input = input.data;
    }
  }

  // String
  if (typeof input === 'string') {
    // Try parsing as Code Snippet
    let parsed = loadCode(input)

    if (parsed) {
      console.log('Successfully parsed as Code Snippet', parsed)
      return parsed
    }


    // Try parsing as PIF (ASCII)
    try {
      let parsed = loadPif(input)
      if (parsed) {
        console.log('Successfully parsed as PIF imagedata', parsed)
        return parsed
      }

    // Nonrecognized format
    } catch (e) {
      console.log('Invalid PIF data!');
      throw e;
    }
  }

  // Nested array - should be a bitmap already
  if (input instanceof Array && input[0] instanceof Array) {
    this.bitmap = input;
    this.w = this.bitmap[0].length;
    this.h = this.bitmap.length;
    return;
  }

  throw("Unrecognized file format.");
}

PixelData.prototype = {
  get pif() {
    // frames support
    if ('$f' in this) {
      return bitmap2pif(
        this.bitmap
          .slice(this.$f*this.h, (this.$f+1)*this.h)
        , (this.id ? this.id+'_'+this.$f : void 0)
      );
    }
    return bitmap2pif(this.bitmap, this.id, this.frames);
  },
  get bytes() {
    return bitmap2bytes(this.bitmap, this.w,this.h, this.frames);
  },
  get rgba() {
    return bitmap2rgba(this.bitmap)
  },
  get sprite() {
    return this.bytes.reduce(function(sprite, v) {
      return sprite += (sprite === '' ? '' : ', ') + ( v<16 ? '0x0' : '0x' ) + v.toString(16);
    }, '');
  },
  get c() {
    return '/*'+ this.w+'x'+this.h +(this.frames>1 ? 'x'+this.frames : '') +'*/ ' + this.sprite
  },

  // Compare two PixelData objects
  equals: function(other) {
    try {
      return this.pif === other.pif;
    } catch (e) {
      console.log("Error matching PixelData: ", e);
      return false;
    }
  },

  // A "view" into the PixelData object, representing just a single frame
  frame: function(n) {
    if (n > (this.frames||0)) return this;
    var fobj = Object.create(this);
    fobj.$f = n;
    return fobj;
  },

  // Create an object with all properties
  serialize: function() {
    return {
      id: this.id,
      w: this.w,
      h: this.h,
      data: this.bytes
    };
  }
}


function bitmap2pif(bitmap, id, frames) {
  return (id ? '! ' + id + ' ' +bitmap[0].length+ 'x' + (frames>1 ? (bitmap.length/frames)+ 'x'+frames : bitmap.length) +'\n' : '') +
    bitmap.reduce(function(out,row) {
      out.push(row.join(''));
      return out;
    },[]).join('\n').replace(/0/g,'.').replace(/1/g,'#');
}

function pif2bitmap(pif) {
  var rows = pif.replace(/[^\.\#]+/g,' ').trim().split(/\s+/g);

  var matrix = rows.map(function(s) {
    var i,
        r = [];

    for (i = 0; i < s.length; ++i) {
      r.push(s[i] === '#' ? 1 : 0);
    }

    return r;
  });

  return matrix;
}

function pif2bytes(pif) {
  return bitmap2bytes( pif2bitmap( pif ));
}

function bitmap2bytes(bitmap, w,h, frames) {
  w = w||bitmap[0].length
  h = h||bitmap.length
  frames = frames||1

  let bytes = []

  let fr = 0
  let seg = 0

  while (fr < frames && seg < h) {
    for (let x = 0; x < w; ++x) {
      let v = 0;
      let ymax = (h-seg < 8 ? h-seg : 8);

      for (let y = 0; y < ymax; ++y) {
        v |= bitmap[fr*h +seg +y][x] << y;
      }

      // Save byte values
      bytes.push(v);
    }

    seg += 8;
    if (seg >= h) {
      ++fr;
      seg = 0;
    }
  }

  return bytes;
}

function bitmap2rgba(bitmap, fg, bg) { //TODO: frames
  let w = bitmap[0].length, h = bitmap.length;
  let rgba = new Uint8ClampedArray(w * h * 4);

  bg = bg || [0,0,0,0];
  fg = fg || [255,255,255,255];


  let y = 0;
  while (y < h) {

    for (let x = 0; x < w; ++x) {
      let cc = (bitmap[y][x] ? fg : bg);

      rgba[ (y*w + x)*4 + 0 ] = cc[0];
      rgba[ (y*w + x)*4 + 1 ] = cc[1];
      rgba[ (y*w + x)*4 + 2 ] = cc[2];
      rgba[ (y*w + x)*4 + 3 ] = cc[3];
    }

    ++y;
  }

  return rgba;
}


function bytes2bitmap(bytes,w,h,frames,explicit) {
  // Width / height optional, assume square image @ 8x8 or multiples
  if (!explicit) {
    if (!h) {
      h = w;
    }
    if (!w || (w * Math.ceil(h/8)) < bytes.length) {
      w = h = Math.ceil( Math.sqrt( bytes.length / 8) ) * 8;
    }
  }

  // Stores the image as a bitmap
  let bitmap = []

  // Real height of the frame is this divisible by 8
  let rows = Math.ceil(h/8)

  let f = 0;
  do {

    for (let y = 0; y<h; ++y) {
      bitmap[y+f*h] = bitmap[y+f*h] || [];
      for (let x = 0; x<w; ++x) {
        bitmap[y+f*h][x] = (bytes[w * (f*rows + (y >> 3)) + x] & (1 << (y % 8))) ? 1 : 0;
      }
    }

    ++f;
  } while (f < frames);

  return bitmap;
}

function bytes2pif(bytes,w,h,id) {
  return bitmap2pif( bytes2bitmap(bytes,w,h), id );
}

// Import BMP bitmap files
// Based on the BMP data format structure documented in:
// http://paulbourke.net/dataformats/bmp/
function bmp2bitmap(b) {
  // BM (magic identifier) in fist two bytes: 0x42@0, 0x4D@1
  if (b[0] !== 0x42 || b[1] !== 0x4D) throw("Not a valid BMP file.");

  // Image data starts: 4-byte-uint@10
  var imgdata = b.readUInt32LE(10);

  // Image width & height: 4-byte-int@18,22
  var w = b.readInt32LE(18),
      h = b.readInt32LE(22);

  // Bits-per-pixel: 2-byte-ushort@28
  // 32bpp means alpha channel + RGB
  var bpp = b.readUInt16LE(28);

  // Log import
  console.log("Importing BMP bitmap:", b.length,"bytes,",w,"x",h,"bitmap @",bpp,"bpp");

  // Read image bitmap based on above metadata
  var bitmap = new Array(h),
      y = 0, v;

  for (i = 0; i < w*h; ++i) {
    // For some reason the image rows are flipped in BMP files
    y = h - 1 - Math.floor(i/w);

    // New row
    if (!bitmap[y]) bitmap[y] = [];

    switch (bpp) {
      // 32 bit ABGR
      case 32:
        v = b.readUInt32LE(imgdata + i * 4);

        // Check transparency value, also non-black color value
        bitmap[y][i%w] = ( (v >>> 24) > (0xFF >> 1) && (v & 0xFFFFFF) ) ? 1 : 0;
        break;

      // 24 bit BGR
      case 24:
        v = b[imgdata + i*3] | b[imgdata + i*3 + 1] | b[imgdata + i*3 + 2];

        // Count all non-completely-black color values
        bitmap[y][i%w] = v ? 1 : 0;
        break;

      // 1 bit B&W
      case 1:
        // Strange padding to 4 bytes
        v = b.readUInt32BE(imgdata + (h - y - 1) * Math.ceil(w/32)*4);

        // Count all bits
        bitmap[y][i%w] = ( (v >>> (31-(i%w))) & 1 ) ? 1 : 0;
        break;
    }
  }

  return bitmap;
}

function loadPif(contents) {
  // Skip empty rows and trim unneeded whitespace, split to lines
  let bitmap = contents.split('\n').map(r => r.trim()).filter(r => r !== '' );

  // Retrieve DATA and META rows separately
  let rows = bitmap.filter(r => r[0].match(/^[a-z0-0\.\#]/i))
  let meta = bitmap.filter(r => r[0].match(/^[^a-z0-0\.\#]/i)).join(' ')

  let pdata = Object.create(PixelData.prototype);

  // Dimensions
  pdata.w = rows[0].length;
  pdata.h = rows.length;

  // Metadata
  detectDimensions(meta, pdata)

  let m = meta.match(/[a-z]\w+/)
  if (m) {
    pdata.id = m[0]
  }

  pdata.bitmap = rows.map(row => row.split('').map(i => i==='#' ? 1 : parseInt(i,16)||0) )

  return pdata
}

function loadCode(contents, label, statement) {
  let pdata = Object.create(PixelData.prototype);
  statement = statement || contents;

  // Check for validarray initializer
  contents = arrayInitializerContent(statement);

  if (!contents) {
    console.log('No valid array initializer found')
    return null
  }

  // Pixelsprite id (label)
  if (!label) {
    let match;
    // try to guess from source
    // char|byte label[]
    // TODO: char|byte* label
    match = statement.match(/(?:char|byte)\s+(\w+)\[\]/)
    if (match) {
      label = match[1]
    }
  }

  pdata.id = label;

  // Serialized binary Pixelsprite data in PROGMEM format
  pdata.data = cleanComments(contents)
    .trim().replace(/,\s*$/,'') // get rid of useless whitespace and trailing commas
    .split(',') // get values
      .map(function(n) { return parseInt(n); }); // parse values


  // Try to guess image width/height
  pdata.w = parseInt( (statement.match(/w\:\s*(\d+)[^\n]+/) || [])[1] );
  pdata.h = Math.floor(pdata.data.length / pdata.w) * 8;
  pdata.frames = 0;
  pdata.ambiguous = true;

  // Try to detect/load dimensions from metadata
  detectDimensions(statement, pdata)

  // Generate bitmap
  pdata.bitmap = bytes2bitmap(pdata.data,pdata.w,pdata.h,pdata.frames,true)

  return pdata;
}

// Pixelsprite dimensions can be declared in comments besides the
// binary pixeldata in the format WWWxHHH where WWW and HHH are both
// integer pixel values for width/height
// eg.: PROGMEM ... sprite[] = { /*128x64*/ 0xa3, 0x... }
// Optionally, a single pixelsprite can contain multiple sprites (frames)...
function detectDimensions(source, pdata) {
  var m = source.match(/(?:!|\/\/|\/\*)?\s*([1-9]\d*)x([1-9]\d*)(?:x(\d+))?(?:@(\d+))?/);

  if (m && m[1] && m[2]) {
    pdata.w = parseInt(m[1],10);
    pdata.h = parseInt(m[2],10);
    pdata.frames = m[3] ? parseInt(m[3],10) : 0;
    pdata.palette = m[4] ? parseInt(m[4],10) : 1;
    pdata.ambiguous = false;
  }

}


const RX_CLEANCOMMENTS = /(\/\/[^\n]*\n|\/\*(.*?\*\/))/g;

function cleanComments(str) {
  return str.replace(
    RX_CLEANCOMMENTS,
    function(i) { return ' '.repeat(i.length); }
  );
}

function arrayInitializerContent(statement) {
  try {
    return ( statement
      .replace(/\r|\n|\t/g, ' ') // remove line breaks and tabs
      .match(/=\s*[{\[](.*)[}\]]/)[1] // match core data
      .replace(/\s+/g, ' ').trim() // clean up whitespace
    ) || statement;
  } catch(e) {
    return null
  };

  return statement;
}


PixelData.codeToPif = loadCode
PixelData.loadPif = loadPif

PixelData.util = {
  cleanComments, arrayInitializerContent
}

/*
GLOBAL.fromBitmap = bitmap2pif;
GLOBAL.toBitmap = pif2bitmap;

GLOBAL.fromBytes = bytes2pif;
GLOBAL.toBytes = pif2bytes;
*/

try {
  window.PixelData = PixelData;
} catch (e) {
  module.exports = PixelData;
}

})(); // IIFE
