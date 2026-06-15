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

function buildSearchDirs(hexoCtx, postCtx) {
  const searchDirs = [hexoCtx.source_dir];

  if (postCtx && postCtx.source) {
    const postPath = pathFn.join(hexoCtx.source_dir, postCtx.source);
    const postDir = pathFn.dirname(postPath);
    searchDirs.push(postDir);

    const assetDir = pathFn.join(postDir, pathFn.basename(postCtx.source, pathFn.extname(postCtx.source)));
    searchDirs.push(assetDir);
  }

  return searchDirs;
}

module.exports = function(hexoCtx) {
  // Initialize exclude list on hexo context
  if (!hexoCtx._includeFileExcludeList) {
    hexoCtx._includeFileExcludeList = [];
  }

  return async function includeTag(args, _content) {
    const filename = args[0];
    const excludeFromOutput = args[1] === 'true';

    if (!filename) {
      hexoCtx.log.warn(`[hexo-include-local-file] ${filename} Include file path undefined.`);
      return;
    }

    // Add to exclude list if needed
    if (excludeFromOutput) {
      hexoCtx._includeFileExcludeList.push(filename);
    }

    // Build search directories
    const searchDirs = buildSearchDirs(hexoCtx, this);

    // Try each search directory in order
    for (const dir of searchDirs) {
      const fullPath = pathFn.join(dir, filename);
      const exist = await fs.exists(fullPath);

      if (exist) {
        const contents = await fs.readFile(fullPath);
        if (!contents) {
          hexoCtx.log.warn(`[hexo-include-local-file] ${fullPath} Include file empty.`);
          return;
        }
        hexoCtx.log.debug(`[hexo-include-local-file] ${this?.source} including file: ${fullPath}`);
        return contents;
      }
    }

    hexoCtx.log.warn(`[hexo-include-local-file] ${filename} Include file not found in any search path.`);
  };
};
