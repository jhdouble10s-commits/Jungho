import test from 'node:test';
import assert from 'node:assert/strict';
import { nearestPreviousTopLevelId } from '../chapter-hierarchy.js';

test('Shift+→ 대상은 바로 위의 가장 가까운 최상위 장이다', () => {
  const order = ['a', 'a-1', 'b', 'b-1', 'c'];
  const parents = new Map([['a-1', 'a'], ['b-1', 'b']]);
  assert.equal(nearestPreviousTopLevelId(order, parents, 'c'), 'b');
  assert.equal(nearestPreviousTopLevelId(order, parents, 'b-1'), 'b');
  assert.equal(nearestPreviousTopLevelId(order, parents, 'a'), null);
});
