# Official Editor42 jQuery integration

## About

This package is a thin wrapper around [Editor42](https://github.com/editor42com/editor42),
the auditable MIT fork of TinyMCE 6, to make it easier to use with jQuery. It patches
`.val()`, `.html()`, `.text()`, `.append()`, `.prepend()`, `.remove()`, `.empty()` and
`.attr()` to work naturally against editor-bound elements.

Documentation lives at [editor42.com](https://editor42.com/docs).

## Installation

```sh
npm install @editor42/editor42-jquery
```

## Usage

```html
<script src="jquery.min.js"></script>
<script src="node_modules/@editor42/editor42-jquery/dist/editor42-jquery.js"></script>

<textarea id="editor"></textarea>
<script>
  $('#editor').editor42({ height: 400 });
</script>
```

With no `script_url` the editor script is loaded from `https://cdn.editor42.com` on the
`latest` channel. There is no account, no sign-up and no key of any kind. The `latest`
pointer only ever moves for security and bug-fix releases, because the Editor42 major
version is fixed forever.

The `:editor42` pseudo selector matches elements bound to an editor, for example
`$('*:editor42')`.

## Self-hosting

```js
$('#editor').editor42({ script_url: '/js/editor42/editor42.min.js' });
```

Any full script URL works, editor42 or TinyMCE builds.

## Pinning a version

```js
$('#editor').editor42({ channel: '42.0.0' });
```

`channel` accepts `latest`, a `latest-N` alias, or an exact version.

## Editor options

Everything else is an Editor42 option, passed in the same settings object:

```js
$('#editor').editor42({ height: 400, menubar: false, plugins: 'lists link' });
```

See the [Editor42 documentation](https://editor42.com/docs) for the full list.

## Migrating from the TinyMCE jQuery integration

```sh
npm uninstall @tinymce/tinymce-jquery
npm install @editor42/editor42-jquery
```

`$(el).tinymce(settings)` and the `:tinymce` pseudo keep working as deprecated aliases of
`$(el).editor42(settings)` and `:editor42`. `script_url`, `channel`, `script_loaded` and
`oninit` keep their names, and TinyMCE-style numeric channels resolve to `latest`.

All API-key and licence-key handling has been removed. The `api_key` setting is still
accepted so existing code compiles, but it does nothing: no key is read, stored or sent
anywhere, and no request ever reaches a vendor cloud.

The integration also drives a stock TinyMCE if that is what is already loaded on the
page, which keeps the switch reversible. Configuring TinyMCE itself is outside the scope
of this package.

## Issues

Found an issue or have a feature request? Open an
[issue](https://github.com/editor42com/editor42-jquery/issues) or submit a pull request.
For issues with the editor itself, use the
[Editor42 repository](https://github.com/editor42com/editor42/issues).

## License

MIT. See [LICENSE.txt](LICENSE.txt).
