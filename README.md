# 🏋️ Fitness Marketplace

**A Metric-Driven Full-Stack Marketplace for Fitness Equipment**

A unified marketplace platform built with engineering excellence at its core, connecting buyers and sellers of fitness equipment through a measurable, quality-driven development approach.



## 📋 Project Overview

**Fitness Marketplace** is a comprehensive web application that seamlessly connects buyers and sellers in the fitness equipment industry. This project demonstrates not just modern full-stack development, but also a **metric-driven engineering approach** that ensures quality, maintainability, and architectural excellence at every stage.

### Core Functionalities

- 🛒 **Buy** – Browse, compare, and purchase fitness equipment
- 💼 **Sell** – List and manage products for sale
- ⭐ **Review** – Post verified-purchase reviews for transparency
- 🔐 **Authentication** – Unified login system for both buyer and seller roles

### Engineering Philosophy

We deliver high-quality software through **measurable engineering excellence** across three dimensions:

1. **Requirements Metrics** → Understandability, Unambiguity, Prioritization
2. **Design Metrics** → Coupling Index, Reusability, Flexibility
3. **Implementation Metrics** → Reliability, Sufficiency, Test Coverage, Code Reusability



## 🏗️ System Architecture

### Technology Stack

- **Backend**: FastAPI (Python) with Domain-Driven Design (DDD)
- **Frontend**: React.js with TypeScript
- **Database**: MongoDB Atlas
- **Analysis Tools**: Madge, Grimp, AI-assisted metrics

### Domain-Driven Design (DDD)

Backend is structured using **DDD principles**, which provide:

- ✅ **Modularity** – Clear separation of concerns
- ✅ **Low Coupling** – Independent, maintainable modules
- ✅ **Business Logic Clarity** – Entities, use cases, and abstractions
- ✅ **Extensibility** – New requirements without breaking existing code
- ✅ **Testability** – Abstract → Concrete boundaries

**Benefits:**
- Each layer has distinct responsibility
- Single, well-defined purpose per module
- Clean, scalable architecture
- Easy to maintain, extend, and test

### Project Structure

```
fitness_marketplace/
├── fitness_marketplace_frontend/    # React + TypeScript
│   ├── src/
│   ├── package.json
│   └── README.md
├── fitness_marketplace_backend/     # FastAPI + Python + DDD
│   ├── app/
│   │   ├── domain/              # Business entities
│   │   ├── use_cases/           # Application logic
│   │   ├── interfaces/          # API routes & adapters
│   │   └── infrastructure/      # Database, external services
│   ├── requirements.txt
│   └── README.md
└── tools/
    └── coupling/                    # Architectural metrics toolkit
        ├── analyze_frontend.cjs
        ├── analyze_backend.py
        ├── overall_coupling.cjs
        ├── run_metrics.sh
        └── metrics/
```



## 🚀 Getting Started

### Prerequisites

- **Python 3.x** with pip
- **Node.js** (LTS) with npm
- **MongoDB Atlas** account
- **Git**
- **Graphviz** (optional, for visualizations)

### Quick Setup

#### 1. Clone the Repository

```bash
git clone <repository_url>
cd fitness_marketplace
```

#### 2. Backend Setup

```bash
cd fitness_marketplace_backend

# Install dependencies
pip install -r requirements.txt
pip install grimp  # For coupling analysis

# Create .env file
cat > .env << EOL
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fitness_marketplace
MONGO_DB_NAME=fitness_marketplace
SECRET_KEY=your-secret-key-change-in-production
EOL

# Start server
py -m uvicorn app.main:app --reload
```

✅ Backend runs at: `http://127.0.0.1:8000`

#### 3. Frontend Setup

```bash
cd fitness_marketplace_frontend

# Install dependencies
npm install
npm install --save-dev madge  # For dependency analysis

# Start dev server
npm run dev
```

✅ Frontend runs at: `http://localhost:5173`

#### 4. Run Architectural Metrics

```bash
# From repository root
bash tools/coupling/run_metrics.sh
```

Reports generated in: `tools/coupling/metrics/`



## 📊 Metric-Driven Approach

### Requirements Metrics

#### 1. **Understandability** (100%)
- Measures clarity and readability of requirements
- **Formula**: `[Hierarchical sectioning + TOC + Glossary] / 3`
- Higher score → Better clarity for developers

#### 2. **Unambiguity**
- Measures freedom from vagueness and contradictions
- Uses strong keywords: "shall", "must" (not "should", "could")
- **Formula**: `(Unambiguous - Conflict Clusters) / Total Requirements`

#### 3. **Prioritization** (P1-P5)
- Determines which requirements to address first
- **Factors**: Urgency (1–5) × Importance (1–100) × Easiness (1–5)
- **Formula**: `Priority = Urgency × Importance × Easiness`
- P1 = Highest priority, P5 = Lowest priority

### Design Metrics

#### 1. **Coupling Index**

**Measures interdependence between modules:**

