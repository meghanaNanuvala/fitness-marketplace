#!/usr/bin/env node
/**
 * 📊 Coupling Metrics Merger
 * Combines Frontend + Backend coupling metrics
 * and computes overall Coupling Index and Health Grade.
 *
 * Usage:
 *   node tools/coupling/overall_coupling.cjs
 *     --inFe tools/coupling/metrics/coupling.frontend.json
 *     --inBe tools/coupling/metrics/coupling.backend.json
 *     --out  tools/coupling/metrics/coupling.all.json
 */

const fs = require("fs");
const path = require("path");

// ---------------------------
// 🔧 CLI argument parser
// ---------------------------
const args = process.argv.slice(2);
const get = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

// Default input/output locations
const IN_FE = get("--inFe", path.join(__dirname, "metrics/coupling.frontend.json"));
const IN_BE = get("--inBe", path.join(__dirname, "metrics/coupling.backend.json"));
const OUT = get("--out", path.join(__dirname, "metrics/overall.coupling.json"));

// ---------------------------
// 🧮 Helper functions
// ---------------------------

// Health grade from coupling index
function grade(index) {
  if (index <= 0.40) return "A";
  if (index <= 0.60) return "B";
  if (index <= 0.80) return "C";
  if (index <= 0.95) return "D";
  return "F";
}

// Weighted average helper
function weightedAverage(fe, be, key) {
  const totalNodes = (fe.nodes || 0) + (be.nodes || 0);
  if (totalNodes === 0) return 0;
  return ((fe[key] * fe.nodes) + (be[key] * be.nodes)) / totalNodes;
}

// ---------------------------
// 🧾 Read JSON inputs
// ---------------------------
if (!fs.existsSync(IN_FE)) {
  console.error(`[ERROR] Frontend metrics not found: ${IN_FE}`);
  process.exit(1);
}
if (!fs.existsSync(IN_BE)) {
  console.error(`[ERROR] Backend metrics not found: ${IN_BE}`);
  process.exit(1);
}

const fe = JSON.parse(fs.readFileSync(IN_FE, "utf8"));
const be = JSON.parse(fs.readFileSync(IN_BE, "utf8"));

// ---------------------------
// 🧮 Compute combined metrics
// ---------------------------
const avgCe = weightedAverage(fe, be, "avgCe");
const avgRipple = weightedAverage(fe, be, "avgRipple");

// Binary cycle percentage: 0 if none, 100 if any exist
const cyclesPct = (fe.cyclesCount > 0 || be.cyclesCount > 0) ? 100 : 0;

// Normalized coupling index
const couplingIndex = Math.min(
  1,
  avgCe / 3.0 + avgRipple / 10.0 + cyclesPct / 100.0
);

const overall = {
  avgCe: +avgCe.toFixed(3),
  avgRipple: +avgRipple.toFixed(3),
  cyclesPct,
  couplingIndex: +couplingIndex.toFixed(3),
  healthGrade: grade(couplingIndex),
};

// ---------------------------
// 🧩 Final JSON structure
// ---------------------------
const combined = {
  summary: {
    nodes: (fe.nodes || 0) + (be.nodes || 0),
    edges: (fe.edges || 0) + (be.edges || 0),
    cyclesCount: (fe.cyclesCount || 0) + (be.cyclesCount || 0),
    ...overall,
  },
  frontend: fe,
  backend: be,
  generatedAt: new Date().toISOString(),
};

// ---------------------------
// 💾 Write output
// ---------------------------
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(combined, null, 2));

console.log(
  `[COUPLING] ✅ Combined report written to: ${OUT}\n` +
  `→ Coupling Index: ${overall.couplingIndex} | Health: ${overall.healthGrade}`
);
