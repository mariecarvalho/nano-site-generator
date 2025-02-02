const fse = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const ejsRenderFile = promisify(require('ejs').renderFile);
const globP = promisify(require('glob'));
const config = require('../site.config');

const srcPath = './src';
const distPath = './public';

// Clean destination dir
fse.emptyDirSync(distPath);

// Copy assets folder
fse.copySync(`${srcPath}/assets`, `${distPath}/assets`);

// Read pages templates
globP('**/*.ejs', { cwd: `${srcPath}/pages` })
  .then((files) => {
    files.forEach((file) => {
      const fileData = path.parse(file);
      const destPath = path.join(distPath, fileData.dir);

      // Crate destination dir
      fse.mkdirsSync(destPath);

      // Render page
      ejsRenderFile(`${srcPath}/pages/${file}`, Object.assign({}, config))
        .then((pageContents) => {
          // Render o layout with pages content
          return ejsRenderFile(
            `${srcPath}/layout.ejs`,
            Object.assign({}, config, { body: pageContents })
          );
        })
        .then((layoutContent) => {
          // Save HTML file generated
          fse.writeFileSync(`${destPath}/${fileData.name}.html`, layoutContent);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  })
  .catch((err) => {
    console.error(err);
  });
