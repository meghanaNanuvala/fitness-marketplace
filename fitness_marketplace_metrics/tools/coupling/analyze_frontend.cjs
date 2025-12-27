#!/usr/bin/env node
/**
 * Frontend Coupling Analyzer (Node/React/TS)
 * ------------------------------------------
 *
 * Correct implementation using Robert Martin’s metrics:
 *   - Ca (afferent coupling)
 *   - Ce (efferent coupling)
 *   - Instability I = Ce / (Ca + Ce)
 *   - Global Instability = average Instability across modules
 *
 * Usage:
 *   node tools/coupling/analyze_frontend.cjs --root marketplace-ui --src src
 */

const fs = require("fs");
const path = require("path");
const { argv } = require("node:process");
const { createRequire } = require("module");

// ---------------- args ----------------
const args = argv.slice(2);
const get = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const FE_ROOT = path.resolve(get("--root", "marketplace-ui"));
const SRC_DIR = path.resolve(FE_ROOT, get("--src", "src"));
const TSCONFIG = path.resolve(FE_ROOT, get("--tsconfig", "tsconfig.json"));
const CORE_REGEX = get("--coreRe", "^src/(core|domain)/");

const OUT_DIR = path.resolve(
  get("--outDir", path.join(__dirname, "metrics"))
);
const OUT_PATH = path.resolve(
  get("--out", path.join(OUT_DIR, "coupling.frontend.json"))
);

const SKIP_DOT = args.includes("--skip-dot");

// ---------------- require madge dynamically ----------------
const requireFromFe = createRequire(path.join(FE_ROOT, "package.json"));
let madge;
try {
  madge = requireFromFe("madge");
} catch (e) {
  console.error(
    `[COUPLING][FE] Could not load 'madge'. Install inside frontend:\n` +
      `  cd ${FE_ROOT}\n  npm i -D madge`
  );
  process.exit(2);
}

// ---------------- helper: compute global instability ----------------
function computeGlobalInstability(perNode) {
  const values = Object.values(perNode).map((n) => n.I);
  const avgI = values.length
    ? values.reduce((a, b) => a + b, 0) / values.length
    : 0;

  // grading scale same as backend
  let grade;
  if (avgI < 0.4) grade = "A";
  else if (avgI < 0.6) grade = "B";
  else if (avgI < 0.8) grade = "C";
  else if (avgI < 0.95) grade = "D";
  else grade = "F";

  return { globalInstability: +avgI.toFixed(3), healthGrade: grade };
}

// ---------------- build graph helpers ----------------
function buildGraph(depMap) {
  const nodes = Object.keys(depMap);
  const forward = new Map();
  const reverse = new Map();

  for (const n of nodes) {
    forward.set(n, new Set(depMap[n]));
    reverse.set(n, new Set());
  }

  for (const [src, outs] of forward.entries()) {
    for (const tgt of outs) {
      if (!reverse.has(tgt)) reverse.set(tgt, new Set());
      reverse.get(tgt).add(src);
    }
  }

  return { nodes, forward, reverse };
}

function ripple(node, forward) {
  const visited = new Set();
  const stack = [node];

  while (stack.length) {
    const u = stack.pop();
    for (const v of forward.get(u) || []) {
      if (!visited.has(v)) {
        visited.add(v);
        stack.push(v);
      }
    }
  }

  visited.delete(node);
  return visited.size;
}

// ---------------- main ----------------
(async () => {
  console.log(`[COUPLING][FE] Analyzing frontend at: ${SRC_DIR}`);

  const res = await madge(SRC_DIR, {
    baseDir: FE_ROOT,
    fileExtensions: ["ts", "tsx", "js", "jsx"],
    tsConfig: fs.existsSync(TSCONFIG) ? TSCONFIG : undefined,
    includeNpm: false,
  });

  const depMap = await res.obj();
  const cycles = await res.circular();

  const { nodes, forward, reverse } = buildGraph(depMap);
  const perNode = {};
  const coreRe = new RegExp(CORE_REGEX);
  const coreViolations = [];

  let totalI = 0;

  for (const n of nodes) {
    const Ce = (forward.get(n) || new Set()).size;
    const Ca = (reverse.get(n) || new Set()).size;
    const I = Ca + Ce > 0 ? Ce / (Ca + Ce) : 0;
    const R = ripple(n, forward);

    perNode[n] = {
      Ca,
      Ce,
      I: +I.toFixed(3),
      ripple: R,
    };

    totalI += I;

    if (coreRe.test(n) && I > 0.8) {
      coreViolations.push({ module: n, I: +I.toFixed(3) });
    }
  }

  const cyclesPct = cycles.length > 0 ? 100 : 0;
  const { globalInstability, healthGrade } =
    computeGlobalInstability(perNode);

  // ---------------- write report ----------------
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        layer: "frontend",
        nodes: nodes.length,
        edges: nodes.reduce(
          (s, n) => s + (forward.get(n) || new Set()).size,
          0
        ),
        cyclesCount: cycles.length,
        cyclesPct,
        globalInstability,
        healthGrade,
        coreI_violations: coreViolations,
        perNode,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  // ---------------- guardrails ----------------
  const violations = [];
  if (cyclesPct > 5)
    violations.push(`Frontend cyclesPct ${cyclesPct}% > 5%`);
  if (globalInstability > 0.65)
    violations.push(
      `Frontend globalInstability ${globalInstability} > 0.65`
    );
  if (coreViolations.length)
    violations.push(
      `Frontend core modules I>0.8: ${coreViolations.length}`
    );

  if (violations.length) {
    console.error("[COUPLING][FE] Violations:");
    for (const v of violations) console.error(" -", v);
    process.exit(1);
  }

  console.log("[COUPLING][FE] OK →", OUT_PATH);
})();
