/**
 * Action executor — translates the vision model's structured decisions into
 * real Playwright interactions on the page.
 */

/**
 * @param {import('playwright').Page} page       The Playwright page handle.
 * @param {object}  decision                     { action, elementId?, value? }
 * @param {Array}   elements                     Interactive element descriptors.
 * @returns {Promise<{success:boolean, message:string, data?:string, done?:boolean}>}
 */
export async function executeAction(page, decision, elements) {
  const { action, elementId, value } = decision;

  try {
    switch (action) {
      /* ── Click ────────────────────────────────────────────── */
      case 'click': {
        const el = elements.find((e) => e.id === elementId);
        if (!el)
          return { success: false, message: `Element [${elementId}] not found` };

        const { x, y, w, h } = el.bbox;
        await page.mouse.click(x + w / 2, y + h / 2);
        await page
          .waitForLoadState('domcontentloaded', { timeout: 5000 })
          .catch(() => {});
        await sleep(500);
        return {
          success: true,
          message: `Clicked [${elementId}] "${el.text || el.name || el.tag}"`,
        };
      }

      /* ── Type ─────────────────────────────────────────────── */
      case 'type': {
        const el = elements.find((e) => e.id === elementId);
        if (!el)
          return { success: false, message: `Element [${elementId}] not found` };

        const { x, y, w, h } = el.bbox;
        // Triple-click to select all existing text, then type to replace
        await page.mouse.click(x + w / 2, y + h / 2, { clickCount: 3 });
        await sleep(100);
        await page.keyboard.type(value || '', { delay: 20 });
        return {
          success: true,
          message: `Typed into [${elementId}] "${el.name || el.placeholder || el.tag}"`,
        };
      }

      /* ── Select ───────────────────────────────────────────── */
      case 'select': {
        const el = elements.find((e) => e.id === elementId);
        if (!el)
          return { success: false, message: `Element [${elementId}] not found` };

        const { x, y, w, h } = el.bbox;
        await page.mouse.click(x + w / 2, y + h / 2);
        await sleep(200);
        await page.keyboard.type(value || '');
        await page.keyboard.press('Enter');
        return { success: true, message: `Selected "${value}" in [${elementId}]` };
      }

      /* ── Scroll ───────────────────────────────────────────── */
      case 'scroll': {
        const dir = (value || 'down').toLowerCase();
        await page.mouse.wheel(0, dir === 'up' ? -600 : 600);
        await sleep(500);
        return { success: true, message: `Scrolled ${dir}` };
      }

      /* ── Navigate ─────────────────────────────────────────── */
      case 'navigate': {
        if (!value)
          return { success: false, message: 'No URL provided for navigate' };
        await page.goto(value, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });
        return { success: true, message: `Navigated to ${value}` };
      }

      /* ── Wait ─────────────────────────────────────────────── */
      case 'wait': {
        const seconds = Math.min(Math.max(parseInt(value, 10) || 2, 1), 5);
        await sleep(seconds * 1000);
        return { success: true, message: `Waited ${seconds}s` };
      }

      /* ── Extract ──────────────────────────────────────────── */
      case 'extract': {
        const content = await page.evaluate(() => {
          const main =
            document.querySelector('main') ||
            document.querySelector('[role="main"]') ||
            document.querySelector('#content') ||
            document.querySelector('.content') ||
            document.querySelector('article') ||
            document.body;
          return main.innerText.slice(0, 8000);
        });
        return { success: true, message: 'Extracted page content', data: content };
      }

      /* ── Done ─────────────────────────────────────────────── */
      case 'done': {
        return { success: true, message: value || 'Goal achieved', done: true };
      }

      default:
        return { success: false, message: `Unknown action: ${action}` };
    }
  } catch (err) {
    return { success: false, message: `Action failed: ${err.message}` };
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
