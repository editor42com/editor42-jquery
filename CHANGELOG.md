# Change log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## 1.0.0 - 2026-09-21

### Changed
- Forked @tinymce/tinymce-jquery 2.3.0 as @editor42/editor42-jquery, targeting Editor42.
- The bundle is dist/editor42-jquery.js (dist/editor42-jquery.min.js minified) and package main points at it.
- Added the editor42() jquery function and the :editor42 pseudo selector; tinymce() and :tinymce stay registered as deprecated aliases.
- Renamed the identifiers this integration looks for: it resolves the editor42 global and falls back to a stock TinyMCE when that is what the page has loaded.
- The no-script_url fallback loads from https://cdn.editor42.com on the latest channel and TinyMCE-style numeric channels resolve to latest.
- Hardened the loader: a test-only reset hook, and the patched jquery functions no longer throw on a page whose engine was removed after patching.

### Removed
- All API-key and licence-key handling. The api_key setting is still accepted so existing code compiles, but no key is read, stored or sent, and no request reaches a vendor cloud.
- Vendor CI, release tooling and the vendor cloud test matrix.

## 2.3.0 - 2026-05-28

### Changed

- Updated to support jQuery 4. #INT-3359

## 2.2.0 - 2025-10-16

### Fixed
- Editor initialization failure handling. #INT-3365

### Changed
- Set the default cloudChannel to 8. #INT-3357

## 2.1.0 - 2023-03-27

### Fixed
- Updated CI library to latest
- Updated dependencies

## 2.0.0 - 2022-04-08

### Changed
- Set default cloudChannel to 6
- Updated dependencies

## 1.0.1 - 2022-03-15

### Fixed
- Set release version in changelog.

## 1.0.0 - 2022-03-15

### Added
- Initial release of the TinyMCE jQuery integration as a separate node module.

### Changed
- The `$(e).tinymce({...})` now returns a `Promise` of all initialized editors instead of the `this` object.
- The `$(e).tinymce()` now returns `undefined` when no editor is present instead of `null`.

### Fixed
- Removing an element with `$(e).remove()` destroys all contained editors.
- Removing child elements with `$(e).empty()` destroys all contained editors.
- Overwriting an element with `$(e).text(value)` or `$(e).html(value)` destroys all contained editors

### Removed
- Removed the patch on `replaceAll` as it was inconsistent with other functions. Due to this change calling `replaceAll` will not automatically destroy any moved or overwritten TinyMCE instances though they will likely be left in a non-functional state.
- Removed the patch on `replaceWith` as it was inconsistent with other functions. Due to this change calling `replaceWith` will not automatically destroy any moved or overwritten TinyMCE instances though they will likely be left in a non-functional state.
