let ctx = document.querySelector('canvas').getContext('2d');
let img;
let im = {
  x: 0, y: 0, w: 0, h: 0
};

document.querySelector('input').addEventListener('change', load);

document.querySelector('body').addEventListener("click", interact);

let actions = {
  "nudgeleft":  () => { --im.x; --im.w },
  "nudgeright": () => { ++im.x; ++im.w },
  "decwidth": () =>   --im.w,
  "incwidth": () =>   ++im.w,
  "topup":   () => { --im.y; --im.h },
  "topdown": () => { ++im.y; ++im.h },
  "decheight": () =>   --im.h,
  "incheight": () =>   ++im.h ,
}

function interact(e) {
  if (e.target.nodeName === "BUTTON" && e.target.id in actions) {
    actions[e.target.id].call();
    render();
  }
}


function load(e) {
  let files = e.target.files;
  console.log(files);

  if (files[0]) {
    let f = files[0];
    let reader = new FileReader();
    reader.onloadend = r => {
      console.log("read finished", r, reader);

      img = document.createElement("img");
        img.src = window.URL.createObjectURL(files[0]);
        img.onload = function() {
          window.URL.revokeObjectURL(this.src);

          im.x = im.y = 0;
          im.w = img.width;
          im.h = img.height;
          render();
        }
    };
    console.log('read');
    reader.readAsArrayBuffer(f);
  }
}

function render() {
  ctx.width = ctx.canvas.width = im.w;
  ctx.height = ctx.canvas.height = im.h;
  ctx.drawImage(img, im.x, im.y);
  console.log(ctx, img, im.w, im.h);

  document.querySelector('#image').appendChild(img);

  let idata = ctx.getImageData(0, 0, im.w, im.h);
  console.log(idata, im.w,im.h);

  let i=0, j=0, res=[];
  while (i<idata.data.length) {
    res[j] = res[j] || [];
    res[j].push(idata.data[i]>0?1:0);
    i += 4;
    j = Math.floor(i / (idata.width*4));
  }
  console.log(res, res.map(r=>r.join('')).join('\n'));
}
