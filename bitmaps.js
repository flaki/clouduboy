const fs = require('fs-extra')
const path = require('path')

fs.readdir('./bitmaps').then(d => {
  // List .pif files only
  d = d.filter(f => f.match(/\.pif$/))
  console.log(d)

  const result = {}
  const buildResult = d.map(file => {
    return fs.readFile(path.join('./bitmaps', file)).then(contents => {
      result[file] = contents.toString()
    }).catch(err => console.log(err))
  })

  Promise.all(buildResult).then(_ => {
    console.log(result)

    fs.writeFileSync(path.join('./editor/dist', 'bitmaps.json'), JSON.stringify(result, null, 2))
  })
})
