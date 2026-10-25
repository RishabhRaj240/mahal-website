import fs from "fs";
import path from "path";
import zlib from "zlib";

const srcPath = "/Users/rishabraj/.gemini/antigravity-ide/brain/1a8ad465-f9bf-4d36-aab8-fc73dc8d19de/.user_uploaded/media_1792901758350.png";
const projectRoot = "/Users/rishabraj/Mahal Website";

// 1. Read and decode PNG
const buf = fs.readFileSync(srcPath);
let pos = 8, idatBuffers = [];
while (pos < buf.length) {
  const length = buf.readUInt32BE(pos);
  const type = buf.toString("ascii", pos + 4, pos + 8);
  const data = buf.subarray(pos + 8, pos + 8 + length);
  if (type === "IDAT") idatBuffers.push(data);
  pos += 12 + length;
}
const raw = zlib.inflateSync(Buffer.concat(idatBuffers));
const srcW = 100, srcH = 76, bpp = 4;
const uncompressed = Buffer.alloc(srcW * srcH * bpp);

function paeth(a, b, c) {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

let rawOffset = 0;
for (let y = 0; y < srcH; y++) {
  const filterType = raw[rawOffset++];
  for (let x = 0; x < srcW * bpp; x++) {
    const val = raw[rawOffset++];
    const left = x >= bpp ? uncompressed[y * srcW * bpp + x - bpp] : 0;
    const up = y > 0 ? uncompressed[(y - 1) * srcW * bpp + x] : 0;
    const upLeft = (y > 0 && x >= bpp) ? uncompressed[(y - 1) * srcW * bpp + x - bpp] : 0;

    let res = val;
    if (filterType === 1) res = (val + left) & 0xff;
    else if (filterType === 2) res = (val + up) & 0xff;
    else if (filterType === 3) res = (val + Math.floor((left + up) / 2)) & 0xff;
    else if (filterType === 4) res = (val + paeth(left, up, upLeft)) & 0xff;

    uncompressed[y * srcW * bpp + x] = res;
  }
}

// 2. Center and crop
const cx = 52.5, cy = 37.5;
const baseSize = 72; // 72x72 square centered on cx, cy
const half = baseSize / 2;

function sampleSubpixel(fx, fy) {
  if (fx < 0 || fx >= srcW - 1 || fy < 0 || fy >= srcH - 1) {
    const rx = Math.max(0, Math.min(srcW - 1, Math.round(fx)));
    const ry = Math.max(0, Math.min(srcH - 1, Math.round(fy)));
    const i = (ry * srcW + rx) * 4;
    return [uncompressed[i], uncompressed[i+1], uncompressed[i+2], uncompressed[i+3]];
  }
  const x0 = Math.floor(fx), x1 = x0 + 1;
  const y0 = Math.floor(fy), y1 = y0 + 1;
  const wx1 = fx - x0, wx0 = 1 - wx1;
  const wy1 = fy - y0, wy0 = 1 - wy1;

  const i00 = (y0 * srcW + x0) * 4, i10 = (y0 * srcW + x1) * 4;
  const i01 = (y1 * srcW + x0) * 4, i11 = (y1 * srcW + x1) * 4;

  const res = [0, 0, 0, 0];
  for (let c = 0; c < 4; c++) {
    res[c] = wy0 * (wx0 * uncompressed[i00 + c] + wx1 * uncompressed[i10 + c]) +
             wy1 * (wx0 * uncompressed[i01 + c] + wx1 * uncompressed[i11 + c]);
  }
  return res;
}

const masterRGBA = Buffer.alloc(baseSize * baseSize * 4);
for (let y = 0; y < baseSize; y++) {
  for (let x = 0; x < baseSize; x++) {
    const srcX = cx - half + x + 0.5;
    const srcY = cy - half + y + 0.5;
    const [r, g, b, a] = sampleSubpixel(srcX, srcY);

    const dx = x + 0.5 - half;
    const dy = y + 0.5 - half;
    const dist = Math.hypot(dx, dy);

    // Antialiased circular boundary at outer edge of gold ring
    // Gold ring is at r ~ 31.0px. Outer edge is ~32.5px.
    // Let circle background fill smoothly to 34.0px with 1.5px soft falloff.
    let alphaFactor = 1.0;
    if (dist > 35.0) {
      alphaFactor = 0.0;
    } else if (dist > 33.5) {
      alphaFactor = (35.0 - dist) / 1.5;
    }

    const idx = (y * baseSize + x) * 4;
    masterRGBA[idx] = Math.max(0, Math.min(255, Math.round(r)));
    masterRGBA[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
    masterRGBA[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
    masterRGBA[idx + 3] = Math.max(0, Math.min(255, Math.round(a * alphaFactor)));
  }
}

// 3. High quality resampler (area-averaging / box downsampling, bicubic upsampling)
function resample(srcBuf, srcSize, dstSize) {
  const dstBuf = Buffer.alloc(dstSize * dstSize * 4);
  const scale = dstSize / srcSize;

  if (dstSize <= srcSize) {
    // Area-averaging downsampling
    const boxSize = srcSize / dstSize;
    for (let dy = 0; dy < dstSize; dy++) {
      const sy0 = dy * boxSize;
      const sy1 = (dy + 1) * boxSize;
      for (let dx = 0; dx < dstSize; dx++) {
        const sx0 = dx * boxSize;
        const sx1 = (dx + 1) * boxSize;

        let sumR = 0, sumG = 0, sumB = 0, sumA = 0, totalWeight = 0;
        const minIY = Math.floor(sy0), maxIY = Math.min(srcSize - 1, Math.floor(sy1));
        const minIX = Math.floor(sx0), maxIX = Math.min(srcSize - 1, Math.floor(sx1));

        for (let iy = minIY; iy <= maxIY; iy++) {
          const yWeight = Math.min(sy1, iy + 1) - Math.max(sy0, iy);
          for (let ix = minIX; ix <= maxIX; ix++) {
            const xWeight = Math.min(sx1, ix + 1) - Math.max(sx0, ix);
            const w = xWeight * yWeight;
            const idx = (iy * srcSize + ix) * 4;
            const a = srcBuf[idx + 3] / 255;
            sumR += srcBuf[idx] * a * w;
            sumG += srcBuf[idx + 1] * a * w;
            sumB += srcBuf[idx + 2] * a * w;
            sumA += srcBuf[idx + 3] * w;
            totalWeight += w;
          }
        }

        const dstIdx = (dy * dstSize + dx) * 4;
        const outA = sumA / totalWeight;
        if (outA > 0.5) {
          const alphaNorm = outA / 255;
          dstBuf[dstIdx] = Math.min(255, Math.max(0, Math.round((sumR / totalWeight) / alphaNorm)));
          dstBuf[dstIdx + 1] = Math.min(255, Math.max(0, Math.round((sumG / totalWeight) / alphaNorm)));
          dstBuf[dstIdx + 2] = Math.min(255, Math.max(0, Math.round((sumB / totalWeight) / alphaNorm)));
          dstBuf[dstIdx + 3] = Math.min(255, Math.max(0, Math.round(outA)));
        } else {
          dstBuf[dstIdx + 3] = 0;
        }
      }
    }
  } else {
    // Bicubic / bilinear upsampling
    for (let dy = 0; dy < dstSize; dy++) {
      const fy = (dy + 0.5) / scale - 0.5;
      for (let dx = 0; dx < dstSize; dx++) {
        const fx = (dx + 0.5) / scale - 0.5;
        const x0 = Math.max(0, Math.min(srcSize - 1, Math.floor(fx)));
        const x1 = Math.max(0, Math.min(srcSize - 1, Math.ceil(fx)));
        const y0 = Math.max(0, Math.min(srcSize - 1, Math.floor(fy)));
        const y1 = Math.max(0, Math.min(srcSize - 1, Math.ceil(fy)));
        const wx = fx - x0;
        const wy = fy - y0;

        const i00 = (y0 * srcSize + x0) * 4;
        const i10 = (y0 * srcSize + x1) * 4;
        const i01 = (y1 * srcSize + x0) * 4;
        const i11 = (y1 * srcSize + x1) * 4;

        const dstIdx = (dy * dstSize + dx) * 4;
        for (let c = 0; c < 4; c++) {
          const val = (1 - wy) * ((1 - wx) * srcBuf[i00 + c] + wx * srcBuf[i10 + c]) +
                      wy * ((1 - wx) * srcBuf[i01 + c] + wx * srcBuf[i11 + c]);
          dstBuf[dstIdx + c] = Math.min(255, Math.max(0, Math.round(val)));
        }
      }
    }
  }
  return dstBuf;
}

// 4. PNG encoder
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c;
}
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function makeChunk(t, d) {
  const c = Buffer.alloc(12 + d.length);
  c.writeUInt32BE(d.length, 0);
  c.write(t, 4, 4, "ascii");
  d.copy(c, 8);
  c.writeUInt32BE(crc32(c.subarray(4, 8 + d.length)), 8 + d.length);
  return c;
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const scanlines = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    scanlines[y * (1 + w * 4)] = 0;
    rgba.copy(scanlines, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([sig, makeChunk("IHDR", ihdr), makeChunk("IDAT", zlib.deflateSync(scanlines)), makeChunk("IEND", Buffer.alloc(0))]);
}

// 5. ICO builder (DIB/BMP format with 32-bit RGBA and AND mask)
function createDIB(w, h, rgba) {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);
  header.writeInt32LE(w, 4);
  header.writeInt32LE(h * 2, 8); // 2 * height for ICO
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(32, 14);
  header.writeUInt32LE(0, 16);
  header.writeUInt32LE(w * h * 4, 20);

  const pixelData = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const srcY = h - 1 - y;
    for (let x = 0; x < w; x++) {
      const srcIdx = (srcY * w + x) * 4;
      const dstIdx = (y * w + x) * 4;
      pixelData[dstIdx] = rgba[srcIdx + 2];     // B
      pixelData[dstIdx + 1] = rgba[srcIdx + 1]; // G
      pixelData[dstIdx + 2] = rgba[srcIdx];     // R
      pixelData[dstIdx + 3] = rgba[srcIdx + 3]; // A
    }
  }

  const andRowBytes = Math.ceil(w / 32) * 4;
  const andMask = Buffer.alloc(andRowBytes * h);
  for (let y = 0; y < h; y++) {
    const srcY = h - 1 - y;
    for (let x = 0; x < w; x++) {
      const srcIdx = (srcY * w + x) * 4;
      const a = rgba[srcIdx + 3];
      if (a < 128) {
        const byteIdx = y * andRowBytes + Math.floor(x / 8);
        const bitIdx = 7 - (x % 8);
        andMask[byteIdx] |= (1 << bitIdx);
      }
    }
  }

  return Buffer.concat([header, pixelData, andMask]);
}

function buildIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const dirBuffers = [];
  const imageBuffers = [];

  for (const entry of entries) {
    const dib = createDIB(entry.w, entry.h, entry.rgba);
    const dir = Buffer.alloc(16);
    dir.writeUInt8(entry.w >= 256 ? 0 : entry.w, 0);
    dir.writeUInt8(entry.h >= 256 ? 0 : entry.h, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(dib.length, 8);
    dir.writeUInt32LE(offset, 12);

    dirBuffers.push(dir);
    imageBuffers.push(dib);
    offset += dib.length;
  }

  return Buffer.concat([header, ...dirBuffers, ...imageBuffers]);
}

// 6. Generate standard sizes
const size16 = resample(masterRGBA, baseSize, 16);
const size32 = resample(masterRGBA, baseSize, 32);
const size48 = resample(masterRGBA, baseSize, 48);
const size64 = resample(masterRGBA, baseSize, 64);
const size180 = resample(masterRGBA, baseSize, 180);
const size192 = resample(masterRGBA, baseSize, 192);
const size512 = resample(masterRGBA, baseSize, 512);

const icoBuffer = buildIco([
  { w: 16, h: 16, rgba: size16 },
  { w: 32, h: 32, rgba: size32 },
  { w: 48, h: 48, rgba: size48 },
]);

const png32 = encodePNG(32, 32, size32);
const png180 = encodePNG(180, 180, size180);
const png192 = encodePNG(192, 192, size192);
const png512 = encodePNG(512, 512, size512);

// 7. Write to src/app and public
fs.writeFileSync(path.join(projectRoot, "src/app/favicon.ico"), icoBuffer);
fs.writeFileSync(path.join(projectRoot, "src/app/icon.png"), png192);
fs.writeFileSync(path.join(projectRoot, "src/app/apple-icon.png"), png180);

fs.writeFileSync(path.join(projectRoot, "public/favicon.ico"), icoBuffer);
fs.writeFileSync(path.join(projectRoot, "public/icon.png"), png192);
fs.writeFileSync(path.join(projectRoot, "public/apple-icon.png"), png180);
fs.writeFileSync(path.join(projectRoot, "public/logo.png"), png512);

// 8. Vector SVG Favicon for modern crisp displays
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <defs>
    <radialGradient id="mahalBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#141418" />
      <stop offset="75%" stop-color="#0E0E10" />
      <stop offset="100%" stop-color="#08080A" />
    </radialGradient>
    <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF2CE" />
      <stop offset="35%" stop-color="#D4AF37" />
      <stop offset="70%" stop-color="#AA820A" />
      <stop offset="100%" stop-color="#D4AF37" />
    </linearGradient>
    <linearGradient id="goldLetter" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF8E7" />
      <stop offset="50%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#997508" />
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Dark Obsidian Disc -->
  <circle cx="64" cy="64" r="62" fill="url(#mahalBg)" />

  <!-- Outer Golden Luxury Ring -->
  <circle cx="64" cy="64" r="54" fill="none" stroke="url(#goldRim)" stroke-width="2.75" />

  <!-- Subtle Inner Ambient Ring -->
  <circle cx="64" cy="64" r="51.5" fill="none" stroke="#D4AF37" stroke-width="0.5" stroke-opacity="0.3" />

  <!-- Center Serif M Monogram -->
  <g transform="translate(64, 64)" filter="url(#softGlow)">
    <!-- Roman Inscriptional Monogram Path -->
    <path
      d="M -23,17.5 
         L -15.5,17.5 
         L -15.5,15.5 
         L -18.5,15.5 
         L -18.5,-12 
         L -14,-14 
         L -13.5,-17 
         L -23,-17 
         L -23,-14 
         L -20.5,-12 
         L -20.5,15.5 
         L -23,15.5 
         Z 
         M -18.5,-12.5 
         L -0.5,13.5 
         L 1.5,13.5 
         L 17,-13.5 
         L 17,15.5 
         L 14.5,15.5 
         L 14.5,17.5 
         L 23,17.5 
         L 23,15.5 
         L 20,15.5 
         L 20,-14.5 
         L 23,-17 
         L 15,-17 
         L 0.5,8 
         L -14.5,-16 
         L -18.5,-12.5 
         Z"
      fill="url(#goldLetter)"
    />
  </g>
</svg>`;

fs.writeFileSync(path.join(projectRoot, "src/app/icon.svg"), svgIcon);
fs.writeFileSync(path.join(projectRoot, "public/icon.svg"), svgIcon);

console.log("All favicons generated successfully!");
