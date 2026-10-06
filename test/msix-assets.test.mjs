import assert from 'node:assert/strict';
import test from 'node:test';
import { createBrandedPng, MSIX_BRAND_ASSET_VERSION } from '../scripts/msix-assets.mjs';

const CASES = [
  ['StoreLogo.png', 50, 50],
  ['Square44x44Logo.png', 44, 44],
  ['Square150x150Logo.png', 150, 150],
  ['Wide310x150Logo.png', 310, 150]
];

function pngDimensions(buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

test('MSIX brand asset version is explicit', () => {
  assert.equal(MSIX_BRAND_ASSET_VERSION, 'ptl-ledger-monogram-v1');
});

test('MSIX certification assets are valid branded PNGs at the declared dimensions', () => {
  const generated = CASES.map(([name, width, height]) => {
    const png = createBrandedPng(width, height);
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${name} must be PNG`);
    assert.deepEqual(pngDimensions(png), { width, height }, `${name} dimensions`);
    assert.ok(png.length > 100, `${name} must contain rendered brand data`);
    return png.toString('base64');
  });

  assert.equal(new Set(generated).size, CASES.length, 'each tile size must have a distinct rendered binary');
});

test('MSIX branded assets reject invalid dimensions', () => {
  assert.throws(() => createBrandedPng(8, 8), /Dimensiones MSIX inválidas/);
});
