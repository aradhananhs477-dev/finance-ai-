# FinWise AI – Intelligent Personal Finance Management System

> **Fintech-Grade, AI-Powered Personal Finance Platform for Students and Young Professionals**  
> Built with React 18, TypeScript, Tailwind CSS, Node.js Express, Native SQLite, Recharts, and Google Gemini AI. Fully denominated in Indian Rupees (₹ INR).

---

## 🌟 Executive Overview

**FinWise AI** is an intelligent personal finance web application that helps students and young professionals master their money. It bridges the gap between passive transaction tracking and proactive financial guidance through **Google Gemini AI**.

Instead of generic advice, FinWise AI grounds all AI responses, spending analyses, and chatbot replies directly in the user's live transactional database.

---

## 🚀 Key Features

### 1. 📊 Financial Dashboard
- **Executive Metric Cards**: Total Net Balance, Monthly Inflow, Monthly Outflow, and Monthly Savings Rate (%) with month-over-month growth trends.
- **Dynamic Gemini Pulse Deck**: 3 real-time AI insight cards diagnosing savings pace, variable spending, and emergency fund runways.
- **Income vs Expense Cash Flow Trend**: 6-month interactive Area Chart built with Recharts.
- **Category Expense Breakdown**: Interactive Donut / Pie Chart showing spending distribution across categories.
- **Recent Activity Feed**: Real-time transaction list with category badges, UPI/Card tags, and amounts.
- **Budget Alerts**: Visual warning indicators for categories exceeding 80% and 100% thresholds.

### 2. 💳 Transaction Management & AI Categorization
- **Full CRUD Support**: Add, edit, and delete transactions.
- **INR (₹) Standard**: Native formatting for Indian currency (`₹1,250`, `₹48,000`).
- **Payment Methods**: UPI (GPay, PhonePe, Paytm), Net Banking, Credit Card, Debit Card, Cash.
- **Gemini AI Auto-Categorization**:
  - Automatically identifies category as user enters description (e.g., `Swiggy ₹350` → **Food**, `Uber ₹180` → **Transport**, `Amazon ₹1499` → **Shopping**, `Coursera ₹2800` → **Education**).
  - Displays match confidence percentage (e.g., 95% match) and merchant reasoning.
  - Users can confirm or modify AI suggestions.
- **Search & Filters**: Multi-faceted filtering by Category, Type (Income vs Expense), and keywords.
- **Export to CSV**: Download transactional statements for spreadsheets and tax audits.

### 3. 🤖 AI Financial Assistant (Interactive Chatbot)
- Interactive, responsive chat interface with conversation history stored in SQLite.
- **RAG-Grounded Context**: Queries the user's actual database records to answer:
  - *"Where am I spending most?"* → Calculates top expense category, exact ₹ amount, and percentage of total outflow.
  - *"How much did I spend on food?"* → Computes food total, share of outflow, and active budget consumption.
  - *"How can I save ₹2,000 next month?"* → Formulates a concrete 3-part cut on delivery, impulse shopping, and subscriptions.
  - *"Which expenses can I reduce?"* → Pinpoints variable vs fixed leakages.
  - *"Compare this month with last month"* → Calculates month-over-month variances and growth percentages.
- **Quick-Prompt Carousel**: One-click prompt chips for rapid demonstration.

### 4. 🧠 Deep AI Spending Analysis
- **Financial Health Index (0-100)**: Proprietary gauge scoring cash retention, fixed cost ratios, and budget discipline.
- **AI Executive Diagnosis**: Comprehensive natural language assessment of financial stability.
- **Spending Patterns**: Detection of recurring subscriptions, weekend spikes, and grocery cycles.
- **Anomalies & Leakage Alerts**: Flags unusual micro-debits and category breaches.
- **Quantified Savings Opportunities**: Tailored recommendations with estimated monthly savings in ₹ (e.g. `+₹1,500/mo by consolidating delivery surcharges`).
- **Action Plan Checklist**: Interactive checklist of concrete next steps.

