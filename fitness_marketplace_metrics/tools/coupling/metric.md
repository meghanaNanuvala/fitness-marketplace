# 📊 Coupling & Flexibility Metrics (Fitbit Marketplace)

Measure and track structural coupling across your entire Marketplace project — both Frontend (React/TypeScript) and Backend (FastAPI/Python) — using automated dependency graph analysis.

This toolkit generates detailed metrics (Ca, Ce, I, ripple), computes an overall coupling index, grades architecture health, and enforces guardrails for continuous integration.

## 🧩 Repository Layout

```bash
Github/
├─ fitness_marketplace_frontend/   # React + TS app
├─ fitness_marketplace_backend/    # FastAPI + Python app
└─ tools/
   └─ coupling/
      ├─ analyze_frontend.cjs      # Frontend analyzer
      ├─ analyze_backend.py        # Backend analyzer
      ├─ overall_coupling.cjs      # Combines FE + BE
      ├─ run_metrics.sh            # One-command runner
      └─ metrics/                  # JSON & DOT outputs

```    

## Requirements
### 🖥️ Frontend (React / TS)

From inside the fitness_marketplace_frontend directory:
```bash
npm install --save-dev madge
```

### 🐍 Backend (FastAPI / Python)

From inside the fitness_marketplace_backend directory:
```bash
pip install grimp
```

### Optional — Graphviz (for visual graphs)

Used to render .dot → .svg import graphs:
```bash
brew install graphviz     # macOS
sudo apt install graphviz # Ubuntu / Debian
```

## 🚀 Running Metrics

Run everything (FE + BE + merge) from the repo root:

```bash
bash tools/coupling/run_metrics.sh
```

This will:

1. Analyze frontend dependencies (TS/JS imports)

2. Analyze backend dependencies (Python imports)

3. Generate combined coupling.all.json with overall metrics


## 📁 Output Structure

All reports are saved under:

```bash
tools/coupling/metrics/
├─ coupling.frontend.json      # FE module metrics
├─ coupling.frontend.dot       # FE dependency graph (Graphviz)
├─ coupling.backend.json       # BE module metrics
└─ coupling.all.json           # Combined FE + BE + overall index
```


# 🧩 Module-Level Metrics

| Metric | Meaning | Formula | Level |
|--------|---------|----------|--------|
| **Ca** | Afferent Coupling – number of modules that depend on this module | Count of incoming edges | Per module |
| **Ce** | Efferent Coupling – number of modules this module depends on | Count of outgoing edges | Per module |
| **I (Instability)** | How change-prone a module is | `I = Ce / (Ca + Ce)` | Per module |
| **Ripple** | Transitive fan-out – how many modules change if this one changes | DFS/BFS reach count | Per module |


# 🏛 Project-Level Metrics

| Metric | Meaning | Level |
|--------|---------|--------|
| **globalInstability** | Average Instability across all modules | Overall |
| **cyclesCount** | Number of import cycles found | Overall |
| **cyclesPct** | `%` of project affected by cycles (0% or 100%) | Overall |
| **coreI_violations** | Number of unstable modules within `core` or `domain` layers | Core health |
| **healthGrade** | Architectural grade (A–F) based on *globalInstability* | Overall |


# 🔍 Instability: The Coupling Metric

Instability (I) is the measure of coupling.

```text
Instability = Ce/ (Ca + Ce)
```

### Interpretation
- **I ≈ 0** → Stable (others depend on it; internal/core modules should be here)
- **I ≈ 1** → Unstable (depends on many modules; good for outer/adapters/UI)


# 🧮 Global Instability (Overall Coupling)

To measure coupling for the entire system:

```
Global Instability = (1/N) * Σ I_i
```

Where:
- \(I_i\) is the instability of module *i*
- \(N\) is the total number of modules

### Why this metric?
It directly reflects:
- architectural modularity  
- maintainability  
- dependency structure quality  

It is also **normalized between 0–1**, making it consistent across varying project sizes.


# 🟦 Architectural Health Grade

The architectural health grade is calculated from **globalInstability**:

| Range | Grade | Meaning |
|--------|--------|------------|
| **0.00 – 0.40** | 🟢 A | Excellent modularity |
| **0.41 – 0.60** | 🟢 B | Good, maintainable architecture |
| **0.61 – 0.80** | 🟡 C | Moderate coupling |
| **0.81 – 0.95** | 🟠 D | High coupling – caution |
| **> 0.95** | 🔴 F | Over-coupled / fragile |


## 🧩 Flexibility Index

Flexibility is defined as the inverse of structural coupling.  
Since a system with high coupling is rigid, and a system with low coupling is adaptable,  
we define flexibility as:

```text
FlexibilityIndex = 1 - CouplingIndex
```

Thus:

- **FlexibilityIndex = 1.0** → fully flexible, highly modular
- **FlexibilityIndex = 0.0** → rigid, extremely coupled

### 📈 Flexibility Grades

| Flexibility Range | Grade | Meaning                        |
|:----------------------|:---------:|------------------------------------|
| **0.60 – 1.00**       | 🟢 **A**  | **Highly flexible / easy to change** |
| **0.40 – 0.59**       | 🟡 **B**  | **Good flexibility**                 |
| **0.20 – 0.39**       | 🟠 **C**  | **Moderately flexible**              |
| **0.05 – 0.19**       | 🔴 **D**  | **Low flexibility**                  |
| **< 0.05**            | ⚫ **F**  | **Rigid / difficult to change**      |




## 🧪 Run Individually
### Frontend
```bash
node fitness_marketplace_metrics/tools/coupling/analyze_frontend.cjs \
  --root ./fitness_marketplace_frontend \
  --outDir fitness_marketplace_metrics/tools/coupling/metrics
```

### Backend
```bash 
python fitness_marketplace_metrics/tools/coupling/analyze_backend.py \
  --root ./fitness_marketplace_backend \
  --pkg app \
  --out fitness_marketplace_metrics/tools/coupling/metrics/coupling.backend.json
```

### Merge + Overall
```bash
node tools/coupling/merge.cjs
```

## 🖼️ Visualizing Dependencies (Frontend)

You can render the .dot file using Graphviz:

```bash
dot -Tsvg tools/coupling/metrics/coupling.frontend.dot -o tools/coupling/metrics/coupling.frontend.svg
open tools/coupling/metrics/coupling.frontend.svg
```


This graph shows each file (node) and its import relationships (edges).