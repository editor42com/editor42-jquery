import { Assertions, Waiter } from '@ephox/agar';
import { after, before, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import type { Editor } from 'editor42';

import { setupIntegration } from '../../../main/ts/Integration';

import { EDITOR42_LOCAL, TINYMCE_LOCAL, pLoadEditor42Script, removeAllEngines } from '../Utils';

// The four page states of the dual-engine contract, plus the shim-off run.
describe('DualEngineTest', () => {
  const w = window as any;

  before(setupIntegration);

  const pCreateEditor = async (settings: Record<string, unknown>, action: (editor: Editor) => void) => {
    const ce = SugarElement.fromTag('textarea');
    Insert.append(SugarBody.body(), ce);
    try {
      const editors = await $(ce.dom).tinymce({ ...settings });
      await Waiter.pTryUntilPredicate('Editor should be initialized', () => editors[0]?.initialized === true);
      try {
        action(editors[0]);
      } finally {
        editors[0]?.remove();
      }
    } finally {
      Remove.remove(ce);
    }
  };

  beforeEach(() => {
    removeAllEngines();
  });

  after(() => {
    removeAllEngines();
  });

  it('editor42 only: the plugin drives editor42', async () => {
    await pLoadEditor42Script();
    await pCreateEditor({}, (editor) => {
      Assertions.assertEq('majorVersion is the TinyMCE 6 api level', '6', w.editor42.majorVersion);
      Assertions.assertEq('minorVersion is 42-family', true, w.editor42.minorVersion.startsWith('42.'));
      Assertions.assertEq('editor belongs to editor42', true, editor.editorManager === w.editor42);
    });
  });

  it('editor42 with the shim disabled still works', async () => {
    await pLoadEditor42Script({ noShim: true });
    Assertions.assertEq('no tinymce alias with EDITOR42_NO_SHIM', undefined, w.tinymce);
    await pCreateEditor({}, (editor) => {
      Assertions.assertEq('editor belongs to editor42', true, editor.editorManager === w.editor42);
    });
  });

  it('real tinymce only: the plugin falls back', async () => {
    await pCreateEditor({ script_url: TINYMCE_LOCAL }, (editor) => {
      Assertions.assertEq('no editor42 global', undefined, w.editor42);
      Assertions.assertEq('editor belongs to tinymce', true, editor.editorManager === w.tinymce);
    });
  });

  it('both engines loaded: editor42 wins and tinymce is not clobbered', async () => {
    await pCreateEditor({ script_url: TINYMCE_LOCAL }, () => undefined);
    await pLoadEditor42Script();
    Assertions.assertEq('tinymce majorVersion is 6', '6', w.tinymce.majorVersion);
    Assertions.assertEq('tinymce is the real one, not the editor42 shim', false, w.tinymce.minorVersion.startsWith('42.'));
    await pCreateEditor({}, (editor) => {
      Assertions.assertEq('editor belongs to editor42', true, editor.editorManager === w.editor42);
    });
  });

  it('loads editor42 via script_url too', async () => {
    await pCreateEditor({ script_url: EDITOR42_LOCAL }, (editor) => {
      Assertions.assertEq('majorVersion is the TinyMCE 6 api level', '6', w.editor42.majorVersion);
      Assertions.assertEq('minorVersion is 42-family', true, w.editor42.minorVersion.startsWith('42.'));
      Assertions.assertEq('editor belongs to editor42', true, editor.editorManager === w.editor42);
    });
  });
});
