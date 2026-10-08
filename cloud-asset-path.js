// Storage object keys are ASCII-only; the original names remain in the draft and EPUB.
export async function cloudAssetPath(ownerId, title, name) {
  const digest = async value => Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))),
    byte => byte.toString(16).padStart(2, '0'),
  ).join('');
  return `${ownerId}/${await digest(title)}/${await digest(name)}`;
}
