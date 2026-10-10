import { test, expect } from '@playwright/test';
import { setTheme } from './ui-helpers.js';
import { mockApprovedSession } from './approved-session.js';

test('style dialog aligns fields and stays usable in light/dark and narrow screens', async ({ page }) => {
  await mockApprovedSession(page);
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.locator('.new-book').click();
  await page.locator('#add').click();
  await page.waitForFunction(() => document.querySelector('.ProseMirror') && window.epubMonacoEditor);
  await expect(page.getByRole('button', {name:'스타일 설정',exact:true})).toHaveCount(0);
  const dialog = page.getByRole('dialog', {name:'텍스트 스타일 설정'});
  for (const theme of ['light','dark']) {
    await setTheme(page, theme);
    for (const width of [1600,390]) {
      await page.setViewportSize({width,height:900});
      await page.locator('[data-heading]').selectOption('add-style');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('[name=style]')).toHaveValue('new');
      await expect(dialog.locator('[name=style]')).toBeFocused();
      await dialog.locator('[name=style]').selectOption('h1');
      await expect(dialog.locator('[name=label]')).toHaveValue('제목 1');
      const boxes = await dialog.evaluate(node => {
        const rect = element => {const r=element.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,height:r.height};};
        const rows = [...node.querySelectorAll('.style-field')].map(row => ({
          label:rect(row.querySelector(':scope > span,:scope > label')),
          input:rect(row.querySelector(':scope > input,:scope > select,:scope > .style-target-kind,:scope > .style-shortcut-control input')),
        }));
        return {dialog:rect(node),rows,
          overflow:node.scrollWidth-node.clientWidth};
      });
      expect(boxes.overflow).toBe(0);
      expect(boxes.dialog.x).toBeGreaterThanOrEqual(15);
      expect(boxes.dialog.right).toBeLessThanOrEqual(width-15);
      for (const {input:box} of boxes.rows) {
        expect(Math.abs(box.x-boxes.rows[0].input.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(box.right-boxes.rows[0].input.right)).toBeLessThanOrEqual(1);
        expect(box.height).toBe(40);
      }
      for (const {label,input} of boxes.rows) {
        expect(Math.abs(label.x-boxes.rows[0].label.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(label.y+label.height/2-input.y-input.height/2)).toBeLessThanOrEqual(1);
      }
      await page.screenshot({path:test.info().outputPath(`style-dialog-${theme}-${width}.png`)});
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
    await page.setViewportSize({width:1600,height:900});
  }
  // Footer stays reachable even when the fields require scrolling.
  await page.setViewportSize({width:390,height:560});
  await page.locator('[data-heading]').selectOption('add-style');
  await expect(dialog.getByRole('button',{name:'저장',exact:true})).toBeInViewport();
  await dialog.getByRole('button',{name:'닫기',exact:true}).click();
});

test('toolbar uses edge space and shows gradient overlays only in scrollable directions', async ({ page }) => {
  await mockApprovedSession(page);
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.locator('.new-book').click();
  await page.locator('#add').click();
  await page.waitForFunction(() => document.querySelector('.ProseMirror'));
  const toolbar = page.locator('.rich-toolbar');
  const previous = page.getByRole('button',{name:'이전 편집 도구 보기'});
  const next = page.getByRole('button',{name:'다음 편집 도구 보기'});
  const fades = () => page.locator('.toolbar-viewport').evaluate(node => ({
    before:getComputedStyle(node,'::before').opacity, after:getComputedStyle(node,'::after').opacity,
    background:getComputedStyle(node,'::after').backgroundImage,
  }));
  for (const width of [1600,390]) {
    await page.setViewportSize({width,height:1000});
    await toolbar.evaluate(node => {node.scrollLeft=0;});
    await expect(previous).not.toBeVisible();
    await expect(next).toBeVisible();
    await expect.poll(async () => (await fades()).before).toBe('0');
    await expect.poll(async () => (await fades()).after).toBe('1');
    expect((await fades()).background).toContain('linear-gradient');
    const edge = await toolbar.evaluate(node => node.firstElementChild.getBoundingClientRect().left-node.getBoundingClientRect().left);
    expect(edge).toBeLessThanOrEqual(6);
    await next.click();
    await expect(previous).toBeVisible();
    await expect.poll(async () => (await fades()).before).toBe('1');
    await toolbar.evaluate(node => node.scrollTo({left:node.scrollWidth,behavior:'instant'}));
    await expect(next).not.toBeVisible();
    await expect.poll(async () => (await fades()).after).toBe('0');
    const rightEdge = await toolbar.evaluate(node => node.getBoundingClientRect().right-node.lastElementChild.getBoundingClientRect().right);
    expect(rightEdge).toBeLessThanOrEqual(6);
    await page.screenshot({path:test.info().outputPath(`toolbar-end-${width}.png`)});
  }
  await page.setViewportSize({width:3840,height:1080});
  await expect(previous).not.toBeVisible();
  await expect(next).not.toBeVisible();
  await expect.poll(async () => (await fades()).before).toBe('0');
  await expect.poll(async () => (await fades()).after).toBe('0');
  const edges = await toolbar.evaluate(node => ({
    left:node.firstElementChild.getBoundingClientRect().left-node.getBoundingClientRect().left,
    right:node.getBoundingClientRect().right-node.lastElementChild.getBoundingClientRect().right,
  }));
  expect(edges.left).toBeLessThanOrEqual(6);
  expect(edges.right).toBeLessThanOrEqual(6);
});

test('preview stays at device size or smaller and hides scrollbars without losing scroll', async ({page}) => {
  await mockApprovedSession(page);
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.epubMonacoEditor && document.querySelector('#phonePreview'));
  await page.setViewportSize({width:1800,height:1600});
  const measure = () => page.locator('#preview').evaluate(node => {
    const frame=node.querySelector('iframe');
    const rect=node.getBoundingClientRect();
    return {width:rect.width,height:rect.height,bottom:rect.bottom,
      stageBottom:node.parentElement.getBoundingClientRect().bottom,
      editorBottom:document.querySelector('.editor').getBoundingClientRect().bottom,
      scrollbar:getComputedStyle(node).scrollbarWidth,
      innerScrollbar:frame?.contentDocument ? getComputedStyle(frame.contentDocument.body).scrollbarWidth : null};
  });
  await page.locator('#phonePreview').selectOption('iphone-16');
  await expect.poll(async () => (await measure()).width).toBeLessThanOrEqual(393);
  const full=await measure();
  expect(full.height).toBeLessThanOrEqual(852);
  expect(full.width).toBeGreaterThan(370);
  expect(full.scrollbar).toBe('none');
  if(full.innerScrollbar) expect(full.innerScrollbar).toBe('none');
  await page.setViewportSize({width:1600,height:700});
  await expect.poll(async () => (await measure()).height).toBeLessThan(852);
  const small=await measure();
  expect(Math.abs(small.width/small.height-393/852)).toBeLessThan(.03);
  await page.locator('#phonePreview').selectOption('');
  await expect.poll(async () => Math.abs((await measure()).bottom-(await measure()).stageBottom)).toBeLessThanOrEqual(2);
  const plain=await measure();
  expect(plain.scrollbar).toBe('none');
  if(plain.innerScrollbar) expect(plain.innerScrollbar).toBe('none');
  expect(Math.abs(plain.bottom-plain.editorBottom)).toBeLessThanOrEqual(20);
});
