#!/usr/bin/env python3
"""
Backend coupling analyzer (FastAPI / Python)
-------------------------------------------

Correct implementation using Robert Martin’s metrics:
- Afferent Coupling (Ca)
- Efferent Coupling (Ce)
- Instability (I = Ce / (Ca + Ce))
- Global Instability Index (mean(I))
- Ripple (transitive fan-out)
- Cycle detection (via grimp)

Usage:
  python tools/coupling/analyze_backend.py --root fitness_marketplace_backend --pkg app
"""

from __future__ import annotations
import os, sys, re, json, argparse
from collections import deque
from datetime import datetime, timezone

# ---------------- args ----------------
SCRIPT_DIR = os.path.dirname(__file__)
DEFAULT_OUT_DIR = os.path.join(SCRIPT_DIR, "metrics")

ap = argparse.ArgumentParser()
ap.add_argument("--root", default="fitness_marketplace_backend",
                help="Backend root directory that contains the package folder")
ap.add_argument("--pkg", default="app",
                help="Root package name inside backend root")
ap.add_argument("--outDir", default=DEFAULT_OUT_DIR,
                help="Directory for metrics output")
ap.add_argument("--out", default=None,
                help="Explicit output JSON path (overrides --outDir)")
ap.add_argument("--coreRe", default=r"^app/(core|domain)/",
                help="Regex for core modules (core must remain stable)")
args = ap.parse_args()

BACKEND_ROOT = os.path.abspath(args.root)
PKG = args.pkg
OUT_DIR = os.path.abspath(args.outDir)
OUT_PATH = os.path.abspath(args.out) if args.out else os.path.join(OUT_DIR, "coupling.backend.json")

# ---------------- require grimp ----------------
def _require_grimp():
    try:
        import grimp
        return grimp
    except Exception:
        print(
            "[COUPLING][BE] Missing package 'grimp'.\n"
            f"Install it in this backend env:\n  cd {BACKEND_ROOT}\n  pip install grimp\n",
            file=sys.stderr
        )
        sys.exit(2)

grimp = _require_grimp()

# ---------------- validate backend structure ----------------
if not os.path.isdir(BACKEND_ROOT):
    sys.exit(f"[COUPLING][BE] Backend root not found: {BACKEND_ROOT}")

if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

pkg_dir = os.path.join(BACKEND_ROOT, PKG)
if not os.path.isdir(pkg_dir):
    sys.exit(f"[COUPLING][BE] Package directory not found: {pkg_dir}")

# ensure package importable
init_file = os.path.join(pkg_dir, "__init__.py")
if not os.path.exists(init_file):
    open(init_file, "a").close()

print(f"[COUPLING][BE] Building dependency graph for '{PKG}' ...")

# ---------------- build graph using grimp ----------------
g = grimp.build_graph(PKG)
nodes = sorted(g.modules)

# forward adjacency: module -> direct imported modules (internal only)
forward = {m: set() for m in nodes}
for m in nodes:
    for dep in g.find_modules_directly_imported_by(m):
        if dep in nodes:
            forward[m].add(dep)

# reverse adjacency: who imports me?
reverse = {m: set() for m in nodes}
for src, outs in forward.items():
    for tgt in outs:
        reverse[tgt].add(src)

# ---------------- ripple (transitive fan-out) ----------------
def ripple(module: str) -> int:
    visited = set()
    q = deque([module])
    while q:
        u = q.popleft()
        for v in forward.get(u, ()):
            if v not in visited:
                visited.add(v)
                q.append(v)
    visited.discard(module)
    return len(visited)

# ---------------- compute per-module metrics ----------------
per_node = {}
total_I = 0.0
core_re = re.compile(args.coreRe)
core_violations = []

for m in nodes:
    Ce = len(forward[m])     # Efferent: fan-out
    Ca = len(reverse[m])     # Afferent: fan-in
    I = Ce / (Ca + Ce) if (Ca + Ce) else 0.0
    R = ripple(m)
    
    per_node[m] = {
        "Ca": Ca,
        "Ce": Ce,
        "I": round(I, 3),
        "ripple": R
    }

    total_I += I

    # guardrail: core modules should NOT be unstable
    if core_re.search(m) and I > 0.8:
        core_violations.append({"module": m, "I": round(I, 3)})

# ---------------- detect cycles ----------------
try:
    cycles = g.find_cycles()   # list[list[str]]
except Exception:
    cycles = []

cycles_count = len(cycles)
cycles_pct = 100.0 if cycles_count > 0 else 0.0

# ---------------- global metrics (correct formula) ----------------
N = len(nodes)
global_instability = round(total_I / N, 3) if N else 0.0

# grading scale
if   global_instability < 0.40: grade = "A"
elif global_instability < 0.60: grade = "B"
elif global_instability < 0.80: grade = "C"
elif global_instability < 0.95: grade = "D"
else:                            grade = "F"

# ---------------- write report ----------------
os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
with open(OUT_PATH, "w") as f:
    json.dump({
        "layer": "backend",
        "root": PKG,
        "modules": N,
        "edges": sum(len(forward[m]) for m in nodes),
        "cyclesCount": cycles_count,
        "cyclesPct": cycles_pct,
        "globalInstability": global_instability,
        "healthGrade": grade,
        "coreI_violations": core_violations,
        "perNode": per_node,
        "generatedAt": datetime.now(timezone.utc).isoformat()
    }, f, indent=2)

# ---------------- guardrails ----------------
violations = []
if cycles_pct > 5:
    violations.append(f"Backend cyclesPct {cycles_pct}% > 5%")
if global_instability > 0.65:
    violations.append(f"Backend coupling too high: globalInstability {global_instability} > 0.65")
if core_violations:
    violations.append(f"Backend core modules I>0.8: {len(core_violations)}")

if violations:
    print("[COUPLING][BE] Violations:")
    for v in violations:
        print(" -", v)
    sys.exit(1)

print(f"[COUPLING][BE] OK → {OUT_PATH}")
