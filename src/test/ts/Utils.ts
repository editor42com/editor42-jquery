
import { Waiter } from '@ephox/agar';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import type { Editor } from 'editor42';
import { reinitializeLoader } from '../../main/ts/Editor42';

export const createEditor = async (action: (targetElm: JQuery<HTMLElement>, editors: Editor) => void | Promise<void>) => {
  // TinyMCE must be in the document to work
  const ce = SugarElement.fromTag('textarea');
  Insert.append(SugarBody.body(), ce);

  try {
    const targetElm = $(ce.dom);
    // editor42 is the primary engine under test; DualEngineTest covers the tinymce
    // fallback.
    const editors = await targetElm.tinymce({
      script_url: EDITOR42_LOCAL,
    });

    await Waiter.pTryUntilPredicate('Editor should be initialized', () => editors[0]?.initialized === true);

    try {
      const maybeAsync = action(targetElm, editors[0]);
      if (maybeAsync) {
        await maybeAsync;
      }
    } finally {
      editors[0]?.remove();
    }
  } finally {
    Remove.remove(ce);
  }
};

export const createHTML = async (html: string, action: (root: HTMLElement) => void | Promise<void>) => {
  const ce = SugarElement.fromHtml<HTMLElement>(html);
  Insert.append(SugarBody.body(), ce);

  try {
    const maybeAsync = action(ce.dom);
    if (maybeAsync) {
      await maybeAsync;
    }
  } finally {
    Remove.remove(ce);
  }
};

export const removeTinymce = () => {
  const tinymceScriptTags = document.querySelectorAll('script[src*="tinymce"]');
  tinymceScriptTags.forEach((script) => script.remove());
  delete (window as any).tinymce;
  delete (window as any).tinyMCE;
};

export const EDITOR42_LOCAL = '/project/node_modules/editor42/editor42.min.js';
export const TINYMCE_LOCAL = '/project/node_modules/tinymce/tinymce.js';

// Drop editor42 (and the shim aliases it may have installed) so a following test can
// load the engine it actually asked for.
export const removeEditor42 = () => {
  const w = window as any;
  document.querySelectorAll('script[src*="editor42"]').forEach((script) => script.remove());
  document.querySelectorAll('link[href*="editor42"]').forEach((link) => link.remove());
  if (w.tinymce !== undefined && w.tinymce === w.editor42) {
    delete w.tinymce;
  }
  if (w.tinyMCE !== undefined && w.tinyMCE === w.editor42) {
    delete w.tinyMCE;
  }
  delete w.editor42;
  delete w.EDITOR42_NO_SHIM;
};

// Full engine sweep so every test file is self-cleaning whatever order files run in.
export const removeAllEngines = () => {
  reinitializeLoader();
  removeEditor42();
  removeTinymce();
};

export const pLoadEditor42Script = (options: { noShim?: boolean } = {}): Promise<void> => {
  removeEditor42();
  if (options.noShim) {
    (window as any).EDITOR42_NO_SHIM = true;
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = EDITOR42_LOCAL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('failed to load ' + EDITOR42_LOCAL));
    document.head.appendChild(script);
  });
};
