/*
* Hexo include tag function
*
* Takes context. Exports function that grabs the contents of a file
* given a filename. Searches in the following order:
*   1. source_dir (global source root)
*   2. The directory containing the current .md file
*   3. The post asset folder (same name as the .md file, without extension)
*/

const pathFn = require('path');
const fs = require('hexo-fs');

module.exports = function(ctx) {
  return function includeTag(args) {
    const filename = args[0];

    if (!filename) {
      console.warn("Include file path undefined.");
      return;
    }

    // Build search directories
    const searchDirs = [ctx.source_dir];

    // this.source is the post source path relative to source_dir (e.g. "_posts/onepass-js.md")
    if (this && this.source) {
      const postPath = pathFn.join(ctx.source_dir, this.source);
      const postDir = pathFn.dirname(postPath);
      // Directory containing the .md file
      searchDirs.push(postDir);
      // Post asset folder (same name without extension)
      const assetDir = pathFn.join(postDir, pathFn.basename(this.source, pathFn.extname(this.source)));
      searchDirs.push(assetDir);
    }

    // Try each search directory in order
    const tryNext = (index) => {
      if (index >= searchDirs.length) {
        console.warn('Include file not found in any search path: ' + filename);
        return;
      }

      const fullPath = pathFn.join(searchDirs[index], filename);

      return fs.exists(fullPath).then(exist => {
        if (!exist) {
          return tryNext(index + 1);
        }
        return fs.readFile(fullPath).then(contents => {
          if (!contents) {
            console.warn('Include file empty: ' + fullPath);
            return;
          }
          return contents;
        });
      });
    };

    return tryNext(0);
  };
};
