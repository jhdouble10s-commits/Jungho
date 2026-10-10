// Dexie serialises read/write transactions across tabs. Compare the revision
// inside that transaction, never against a tab's cached project list.
export async function putLocalProject(db, ownerId, draft, writeAssets = async () => {}) {
  return db.transaction('rw', db.projects, db.assets, async () => {
    const rows = await db.projects.where('ownerId').equals(ownerId).toArray();
    const previous = rows.find(row => row.payload.projectId === draft.projectId);
    const nameCollision = rows.find(row => row.title === draft.title && row !== previous);
    if (nameCollision || (previous?.payload.localRevision || 0) !== (draft.localRevision || 0)) throw new Error('로컬 저장 충돌: 다른 탭의 저장본을 덮어쓰지 않았습니다. 복사본으로 저장하거나 최신 저장본을 확인하세요.');
    const saved = {...draft, localRevision:(draft.localRevision || 0) + 1};
    await writeAssets(previous?.title);
    if (previous && previous.title !== draft.title) await db.projects.delete([ownerId, previous.title]);
    await db.projects.put({ownerId,title:saved.title,payload:saved,updatedAt:saved.updatedAt});
    return saved;
  });
}

export async function deleteLocalProject(db, ownerId, draft) {
  await db.transaction('rw', db.projects, db.assets, async () => {
    const row = await db.projects.get([ownerId,draft.title]);
    if (!row) return;
    if (row.payload.projectId !== draft.projectId || (row.payload.localRevision || 0) !== (draft.localRevision || 0)) throw new Error('다른 탭에서 변경된 저장본입니다. 목록을 다시 열어 주세요.');
    await db.projects.delete([ownerId,draft.title]);
    await db.assets.where('[ownerId+title]').equals([ownerId,draft.title]).delete();
  });
}
