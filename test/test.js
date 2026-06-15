'use strict';
const pathFn = require('path');
const should = require('chai').should();
const Hexo = require('hexo');
const fs = require('hexo-fs');

const hexo = new Hexo(pathFn.join(__dirname, 'include_test'));
global.hexo = hexo;

const include = require('../lib/include.js')(hexo);

describe('Include tag', () => {
  const sourceFile = pathFn.join(hexo.source_dir, 'test_dir/test.html');
  const emptyFile = pathFn.join(hexo.source_dir, 'test_dir/empty.html');
  const postDir = pathFn.join(hexo.source_dir, '_posts');
  const postFile = pathFn.join(postDir, 'test-post.md');
  const postAssetDir = pathFn.join(postDir, 'test-post');
  const postAssetFile = pathFn.join(postAssetDir, 'asset.html');

  const fixture = [
    '<h1>go to sleep ya little bae</h1>',
    'if (tired && night){',
    '  sleep();',
    '}'
  ].join('\n');

  const postFixture = '<div>Post directory content</div>';
  const assetFixture = '<div>Asset folder content</div>';

  // Simulates the context when called from a post
  function postContext(sourcePath) {
    return {
      source: sourcePath
    };
  }

  // returns the rendered content with optional context and args
  function renderedContent(file, context, args) {
    const callArgs = args || [file];
    return include.call(context, callArgs);
  }

  before(() => {
    // create files for testing
    fs.writeFileSync(sourceFile, fixture);
    fs.writeFileSync(emptyFile, '');
    fs.writeFileSync(postFile, '');
    fs.writeFileSync(postAssetFile, assetFixture);
    fs.writeFileSync(pathFn.join(postDir, 'post-file.html'), postFixture);

  });

  after(() => {
    // remove the testing arena
    return fs.rmdir(hexo.base_dir);
  });

  beforeEach(() => {
    // Reset exclude list before each test
    hexo._includeFileExcludeList = [];
  });

  it('existing file in source directory', () => {
    return renderedContent('test_dir/test.html').then(result => {
      result.should.eql(fixture);
    });
  });

  it('existing file in post directory', () => {
    const context = postContext('_posts/test-post.md');
    return renderedContent('post-file.html', context).then(result => {
      result.should.eql(postFixture);
    });
  });

  it('existing file in post asset folder', () => {
    const context = postContext('_posts/test-post.md');
    return renderedContent('asset.html', context).then(result => {
      result.should.eql(assetFixture);
    });
  });

  it('empty file', () => {
    return renderedContent('test_dir/empty.html').then(result => {
      should.not.exist(result);
    });
  });

  it('nonexistent file', () => {
    return renderedContent('this/file/doesnt/exist.magic').then(result => {
      should.not.exist(result);
    });
  });

  it('searches source directory first', () => {
    // Create a file with same name in both source and post asset folder
    const sourceDuplicate = pathFn.join(hexo.source_dir, 'duplicate.html');
    const assetDuplicate = pathFn.join(postAssetDir, 'duplicate.html');
    const sourceContent = 'source version';
    const assetContent = 'asset version';

    fs.writeFileSync(sourceDuplicate, sourceContent);
    fs.writeFileSync(assetDuplicate, assetContent);

    const context = postContext('_posts/test-post.md');
    return renderedContent('duplicate.html', context).then(result => {
      result.should.eql(sourceContent);
      // Cleanup
      fs.unlinkSync(sourceDuplicate);
      fs.unlinkSync(assetDuplicate);
    });
  });

  describe('exclude parameter', () => {
    it('should not add file to exclude list by default', () => {
      return renderedContent('test_dir/test.html').then(result => {
        result.should.eql(fixture);
        hexo._includeFileExcludeList.should.have.lengthOf(0);
      });
    });

    it('should not add file to exclude list when second arg is false', () => {
      const args = ['test_dir/test.html', 'false'];
      return renderedContent('test_dir/test.html', null, args).then(result => {
        result.should.eql(fixture);
        hexo._includeFileExcludeList.should.have.lengthOf(0);
      });
    });

    it('should add file to exclude list when second arg is true', () => {
      const args = ['test_dir/test.html', 'true'];
      return renderedContent('test_dir/test.html', null, args).then(result => {
        result.should.eql(fixture);
        hexo._includeFileExcludeList.should.have.lengthOf(1);
        hexo._includeFileExcludeList[0].should.eql('test_dir/test.html');
      });
    });

    it('should add multiple files to exclude list', () => {
      const args1 = ['test_dir/test.html', 'true'];
      const args2 = ['test_dir/empty.html', 'true'];

      return renderedContent('test_dir/test.html', null, args1).then(() => {
        return renderedContent('test_dir/empty.html', null, args2);
      }).then(() => {
        hexo._includeFileExcludeList.should.have.lengthOf(2);
        hexo._includeFileExcludeList.should.include('test_dir/test.html');
        hexo._includeFileExcludeList.should.include('test_dir/empty.html');
      });
    });
  });
});

describe('after_generate filter', () => {
  // Mock route system
  let mockRoutes,
    removedRoutes;

  beforeEach(() => {
    hexo._includeFileExcludeList = [];
    mockRoutes = {
      'test_dir/test.html': true,
      'test_dir/other.html': true,
      '_posts/some-post/index.html': true
    };
    removedRoutes = [];

    hexo.route = {
      list: function() {
        return Object.keys(mockRoutes);
      },
      remove: function(path) {
        removedRoutes.push(path);
        delete mockRoutes[path];
      }
    };
  });

  it('should not remove any routes when exclude list is empty', () => {
    // Load the filter registration
    require('../lib/index.js');

    // Get the registered filter
    const filters = hexo.extend.filter.list('after_generate');
    filters.should.have.lengthOf(1);

    // Execute the filter
    filters[0]();
    removedRoutes.should.have.lengthOf(0);
  });

  it('should remove matching routes from output', () => {
    hexo._includeFileExcludeList = ['test_dir/test.html'];

    const filters = hexo.extend.filter.list('after_generate');
    filters[0]();
    removedRoutes.should.have.lengthOf(1);
    removedRoutes.should.include('test_dir/test.html');
  });

  it('should not remove non-matching routes', () => {
    hexo._includeFileExcludeList = ['nonexistent/file.html'];

    const filters = hexo.extend.filter.list('after_generate');
    filters[0]();
    removedRoutes.should.have.lengthOf(0);
  });

  it('should deduplicate exclude list', () => {
    hexo._includeFileExcludeList = ['test_dir/test.html', 'test_dir/test.html'];

    const filters = hexo.extend.filter.list('after_generate');
    filters[0]();
    // Should only remove once despite duplicates
    removedRoutes.should.have.lengthOf(1);
    removedRoutes.should.include('test_dir/test.html');
  });
});
