/**
 * Browser management layer — launches Playwright Chromium, takes screenshots,
 * and extracts the set of visible interactive elements on the page.
 */

import { chromium } from 'playwright';

let browserInstance = null;

/**
 * Return a shared Chromium browser instance (launch one if needed).
 */
export async function getBrowser(headless = true) {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browserInstance;
}

/**
 * Open a fresh page in its own BrowserContext so cookies/sessions are isolated.
 */
export async function createPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  });
  return context.newPage();
}

/**
 * Capture a viewport screenshot and return it as a base-64 PNG string.
 */
export async function takeScreenshot(page) {
  const buffer = await page.screenshot({ type: 'png', fullPage: false });
  return buffer.toString('base64');
}

/**
 * Query the DOM for every visible, interactive element and return a compact
 * descriptor array that the vision model can reason about.
 */
export async function getInteractiveElements(page) {
  return page.evaluate(() => {
    const selectors =
      'a, button, input, select, textarea, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [onclick], label[for]';
    const nodeList = document.querySelectorAll(selectors);

    return Array.from(nodeList)
      .map((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;

        const style = window.getComputedStyle(el);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          parseFloat(style.opacity) === 0
        )
          return null;

        // Skip elements entirely outside the viewport
        if (rect.bottom < 0 || rect.top > window.innerHeight) return null;

        return {
          id: idx,
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || '',
          role: el.getAttribute('role') || '',
          name: (
            el.getAttribute('aria-label') ||
            el.getAttribute('name') ||
            el.getAttribute('title') ||
            el.getAttribute('alt') ||
            ''
          ).slice(0, 80),
          text: (el.innerText || el.value || '').trim().slice(0, 80),
          placeholder: el.getAttribute('placeholder') || '',
          href:
            el.tagName === 'A'
              ? (el.getAttribute('href') || '').slice(0, 120)
              : '',
          bbox: {
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
          },
        };
      })
      .filter(Boolean);
  });
}

/**
 * Quick helper — current URL + document title.
 */
export async function getPageInfo(page) {
  return {
    url: page.url(),
    title: await page.title(),
  };
}

/**
 * Shut down the shared browser (useful for cleanup / tests).
 */
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}
