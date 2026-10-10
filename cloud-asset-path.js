// Storage object keys are ASCII-only; the original names remain in the draft and EPUB.
export async function cloudAssetPath(ownerId, title, name) {
  const digest = async value => Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))),
    byte => byte.toString(16).padStart(2, '0'),
  ).join('');
  return `${ownerId}/${await digest(title)}/${await digest(name)}`;
}

export function immutableAssetPath(ownerId, projectId, hash) {
  if (![ownerId, projectId].every(value => /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)) || !/^[0-9a-f]{64}$/.test(hash)) throw new Error('Invalid asset identity');
  return `${ownerId}/projects/${projectId}/${hash}`;
}

export async function savedAssetPath(ownerId, draft, asset) {
  if (!asset.storagePath) return cloudAssetPath(ownerId, draft.title, asset.name);
  if (asset.storagePath !== immutableAssetPath(ownerId, draft.projectId, asset.hash)) throw new Error('Invalid asset reference');
  return asset.storagePath;
}