- **Afferent Coupling (Ca)**: Incoming dependencies (modules that depend on this)
- **Efferent Coupling (Ce)**: Outgoing dependencies (modules this depends on)
- **Instability (I)**: `Ce / (Ca + Ce)` per module
- **Global Instability**: `(1/N) × ∑I_k` across all modules

**Interpretation:**
- Low coupling = Independent modules = Better architecture
- High coupling = Tight dependencies = Harder to maintain

**Tools:**
- Frontend: **Madge** (Node.js dependency analyzer)
- Backend: **Grimp** (Python architecture analysis)

**Health Grades:**
| Range | Grade | Architecture Quality |
|-------|-------|---------------------|
| 0.00–0.40 | 🟢 A | Excellent modularity |
| 0.41–0.60 | 🟢 B | Good, maintainable |
| 0.61–0.80 | 🟡 C | Moderate coupling |
| 0.81–0.95 | 🟠 D | High coupling |
| > 0.95 | 🔴 F | Over-coupled |

#### 2. **Design Reusability**
- Measures how often patterns are reused
- **Formula**: `Modules using class / Total modules`
- Encourages low maintenance and easy expansion

#### 3. **Flexibility**
- **Abstractness (A)**: Abstract classes / Total classes
- **Instability (I)**: From coupling analysis
- **Visualization**: A–I Graph
- Flexible code uses interfaces/base classes with appropriate instability

### Implementation Metrics

#### 1. **Reliability Score**

```
Reliability = (Successful Builds × 0.25) + 
              (1 - Defect Rate) × 0.35 + 
              (Deployment Success × 0.40)
```

**Grades:**
- 🟢 Excellent: 85–100%
- 🟡 Acceptable: 70–84%
- 🔴 Poor: < 70%

**Deployment Definition:**
- ✔ Push to GitHub main branch
- ✔ Successful build + local run
- ✔ Working feature delivered to QA

#### 2. **Sufficiency Score**

```
Sufficiency = (Feature Completion × 0.5) + 
              (Requirements Coverage × 0.3) + 
              (Environment Readiness × 0.2)
```

**Grades:**
- 🟢 Excellent: 90–100%
- 🟡 Acceptable: 75–89%
- 🔴 Poor: < 75%

#### 3. **Test Coverage**

```
Coverage % = (Tests Passed / Total Tests) × 100
```

**Our Journey:**
- Weeks 1-2: Strong start (~77% coverage)
- Week 3: Dip to 28.57% (new test cases added)
- Weeks 4-7: Recovery and stabilization (~85-90%)

#### 4. **Implementation Reusability**
- Measures external library usage
- **Formula**: `Files using external libraries / Total files`
- Promotes efficiency over reinventing the wheel



## 🤖 AI-Assisted Development

### AI Tools Used

- **Claude** – Architectural guidance and code generation
- **ChatGPT** – Requirements refinement
- **Gemini** – Alternative perspectives
- **Perplexity** – Research and documentation
- **Google ADK (Agents Framework)** – Automated agents
- **Madge & Grimp** – Dependency analysis

### Prompting Techniques

1. **Reverse Prompting**: Asked AI to clarify requirements first
   - *"Ask us 10–15 clarifying questions before defining metrics"*
   - Eliminated hallucinations, revealed edge cases
   
2. **One-Shot Prompting**: Single example-based guidance

3. **Few-Shot Prompting**: Multiple examples for pattern learning

### Approach with ChatGPT

**Before defining metrics:**
1. Prepared comprehensive Requirements Document
2. Used reverse prompting for clarification
3. AI asked 10–15 questions about system needs
4. Refined requirements based on AI insights
5. Detected edge cases and missing details early

**Result:** Context-aware, precise requirements with minimal ambiguity



## 🧪 Testing & Validation

### API Testing

**Test Endpoints:**
```bash
# Get all listings
GET http://127.0.0.1:8000/api/v1/listings

# User authentication
POST http://127.0.0.1:8000/api/v1/auth/login

# Create listing
POST http://127.0.0.1:8000/api/v1/listings
```

Use Postman or similar tools. See `app/interfaces/route/` for all routes.

### Frontend Testing

1. Ensure backend is running
2. Open `http://localhost:5173` in browser
3. Test buy/sell/review workflows
4. Verify authentication flows

### Metrics Analysis

```bash
# Run complete analysis
bash tools/coupling/run_metrics.sh

# View results
cat tools/coupling/metrics/coupling.all.json

# Generate visual graph
dot -Tsvg tools/coupling/metrics/coupling.frontend.dot \
    -o tools/coupling/metrics/coupling.frontend.svg
```


## 📈 Key Learnings

### What I Discovered

1. **Early Detection**
   - Measuring coupling, flexibility, and reliability made design trade-offs visible early
   - Caught issues before release time, not after

2. **Incremental Improvement**
   - Quality improvement is gradual, not one-time fixes
   - Consistent tracking reveals progress patterns

