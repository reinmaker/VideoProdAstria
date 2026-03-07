/**
 * Getting Started — Clip 4: Packs
 * Shows: /packs page overview → hover a pack card → click to open → show pack detail
 * Output: projects/astria-tutorial/public/demos/gs-packs.mp4 (~20s)
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

  // ── 1. Load Packs page ─────────────────────────────────────────────────────
  console.log('Loading /packs...');
  await page.goto('https://www.astria.ai/packs', { waitUntil: 'networkidle' });
  await sleep(2000);
  await inject(page);

  // Screenshot to understand layout
  await page.screenshot({ path: join(__dirname, '../../projects/astria-expansion/explore/packs-page.png') });
  console.log('Screenshot saved.');

  // ── 2. Pan the packs grid ─────────────────────────────────────────────────
  console.log('Panning packs grid...');
  await move(page, 720, 450, 600);
  await sleep(800);

  // Find pack card images by targeting links to /packs/\d+
  const cardPositions = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/packs/"]')) as HTMLAnchorElement[];
    return links
      .filter(a => /\/packs\/\d+/.test(a.href))
      .slice(0, 5)
      .map(a => {
        const r = a.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: r.width, h: r.height };
      })
      .filter(c => c.w > 50 && c.y > 80 && c.y < 850);
  });
  console.log('Card positions:', cardPositions);

  if (cardPositions.length > 0) {
    // Hover over first few cards
    for (const pos of cardPositions.slice(0, 4)) {
      await move(page, pos.x, pos.y, 700);
      await sleep(500);
    }
  } else {
    // Fallback: just pan the page
    await move(page, 300, 350, 1000);
    await sleep(400);
    await move(page, 720, 400, 1000);
    await sleep(400);
    await move(page, 1100, 350, 1000);
    await sleep(400);
  }

  // ── 3. Click first real pack card — use /show URL (not /edit) ────────────
  console.log('Clicking first pack...');
  const firstPackHref = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/packs/"]')) as HTMLAnchorElement[];
    const packLinks = links.filter(a => /\/packs\/\d+/.test(a.href));
    return packLinks.length > 0 ? packLinks[0].href : null;
  });
  console.log('First pack href:', firstPackHref);

  // Build the public show URL (strip /edit suffix)
  const showUrl = firstPackHref
    ? firstPackHref.replace(/\/edit$/, '')
    : null;

  // Navigate to edit page — shows pack config (title, model, prompts)
  const editUrl = firstPackHref || null;
  if (editUrl) {
    // Move cursor toward the card before navigating
    const cardLink = await page.evaluate((href: string) => {
      const a = document.querySelector(`a[href="${href}"]`) as HTMLAnchorElement | null;
      if (a) {
        const r = a.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      }
      return { x: 160, y: 458 };
    }, editUrl);

    await move(page, cardLink.x, cardLink.y, 900);
    await sleep(500);
    await page.mouse.click(cardLink.x, cardLink.y);
    await page.waitForLoadState('networkidle').catch(() => {});
    await sleep(2000);
    await inject(page);

    await page.screenshot({ path: join(__dirname, '../../projects/astria-expansion/explore/pack-detail.png') });
    console.log('Pack page URL:', page.url());

    // Pan the pack edit page — show title, model selector, settings
    await move(page, 720, 300, 800);
    await sleep(600);
    await move(page, 500, 340, 700);
    await sleep(400);
    await move(page, 850, 340, 700);
    await sleep(400);
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: 'smooth' }));
    await sleep(1200);
    await move(page, 540, 450, 800);
    await sleep(500);
    await move(page, 720, 500, 700);
    await sleep(800);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await sleep(1000);
  } else {
    console.log('No pack links found — staying on packs page');
    await move(page, 400, 500, 1000);
    await sleep(600);
    await move(page, 900, 400, 1200);
    await sleep(600);
  }

  await move(page, 720, 400, 800);
  await sleep(2000);

  await context.close();
  await browser.close();
  const videoPath = await page.video()?.path();
  if (videoPath) console.log('\n📹 Video saved:', videoPath);
  console.log('✅ gs-packs done!');
})();
