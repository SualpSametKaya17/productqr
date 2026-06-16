/**
 * Optimize a GLB for the web / mobile.
 *
 *   node scripts/optimize-glb.mjs <input.glb> <output.glb> [simplifyRatio]
 *
 * Runs gltfpack with meshopt compression + vertex quantization and an
 * optional mesh simplification ratio (default 0.5 = keep 50% of tris).
 * drei's useGLTF decodes meshopt out of the box, so no extra runtime
 * wiring is needed.
 *
 * For very heavy models, lower the ratio (e.g. 0.35) and/or downscale the
 * source textures before export from your 3D tool.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const [input, output, ratioArg] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/optimize-glb.mjs <in.glb> <out.glb> [ratio]");
  process.exit(1);
}
if (!existsSync(input)) {
  console.error("input not found:", input);
  process.exit(1);
}

const ratio = ratioArg ?? "0.5";

// -cc  : meshopt compression
// -si  : simplify to ratio
// -kn  : keep node names (preserve animations/targets)
const args = ["-i", input, "-o", output, "-cc", "-si", ratio, "-kn"];

console.log("gltfpack", args.join(" "));
execFileSync("npx", ["-y", "gltfpack", ...args], { stdio: "inherit" });
console.log("done ->", output);
