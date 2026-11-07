import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { SpendingAnalysisPage } from './pages/SpendingAnalysisPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { Transaction } from './types';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Initializing FinWise AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleDataChanged = () => {
    setDataRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onRefreshData={handleDataChanged}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenAddModal={handleOpenAdd}
          onNavigateToChat={() => setCurrentTab('ai-chat')}
          onRefresh={handleDataChanged}
        />

        <main className="flex-1 overflow-y-auto" key={dataRefreshKey}>
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onOpenAddModal={handleOpenAdd}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsPage
              onOpenAddModal={handleOpenAdd}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {currentTab === 'ai-chat' && <AIAssistantPage />}

          {currentTab === 'spending-analysis' && <SpendingAnalysisPage />}

          {currentTab === 'budgets' && <BudgetsPage />}

          {currentTab === 'goals' && <SavingsGoalsPage />}

          {currentTab === 'reports' && <ReportsPage />}
        </main>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={handleDataChanged}
        editTransaction={editingTransaction}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
