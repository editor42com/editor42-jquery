import type { Editor, RawEditorOptions, Editor42 as Editor42Global } from 'editor42';
import { getJquery } from './JQuery';
import { patchJQueryFunctions } from './Patch';
import { loadEditor42, getEditor42Instance } from './Editor42';

export interface RawEditorExtendedSettings extends RawEditorOptions {
  script_url?: string;
  channel?: string;
  api_key?: string;
  selector?: undefined;
  target?: undefined;
  script_loaded?: () => void;
  oninit?: string | AllInitFn;
}

declare global {
  interface JQuery<TElement = HTMLElement> extends Iterable<TElement> {
    editor42(): Editor;
    editor42(settings: RawEditorExtendedSettings): Promise<Editor[]>;
    /** Deprecated alias of editor42(). */
    tinymce(): Editor;
    /** Deprecated alias of editor42(). */
    tinymce(settings: RawEditorExtendedSettings): Promise<Editor[]>;
  }
}

type AllInitFn = (editors: Editor[]) => void;

export const getScriptSrc = (settings: RawEditorExtendedSettings): string => {
  if (typeof settings.script_url === 'string') {
    return settings.script_url;
  } else {
    const channel = typeof settings.channel === 'string' ? settings.channel : '8';
    const apiKey = typeof settings.api_key === 'string' ? settings.api_key : 'no-api-key';
    return `https://cdn.tiny.cloud/1/${apiKey}/tinymce/${channel}/tinymce.min.js`;
  }
};

const getEditors = (tinymce: Editor42Global, self: JQuery<HTMLElement>): Editor[] => {
  const out: Editor[] = [];
  self.each((i, ele) => {
    const ed = tinymce.get(ele.id);
    if (ed != null) {
      out.push(ed);
    }
  });
  return out;
};

const resolveFunction = <F extends Function> (tiny: Editor42Global, fnOrStr: unknown): F | null => {
  if (typeof fnOrStr === 'string') {
    const func: unknown = tiny.resolve(fnOrStr);
    if (typeof func === 'function') {
      const scope = (fnOrStr.indexOf('.') === -1) ? tiny : tiny.resolve(fnOrStr.replace(/\.\w+$/, ''));
      return (func as F).bind(scope);
    }
  } else if (typeof fnOrStr === 'function') {
    return fnOrStr.bind(tiny);
  }
  return null;
};

let patchApplied = false;

const tinymceFn = function (this: JQuery<HTMLElement>, settings?: RawEditorExtendedSettings): Editor | undefined | Promise<Editor[]> {
  // No match then just ignore the call
  if (!this.length) {
    return !settings ? undefined : Promise.resolve([]);
  }

  // Get editor instance
  if (!settings) {
    return getEditor42Instance(this[0]) ?? undefined;
  }

  // Hide textarea to avoid flicker
  this.css('visibility', 'hidden');

  return new Promise<Editor[]>((resolve) => {
    // Load tinymce
    loadEditor42(getScriptSrc(settings), (engine, loadedFromProvidedUrl) => {
      // Execute callback after tinymce has been loaded and before the initialization occurs
      if (loadedFromProvidedUrl && settings.script_loaded) {
        settings.script_loaded();
      }
      // Apply patches to the jQuery object, only once
      if (!patchApplied) {
        patchApplied = true;
        patchJQueryFunctions(getJquery());
      }

      // track how many editors have initialized so we can run a callback
      let initCount = 0;
      const allInitCallback = resolveFunction<AllInitFn>(engine, settings.oninit);
      const allInitialized = () => {
        const editors = getEditors(engine, this);
        if (allInitCallback) {
          allInitCallback(editors);
        }
        resolve(editors);
      };

      // Create an editor instance for each matched node
      this.each((_i, elm) => {

        // Generate unique id for target element if needed
        if (!elm.id) {
          elm.id = engine.DOM.uniqueId();
        }

        // Only init the editor once
        if (engine.get(elm.id)) {
          initCount++;
          return;
        }

        const initInstanceCallback = (editor: Editor) => {
          this.css('visibility', '');
          initCount++;
          const origFn = settings.init_instance_callback;
          if (typeof origFn === 'function') {
            origFn.call(editor, editor);
          }
          if (initCount === this.length) {
            allInitialized();
          }
        };

        // Create editor instance and render it
        engine.init({
          ...settings,
          selector: undefined,
          target: elm,
          init_instance_callback: initInstanceCallback
        }).catch((err) => {
          /* eslint-disable-next-line no-console */
          console.error('editor init failed', err);
        });
      }); // this.each

      if (initCount === this.length) {
        allInitialized();
      }

    }); // load tinymce
  });
};

export const setupIntegration = () => {
  const jq = getJquery();

  // Add the :editor42 pseudo selector to select elements that have been converted into
  // editor instances, so things like $('*:editor42') get all bound elements. :tinymce
  // stays as a deprecated alias. Take advantage of jQuery's createPseudo API in v4
  // while still supporting the older versions.
  const boundPseudo = jq.expr.createPseudo ?
    jq.expr.createPseudo(( _text ) => ( elem ) => !!getEditor42Instance( elem ))
    : (e: Element) => !!getEditor42Instance(e);
  jq.expr.pseudos.editor42 = boundPseudo;
  jq.expr.pseudos.tinymce = boundPseudo;

  // Add an editor42 function for creating editors; tinymce stays as a deprecated alias
  (jq.fn as any).editor42 = tinymceFn;
  (jq.fn as any).tinymce = tinymceFn;
};