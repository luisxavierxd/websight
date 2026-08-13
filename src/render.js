import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { isAbsolute } from 'node:path';
import { optimizeToJpeg } from './optimize.js';

export const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 1600 }
};

/**
 * Normaliza el objetivo a una URL. Acepta http(s)://, file:// o una ruta
 * absoluta del sistema. Rechaza rutas relativas.
 * @param {string} target
 * @returns {string}
 */
export function resolveTarget(target) {
  if (/^(https?|file):\/\//i.test(target)) return target;
  if (isAbsolute(target)) return pathToFileURL(target).href;
  throw new Error(`target inválido: usa una URL http(s)/file o una ruta absoluta, no "${target}"`);
}

/**
 * Renderiza una página y devuelve un screenshot optimizado como data-URI JPEG.
 * @param {{ target: string, viewport?: 'mobile'|'desktop', delayMs?: number }} opts
 * @returns {Promise<{ dataUri: string, bytes: number, width: number, height: number }>}
 */
export async function renderPage({ target, viewport = 'desktop', delayMs = 0 }) {
  if (!VIEWPORTS[viewport]) {
    throw new Error(`viewport inválido: "${viewport}" (usa "mobile" o "desktop")`);
  }
  const url = resolveTarget(target);
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: VIEWPORTS[viewport],
      deviceScaleFactor: 1,
      reducedMotion: 'reduce'
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    if (delayMs > 0) await page.waitForTimeout(delayMs);
    const png = await page.screenshot({ type: 'png' });
    const { buffer, width, height, bytes } = await optimizeToJpeg(png);
    process.stderr.write(`[websight] captura ${width}x${height} · ${(bytes / 1024).toFixed(1)} KB\n`);
    return { dataUri: `data:image/jpeg;base64,${buffer.toString('base64')}`, bytes, width, height };
  } finally {
    await browser.close();
  }
}
