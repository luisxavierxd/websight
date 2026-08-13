#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { renderPage } from './src/render.js';

function parseArgs(argv) {
  const [command, target, ...rest] = argv;
  const opts = { command, target, viewport: 'desktop', delayMs: 0, out: null, base64: false };
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--viewport') opts.viewport = rest[++i];
    else if (a === '--delay-ms') opts.delayMs = Number(rest[++i]);
    else if (a === '--out') opts.out = rest[++i];
    else if (a === '--base64') opts.base64 = true;
    else throw new Error(`argumento desconocido: ${a}`);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.command !== 'render') {
    process.stderr.write('uso: websight render <url|ruta> [--viewport mobile|desktop] [--delay-ms N] [--out FILE] [--base64]\n');
    process.exit(1);
  }
  if (!opts.out && !opts.base64) {
    process.stderr.write('error: especifica --out FILE o --base64\n');
    process.exit(1);
  }
  const { dataUri } = await renderPage({ target: opts.target, viewport: opts.viewport, delayMs: opts.delayMs });
  if (opts.out) {
    const b64 = dataUri.replace(/^data:image\/jpeg;base64,/, '');
    writeFileSync(opts.out, Buffer.from(b64, 'base64'));
    process.stderr.write(`[websight] escrito ${opts.out}\n`);
  }
  if (opts.base64) process.stdout.write(dataUri + '\n');
}

main().catch((err) => {
  process.stderr.write(`error: ${err.message}\n`);
  process.exit(1);
});
