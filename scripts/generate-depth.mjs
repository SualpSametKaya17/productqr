import sharp from "sharp";
import path from "node:path";

const INPUT = process.argv[2] || "public/images/dikilitas.webp";
const OUTBASE = process.argv[3] || "public/images/dikilitas";
const W = 768;

const { data, info } = await sharp(INPUT)
  .resize(W)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width, h = info.height, ch = info.channels;
const N = w * h;
const lum = new Float32Array(N);
const sat = new Float32Array(N);

for (let i = 0; i < N; i++) {
  const r = data[i * ch] / 255, g = data[i * ch + 1] / 255, b = data[i * ch + 2] / 255;
  lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  sat[i] = mx <= 0 ? 0 : (mx - mn) / mx;
}

const smooth = (t) => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ── Build raw depth via heuristic ──
const depth = new Float32Array(N);
for (let y = 0; y < h; y++) {
  const ny = y / (h - 1);
  for (let x = 0; x < w; x++) {
    const nx = x / (w - 1);
    const i = y * w + x;
    const L = lum[i], S = sat[i];

    // Sky: bright, low-saturation, upper region -> pushed far (depth 0)
    const skyish = clamp((L - 0.42) / 0.45, 0, 1) * clamp((0.32 - S) / 0.32, 0, 1) * clamp((0.62 - ny) / 0.5, 0, 1);
    const skyMask = 1 - smooth(clamp(skyish * 1.4, 0, 1));

    // Foreground recession: bottom comes forward, top recedes
    const ground = smooth(clamp((ny - 0.18) / 0.82, 0, 1)) * 0.45;

    // Surface relief from luminance (column/buildings catch light)
    const relief = smooth(clamp((L - 0.2) / 0.7, 0, 1)) * 0.5;

    // Central vertical column lift
    const cx = 1 - smooth(clamp(Math.abs(nx - 0.5) / 0.085, 0, 1));
    const cy = smooth(clamp((ny - 0.05) / 0.1, 0, 1)) * (1 - smooth(clamp((ny - 0.6) / 0.14, 0, 1)));
    const columnLift = cx * cy * clamp((L - 0.25) / 0.5, 0, 1) * 0.5;

    let d = (relief + columnLift + ground) * skyMask + 0.03;
    depth[i] = d;
  }
}

// ── Separable box blur (x2 ~ gaussian) ──
function boxBlur(src, radius, passes) {
  let a = src;
  for (let p = 0; p < passes; p++) {
    const tmp = new Float32Array(N);
    // horizontal
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let s = 0, c = 0;
        for (let k = -radius; k <= radius; k++) {
          const xx = x + k;
          if (xx < 0 || xx >= w) continue;
          s += a[y * w + xx]; c++;
        }
        tmp[y * w + x] = s / c;
      }
    }
    const out = new Float32Array(N);
    // vertical
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let s = 0, c = 0;
        for (let k = -radius; k <= radius; k++) {
          const yy = y + k;
          if (yy < 0 || yy >= h) continue;
          s += tmp[yy * w + x]; c++;
        }
        out[y * w + x] = s / c;
      }
    }
    a = out;
  }
  return a;
}

let d = boxBlur(depth, 5, 2);

// ── Normalize 0..1 ──
let lo = Infinity, hi = -Infinity;
for (let i = 0; i < N; i++) { lo = Math.min(lo, d[i]); hi = Math.max(hi, d[i]); }
const range = hi - lo || 1;
const depth8 = Buffer.alloc(N);
for (let i = 0; i < N; i++) depth8[i] = Math.round(clamp((d[i] - lo) / range, 0, 1) * 255);

await sharp(depth8, { raw: { width: w, height: h, channels: 1 } })
  .png()
  .toFile(`${OUTBASE}-depth.png`);

// ── Normal map from depth (sobel) ──
const STRENGTH = 2.2;
const normal = Buffer.alloc(N * 3);
const D = (x, y) => d[clamp(y, 0, h - 1) * w + clamp(x, 0, w - 1)];
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const dx = (D(x - 1, y) - D(x + 1, y)) * STRENGTH;
    const dy = (D(x, y - 1) - D(x, y + 1)) * STRENGTH;
    let nx = dx, nyv = dy, nz = 1 / range;
    const len = Math.hypot(nx, nyv, nz) || 1;
    nx /= len; nyv /= len; nz /= len;
    const i = (y * w + x) * 3;
    normal[i] = Math.round((nx * 0.5 + 0.5) * 255);
    normal[i + 1] = Math.round((nyv * 0.5 + 0.5) * 255);
    normal[i + 2] = Math.round((nz * 0.5 + 0.5) * 255);
  }
}
await sharp(normal, { raw: { width: w, height: h, channels: 3 } })
  .png()
  .toFile(`${OUTBASE}-normal.png`);

// preview: depth as small jpg for inspection
await sharp(`${OUTBASE}-depth.png`).resize(360).toFile("/tmp/depth-preview.png");
console.log("done", w, "x", h, "range", range.toFixed(3));
