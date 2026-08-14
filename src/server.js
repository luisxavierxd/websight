import http from 'node:http';
import { renderPage } from './render.js';

const ROUTE = '/api/v1/skills/websight/render';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { reject(new Error('body JSON inválido')); }
    });
    req.on('error', reject);
  });
}

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(body);
}

export function createServer() {
  return http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== ROUTE) {
      return send(res, 404, { error: 'not found' });
    }
    let body;
    try {
      body = await readJson(req);
    } catch (err) {
      return send(res, 400, { error: err.message });
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return send(res, 400, { error: 'body debe ser un objeto JSON' });
    }
    const viewport = body.viewport ?? 'desktop';
    if (viewport !== 'mobile' && viewport !== 'desktop') {
      return send(res, 400, { error: `viewport inválido: "${viewport}"` });
    }
    if (!body.target_url) {
      return send(res, 400, { error: 'falta target_url' });
    }
    try {
      const { dataUri } = await renderPage({
        target: body.target_url,
        viewport,
        delayMs: Number(body.delay_ms) || 0
      });
      return send(res, 200, { type: 'image_url', image_url: { url: dataUri } });
    } catch (err) {
      return send(res, 500, { error: err.message });
    }
  });
}

export function startServer(port) {
  const server = createServer();
  server.listen(port, () => {
    process.stderr.write(`[websight] escuchando en http://localhost:${port}${ROUTE}\n`);
  });
  return server;
}
