import sharp from 'sharp';

/**
 * Redimensiona un PNG a un máximo de `maxLongSide` px en el lado más largo
 * (solo reduce, nunca amplía) y lo codifica como JPEG.
 * @param {Buffer} pngBuffer
 * @param {{ maxLongSide?: number, quality?: number }} [opts]
 * @returns {Promise<{ buffer: Buffer, width: number, height: number, bytes: number }>}
 */
export async function optimizeToJpeg(pngBuffer, opts = {}) {
  const maxLongSide = opts.maxLongSide ?? 1080;
  const quality = opts.quality ?? 80;

  const pipeline = sharp(pngBuffer)
    .resize(maxLongSide, maxLongSide, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality });

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height, bytes: data.length };
}
