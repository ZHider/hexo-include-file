/**
* hexo-include
* https://github.com/pirtleshell/hexo-include.git
* Copyright (c) 2015, Robert Pirtle
* Licensed under MIT License
*
* Inserts the raw contents of a file into a hexo markdown file.
*
* Syntax:
*   {% includeFile path/to/file [exclude] %}
*   Path is relative to your source directory.
*   exclude: optional, true/false. If true, the included file will be
*            removed from the generated output. Default: false.
*/

'use strict';

const includeTag = require('./include')(hexo);

hexo.extend.tag.register('includeFile', includeTag, {async: true});

// After generation, remove any files that were marked for exclusion
hexo.extend.filter.register('after_generate', () => {
  const excludeList = hexo._includeFileExcludeList;
  if (!excludeList || excludeList.length === 0) return;

  const route = hexo.route;
  const list = route.list();

  // Deduplicate
  const uniquePaths = [...new Set(excludeList)];

  uniquePaths.forEach(filePath => {
    // Find matching routes by checking if route path ends with the file path
    list.forEach(routePath => {
      if (routePath === filePath || routePath.endsWith('/' + filePath)) {
        route.remove(routePath);
        hexo.log.info(`[hexo-include-local-file] Excluded file: ${routePath}`);
      }
    });
  });
});
