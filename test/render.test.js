import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { renderPage, resolveTarget, VIEWPORTS } from '../src/render.js';

let dir, htmlPath;

before(() => {
  dir = mkdtempSync(join(tmpdir(), 'ch-'));
  htmlPath = join(dir, 'page.html');
  writeFileSync(htmlPath, '<!doctype html><html><body style="margin:0"><div style="width:100vw;height:100vh;background:#c00"></div></body></html>');
});

after(() => rmSync(dir, { recursive: true, force: true }));

test('resolveTarget convierte ruta absoluta a file://', () => {
  const url = resolveTarget(htmlPath);
  assert.ok(url.startsWith('file://'));
});

test('resolveTarget deja pasar URLs http', () => {
  assert.equal(resolveTarget('http://localhost:3000'), 'http://localhost:3000');
});

test('resolveTarget rechaza rutas relativas', () => {
  assert.throws(() => resolveTarget('./rel/path.html'), /absoluta|absolute|URL/i);
});

test('renderPage captura un archivo local y devuelve data-uri JPEG', async () => {
  const { dataUri, bytes, width } = await renderPage({ target: htmlPath, viewport: 'mobile' });
  assert.ok(dataUri.startsWith('data:image/jpeg;base64,'));
  assert.ok(bytes > 0);
  assert.ok(width <= 1080);
  assert.ok(width <= VIEWPORTS.mobile.width);
});

test('renderPage rechaza viewport inválido', async () => {
  await assert.rejects(() => renderPage({ target: htmlPath, viewport: 'tablet' }), /viewport/i);
});
