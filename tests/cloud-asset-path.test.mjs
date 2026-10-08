import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudAssetPath } from '../cloud-asset-path.js';

test('Korean titles and filenames produce stable ASCII Storage keys without collisions', async () => {
  const owner = 'eb205327-3994-46f0-b392-58c435c7e644';
  const path = await cloudAssetPath(owner, '인간력', '표지 이미지.jpg');
  assert.match(path, new RegExp(`^${owner}/[a-f0-9]{64}/[a-f0-9]{64}$`));
  assert.equal(path, await cloudAssetPath(owner, '인간력', '표지 이미지.jpg'));
  assert.notEqual(path, await cloudAssetPath(owner, '인간력', '다른 이미지.jpg'));
  assert.notEqual(path, await cloudAssetPath(owner, '다른 책', '표지 이미지.jpg'));
});
