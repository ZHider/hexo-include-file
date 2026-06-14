/* eslint-env node, mocha */

const pathFn = require('path');
const should = require('chai').should();
const Hexo = require('hexo');
const fs = require('hexo-fs');

const hexo = new Hexo(pathFn.join(__dirname, 'include_test'));

const include = require('../lib/include.js')(hexo);

describe('Include tag', function() {
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

  // returns the rendered content with optional context
  function renderedContent(file, context) {
    return include.call(context, [file]);
  }

  before(function() {
    // create files for testing
    fs.writeFileSync(sourceFile, fixture);
    fs.writeFileSync(emptyFile, '');
    fs.writeFileSync(postFile, '');
    fs.writeFileSync(postAssetFile, assetFixture);
    fs.writeFileSync(pathFn.join(postDir, 'post-file.html'), postFixture);
    return;
  });

  after(function() {
    // remove the testing arena
    return fs.rmdir(hexo.base_dir);
  });

  it('existing file in source directory', function() {
    return renderedContent('test_dir/test.html').then(result => {
      result.should.eql(fixture);
    });
  });

  it('existing file in post directory', function() {
    const context = postContext('_posts/test-post.md');
    return renderedContent('post-file.html', context).then(result => {
      result.should.eql(postFixture);
    });
  });

  it('existing file in post asset folder', function() {
    const context = postContext('_posts/test-post.md');
    return renderedContent('asset.html', context).then(result => {
      result.should.eql(assetFixture);
    });
  });

  it('empty file', function() {
    return renderedContent('test_dir/empty.html').then(result => {
      should.not.exist(result);
    });
  });

  it('nonexistent file', function() {
    return renderedContent('this/file/doesnt/exist.magic').then(result => {
      should.not.exist(result);
    });
  });

  it('searches source directory first', function() {
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
});