3. **Design Pays Off**
   - Low coupling and clear abstractions reduce code duplication
   - New features added faster and safer

4. **Requirements Matter**
   - Measuring ambiguity clarified specifications
   - Detected edge cases early in development
   - AI-assisted reverse prompting revealed hidden assumptions

5. **Automation is Essential**
   - Reduces mental overhead
   - Maintains good practices consistently
   - Metrics guide where to invest effort next

### Challenges & Improvements

**Challenges:**
- Finding reliable automation for all metrics
- Balancing metric tracking with feature delivery
- Scope creep deviation from core requirements

**Future Improvements:**
- ✨ Better metric definitions based on experience
- ✨ Deeper automation for metric collection
- ✨ Improved code collaboration workflows
- ✨ Clearer task assignments and deadlines
- ✨ Use metrics proactively for quality improvements


## 🔧 Development Workflow

### Standard Process

1. **Requirements Phase**
   - Define features clearly
   - Measure understandability & unambiguity
   - Prioritize using urgency × importance × easiness

2. **Design Phase**
   - Apply DDD principles
   - Minimize coupling between modules
   - Maximize reusability and flexibility

3. **Implementation Phase**
   - Write tests first (TDD when appropriate)
   - Track reliability and sufficiency weekly
   - Reuse existing libraries and patterns

4. **Metrics Review**
   - Run coupling analysis
   - Check test coverage
   - Review health grades
   - Address issues before PR

5. **Deployment**
   - Push to main branch
   - Verify successful build
   - Deliver to QA for testing

### Weekly Evaluation

Each week is independent with its own:
- ✅ Defined tasks
- ✅ Reliability score
- ✅ Sufficiency score
- ✅ Test coverage target

**Goal:** Maintain scores above threshold consistently


## 🤝 Contributing Guidelines

When contributing to this project:

### Code Quality
- Follow DDD architecture patterns
- Maintain or improve coupling scores
- Add tests for new features
- Keep global instability < 0.60

### Documentation
- Update requirements for new features
- Document design decisions
- Comment complex business logic
- Update metrics after major changes

### Process
1. Create feature branch
2. Implement with tests
3. Run metrics analysis
4. Review coupling impact
5. Submit PR with metrics report

### Metrics Thresholds
- 🎯 Flexibility Index: > 0.40
- 🎯 Test Coverage: > 75%
- 🎯 Reliability: > 85%
- 🎯 Sufficiency: > 90%
- 🎯 Cycles Count: 0


## 📚 Documentation

Detailed guides available:
- `fitness_marketplace_frontend/README.md` - Frontend setup
- `fitness_marketplace_backend/README.md` - Backend API
- `tools/coupling/README.md` - Metrics toolkit


## 🛡️ Security & Configuration

### Environment Variables

**Backend (.env):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fitness_marketplace
MONGO_DB_NAME=fitness_marketplace
SECRET_KEY=your-secret-key-change-in-production
```

**Security Best Practices:**
- 🔒 Never commit `.env` to version control
- 🔒 Use strong, unique secret keys
- 🔒 Rotate credentials regularly
- 🔒 Use environment-specific configs
- 🔒 Enable MongoDB authentication


## 📊 Project Statistics

### Development Timeline
- **Total Weeks**: 7 development sprints
- **Metrics Tracked**: 10+ quality indicators
- **Test Coverage Peak**: 90%
- **Architecture Grade**: Target A-B

### Key Achievements
- ✅ Measurable quality at every phase
- ✅ Low coupling, high flexibility architecture
- ✅ Automated metrics pipeline
- ✅ AI-assisted requirements refinement
- ✅ Consistent 85%+ reliability score


## 🎯 Success Criteria

This project demonstrates:

1. **Engineering Excellence**
   - Metrics-driven decision making
   - Quality gates at each phase
   - Continuous monitoring and improvement

2. **Technical Proficiency**
   - Modern full-stack development
   - Domain-Driven Design implementation
   - Automated quality analysis

3. **Team Collaboration**
   - Clear roles and responsibilities
   - Weekly independent evaluations
   - Collaborative problem-solving

4. **Practical Application**
   - Real-world marketplace platform
   - Production-ready architecture
   - Scalable, maintainable codebase

---

## 📞 Support & Questions

**Need Help?**
- Check individual README files in subdirectories
- Review metrics documentation
- Examine example outputs in `tools/coupling/metrics/`

**Found a Bug?**
- Open an issue with reproduction steps
- Include relevant metrics if architecture-related
- Provide system environment details

**Have Ideas?**
- We welcome feature suggestions
- Discuss metric improvements
- Share optimization strategies


## 🏆 Project Highlights

> "This project showcases how modern software engineering principles, combined with AI-assisted development and rigorous metrics tracking, create maintainable, high-quality systems that evolve gracefully over time."

**Core Innovation**: Integrating quality metrics throughout the entire SDLC, from requirements to deployment, ensuring measurable excellence at every stage.


**Built with ❤️ and metrics-driven engineering excellence**
