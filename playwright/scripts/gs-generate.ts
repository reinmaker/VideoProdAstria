/**
 * Getting Started — Clip 2: First Prompt & Generate
 * Shows: click prompt bar → type @ → pick reference → type prompt → generate → wait → result appears
 * Output: projects/astria-tutorial/public/demos/gs-generate.mp4 (~40s)
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

async function findGenerateButton(page: any) {
  return page.evaluate(() => {
    const btn = document.querySelector('button[class*="btn-circle"][class*="btn-primary"], .btn-circle.btn-primary');
    if (btn) {
      const r = (btn as HTMLElement).getBoundingClientRect();
      if (r.width > 0 && r.height > 0)
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    }
    return null;
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

  // ── 1. Load ────────────────────────────────────────────────────────────────
  console.log('Loading...');
  await page.goto('https://www.astria.ai/set_workspace?workspace=14', { waitUntil: 'networkidle' });
  await page.goto('https://www.astria.ai/prompts', { waitUntil: 'networkidle' });
  await sleep(1500);
  await inject(page);
  await move(page, 720, 400, 500);
  await sleep(1000);

  // ── 2. Click the prompt bar ───────────────────────────────────────────────
  console.log('Clicking prompt editor...');
  const editor = page.locator('.tribute-prompt-input').first();
  const editorBB = await editor.boundingBox().catch(() => null);
  let edX = 600, edY = 857;
  if (editorBB) {
    edX = editorBB.x + Math.min(editorBB.width / 2, 300);
    edY = editorBB.y + editorBB.height / 2;
  }

  await move(page, edX, edY, 900);
  await sleep(300);
  await page.mouse.click(edX, edY);
  await sleep(400);

  // Clear any existing chips
  await page.keyboard.press('Meta+a');
  await sleep(100);
  await page.keyboard.press('Delete');
  await sleep(300);

  // ── 3. Type @ to open reference picker ────────────────────────────────────
  console.log('Opening reference picker...');
  await page.keyboard.type('@', { delay: 80 });
  await sleep(2200);

  // Type keyword to filter — "shirt" is reliable in Zara workspace
  await page.keyboard.type('shirt', { delay: 80 });
  await sleep(2000);

  // Hover + click first result
  const pickerItem = await page.evaluate(() => {
    const item = document.querySelector('.tune-picker-item.highlighted, .tune-picker-item');
    if (item) {
      const r = item.getBoundingClientRect();
      if (r.width > 50 && r.height > 20)
        return { x: Math.round(r.x + Math.min(r.width / 2, 150)), y: Math.round(r.y + r.height / 2) };
    }
    return null;
  });
  console.log('Picker item:', pickerItem);

  if (pickerItem) {
    await move(page, pickerItem.x, pickerItem.y, 700);
    await sleep(400);
    await page.mouse.click(pickerItem.x, pickerItem.y);
    await sleep(800);
  } else {
    await page.keyboard.press('Enter');
    await sleep(400);
  }

  // ── 4. Type the prompt ────────────────────────────────────────────────────
  // Press End to move cursor to end of editor (after the reference chip), then type
  console.log('Typing prompt...');
  await page.keyboard.press('End');
  await sleep(300);
  await page.keyboard.type(' editorial fashion photo, model wearing the shirt, outdoor golden hour light, natural background', { delay: 50 });
  await sleep(800);

  // ── 5. Count existing cards ───────────────────────────────────────────────
  const existingCount = await page.evaluate(() =>
    document.querySelectorAll('turbo-frame[id*="prompt"], turbo-frame.prompt').length
  );
  console.log('Existing cards:', existingCount);

  // ── 6. Move to generate button and click ──────────────────────────────────
  console.log('Finding generate button...');
  let genCoords = await findGenerateButton(page);
  if (!genCoords) genCoords = { x: 1257, y: 857 };

  await move(page, genCoords.x, genCoords.y, 1000);
  await sleep(500);
  await page.mouse.click(genCoords.x, genCoords.y);
  await sleep(600);

  // ── 7. Wait for new card & generation ─────────────────────────────────────
  console.log('Waiting for new card...');
  await move(page, 720, 400, 600);

  let generated = false;
  for (let i = 0; i < 90; i++) {
    await sleep(1000);
    const newCount = await page.evaluate(() =>
      document.querySelectorAll('turbo-frame[id*="prompt"], turbo-frame.prompt').length
    );
    if (newCount > existingCount) {
      console.log(`✅ Card appeared after ${i + 1}s`);
      generated = true;
      break;
    }
    if (i === 8) {
      const hasText = await page.evaluate(() => {
        const ed = document.querySelector('.tribute-prompt-input');
        return ed ? (ed as HTMLElement).innerText.trim().length > 10 : false;
      });
      if (hasText) {
        const retryBtn = await findGenerateButton(page);
        if (retryBtn) {
          await move(page, retryBtn.x, retryBtn.y, 400);
          await page.mouse.click(retryBtn.x, retryBtn.y);
        }
      }
    }
  }

  if (generated) {
    // Wait for image to load
    await sleep(5000);
    for (let i = 0; i < 85; i++) {
      await sleep(1000);
      const done = await page.evaluate(() => {
        const first = document.querySelector('turbo-frame.prompt, turbo-frame[id*="prompt"]');
        if (!first) return false;
        return Array.from(first.querySelectorAll('img')).some(
          img => (img as HTMLImageElement).naturalWidth > 50
        );
      });
      if (done) { console.log(`✅ Image loaded after ${i + 6}s`); break; }
    }
    // Move cursor to newest result (top-left of grid)
    await move(page, 175, 300, 800);
    await sleep(3000);
  }

  await context.close();
  await browser.close();
  const videoPath = await page.video()?.path();
  if (videoPath) console.log('\n📹 Video saved:', videoPath);
  console.log('✅ gs-generate done!');
})();
