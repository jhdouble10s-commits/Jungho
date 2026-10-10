import {
  createElement, BookOpen, PanelLeftClose, PanelLeftOpen, Menu, X,
  FolderOpen, Settings, UserRound, ChevronRight, Trash2,
} from 'https://cdn.jsdelivr.net/npm/lucide@1.52.0/+esm';
import { createFocusTrap } from 'https://cdn.jsdelivr.net/npm/focus-trap@8.2.3/+esm';

// shadcn Sidebar's Header / Content / Group / Footer composition, adapted to
// this non-React app. Native details/dialog own disclosure/modality; focus-trap
// keeps keyboard navigation within the mobile drawer (including Shift+Tab).
// Actions are supplied by the app; this module never reads/writes BookProject.
const preferenceKey = 'epub-sidebar-expanded';

function icon(node) {
  return createElement(node, { width:18, height:18, 'stroke-width':1.7, 'aria-hidden':'true', focusable:'false' });
}

function element(tag, className) {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

// Preserve the actual button (and its listeners); only its presentation changes.
function decorate(button, label, glyph) {
  button.classList.add('sb-menu-button');
  button.title = label;
  if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', label);
  const text = element('span', 'sb-label');
  text.textContent = label;
  button.replaceChildren(icon(glyph), text);
  return button;
}

export function mountAppSidebar({ app, side, main, nodes }) {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = '/sidebar.css?v=20261008-76';
  document.head.append(stylesheet);

  app.classList.add('epub-sidebar-layout');
  side.id = 'app-sidebar';
  side.dataset.sidebar = 'sidebar';
  side.dataset.collapsible = 'icon';
  side.setAttribute('aria-label', 'JH Studio 작업공간');

  const header = element('header', 'sb-header');
  header.dataset.sidebar = 'header';
  const brand = element('div', 'sb-brand');
  const mark = element('span', 'sb-brand-mark');
  mark.textContent = 'J';
  mark.setAttribute('aria-hidden', 'true');
  const brandText = element('span', 'sb-label');
  brandText.textContent = 'JH Studio';
  brand.append(mark, brandText);
  const toggle = element('button', 'sidebar-toggle sb-icon-button');
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', side.id);
  header.append(brand, toggle);

  const content = element('nav', 'sb-content');
  content.dataset.sidebar = 'content';
  content.setAttribute('aria-label', '전자책 도구');
  const caption = element('div', 'sb-group-label');
  caption.textContent = '작업공간';
  content.append(caption);
  const group = element('details', 'sb-group');
  group.open = true;
  const summary = decorate(element('summary', ''), 'EPUB MAKE', BookOpen);
  summary.dataset.active = 'true';
  summary.setAttribute('aria-current', 'page');
  summary.append(icon(ChevronRight));
  summary.lastChild.classList.add('sb-chevron');
  summary.addEventListener('click', event => {
    if (!mobile.matches && !expanded) {
      event.preventDefault(); setExpanded(true); group.open = true;
    }
  });
  const projects = element('section', 'sb-projects sb-submenu');
  const projectToggle = decorate(nodes.projects, '프로젝트', FolderOpen);
  projectToggle.classList.remove('active');
  projectToggle.append(icon(ChevronRight));
  projectToggle.lastChild.classList.add('sb-chevron');
  nodes.drafts.id = 'sidebar-project-list';
  projectToggle.setAttribute('aria-controls', nodes.drafts.id);
  projects.append(projectToggle, nodes.drafts);
  group.append(summary, projects);
  content.append(group);

  const footer = element('footer', 'sb-footer');
  footer.dataset.sidebar = 'footer';
  const themes = side.querySelector('.theme-settings');
  decorate(themes.querySelector('.settings-button'), '설정', Settings);
  const accountIcon = icon(UserRound);
  accountIcon.classList.add('sb-account-icon');
  nodes.account.prepend(accountIcon);
  const accountButton = nodes.account.querySelector('.account-button');
  accountButton.classList.add('sb-menu-button');
  const syncAccountLabel = () => {
    accountButton.title = accountButton.textContent;
    accountButton.setAttribute('aria-label', accountButton.textContent);
  };
  new MutationObserver(syncAccountLabel).observe(accountButton, { childList:true });
  syncAccountLabel();
  footer.append(themes, nodes.account);

  // Only obsolete presentation is removed. Existing actionable nodes were moved.
  side.querySelector('.brand')?.remove();
  side.querySelector('.tip')?.remove();
  const legacyTabs = side.querySelector('.tabs');
  if (legacyTabs) legacyTabs.hidden = true;
  side.prepend(header);
  side.append(content, footer);

  const mobile = matchMedia('(max-width:700px)');
  let stored;
  try { stored = localStorage.getItem(preferenceKey); } catch { /* unavailable storage */ }
  let expanded = stored === null || stored === undefined ? !matchMedia('(max-width:1050px)').matches : stored === 'true';
  const drawer = element('dialog', 'sb-drawer');
  drawer.setAttribute('aria-label', '작업공간 메뉴');
  document.body.append(drawer);
  const mobileTrigger = element('button', 'sb-mobile-trigger sb-icon-button');
  mobileTrigger.type = 'button';
  mobileTrigger.title = '메뉴 열기';
  mobileTrigger.setAttribute('aria-label', '메뉴 열기');
  mobileTrigger.setAttribute('aria-controls', side.id);
  mobileTrigger.setAttribute('aria-expanded', 'false');
  mobileTrigger.append(icon(Menu));
  main.prepend(mobileTrigger);
  const drawerFocus = createFocusTrap(side, {
    initialFocus:toggle, delayInitialFocus:false, preventScroll:true,
    escapeDeactivates:false, allowOutsideClick:true,
    // Native dialog restores the opener. A delayed second restore would steal
    // focus from an API settings dialog opened by a menu action.
    returnFocusOnDeactivate:false,
  });
  function closeDrawer() {
    drawerFocus.deactivate();
    drawer.close();
  }

  function renderLayout() {
    const state = mobile.matches || expanded ? 'expanded' : 'collapsed';
    app.dataset.sidebarState = state;
    side.dataset.state = state;
    const label = mobile.matches ? '메뉴 닫기' : expanded ? '사이드바 접기' : '사이드바 펼치기';
    toggle.title = label;
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-expanded', String(state === 'expanded'));
    toggle.replaceChildren(icon(mobile.matches ? X : expanded ? PanelLeftClose : PanelLeftOpen));
  }
  function setExpanded(value) {
    expanded = value;
    try { localStorage.setItem(preferenceKey, String(value)); } catch { /* layout still works */ }
    renderLayout();
  }
  toggle.addEventListener('click', () => mobile.matches ? closeDrawer() : setExpanded(!expanded));
  projectToggle.addEventListener('click', () => {
    if (!mobile.matches && !expanded) setExpanded(true);
  });
  mobileTrigger.addEventListener('click', () => {
    drawer.showModal();
    drawerFocus.activate();
    mobileTrigger.setAttribute('aria-expanded', 'true');
  });
  drawer.addEventListener('cancel', () => drawerFocus.deactivate());
  drawer.addEventListener('close', () => {
    drawerFocus.deactivate();
    mobileTrigger.setAttribute('aria-expanded', 'false');
  });
  drawer.addEventListener('click', event => { if (event.target === drawer) closeDrawer(); });
  // Close before the existing action runs (e.g. opening the API settings dialog).
  side.addEventListener('click', event => {
    if (mobile.matches && drawer.open && event.target.closest('.settings-button, .draft-item, .account-button')) closeDrawer();
  }, { capture:true });
  function syncViewport() {
    if (drawer.open) closeDrawer();
    if (mobile.matches) drawer.append(side);
    else app.prepend(side);
    renderLayout();
  }
  mobile.addEventListener('change', syncViewport);
  syncViewport();

  const decorateDrafts = () => {
    nodes.drafts.querySelectorAll('.draft-delete').forEach(button => {
      if (!button.querySelector('svg')) button.replaceChildren(icon(Trash2));
    });
  };
  new MutationObserver(decorateDrafts).observe(nodes.drafts, { childList:true });
  decorateDrafts();
}
