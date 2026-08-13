import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { optimizeToJpeg } from '../src/optimize.js';

// PNG sintético de 2000x1000 (lado largo > 1080) para forzar reducción.
async function makePng(width, height) {
  return sharp({
    create: { width, height, channels: 3, background: { r: 10, g: 20, b: 30 } }
  }).png().toBuffer();
}

test('reduce el lado largo a 1080 preservando aspecto', async () => {
  const png = await makePng(2000, 1000);
  const { buffer, width, height, bytes } = await optimizeToJpeg(png);
  assert.equal(width, 1080);
  assert.equal(height, 540);
  assert.ok(bytes > 0);
  assert.equal(bytes, buffer.length);
  // Cabecera JPEG: 0xFF 0xD8
  assert.equal(buffer[0], 0xff);
  assert.equal(buffer[1], 0xd8);
});

test('no amplía imágenes ya pequeñas', async () => {
  const png = await makePng(400, 300);
  const { width, height } = await optimizeToJpeg(png);
  assert.equal(width, 400);
  assert.equal(height, 300);
});

test('respeta maxLongSide personalizado', async () => {
  const png = await makePng(2000, 1000);
  const { width } = await optimizeToJpeg(png, { maxLongSide: 500 });
  assert.equal(width, 500);
});
