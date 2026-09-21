import type { Editor, Editor42 as Editor42Global } from 'editor42';
import { Global } from './Global';

// Resolve the engine global. Editor42 wins when both engines are on the page; a real
// TinyMCE is a supported fallback so this integration can drive either engine.
const editor42 = (): (Editor42Global | null) => Global.editor42 ?? Global.tinymce ?? null;

export const hasEditor42 = () => !!(editor42());

export const getEditor42 = (): Editor42Global => {
  const engine = editor42();
  if (engine != null) {
    return engine;
  }
  throw new Error('editor42 should have been loaded into global scope');
};

// Returns the editor instance for the specified element or null if it wasn't found
export const getEditor42Instance = (element: Element) => {
  let ed = null;

  if (element && element.id && hasEditor42()) {
    ed = getEditor42().get(element.id);
  }

  return ed;
};

export const withEditor42Instance: {
  <T> (node: HTMLElement, ifPresent: (ed: Editor) => T): (T | void);
  <T> (node: HTMLElement, ifPresent: (ed: Editor) => T, ifMissing: (elem: HTMLElement) => T): T;
} = (node: HTMLElement, ifPresent: (ed: Editor) => any, ifMissing?: (elem: HTMLElement) => any): any => {
  const ed = getEditor42Instance(node);
  if (ed) {
    return ifPresent(ed);
  } else if (ifMissing) {
    return ifMissing(node);
  }
};

enum LoadStatus {
  NOT_LOADING = 0,
  LOADING_STARTED = 1,
  LOADING_FINISHED = 2
}

type EngineCallback = (engine: Editor42Global, loadedFromProvidedUrl: boolean) => void;

let lazyLoading = LoadStatus.NOT_LOADING;
const callbacks: EngineCallback[] = [];

// Only to be used by tests.
export const reinitializeLoader = (): void => {
  lazyLoading = LoadStatus.NOT_LOADING;
  callbacks.length = 0;
};

export const loadEditor42 = (url: string, callback: EngineCallback) => {
  // Load the engine on demand, if we need to
  if (!hasEditor42() && lazyLoading === LoadStatus.NOT_LOADING) {
    lazyLoading = LoadStatus.LOADING_STARTED;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = (e: Event) => {
      if (lazyLoading !== LoadStatus.LOADING_FINISHED && e.type === 'load') {
        lazyLoading = LoadStatus.LOADING_FINISHED;
        const tiny = getEditor42();
        // the original runs the callback function settings.script_loaded
        // when the settings.script_url script has been loaded
        // the second parameter here is to enable that functionality
        // by indicating if the `url` was loaded into the page (true)
        // or an existing global or other script was used (false)
        callback(tiny, true);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < callbacks.length; i++) {
          callbacks[i](tiny, false);
        }
      }
    };
    script.src = url;
    document.body.appendChild(script);
  } else {
    // Delay the init call until the engine is loaded
    if (lazyLoading === LoadStatus.LOADING_STARTED) {
      callbacks.push(callback);
    } else {
      callback(getEditor42(), false);
    }
  }
};