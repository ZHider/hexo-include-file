/*
* Hexo include tag function
*
* Takes context. Exports function that grabs the contents of a file
* given a filename. Searches in the following order:
*   1. source_dir (global source root)
*   2. The directory containing the current .md file
*   3. The post asset folder (same name as the .md file, without extension)
*/

'use strict';

const pathFn = require('path');
const fs = require('hexo-fs');

module.exports = function(ctx) {
  // Initialize exclude list on hexo context
  if (!ctx._includeFileExcludeList) {
    ctx._includeFileExcludeList = [];
  }

  return function includeTag(args, _content) {
    const filename = args[0];
    const excludeFromOutput = args[1] === 'true';

    if (!filename) {
      ctx.log.warn(`[hexo-include-local-file] ${filename} Include file path undefined.`);
      return;
    }

    // Add to exclude list if needed
    if (excludeFromOutput) {
      ctx._includeFileExcludeList.push(filename);
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
    const tryNext = index => {
      if (index >= searchDirs.length) {
        ctx.log.warn(`[hexo-include-local-file] ${filename} Include file not found in any search path.`);
        return;
      }

      const fullPath = pathFn.join(searchDirs[index], filename);

      return fs.exists(fullPath).then(exist => {
        if (!exist) {
          return tryNext(index + 1);
        }
        return fs.readFile(fullPath).then(contents => {
          if (!contents) {
            ctx.log.warn(`[hexo-include-local-file] ${fullPath} Include file empty.`);
            return;
          }
          ctx.log.debug(`[hexo-include-local-file] ${this?.source} including file: ${fullPath}`);
          // Return the contents of the file
          return contents;
        });
      });
    };

    return tryNext(0);
  };
};
