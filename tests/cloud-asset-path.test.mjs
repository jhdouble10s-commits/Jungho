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

test('immutable images use project identity and exact content hash, not title/name; cross-owner metadata is refused',async()=>{
  const {immutableAssetPath,savedAssetPath,savedAssetPaths,legacyEncodedAssetPath}=await import('../cloud-asset-path.js');
  const owner='00000000-0000-4000-8000-000000000001',project='10000000-0000-4000-8000-000000000001',hash='a'.repeat(64);
  const path=immutableAssetPath(owner,project,hash);
  assert.notEqual(path,immutableAssetPath(owner,project,'b'.repeat(64)));
  assert.notEqual(path,immutableAssetPath(owner,'10000000-0000-4000-8000-000000000002',hash));
  assert.equal(await savedAssetPath(owner,{projectId:project,title:'renamed'},{storagePath:path,hash}),path);
  await assert.rejects(savedAssetPath('00000000-0000-4000-8000-000000000002',{projectId:project},{storagePath:path,hash}));
  assert.throws(()=>immutableAssetPath(owner,'../bad',hash));
  const legacyDraft={projectId:project,title:'이전 저장본'};
  const legacyAsset={name:'표지 이미지.png'};
  assert.deepEqual(await savedAssetPaths(owner,legacyDraft,legacyAsset),[
    await cloudAssetPath(owner,legacyDraft.title,legacyAsset.name),
    legacyEncodedAssetPath(owner,legacyDraft.title,legacyAsset.name),
  ]);
  assert.deepEqual(await savedAssetPaths(owner,{...legacyDraft,title:'이름 변경'}, {storagePath:path,hash}),[path]);
});
