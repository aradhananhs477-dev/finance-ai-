import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.resolve(process.cwd(), 'finwise.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for better concurrency and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function queryOne<T = any>(sql: string, ...params: any[]): T | undefined {
  return db.prepare(sql).get(...(params as any)) as T | undefined;
}

export function queryAll<T = any>(sql: string, ...params: any[]): T[] {
  return db.prepare(sql).all(...(params as any)) as T[];
}

export function execute(sql: string, ...params: any[]): { changes: number | bigint; lastInsertRowid: number | bigint } {
  return db.prepare(sql).run(...(params as any)) as any;
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      currency TEXT DEFAULT 'INR',
      monthly_income_target REAL DEFAULT 50000,
      gemini_api_key TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'UPI',
      ai_suggested INTEGER DEFAULT 0,
      ai_confidence REAL DEFAULT 0,
      notes TEXT,
      is_demo INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      monthly_limit REAL NOT NULL,
      month_year TEXT NOT NULL, -- e.g. '2026-11'
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, category, month_year),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      target_date TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      notes TEXT,
      is_demo INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      context_data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('[Database] Tables initialized successfully at', DB_PATH);
  seedDemoDataIfNeeded();
}

export function seedDemoDataIfNeeded() {
  const demoUserId = 'usr_demo_finwise_01';
  const existingUser = queryOne('SELECT id FROM users WHERE id = ?', demoUserId);

  if (!existingUser) {
    console.log('[Database] Seeding realistic Indian financial demo data...');
    const passwordHash = bcrypt.hashSync('demo123', 10);
    
    execute(`
      INSERT INTO users (id, email, password_hash, name, currency, monthly_income_target, gemini_api_key)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, demoUserId, 'demo@finwise.ai', passwordHash, 'Aarav Sharma', 'INR', 55000, '');

    seedDemoRecords(demoUserId);
  }
}

export function seedDemoRecords(userId: string) {
  // Clear any existing demo transactions/budgets/goals for this user
  execute('DELETE FROM transactions WHERE user_id = ?', userId);
  execute('DELETE FROM budgets WHERE user_id = ?', userId);
  execute('DELETE FROM savings_goals WHERE user_id = ?', userId);
  execute('DELETE FROM chat_messages WHERE user_id = ?', userId);

  const currentYearMonth = '2026-11';
  const prevYearMonth = '2026-10';

  // Demo transactions: realistic INR student & young professional spend
  const transactionsData = [
    // Income November 2026
    { id: 'tx_d01', type: 'income', amount: 48000, category: 'Salary', description: 'Monthly Software Developer Salary - TechCorp India', date: '2026-11-01', payment_method: 'Net Banking', notes: 'Credited to HDFC A/C' },
    { id: 'tx_d02', type: 'income', amount: 12500, category: 'Freelancing', description: 'Next.js Web App Design & Development - Client Upwork', date: '2026-11-03', payment_method: 'UPI', notes: 'Received via Razorpay UPI' },
    { id: 'tx_d03', type: 'income', amount: 3000, category: 'Investments', description: 'Quarterly Mutual Fund Dividend Payout', date: '2026-11-05', payment_method: 'Net Banking', notes: 'UTI Nifty 50 Index Fund' },

    // Expenses November 2026
    { id: 'tx_d04', type: 'expense', amount: 14000, category: 'Rent', description: 'Monthly Apartment Rent Sharing - 2BHK Koramangala', date: '2026-11-02', payment_method: 'UPI', notes: 'Sent to Landlord via GPay' },
    { id: 'tx_d05', type: 'expense', amount: 350, category: 'Food', description: 'Swiggy Dinner - Biryani By Kilo & Cold Drink', date: '2026-11-02', payment_method: 'UPI', notes: 'Late evening order' },
    { id: 'tx_d06', type: 'expense', amount: 180, category: 'Transport', description: 'Uber Auto Ride to Tech Park Office', date: '2026-11-03', payment_method: 'UPI', notes: 'Morning commute' },
    { id: 'tx_d07', type: 'expense', amount: 1499, category: 'Shopping', description: 'Amazon India - Wireless Mechanical Keyboard & Mousepad', date: '2026-11-03', payment_method: 'Credit Card', notes: 'Prime discount applied' },
    { id: 'tx_d08', type: 'expense', amount: 899, category: 'Bills', description: 'Airtel Fiber Broadband Unlimited 200Mbps Monthly Bill', date: '2026-11-04', payment_method: 'UPI', notes: 'Auto-debit setup' },
    { id: 'tx_d09', type: 'expense', amount: 450, category: 'Food', description: 'Zomato Lunch - Healthy Green Salad Bowl & Smoothie', date: '2026-11-04', payment_method: 'UPI', notes: 'Office lunch' },
    { id: 'tx_d10', type: 'expense', amount: 2800, category: 'Education', description: 'Coursera Deep Learning & Full-Stack AI Specialization Certificate', date: '2026-11-04', payment_method: 'Credit Card', notes: 'Upskilling investment' },
    { id: 'tx_d11', type: 'expense', amount: 650, category: 'Healthcare', description: 'Apollo Pharmacy - Multivitamins, Protein Bar, and Eyedrops', date: '2026-11-05', payment_method: 'UPI', notes: 'Health essentials' },
    { id: 'tx_d12', type: 'expense', amount: 499, category: 'Entertainment', description: 'Netflix Premium 4K UHD Monthly Subscription', date: '2026-11-05', payment_method: 'Credit Card', notes: 'Recurring charge' },
    { id: 'tx_d13', type: 'expense', amount: 120, category: 'Transport', description: 'Namma Metro Smart Card Auto-Topup via Paytm', date: '2026-11-05', payment_method: 'UPI', notes: 'Weekly metro card recharge' },
    { id: 'tx_d14', type: 'expense', amount: 1250, category: 'Food', description: 'Blinkit Instant Grocery - Milk, Oats, Fruits, and Coffee', date: '2026-11-05', payment_method: 'UPI', notes: 'Weekly grocery restock' },

    // Previous Month (October 2026) for trend analysis & comparisons
    { id: 'tx_d15', type: 'income', amount: 48000, category: 'Salary', description: 'Monthly Software Developer Salary - TechCorp India', date: '2026-10-01', payment_method: 'Net Banking', notes: 'October pay' },
    { id: 'tx_d16', type: 'income', amount: 8000, category: 'Freelancing', description: 'React Dashboard Consulting - Startup Client', date: '2026-10-15', payment_method: 'UPI', notes: 'Consulting gig' },
    { id: 'tx_d17', type: 'expense', amount: 14000, category: 'Rent', description: 'Monthly Apartment Rent Sharing', date: '2026-10-02', payment_method: 'UPI', notes: 'October Rent' },
    { id: 'tx_d18', type: 'expense', amount: 6800, category: 'Food', description: 'Monthly Food, Groceries & Swiggy/Zomato Total', date: '2026-10-28', payment_method: 'UPI', notes: 'Food aggregated' },
    { id: 'tx_d19', type: 'expense', amount: 2400, category: 'Transport', description: 'Monthly Metro & Cabs commute', date: '2026-10-29', payment_method: 'UPI', notes: 'Commute' },
    { id: 'tx_d20', type: 'expense', amount: 5200, category: 'Shopping', description: 'Myntra Diwali Festival Festive Clothing & Footwear', date: '2026-10-18', payment_method: 'Credit Card', notes: 'Diwali sale shopping' },
    { id: 'tx_d21', type: 'expense', amount: 1350, category: 'Bills', description: 'Electricity & Water Board Utility Bill', date: '2026-10-10', payment_method: 'Net Banking', notes: 'BESCOM bill' },
    { id: 'tx_d22', type: 'expense', amount: 4500, category: 'Travel', description: 'IRCTC Train Tickets & Resort stay for Weekend Getaway to Ooty', date: '2026-10-22', payment_method: 'Net Banking', notes: 'Relaxation trip' },
    { id: 'tx_d23', type: 'expense', amount: 1500, category: 'Education', description: 'Technical Books on System Design & Cloud Architecture', date: '2026-10-12', payment_method: 'UPI', notes: 'O’Reilly books' },
    { id: 'tx_d24', type: 'expense', amount: 1200, category: 'Entertainment', description: 'PVR Inox Movie Night - IMAX Tickets with Popcorn', date: '2026-10-26', payment_method: 'UPI', notes: 'Weekend movie with friends' },
    { id: 'tx_d25', type: 'expense', amount: 5000, category: 'Investments', description: 'Monthly Mutual Fund SIP in Parag Parikh Flexi Cap', date: '2026-10-10', payment_method: 'Net Banking', notes: 'Systematic Investment Plan' },
  ];

  for (const tx of transactionsData) {
    execute(`
      INSERT INTO transactions (id, user_id, type, amount, category, description, date, payment_method, ai_suggested, ai_confidence, notes, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, tx.id, userId, tx.type, tx.amount, tx.category, tx.description, tx.date, tx.payment_method, 1, 0.95, tx.notes || '');
  }

  // Monthly Budgets for November 2026
  const budgetsData = [
    { id: 'bg_01', category: 'Food', limit: 8000 },
    { id: 'bg_02', category: 'Shopping', limit: 5000 },
    { id: 'bg_03', category: 'Transport', limit: 2500 },
    { id: 'bg_04', category: 'Entertainment', limit: 2000 },
    { id: 'bg_05', category: 'Bills', limit: 3000 },
    { id: 'bg_06', category: 'Education', limit: 5000 },
    { id: 'bg_07', category: 'Rent', limit: 15000 },
    { id: 'bg_08', category: 'Healthcare', limit: 2000 },
  ];

  for (const bg of budgetsData) {
    execute(`
      INSERT INTO budgets (id, user_id, category, monthly_limit, month_year)
      VALUES (?, ?, ?, ?, ?)
    `, bg.id, userId, bg.category, bg.limit, currentYearMonth);
  }

  // Savings Goals
  const goalsData = [
    { id: 'sg_01', title: 'Emergency Fund (6 Months Expenses)', target_amount: 80000, current_amount: 52000, target_date: '2027-04-30', category: 'Emergency', notes: 'Safety net in high-yield liquid FD' },
    { id: 'sg_02', title: 'MacBook Pro M-Series / AI Rig Upgrade', target_amount: 110000, current_amount: 68000, target_date: '2027-02-28', category: 'Gadgets', notes: 'For AI model training and freelance coding' },
    { id: 'sg_03', title: 'Goa Year-End Roadtrip with College Friends', target_amount: 25000, current_amount: 18500, target_date: '2026-12-25', category: 'Travel', notes: 'Includes flights and beach resort booking' },
    { id: 'sg_04', title: 'AWS & Kubernetes Cloud Certification Fund', target_amount: 20000, current_amount: 14000, target_date: '2027-01-15', category: 'Education', notes: 'Certification exam vouchers & practice exams' },
  ];

  for (const g of goalsData) {
    execute(`
      INSERT INTO savings_goals (id, user_id, title, target_amount, current_amount, target_date, category, notes, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, g.id, userId, g.title, g.target_amount, g.current_amount, g.target_date, g.category, g.notes);
  }

  // Initial welcome message in chat
  execute(`
    INSERT INTO chat_messages (id, user_id, role, content)
    VALUES (?, ?, ?, ?)
  `, 'msg_welcome', userId, 'assistant',
    'Hello Aarav! 👋 I am **FinWise AI**, your personal intelligent financial co-pilot.\n\nI have analyzed your recent November transactions in INR (₹):\n- **Total Income**: ₹63,500\n- **Total Expenses**: ₹22,747\n- **Current Net Savings**: ₹40,753 (64.2% savings rate)\n\nYou have great savings momentum this month! How can I help you today? You can ask me:\n- *"Where am I spending most?"*\n- *"How can I save ₹2,000 next month?"*\n- *"Which expenses can I reduce?"*\n- *"Compare this month with last month"*\n- Or ask anything about your budgets and savings goals!'
  );

  console.log('[Database] Demo records seeded successfully.');
}