### 5. 🎯 Budget Management & Early Warning System
- Set monthly spending ceilings per category (`Food`, `Shopping`, `Transport`, `Rent`, `Bills`, etc.).
- **Automated Threshold Warnings**:
  - 🟢 **Normal (<80%)**: Safe spending trajectory.
  - 🟡 **Caution (80% - 99%)**: Automated warning badge alerting user that 80% of budget is consumed.
  - 🔴 **Danger (≥100%)**: Urgent breach alert with exact overspend amount (e.g., `Over by ₹1,400`).

### 6. 🏆 Savings Goals Tracker
- Set financial targets (e.g., *Emergency Fund*, *MacBook Pro M-Series*, *Goa College Trip*, *Cloud Certifications*).
- **Automated Monthly Pace Calculator**: Calculates exact monthly deposit required based on remaining amount and target date.
- **Deposit & Withdraw Modal**: Adjust saved funds directly with one click.

### 7. 📑 Monthly Reports & Statements
- Select statement month (e.g., November 2026, October 2026).
- Performance breakdown: Total Income, Expenses, Retained Savings, and Transaction count.
- Daily Outflow bar chart.
- **Gemini AI Monthly Executive Summary**: Formatted performance audit with financial grade (A), top strengths, areas for improvement, and a 30-day forward outlook.
- **Printable Statement**: Clean layout formatted for printing or saving to PDF.

### 8. 🚀 Instant Demo Mode
- **1-Click Evaluation**: Immediate access without sign-up hassles.
- **Authentic Indian Data**: 25+ realistic transactions across months (October & November 2026) featuring Swiggy, Zomato, Uber, Amazon, Blinkit, Airtel Fiber, Rent, Salary, and Freelance projects in INR (₹).
- Clearly labeled with `[Demo Data]` tags.
- Dedicated "Reset Demo Data" button in the sidebar.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS | Fast, responsive, dark navy fintech theme |
| **Data Visuals** | Recharts | Area charts, Donut charts, Bar charts |
| **Icons & UI** | Lucide React | High-resolution fintech iconography |
| **Backend API** | Node.js, Express, TypeScript | REST API with JWT authentication & input validation |
| **Database** | Node native SQLite (`node:sqlite`) | Zero native C++ dependency, pure SQLite `.db` storage |
| **AI Integration** | Google Gemini 1.5 / 2.5 Flash | Real-time categorization, RAG chatbot, deep spending analysis |

---

## 📁 Project Structure

```
finwise-ai/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # UI Components (Sidebar, Header, Modals, Auth)
│   │   │   ├── AddTransactionModal.tsx  # Modal with Gemini AI Auto-Categorize
│   │   │   ├── ApiKeyModal.tsx          # Gemini API Key configuration
│   │   │   ├── AuthScreen.tsx           # Modern Login / Demo Access
│   │   │   ├── Header.tsx               # Top action bar
│   │   │   └── Sidebar.tsx              # Sidebar navigation & demo controls
│   │   ├── pages/              # Primary Application Views
│   │   │   ├── AIAssistantPage.tsx      # Grounded Financial Chatbot
│   │   │   ├── BudgetsPage.tsx          # Budgets with 80% & 100% alerts
│   │   │   ├── DashboardPage.tsx        # KPI cards, Recharts trends, insights
│   │   │   ├── ReportsPage.tsx          # Monthly reports & AI executive audit
│   │   │   ├── SavingsGoalsPage.tsx     # Goals & AI monthly contribution math
│   │   │   ├── SpendingAnalysisPage.tsx # AI Health score & leakage analysis
│   │   │   └── TransactionsPage.tsx     # Full CRUD transaction table & CSV export
│   │   ├── context/            # AuthContext (JWT & state management)
│   │   ├── services/           # Axios API client
│   │   ├── types/              # TypeScript definitions
│   │   ├── App.tsx             # Root application orchestrator
│   │   └── index.css           # Tailwind CSS & custom styling
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── middleware/         # JWT Auth Middleware
│   │   ├── routes/             # REST Endpoints
│   │   │   ├── ai.ts           # Categorize, Chat, Analysis, Monthly Summary
│   │   │   ├── analytics.ts    # Dashboard KPIs, Monthly Trends, Reports
│   │   │   ├── auth.ts         # Register, Login, Demo 1-Click Login, Profile
│   │   │   ├── budgets.ts      # Budget CRUD & threshold calculations
│   │   │   ├── goals.ts        # Savings Goals & contributions
│   │   │   └── transactions.ts # Transaction CRUD & filters
│   │   ├── services/
│   │   │   └── geminiService.ts# Google Gemini AI Integration & Grounding Engine
│   │   ├── database.ts         # SQLite tables & demo seeding
│   │   ├── test-suite.ts       # Automated end-to-end verification suite
│   │   └── index.ts            # Server entry point
│   ├── .env                    # Environment variables
│   └── package.json
│
├── run-dev.bat                 # Windows batch launcher (runs server & client)
├── run-dev.ps1                 # PowerShell launcher
└── package.json                # Root package configuration
```

