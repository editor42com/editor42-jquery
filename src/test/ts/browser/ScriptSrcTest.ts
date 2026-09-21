import { Assertions } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { getScriptSrc } from '../../../main/ts/Integration';

describe('ScriptSrcTest', () => {
  const aUrl = 'http://example.com/editor42/editor42.min.js';

  it('returns the latest editor42 cdn URL for empty settings', () => {
    Assertions.assertEq('Test empty settings',
      'https://cdn.editor42.com/editor42/latest/editor42.min.js',
      getScriptSrc({}));
  });

  it('uses "script_url" when provided', () => {
    Assertions.assertEq('Test "script_url"',
      aUrl, getScriptSrc({ script_url: aUrl }));
  });

  it('uses "channel" in the cdn URL', () => {
    Assertions.assertEq('Test "channel"',
      'https://cdn.editor42.com/editor42/42.0.0/editor42.min.js',
      getScriptSrc({ channel: '42.0.0' }));
    Assertions.assertEq('Test latest-N alias',
      'https://cdn.editor42.com/editor42/latest-14/editor42.min.js',
      getScriptSrc({ channel: 'latest-14' }));
  });

  it('maps TinyMCE-style channels to latest', () => {
    Assertions.assertEq('Test legacy channel',
      'https://cdn.editor42.com/editor42/latest/editor42.min.js',
      getScriptSrc({ channel: '5.4.2' }));
  });

  it('ignores "api_key" and never puts a key in the URL', () => {
    const src = getScriptSrc({ api_key: 'abcdef0123456789', channel: '7' });
    Assertions.assertEq('Test "api_key" ignored',
      'https://cdn.editor42.com/editor42/latest/editor42.min.js', src);
    Assertions.assertEq('no tiny.cloud', false, src.indexOf('tiny.cloud') !== -1);
    Assertions.assertEq('no key', false, src.indexOf('abcdef0123456789') !== -1 || src.indexOf('no-api-key') !== -1);
  });

  it('"script_url" takes precedence over other options', () => {
    Assertions.assertEq('Test "script_url" with others',
      aUrl, getScriptSrc({ script_url: aUrl, channel: '42.0.0', api_key: 'abcdef0123456789' }));
  });
});
