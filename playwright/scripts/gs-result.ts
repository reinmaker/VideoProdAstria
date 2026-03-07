/**
 * Getting Started — Clip 3: View a Result
 * Shows: hover over generated image → click to open fullscreen → view prompt detail page
 * Output: projects/astria-tutorial/public/demos/gs-result.mp4 (~15s)
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

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--window-size=1440,900'] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: AUTH,
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  // ── 1. Load generate page ──────────────────────────────────────────────────
  console.log('Loading results grid...');
  await page.goto('https://www.astria.ai/set_workspace?workspace=14', { waitUntil: 'networkidle' });
  await page.goto('https://www.astria.ai/prompts', { waitUntil: 'networkidle' });
  await sleep(2000);
  await inject(page);
  await move(page, 720, 400, 500);
  await sleep(1200);

  // ── 2. Find first image card with a loaded image ───────────────────────────
  console.log('Finding first loaded image...');
  const cardPos = await page.evaluate(() => {
    // Look for a turbo-frame with a real loaded image
    const frames = Array.from(document.querySelectorAll('turbo-frame.prompt, turbo-frame[id*="prompt"]'));
    for (const frame of frames) {
      const imgs = Array.from(frame.querySelectorAll('img'));
      const loaded = imgs.find(img => (img as HTMLImageElement).naturalWidth > 50);
      if (loaded) {
        const r = (loaded as HTMLElement).getBoundingClientRect();
        if (r.width > 50 && r.top > 0 && r.top < window.innerHeight) {
          return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
        }
      }
    }
    // Fallback: click first grid item position
    return { x: 175, y: 300 };
  });
  console.log('Card position:', cardPos);

  // ── 3. Hover over the image to reveal the lightbox link ───────────────────
  console.log('Hovering over image...');
  await move(page, cardPos.x, cardPos.y, 1000);
  await sleep(1000);

  // ── 4. Click a.prompt-image via JS to open LIGHTBOX (full-screen view) ────
  // The a.prompt-image links are CSS-hidden until hover — use JS click to bypass
  console.log('Opening lightbox...');
  const lightboxClicked = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a.prompt-image[data-action*="lightbox"]')) as HTMLAnchorElement[];
    if (links.length > 0) {
      links[0].click();
      return 'clicked: ' + (links[0].getAttribute('data-lightbox-src') || 'no src').slice(0, 60);
    }
    return 'no lightbox links found';
  });
  console.log('Lightbox click:', lightboxClicked);
  await sleep(1500);
  await inject(page);

  // ── 5. Show the lightbox / fullscreen image ─────────────────────────────
  console.log('Showing fullscreen image...');
  await move(page, 720, 400, 800);
  await sleep(1200);
  await move(page, 500, 350, 1000);
  await sleep(600);
  await move(page, 900, 500, 800);
  await sleep(800);

  // ── 6. Close lightbox and navigate to prompt detail ────────────────────
  await page.keyboard.press('Escape');
  await sleep(800);

  // Find and click the prompt detail link
  const detailLink = await page.evaluate((pos: { x: number; y: number }) => {
    const el = document.elementFromPoint(pos.x, pos.y);
    let cur = el as HTMLElement | null;
    while (cur && cur.tagName !== 'TURBO-FRAME') cur = cur.parentElement;
    if (cur) {
      const link = cur.querySelector('a[href*="/prompts/"]') as HTMLAnchorElement | null;
      if (link) {
        const r = link.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), href: link.href };
      }
    }
    return null;
  }, cardPos);

  if (detailLink) {
    console.log('Opening prompt detail:', detailLink.href);
    await move(page, detailLink.x, detailLink.y, 600);
    await sleep(300);
    await page.mouse.click(detailLink.x, detailLink.y);
    await page.waitForLoadState('networkidle').catch(() => {});
    await sleep(2000);
    await inject(page);

    // ── 7. Pan the prompt detail page ─────────────────────────────────────
    console.log('Viewing prompt detail...');
    await move(page, 720, 350, 800);
    await sleep(800);
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'smooth' }));
    await sleep(1200);
    await move(page, 500, 400, 1000);
    await sleep(500);
    await move(page, 900, 500, 900);
    await sleep(600);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await sleep(1000);
    await move(page, 720, 350, 800);
    await sleep(1500);
  } else {
    await move(page, 720, 400, 800);
    await sleep(2000);
  }

  await context.close();
  await browser.close();
  const videoPath = await page.video()?.path();
  if (videoPath) console.log('\n📹 Video saved:', videoPath);
  console.log('✅ gs-result done!');
})();
