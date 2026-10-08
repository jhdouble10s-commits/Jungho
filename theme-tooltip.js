import { computePosition, autoUpdate, offset, flip, shift } from 'https://cdn.jsdelivr.net/npm/@floating-ui/dom@1.8.0/+esm';

// One themed tooltip, using the original title text. No listeners on individual
// buttons, no click interception, and no changes to EPUB/Monaco document nodes.
export function installThemeTooltips() {
  const tooltip = document.createElement('div');
  tooltip.id = 'app-theme-tooltip';
  tooltip.className = 'app-tooltip';
  tooltip.setAttribute('role','tooltip');
  if ('showPopover' in tooltip) tooltip.setAttribute('popover','manual');
  tooltip.hidden = true;
  document.body.append(tooltip);
  let owner = null, originalTitle = '', describedBy = null, cleanup;
  let generation = 0;
  function hide() {
    generation++;
    cleanup?.(); cleanup = null;
    if (owner) {
      if (!owner.hasAttribute('title')) owner.setAttribute('title',originalTitle);
      if (describedBy === null) owner.removeAttribute('aria-describedby');
      else owner.setAttribute('aria-describedby',describedBy);
    }
    owner = null;
    if (tooltip.hidePopover && tooltip.matches(':popover-open')) tooltip.hidePopover();
    tooltip.hidden = true;
  }
  function target(event) {
    if (!(event.target instanceof Element)) return null;
    if (owner?.contains(event.target)) return owner;
    const node = event.target.closest('[title]');
    if (!node || !node.closest('.app,.side,.gemini-settings-dialog,.chapter-search-panel,.chapter-error-popover') ||
      node.closest('.rich-editor,#preview,.monaco-editor')) return null;
    return node;
  }
  function show(node) {
    if (node === owner) return;
    hide();
    if (!node || !node.title.trim()) return;
    owner = node;
    originalTitle = node.title;
    describedBy = node.getAttribute('aria-describedby');
    node.removeAttribute('title'); // Prevent a duplicate, unthemed native tooltip.
    node.setAttribute('aria-describedby',[describedBy,tooltip.id].filter(Boolean).join(' '));
    tooltip.textContent = originalTitle;
    (node.closest('dialog[open]') || document.body).append(tooltip);
    tooltip.style.visibility = 'hidden';
    tooltip.hidden = false;
    tooltip.showPopover?.();
    const current = generation;
    cleanup = autoUpdate(node, tooltip, () => {
      if (!node.isConnected || !node.getClientRects().length) return hide();
      computePosition(node, tooltip, {
        strategy:'fixed', placement:'top',
        middleware:[offset(8),flip(),shift({padding:8})],
      }).then(({x,y}) => {
        if (owner !== node || current !== generation) return;
        Object.assign(tooltip.style,{left:`${x}px`,top:`${y}px`,visibility:'visible'});
      }).catch(() => { if (owner === node && current === generation) hide(); });
    });
  }
  document.addEventListener('pointerover', event => {
    if (event.buttons) { hide(); return; }
    if (event.pointerType === 'touch' || tooltip.contains(event.target)) return;
    show(target(event));
  });
  document.addEventListener('pointerout', event => {
    if (owner && !owner.contains(event.relatedTarget) && !tooltip.contains(event.relatedTarget)) hide();
  });
  document.addEventListener('focusin', event => show(target(event)));
  document.addEventListener('focusout', hide);
  document.addEventListener('pointerdown', hide, {capture:true});
  document.addEventListener('dragstart', hide, {capture:true});
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  document.addEventListener('close', hide, {capture:true});
  window.addEventListener('blur', hide);
}
