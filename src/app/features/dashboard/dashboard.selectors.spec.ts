import { describe, expect, it } from 'vitest';
import { Category, Transaction } from '../../data/finance-store.service';
import {
  filterExpenseTransactions,
  filterTransactionsByPeriod,
  groupExpensesByCategory,
  groupExpensesByDay,
  normalizePeriod,
} from './dashboard.selectors';

function makeCategory(partial: Partial<Category> & Pick<Category, 'id' | 'name'>): Category {
  return {
    id: partial.id,
    name: partial.name,
    color: partial.color ?? '#2b7cff',
    type: partial.type ?? 'expense',
    createdAt: partial.createdAt ?? new Date('2026-02-01T00:00:00Z').toISOString(),
  };
}

function makeTx(partial: Partial<Transaction> & Pick<Transaction, 'id' | 'amount' | 'categoryId' | 'date'>): Transaction {
  return {
    id: partial.id,
    amount: partial.amount,
    currency: partial.currency ?? 'RUB',
    categoryId: partial.categoryId,
    note: partial.note ?? '',
    date: partial.date,
    createdAt: partial.createdAt ?? new Date('2026-02-01T00:00:00Z').toISOString(),
  };
}

describe('dashboard.selectors', () => {
  it('normalizePeriod swaps start/end when start > end', () => {
    expect(normalizePeriod({ start: '2026-02-10', end: '2026-02-01' })).toEqual({
      start: '2026-02-01',
      end: '2026-02-10',
    });
  });

  it('filterTransactionsByPeriod includes boundary dates', () => {
    const tx = [
      makeTx({ id: 't1', categoryId: 'c1', amount: 10, date: '2026-02-01' }),
      makeTx({ id: 't2', categoryId: 'c1', amount: 20, date: '2026-02-02' }),
      makeTx({ id: 't3', categoryId: 'c1', amount: 30, date: '2026-02-03' }),
    ];

    const filtered = filterTransactionsByPeriod(tx, '2026-02-01', '2026-02-03');
    expect(filtered.map((t) => t.id)).toEqual(['t1', 't2', 't3']);
  });

  it('groupExpensesByDay fills missing dates with zeros', () => {
    const tx = [
      makeTx({ id: 't1', categoryId: 'c1', amount: 10, date: '2026-02-01' }),
      makeTx({ id: 't2', categoryId: 'c1', amount: 5, date: '2026-02-03' }),
    ];

    const result = groupExpensesByDay(tx, '2026-02-01', '2026-02-03');
    expect(result.labels).toEqual(['2026-02-01', '2026-02-02', '2026-02-03']);
    expect(result.values).toEqual([10, 0, 5]);
  });

  it('filterExpenseTransactions keeps expense, drops income, keeps unknown categories', () => {
    const categories = [
      makeCategory({ id: 'c-exp', name: 'Еда', type: 'expense' }),
      makeCategory({ id: 'c-inc', name: 'ЗП', type: 'income' }),
    ];
    const tx = [
      makeTx({ id: 't1', categoryId: 'c-exp', amount: 10, date: '2026-02-01' }),
      makeTx({ id: 't2', categoryId: 'c-inc', amount: 999, date: '2026-02-01' }),
      makeTx({ id: 't3', categoryId: 'missing', amount: 4, date: '2026-02-01' }),
    ];

    const filtered = filterExpenseTransactions(tx, categories);
    expect(filtered.map((t) => t.id)).toEqual(['t1', 't3']);
  });

  it('groupExpensesByCategory returns top N and merges rest into "Другое"', () => {
    const categories = [
      makeCategory({ id: 'c1', name: 'A', color: '#111111' }),
      makeCategory({ id: 'c2', name: 'B', color: '#222222' }),
      makeCategory({ id: 'c3', name: 'C', color: '#333333' }),
      makeCategory({ id: 'c4', name: 'D', color: '#444444' }),
    ];
    const tx = [
      makeTx({ id: 't1', categoryId: 'c1', amount: 100, date: '2026-02-01' }),
      makeTx({ id: 't2', categoryId: 'c2', amount: 90, date: '2026-02-01' }),
      makeTx({ id: 't3', categoryId: 'c3', amount: 80, date: '2026-02-01' }),
      makeTx({ id: 't4', categoryId: 'c4', amount: 70, date: '2026-02-01' }),
    ];

    const result = groupExpensesByCategory(tx, categories, 2);
    expect(result[0]?.label).toBe('A');
    expect(result[1]?.label).toBe('B');
    expect(result[2]?.label).toBe('Другое');
    expect(result[2]?.total).toBe(150);
  });
});

