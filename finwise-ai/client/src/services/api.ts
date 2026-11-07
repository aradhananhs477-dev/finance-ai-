import axios from 'axios';
import {
  Transaction,
  Budget,
  SavingsGoal,
  DashboardAnalytics,
  CategorizeResult,
  ChatMessage,
  SpendingAnalysis,
  MonthlyReport,
  User
} from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finwise_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and trigger logout if not already on login
      localStorage.removeItem('finwise_token');
      localStorage.removeItem('finwise_user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  demoLogin: async (): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/demo-login');
    return res.data;
  },
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (data: { email: string; password: string; name: string; currency?: string; monthlyIncomeTarget?: number }): Promise<{ token: string; user: User }> => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateApiKey: async (geminiApiKey: string): Promise<{ success: boolean; hasCustomApiKey: boolean }> => {
    const res = await api.post('/auth/update-key', { geminiApiKey });
    return res.data;
  }
};

export const transactionsApi = {
  getAll: async (params?: { type?: string; category?: string; search?: string; startDate?: string; endDate?: string }): Promise<{ transactions: Transaction[]; total: number }> => {
    const res = await api.get('/transactions', { params });
    return res.data;
  },
  create: async (data: Partial<Transaction>): Promise<Transaction> => {
    const res = await api.post('/transactions', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    const res = await api.put(`/transactions/${id}`, data);
    return res.data;
  },
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  },
  seedDemo: async (): Promise<{ success: boolean; message: string }> => {
    const res = await api.post('/transactions/seed-demo');
    return res.data;
  },
  clearAll: async (): Promise<{ success: boolean }> => {
    const res = await api.post('/transactions/clear-all');
    return res.data;
  }
};

export const budgetsApi = {
  getAll: async (): Promise<{ budgets: Budget[]; totalBudget: number; totalSpent: number; overallPercentage: number }> => {
    const res = await api.get('/budgets');
    return res.data;
  },
  createOrUpdate: async (data: { category: string; monthly_limit: number }): Promise<Budget> => {
    const res = await api.post('/budgets', data);
    return res.data;
  },
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/budgets/${id}`);
    return res.data;
  }
};

export const goalsApi = {
  getAll: async (): Promise<{ goals: SavingsGoal[]; totalTarget: number; totalSaved: number; overallProgress: number }> => {
    const res = await api.get('/goals');
    return res.data;
  },
  create: async (data: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    const res = await api.post('/goals', data);
    return res.data;
  },
  update: async (id: string, data: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    const res = await api.put(`/goals/${id}`, data);
    return res.data;
  },
  contribute: async (id: string, amount: number, action: 'deposit' | 'withdraw' = 'deposit'): Promise<SavingsGoal> => {
    const res = await api.post(`/goals/${id}/contribute`, { amount, action });
    return res.data;
  },
  delete: async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/goals/${id}`);
    return res.data;
  }
};

export const analyticsApi = {
  getDashboard: async (timeframe?: string): Promise<DashboardAnalytics> => {
    const res = await api.get('/analytics/dashboard', { params: { timeframe } });
    return res.data;
  },
  getReport: async (month?: string): Promise<MonthlyReport> => {
    const res = await api.get('/analytics/report', { params: { month } });
    return res.data;
  }
};

export const aiApi = {
  categorize: async (description: string, amount?: number, type: 'income' | 'expense' = 'expense'): Promise<CategorizeResult> => {
    const res = await api.post('/ai/categorize', { description, amount, type });
    return res.data;
  },
  chat: async (message: string): Promise<{ reply: string; userMessage: ChatMessage; assistantMessage: ChatMessage }> => {
    const res = await api.post('/ai/chat', { message });
    return res.data;
  },
  getChatHistory: async (): Promise<{ messages: ChatMessage[] }> => {
    const res = await api.get('/ai/chat-history');
    return res.data;
  },
  clearChatHistory: async (): Promise<{ success: boolean }> => {
    const res = await api.delete('/ai/chat-history');
    return res.data;
  },
  analyzeSpending: async (): Promise<SpendingAnalysis> => {
    const res = await api.post('/ai/spending-analysis');
    return res.data;
  },
  getMonthlySummary: async (monthYear?: string): Promise<{ monthYear: string; summary: string }> => {
    const res = await api.post('/ai/monthly-summary', { monthYear });
    return res.data;
  },
  getInsights: async (): Promise<{ insights: any[] }> => {
    const res = await api.get('/ai/insights');
    return res.data;
  }
};
