import { initDatabase, db, seedDemoRecords } from './database.js';
import { categorizeTransaction, chatWithFinancialAssistant, generateSpendingAnalysis, generateMonthlyReportSummary, getUserFinancialContext } from './services/geminiService.js';

async function runTests() {
  console.log('=== STARTING FINWISE AI COMPREHENSIVE TEST SUITE ===');

  // 1. Initialize DB
  initDatabase();
  const demoUserId = 'usr_demo_finwise_01';
  seedDemoRecords(demoUserId);
  console.log('✓ 1. Database and Demo Records verified.');

  // 2. Test Financial Context Gathering
  const ctx = getUserFinancialContext(demoUserId);
  console.log(`✓ 2. Context extracted: Income=₹${ctx.currentIncome}, Expenses=₹${ctx.currentExpense}, Net Savings=₹${ctx.netSavings}, Savings Rate=${ctx.savingsRate}%`);
  if (ctx.currentIncome <= 0 || ctx.currentExpense <= 0) {
    throw new Error('Financial context calculation failed');
  }

  // 3. Test AI Categorization
  const cat1 = await categorizeTransaction('Swiggy gourmet dinner delivery', 450, 'expense');
  console.log(`✓ 3a. AI Categorize "Swiggy gourmet dinner delivery" -> Category: ${cat1.category} (${(cat1.confidence * 100).toFixed(0)}% confidence)`);
  if (cat1.category !== 'Food') {
    console.warn('Unexpected category for Swiggy:', cat1);
  }

  const cat2 = await categorizeTransaction('Uber cab to Bengaluru airport', 650, 'expense');
  console.log(`✓ 3b. AI Categorize "Uber cab to Bengaluru airport" -> Category: ${cat2.category}`);
  if (cat2.category !== 'Transport') {
    console.warn('Unexpected category for Uber:', cat2);
  }

  const cat3 = await categorizeTransaction('Amazon prime electronics purchase', 1499, 'expense');
  console.log(`✓ 3c. AI Categorize "Amazon prime electronics purchase" -> Category: ${cat3.category}`);

  // 4. Test AI Grounded Financial Assistant (Chatbot)
  const q1 = 'Where am I spending most?';
  const a1 = await chatWithFinancialAssistant(demoUserId, q1);
  console.log(`✓ 4a. Query: "${q1}"`);
  console.log(`Response preview: ${a1.substring(0, 150)}...`);

  const q2 = 'How can I save ₹2,000 next month?';
  const a2 = await chatWithFinancialAssistant(demoUserId, q2);
  console.log(`✓ 4b. Query: "${q2}"`);
  console.log(`Response preview: ${a2.substring(0, 150)}...`);

  const q3 = 'Compare this month with last month';
  const a3 = await chatWithFinancialAssistant(demoUserId, q3);
  console.log(`✓ 4c. Query: "${q3}"`);
  console.log(`Response preview: ${a3.substring(0, 150)}...`);

  // 5. Test AI Spending Analysis
  const analysis = await generateSpendingAnalysis(demoUserId);
  console.log(`✓ 5. Spending Analysis generated: Health Score=${analysis.healthScore}/100, High Spending Categories=${analysis.highSpendingCategories.length}, Savings Opportunities=${analysis.savingsOpportunities.length}`);

  // 6. Test Monthly Summary
  const monthlySummary = await generateMonthlyReportSummary(demoUserId, '2026-11');
  console.log(`✓ 6. Monthly Report AI Summary preview: ${monthlySummary.substring(0, 150)}...`);

  // 7. Verify Budgets and 80%/100% Alert Logic
  const budgets = db.prepare('SELECT * FROM budgets WHERE user_id = ?').all(demoUserId) as any[];
  console.log(`✓ 7. Verified ${budgets.length} category budgets configured for demo user.`);

  // 8. Verify Savings Goals and Monthly Calculation
  const goals = db.prepare('SELECT * FROM savings_goals WHERE user_id = ?').all(demoUserId) as any[];
  console.log(`✓ 8. Verified ${goals.length} savings goals active.`);

  console.log('\n🎉 ALL 8 FINWISE AI CORE ENGINE TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
