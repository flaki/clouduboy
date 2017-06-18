let sonicPal = [
  [  0,  0,  0,   0],
  [  0,  0,170, 255],
  [  0,  0,  0, 255],
  [ 85, 85,255, 255],
  [170, 85, 85, 255],
  [255,170, 85, 255],
  [255,255,255, 255],
  [170,170,170, 255]
]


function grayscale(arr) {
  let avg
  // Simple average
  avg = ((arr[0]+arr[1]+arr[2])/3)|0
  // Luma coded - https://en.wikipedia.org/wiki/Grayscale
  //avg = Math.floor(0.299*arr[0]+0.587*arr[1]+0.114*arr[2])

  //const pts = [ 0, 96, 160, 255 ]
  const pts = [ 0, 85, 128, 170, 255 ]
  let sel
  let d = 255

  // reduce to bit depth
  pts.forEach(p => {
    if (Math.abs(avg-p)<d) {
      d = Math.abs(avg-p)
      sel = p
    }
  })

  return [sel,sel,sel, arr[3]]
}
function toPaletteDefinition(pal) {
  return pal.map(c=> '#'+(c[0]<16?0:'')+c[0].toString(16)+(c[1]<16?0:'')+c[1].toString(16)+(c[2]<16?0:'')+c[2].toString(16)).join(',')
}

let gs = sonicPal.map(grayscale)
let gsp = gs.map(e => e.join(',')).reduce((a,b,i) => {
  if(~a.indexOf(b)) {
    a.push(a.indexOf(b))
  } else {
    a.push(b)
  }
  return a
},[]).map((a,i) => typeof a=='string' ? i : a)

console.log(gs.join('\n'), gsp)

let sonic = new PixelData(examples['Sonic, 3-bit palette, ASCII'])
//document.body.appendChild(mc.loadGraphics(sonic))
document.body.appendChild(mc.loadGraphics(sonic.colors(sonicPal)))
document.body.appendChild(mc.loadGraphics(sonic.colors(sonicPal).grayscale()))
console.log(sonic.colors(sonicPal).grayscale().pwm)
console.log(sonic.colors(sonicPal).grayscale().pwm.c())
console.log(toPaletteDefinition(sonicPal))

let comp = [ 'source-over','source-in','source-out','source-atop',
      'destination-over','destination-in','destination-out','destination-atop',
      'lighter', 'copy','xor', 'multiply', 'screen', 'overlay', 'darken',
      'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light',
      'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
]

comp.forEach(c => {
      let c1 = document.createElement('canvas')
      let c2 = document.createElement('canvas')
      c1.width = 100
      c1.height = 100
      c2.width = 60
      c2.height = 60
      let c1x = c1.getContext('2d')
      c1x.globalCompositeOperation = c;
      c1x.fillStyle = 'rgba(255,255,255,.5)'
      c1x.fillRect(0,0,70,70)
      let c2x = c1.getContext('2d')
      c2x.fillStyle = 'rgba(255,255,255,.5)'
      c2x.fillRect(0,0,60,60)
      c1x.drawImage(c2, 40,40)
      document.body.appendChild(c1)
      console.log(c, c1x.getImageData(10, 10, 1, 1).data);
})
