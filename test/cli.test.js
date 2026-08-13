import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

let dir, htmlPath;

before(() => {
  dir = mkdtempSync(join(tmpdir(), 'ch-cli-'));
  htmlPath = join(dir, 'page.html');
  writeFileSync(htmlPath, '<!doctype html><html><body style="margin:0"><div style="width:100vw;height:100vh;background:#080"></div></body></html>');
});

after(() => rmSync(dir, { recursive: true, force: true }));

function runCli(args) {
  return spawnSync('node', ['cli.js', ...args], { encoding: 'utf8' });
}

test('--base64 imprime un data-uri JPEG a stdout', () => {
  const r = runCli(['render', htmlPath, '--viewport', 'mobile', '--base64']);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout.trim(), /^data:image\/jpeg;base64,/);
});

test('--out escribe un archivo JPEG', () => {
  const out = join(dir, 'shot.jpg');
  const r = runCli(['render', htmlPath, '--out', out]);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(out));
  assert.ok(statSync(out).size > 0);
});

test('sin --out ni --base64 falla con exit 1', () => {
  const r = runCli(['render', htmlPath]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /--out|--base64/);
});
