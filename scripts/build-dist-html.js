require('shelljs/global');

mkdir('-p', 'editor/dist');
cp('editor/*.html', 'editor/dist/');
ls('editor/dist/*.html').forEach((file) => sed('-i', /\/js\//, '\/dist\/js\/', file));
