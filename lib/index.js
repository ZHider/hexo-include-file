/**
* hexo-include
* https://github.com/pirtleshell/hexo-include.git
* Copyright (c) 2015, Robert Pirtle
* Licensed under MIT License
*
* Inserts the raw contents of a file into a hexo markdown file.
*
* Syntax:
*   {% includeFile path/to/file %}
*   Path is relative to your source directory.
*/

const includeTag = require('./include')(hexo);

hexo.extend.tag.register('includeFile', includeTag, {async: true});
