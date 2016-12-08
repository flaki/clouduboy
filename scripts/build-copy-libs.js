require('shelljs/global');

mkdir('-p', 'editor/dist/lib');
cp('node_modules/whatwg-fetch/fetch.js', 'editor/dist/lib/fetch.js');
