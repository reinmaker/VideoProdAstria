/**
 * Getting Started — Clip 1: Dashboard Tour
 * Narration (25.5s at 1.74x = 47s raw recording):
 *   0-7.8s raw  → "This is the Sacks workspace — results fill the grid..."
 *   7.8-13s raw → "Top left, the workspace switcher..."
 *   13-21s raw  → "At the bottom, the prompt bar..."
 *   21-31s raw  → "And here in the nav — the AI assistant. Click it..."
 *   31-47s raw  → "It covers everything: creative ideas..."  (+ click "+" for new chat)
 */
import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH = join(__dirname, '../../projects/astria-expansion/explore/auth.json');
const OUT  = join(__dirname, '../../projects/astria-tutorial/public/demos');

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
async function move(page: any, x: number, y: number, ms = 500) {
  await page.mouse.move(x, y, { steps: Math.max(20, Math.round(ms / 16)) });
}
async function inject(page: any) {
  await page.evaluate(() => {
    if (document.getElementById('__cursor')) return;
    const s = document.createElement('style');
    s.textContent = `
      #__cursor {
        position: fixed !important; width: 16px !important; height: 16px !important;
        background: #FF3300 !important; border: 2px solid #fff !important;
        border-radius: 50% !important;
        box-shadow: 0 0 0 1.5px rgba(255,51,0,0.5), 0 2px 6px rgba(0,0,0,0.5) !important;
        pointer-events: none !important; z-index: 2147483647 !important;
        transform: translate(-50%,-50%) !important; left: -200px; top: -200px;
      }
      @keyframes __ripple {
        0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 0.9; }
        100% { transform: translate(-50%,-50%) scale(2.8); opacity: 0; }
      }
      .__ring {
        position: fixed !important; width: 30px !important; height: 30px !important;
        border: 2px solid #FF3300 !important; border-radius: 50% !important;
        pointer-events: none !important; z-index: 2147483646 !important;
        animation: __ripple 0.45s ease-out forwards !important;
      }
    `;
    document.head.appendChild(s);
    const dot = document.createElement('div');
    dot.id = '__cursor';
    document.body.appendChild(dot);
    document.addEventListener('mousemove', e => {
      dot.style.left = e.clientX + 'px';
      dot.style.top  = e.clientY + 'px';
    }, { passive: true, capture: true });
    document.addEventListener('mousedown', e => {
      const r = document.createElement('div');
      r.className = '__ring';
      r.style.left = e.clientX + 'px';
      r.style.top  = e.clientY + 'px';
      document.body.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    }, { passive: true, capture: true });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--window-size=1440,900'] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: AUTH,
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  // Load Sacks workspace
  await page.goto('https://www.astria.ai/set_workspace?workspace=14', { waitUntil: 'networkidle' });
  await page.goto('https://www.astria.ai/prompts', { waitUntil: 'networkidle' });
  await sleep(1500);
  await inject(page);
  // Cursor starts off-screen; bring it into frame
  await move(page, 720, 450, 400);
  await sleep(300); // ~2s elapsed

  // ── BEAT 1 (raw 0-8s): Grid pan — "This is the Sacks workspace, results fill the grid" ──
  console.log('Beat 1: Grid pan...');
  await move(page, 200, 280, 1500);
  await sleep(400);
  await move(page, 520, 250, 1200);
  await sleep(400);
  await move(page, 850, 300, 1200);
  await sleep(400);
  await move(page, 1150, 270, 1000);
  await sleep(400);
  await move(page, 720, 480, 1200);
  await sleep(500); // ~8s total elapsed ✓

  // ── BEAT 2 (raw 8-13s): Workspace switcher — "Top left, the workspace switcher" ──
  console.log('Beat 2: Workspace switcher...');
  const wsWrapper = page.locator('.ts-wrapper').first();
  const wsBB = await wsWrapper.boundingBox();
  const wcx = wsBB ? wsBB.x + wsBB.width / 2 : 140;
  const wcy = wsBB ? wsBB.y + wsBB.height / 2 : 44;
  await move(page, wcx, wcy, 800);
  await sleep(300);
  await page.mouse.click(wcx, wcy);
  await sleep(700);
  // Hover over 2-3 options quickly
  const opts = await page.locator('.ts-dropdown .option').all();
  for (const opt of opts.slice(0, 3)) {
    const bb = await opt.boundingBox();
    if (bb) { await move(page, bb.x + 60, bb.y + bb.height / 2, 350); await sleep(250); }
  }
  await page.keyboard.press('Escape');
  await sleep(500); // ~13s elapsed ✓

  // ── BEAT 3 (raw 13-21s): Prompt bar — "At the bottom, the prompt bar" ──
  console.log('Beat 3: Prompt bar...');
  await move(page, 720, 600, 1000);
  await sleep(400);
  await move(page, 720, 780, 1000);
  await sleep(400);
  await move(page, 720, 857, 800);
  await sleep(600);
  // Scan bar left to right
  await move(page, 200, 857, 1000);
  await sleep(350);
  await move(page, 600, 857, 900);
  await sleep(350);
  await move(page, 1000, 857, 900);
  await sleep(350);
  await move(page, 1257, 857, 700);
  await sleep(500); // ~21s elapsed ✓

  // ── BEAT 4 (raw 21-31s): AI assistant — "And here in the nav — the AI assistant" ──
  console.log('Beat 4: AI assistant button...');
  // Drift cursor upward to nav area
  await move(page, 1257, 500, 800);
  await sleep(300);
  await move(page, 1257, 200, 700);
  await sleep(300);

  // Find the AI assistant button
  const aiBtn = await page.evaluate(() => {
    const el = document.querySelector('[aria-label="AI assistant"]') as HTMLElement | null;
    if (el) {
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    }
    return { x: 1267, y: 60 };
  });
  console.log('AI button at:', aiBtn);

  await move(page, aiBtn.x, aiBtn.y, 600);
  await sleep(500);
  // Click it
  await page.mouse.click(aiBtn.x, aiBtn.y);
  await sleep(2500); // wait for sidebar to open
  await inject(page);
  await sleep(500); // ~31s elapsed ✓

  // ── BEAT 5 (raw 31-47s): Sidebar — "It covers everything..." + click "+" new chat ──
  console.log('Beat 5: AI sidebar...');

  // Locate the sidebar
  const sidebar = await page.evaluate(() => {
    const selectors = ['.chat-sidebar', '[class*="chat-sidebar"]', '[class*="chat_sidebar"]'];
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 50) return { left: r.left, top: r.top, cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2), w: r.width };
      }
    }
    return { left: 1020, top: 60, cx: 1230, cy: 450, w: 420 };
  });
  console.log('Sidebar:', sidebar);

  // Pan top of sidebar to show the header / new chat area
  await move(page, sidebar.cx, sidebar.top + 40, 700);
  await sleep(800);

  // Find and click the "+" new chat button (NOT the X close button)
  console.log('Looking for + new chat button...');
  const newChatBtn = await page.evaluate((sb: { left: number, top: number }) => {
    const allBtns = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];

    // 1. Try: find "New chat" label/element then pick adjacent button
    const allEls = Array.from(document.querySelectorAll('*')) as HTMLElement[];
    const newChatLabel = allEls.find(el =>
      el.children.length === 0 && // leaf node
      (el.textContent || '').trim().toLowerCase() === 'new chat' &&
      el.getBoundingClientRect().left > sb.left
    );
    if (newChatLabel) {
      const lr = newChatLabel.getBoundingClientRect();
      // Find the button immediately to the right of "New chat" text
      const rightBtn = allBtns.find(btn => {
        const br = btn.getBoundingClientRect();
        return br.left > lr.right - 10 && br.left < lr.right + 80 &&
               Math.abs(br.top - lr.top) < 30;
      });
      if (rightBtn) {
        const r = rightBtn.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), found: 'right-of-new-chat' };
      }
    }

    // 2. Try aria-label / text for + or new chat explicitly
    const explicit = allBtns.find(btn => {
      const r = btn.getBoundingClientRect();
      if (r.left < sb.left - 20 || r.top > 200) return false;
      const text = (btn.textContent || '').trim();
      const label = (btn.getAttribute('aria-label') || '').toLowerCase();
      return text === '+' || label.includes('new chat') || label.includes('compose') || label === 'new';
    });
    if (explicit) {
      const r = explicit.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), found: explicit.getAttribute('aria-label') || explicit.textContent?.trim() };
    }

    // 3. Fallback: small buttons in sidebar header, sorted by x — pick SECOND-to-last
    // (rightmost = X close, second-to-last = + new chat)
    const smallBtns = allBtns.filter(btn => {
      const r = btn.getBoundingClientRect();
      return r.left > sb.left && r.top > 40 && r.top < 150 && r.width < 60;
    });
    if (smallBtns.length >= 2) {
      smallBtns.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
      // Second from right = index [length - 2]
      const plusBtn = smallBtns[smallBtns.length - 2];
      const r = plusBtn.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), found: 'second-from-right: ' + (plusBtn.textContent?.trim() || '?') };
    }
    if (smallBtns.length === 1) {
      const r = smallBtns[0].getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), found: 'only-btn' };
    }
    return null;
  }, { left: sidebar.left, top: sidebar.top });

  console.log('New chat button:', newChatBtn);

  if (newChatBtn) {
    await move(page, newChatBtn.x, newChatBtn.y, 700);
    await sleep(400);
    await page.mouse.click(newChatBtn.x, newChatBtn.y);
    await sleep(1500);
    await inject(page);
  }

  // Pan the sidebar content — show quick-start options or chat input
  await move(page, sidebar.cx, sidebar.top + 150, 800);
  await sleep(600);
  await move(page, sidebar.cx, sidebar.top + 350, 900);
  await sleep(600);
  await move(page, sidebar.cx, sidebar.top + 550, 900);
  await sleep(600);
  await move(page, sidebar.cx, sidebar.top + 300, 800);
  await sleep(1200);
  // Settle
  await move(page, sidebar.cx, sidebar.cy, 700);
  await sleep(2000); // ~47s elapsed ✓

  await context.close();
  await browser.close();

  const videoPath = await page.video()?.path();
  if (videoPath) console.log('\n📹 Video saved:', videoPath);
  console.log('✅ gs-dashboard done!');
})();
