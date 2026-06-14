# hexo-include

A [Hexo](https://github.com/hexojs/hexo) plugin for including the raw content of a text file into a post directly from its markdown. Easily insert pre-written HTML, JS, or the contents of _any_ text file into the body of your post or page.

## Usage

Insert the following into the post's markdown where you want the contents of the external file inserted:

```
{% includeFile 'path/to/file.bar' %}
```

### File Search Order

When resolving a file path, the plugin searches in the following order:

1. **`source` directory** — the global source root of your Hexo site
2. **Post directory** — the directory containing the current `.md` file
3. **Post asset folder** — the folder with the same name as the `.md` file (e.g. `source/_posts/my-post/` for `source/_posts/my-post.md`)

The first match wins. This means you can use short relative paths like:

```
{% includeFile 'main.html' %}
```

and it will automatically find `main.html` in the post's asset folder.

## Install

Install from the base directory of your Hexo site:

```
$ pnpm install hexo-include
```

Or with npm:

```
$ npm install hexo-include
```

## Requirements

- Node.js >= 14.0.0
- Hexo >= 6.0.0

## Changelog

### v1.2.0
- Updated dependencies to latest compatible versions
- Fixed security vulnerabilities
- Improved compatibility with modern Node.js versions
- Updated code to use ES6+ syntax where appropriate
- Added multi-directory file search: resolves files from source root, post directory, and post asset folder

Thanks to [Robert Pirtle](https://github.com/pirtleshell/hexo-include) and [binds-co](https://github.com/binds-co/hexo-include).

## License

MIT (c) 2016.