---

## ⚡ Quick Start & Setup

### 1. Prerequisites
- **Node.js** v18 or higher (v24 recommended).
- **npm** (comes bundled with Node.js).

### 2. Running the Application

You can launch both the backend and frontend with a single command from `finwise-ai`:

#### Option A: Quick Launcher (Windows)
Double-click `run-dev.bat` or run in PowerShell:
```powershell
.\run-dev.ps1
```

#### Option B: Terminal Command
From the `finwise-ai` directory:
```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd client
npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Gemini AI Configuration

FinWise AI connects to **Google Gemini AI** (`gemini-1.5-flash`).

### How to configure your Gemini API Key:
1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Set it using either method:
   - **Method A (In UI)**: Click the **"AI Configuration"** button on the bottom-left sidebar of the app, paste your key, and click Save.
   - **Method B (In `.env`)**: In `server/.env`, set:
     ```env
     GEMINI_API_KEY=your_actual_gemini_api_key_here
     ```
3. *Resilience Feature*: If no key is set yet or if offline, FinWise AI seamlessly switches to its built-in algorithmic categorization and database grounding engine, ensuring the app remains 100% operational during offline demonstrations.

---

## 🧪 Testing the AI Engine

Run the built-in automated test suite:
```bash
cd server
npx tsx src/test-suite.ts
```

This verifies:
1. SQLite database initialization and demo record seeding.
2. Context extraction (Income, Expenses, Net Savings, Savings Rate).
3. Gemini AI transaction categorization (`Swiggy` → Food, `Uber` → Transport, `Amazon` → Shopping).
4. Grounded AI Financial Assistant responses to *"Where am I spending most?"*, *"How can I save ₹2,000 next month?"*, and month comparisons.
5. AI Spending Analysis (Health Score 0-100, Anomalies, Savings Opportunities).
6. Monthly AI Executive Summary generation.
7. Budget threshold calculations (80% and 100% alerts).
8. Savings goal monthly contribution calculations.

---

## 🎓 Viva & Project Demonstration Points

1. **Why Gemini AI instead of generic LLMs?**  
   Gemini 1.5/2.5 Flash provides fast inference with low latency, structured JSON outputs, and large context windows for analyzing multi-month transactional records.
2. **How does FinWise AI prevent hallucinations?**  
   It implements **Retrieval-Augmented Grounding (RAG)**: the backend extracts exact figures (Income, Outflow, Category Totals, Budgets, and Goals) from SQLite and injects them directly into the system prompt. The AI reasons over real math instead of inventing numbers.
3. **How does AI Auto-Categorization work?**  
   When the user types a description, FinWise AI sends the merchant name and amount to Gemini, which classifies it into standard categories with confidence scores and money-saving tips.
4. **Is user financial data secure?**  
   Yes. Password hashes use `bcrypt` (10 rounds), API endpoints require signed `JWT` tokens, and all data queries are parameterized with prepared statements to prevent SQL injection.

---

## 📄 License
MIT License. Built for academic demonstration and personal financial empowerment.
