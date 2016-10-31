'use strict';

const diff = require('diff');

let a = 'aa\nbb\ncccc;';
let b = 'aa\nbbb\ncccc;';

let d = diff.diffChars(a,b);



const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');
const microCanvasBuild = require('./build.js');

// Empty testfile - run all tests
let testfile = process.argv[2] || '';

let source = fs.readFileSync( path.join(__dirname, 'testsuite', testfile+'.js' ) ).toString();

let game = microCanvasBuild('arduboy', source, testfile+'.js');

try {
  a = fs.readFileSync( path.join(__dirname, 'testsuite', testfile+'.ino' ) ).toString();
} catch (e) {
  a = '';
  console.log('No compiled version found: ', e.stack);
}

b = game.ino;

d = diff.diffTrimmedLines(a.replace(/\r\n/g,'\n').trim(),b.replace(/\r\n/,'\n').trim());

console.log('Compilation finished: ', testfile);
fs.writeFileSync('.lasttest.ino', game.ino);

// update testfile
if (process.argv[3] === '-u') fs.writeFileSync(path.join(__dirname, 'testsuite', testfile+'.ino' ), game.ino);

console.log('---');
//console.log(d);

let lc = 0;
d.forEach(c => {
  //console.log( c.added?'+': (c.removed?'-':''), c.count );
  if (c.removed) {
    c.value.replace(/\n$/,'').split(/\n/).forEach((ln,idx) => {
      console.log( lpad(lc+idx, 5)+' | '+colors.green(ln) );
    });
  } else if (c.added) {
    c.value.replace(/\n$/,'').split(/\n/).forEach((ln,idx) => {
      console.log( lpad(lc+idx, 5)+' | '+colors.red(ln) );
    });
  } else {
    lc += c.count;
  }
});

function lpad(str, n, padstr) {
  padstr = padstr || ' ';
  str = String(str);
  let l = str.length;
  if (l < 0) l=0;
  if (l > n) l=n;
  return padstr.repeat(n-l||0)+str.substr(-l);
}
