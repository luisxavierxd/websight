import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from '../src/server.js';

let server, port, dir, htmlPath;

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'ch-srv-'));
  htmlPath = join(dir, 'page.html');
  writeFileSync(htmlPath, '<!doctype html><html><body style="margin:0"><div style="width:100vw;height:100vh;background:#008"></div></body></html>');
  server = createServer();
  await new Promise((res) => server.listen(0, res));
  port = server.address().port;
});

after(async () => {
  await new Promise((res) => server.close(res));
  rmSync(dir, { recursive: true, force: true });
});

async function post(body) {
  const res = await fetch(`http://127.0.0.1:${port}/api/v1/skills/websight/render`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { status: res.status, json: await res.json() };
}

test('devuelve el bloque image_url de Anthropic', async () => {
  const { status, json } = await post({ target_url: htmlPath, viewport: 'mobile' });
  assert.equal(status, 200);
  assert.equal(json.type, 'image_url');
  assert.match(json.image_url.url, /^data:image\/jpeg;base64,/);
});

test('viewport inválido devuelve 400', async () => {
  const { status, json } = await post({ target_url: htmlPath, viewport: 'tablet' });
  assert.equal(status, 400);
  assert.ok(json.error);
});
