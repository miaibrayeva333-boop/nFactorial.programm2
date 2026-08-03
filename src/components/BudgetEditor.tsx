import { useState } from 'react';

export type BudgetTransaction = {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  createdAt: string;
};

type Props = {
  balance: number;
  transactions: BudgetTransaction[];
  onAdd: (transaction: BudgetTransaction) => void;
};

export function BudgetEditor({ balance, transactions, onAdd }: Props) {
  const [amount, setAmount] = useState('');
  const value = Number(amount);

  function add(type: BudgetTransaction['type']) {
    if (!Number.isFinite(value) || value <= 0) return;
    const recordedAmount = type === 'expense' ? Math.min(value, balance) : value;
    if (recordedAmount <= 0) return;
    onAdd({ id: Date.now(), type, amount: recordedAmount, createdAt: new Date().toISOString() });
    setAmount('');
  }

  return (
    <>
      <div className="tracker-symbol orange">$</div><h2>Budget</h2>
      <p>Available balance: <strong>${balance.toLocaleString()}</strong></p>
      <input className="amount-input" min="0" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Enter amount" type="number" />
      <div className="budget-actions">
        <button disabled={!value} onClick={() => add('income')} type="button">＋ Income</button>
        <button disabled={!value} onClick={() => add('expense')} type="button">− Expense</button>
      </div>
      <section className="budget-history">
        <h3>History</h3>
        {transactions.length ? transactions.map((transaction) => (
          <article key={transaction.id}>
            <span className={transaction.type}>{transaction.type === 'income' ? '＋' : '−'}</span>
            <div><strong>{transaction.type === 'income' ? 'Income' : 'Expense'}</strong><small>{formatTime(transaction.createdAt)}</small></div>
            <b className={transaction.type}>{transaction.type === 'income' ? '+' : '−'}${transaction.amount.toLocaleString()}</b>
          </article>
        )) : <p>No transactions yet.</p>}
      </section>
    </>
  );
}

function formatTime(value: string) {
  return new Date(value).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
