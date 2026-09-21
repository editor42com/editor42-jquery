import { Assertions, Waiter } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import { setupIntegration } from '../../../main/ts/Integration';
import { EDITOR42_LOCAL, removeAllEngines } from '../Utils';

describe('ApiAliasTest', () => {
  before(setupIntegration);
  after(removeAllEngines);

  it('the editor42 function and both pseudo selectors work', async () => {
    const ce = SugarElement.fromTag('textarea');
    Insert.append(SugarBody.body(), ce);
    try {
      const editors = await $(ce.dom).editor42({ script_url: EDITOR42_LOCAL });
      await Waiter.pTryUntilPredicate('Editor should be initialized', () => editors[0]?.initialized === true);
      try {
        Assertions.assertEq('the element matches :editor42', 1, $(ce.dom).filter(':editor42').length);
        Assertions.assertEq('the element matches the deprecated :tinymce alias', 1, $(ce.dom).filter(':tinymce').length);
        Assertions.assertEq('editor42() with no args returns the instance', true, $(ce.dom).editor42() === editors[0]);
        Assertions.assertEq('the deprecated tinymce() alias returns the instance', true, $(ce.dom).tinymce() === editors[0]);
      } finally {
        editors[0]?.remove();
      }
    } finally {
      Remove.remove(ce);
    }
  });
});
