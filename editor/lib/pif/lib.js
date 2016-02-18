/* PixelData manipulation and storage library
*/
(function() {

function PixelData(input) {
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
      this.bitmap = bytes2bitmap(input.data, input.w, input.h, (input.w && input.h && "explicit-size") );
      this.w = this.bitmap[0].length;
      this.h = this.bitmap.length;
      this.id = input.id;
      return;
    } else {
      input = input.data;
    }
  }

  // String, try parsing as PIF
  if (typeof input === 'string') {
    try {
      this.bitmap = pif2bitmap(input);
      this.w = this.bitmap[0].length;
      this.h = this.bitmap.length;

      // Try to read embedded id tag
      try {
        this.id = input.match(/\:(\w+)/)[1];
      } catch (e) {
        console.log('No embedded id found in PIF string');
      }
      return;

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
    return bitmap2pif(this.bitmap, this.id);
  },
  get bytes() {
    return bitmap2bytes(this.bitmap);
  },
  get rgba() {
    return bitmap2rgba(this.bitmap)
  },
  get sprite() {
    return this.bytes.reduce(function(sprite, v) {
      return sprite += (sprite === '' ? '' : ', ') + ( v<16 ? '0x0' : '0x' ) + v.toString(16);
    }, '');
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


function bitmap2pif(bitmap, id) {
  return (id ? ':' + id + ':\n' : '') +
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

function bitmap2bytes(bitmap) {
  var x,y,seg,ymax,v;
  var w = bitmap[0].length, h = bitmap.length;
  var bytes = [];

  seg = 0;
  while (seg < h) {
    for (x = 0; x < w; ++x) {
      v = 0;
      ymax = (h-seg < 8 ? h-seg : 8);

      for (y = 0; y < ymax; ++y) {
        v |= bitmap[seg+y][x] << y;
      }

      // Save byte values
      bytes.push(v);
    }

    seg += 8;
  }

  return bytes;
}

function bitmap2rgba(bitmap, fg, bg) {
  var w = bitmap[0].length, h = bitmap.length;
  var rgba = new Uint8ClampedArray(w * h * 4);
  var bg = bg || [0,0,0,0];
  var fg = fg || [255,255,255,255];
  var cc;


  var y = 0;
  while (y < h) {

    for (x = 0; x < w; ++x) {
      cc = (bitmap[y][x] ? fg : bg);

      rgba[ (y*w + x)*4 + 0 ] = cc[0];
      rgba[ (y*w + x)*4 + 1 ] = cc[1];
      rgba[ (y*w + x)*4 + 2 ] = cc[2];
      rgba[ (y*w + x)*4 + 3 ] = cc[3];
    }

    ++y;
  }

  return rgba;
}


function bytes2bitmap(bytes,w,h,explicit) {
  // Width / height optional, assume square image @ 8x8 or multiples
  if (!explicit) {
    if (!h) {
      h = w;
    }
    if (!w || (w * Math.ceil(h/8)) < bytes.length) {
      w = h = Math.ceil( Math.sqrt( bytes.length / 8) ) * 8;
    }
  }

  var x,y;
  var bitmap = [];
  for (y = 0; y<h; ++y) {
    bitmap[y] = [];
    for (x = 0; x<w; ++x) {
      bitmap[y][x] = (bytes[(y >> 3) * w + x] & (1 << (y % 8))) ? 1 : 0;
    }
  }

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
