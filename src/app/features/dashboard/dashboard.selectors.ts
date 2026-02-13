import { Category, Transaction } from '../../data/finance-store.service';

export type Period = {
  start: string;
  end: string;
};

export type CategoryTotal = {
  categoryId: string | null;
  label: string;
  total: number;
  color?: string;
};

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(value: string): Date | null {
  const [y, m, d] = value.split('-').map((item) => Number.parseInt(item, 10));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return null;
  }
  return new Date(y, m - 1, d);
}

export function getMonthRange(date: Date): Period {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

export function getLastDaysRange(days: number, now = new Date()): Period {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - Math.max(0, days - 1));
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

export function normalizePeriod(period: Period): Period {
  if (!period.start || !period.end || period.start <= period.end) {
    return period;
  }
  return { start: period.end, end: period.start };
}

export function filterTransactionsByPeriod(transactions: Transaction[], start: string, end: string) {
  const normalized = normalizePeriod({ start, end });
  return transactions.filter((transaction) => {
    if (normalized.start && transaction.date < normalized.start) {
      return false;
    }
    if (normalized.end && transaction.date > normalized.end) {
      return false;
    }
    return true;
  });
}

export function getCategoryMap(categories: Category[]) {
  return new Map(categories.map((category) => [category.id, category]));
}

export function filterExpenseTransactions(transactions: Transaction[], categories: Category[]) {
  const map = getCategoryMap(categories);
  return transactions.filter((transaction) => {
    const category = map.get(transaction.categoryId);
    // If category is missing, keep it visible instead of silently dropping.
    return category ? category.type === 'expense' : true;
  });
}

export function groupExpensesByDay(
  transactions: Transaction[],
  start: string,
  end: string,
): { labels: string[]; values: number[] } {
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  if (!startDate || !endDate) {
    return { labels: [], values: [] };
  }

  const totals = transactions.reduce((acc, transaction) => {
    acc.set(transaction.date, (acc.get(transaction.date) ?? 0) + transaction.amount);
    return acc;
  }, new Map<string, number>());

  const labels: string[] = [];
  const values: number[] = [];

  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const last = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  while (cursor <= last) {
    const key = toIsoDate(cursor);
    labels.push(key);
    values.push(totals.get(key) ?? 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  return { labels, values };
}

export function groupExpensesByCategory(
  transactions: Transaction[],
  categories: Category[],
  limit = 6,
): CategoryTotal[] {
  const categoryMap = getCategoryMap(categories);

  const totals = transactions.reduce((acc, transaction) => {
    acc.set(transaction.categoryId, (acc.get(transaction.categoryId) ?? 0) + transaction.amount);
    return acc;
  }, new Map<string, number>());

  const rows = Array.from(totals.entries())
    .map(([categoryId, total]) => {
      const category = categoryMap.get(categoryId);
      return {
        categoryId,
        label: category?.name ?? 'Без категории',
        total,
        color: category?.color,
      } satisfies CategoryTotal;
    })
    .sort((a, b) => b.total - a.total);

  if (rows.length <= limit) {
    return rows;
  }

  const head = rows.slice(0, limit);
  const tail = rows.slice(limit);
  const otherTotal = tail.reduce((sum, item) => sum + item.total, 0);

  return [
    ...head,
    {
      categoryId: null,
      label: 'Другое',
      total: otherTotal,
      color: 'rgba(43, 124, 255, 0.35)',
    },
  ];
}

export function getTopCategories(transactions: Transaction[], categories: Category[], limit = 5) {
  return groupExpensesByCategory(transactions, categories, limit);
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
