import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldRenderCoverView } from '../cover-view.js';

test('표지 전용 view는 표지가 선택되고 이미지가 있을 때만 렌더한다', () => {
  assert.equal(shouldRenderCoverView(false, 'blob:cover'), false);
  assert.equal(shouldRenderCoverView(true, ''), false);
  assert.equal(shouldRenderCoverView(true, 'blob:cover'), true);
});
