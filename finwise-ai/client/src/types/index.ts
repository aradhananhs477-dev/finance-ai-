export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Food'
  | 'Shopping'
  | 'Education'
  | 'Transport'
  | 'Entertainment'
  | 'Healthcare'
  | 'Bills'
  | 'Rent'
  | 'Travel'
  | 'Salary'
  | 'Freelancing'
  | 'Investments'
  | 'Others';

export type PaymentMethod =
  | 'UPI'
  | 'Net Banking'
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash';

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  monthlyIncomeTarget?: number;
  hasCustomApiKey?: boolean;
  isDemo?: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string;
  payment_method: PaymentMethod;
  ai_suggested: number;
  ai_confidence: number;
  notes?: string;
  is_demo: number;
  created_at?: string;
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  monthly_limit: number;
  month_year: string;
  spent: number;
  remaining: number;
  percentage: number;
  alertStatus: 'NORMAL' | 'WARNING_80' | 'OVER_BUDGET';
  isOverBudget: boolean;
  isWarning: boolean;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  notes?: string;
  remaining: number;
  progress: number;
  suggestedMonthly: number;
  monthsRemaining: number;
  isCompleted: boolean;
  is_demo: number;
}

export interface DashboardAnalytics {
  timeframe?: string;
  kpis: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    netSavings: number;
    savingsRate: number;
    incomeGrowth: number;
    expenseGrowth: number;
  };
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrends: {
    label?: string;
    month?: string;
    monthLabel?: string;
    income: number;
    expense: number;
    savings: number;
  }[];
  recentTransactions: Transaction[];
  budgetsSummary: {
    category: string;
    limit: number;
    spent: number;
    remaining: number;
    percentage: number;
    alert: 'ok' | 'warning' | 'danger';
  }[];
  goalsSummary: {
    id: string;
    title: string;
    target: number;
    current: number;
    percentage: number;
  }[];
}

export interface CategorizeResult {
  category: TransactionCategory;
  confidence: number;
  reasoning: string;
  suggestedTags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface SpendingAnalysis {
  healthScore: number;
  summary: string;
  spendingPatterns: string[];
  anomalies: string[];
  highSpendingCategories: {
    category: string;
    amount: number;
    percentage: number;
    insight: string;
  }[];
  savingsOpportunities: {
    title: string;
    potentialMonthlySavings: number;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
  }[];
  actionPlan: string[];
}

export interface MonthlyReport {
  monthYear: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  paymentMethodBreakdown: Record<string, number>;
  dailyTrend: {
    date: string;
    amount: number;
  }[];
  transactions: Transaction[];
}
