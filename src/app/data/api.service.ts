import { Injectable } from '@angular/core';
import { Category, Transaction } from './finance-store.service';

const API_BASE_URL = '/api';
const DEFAULT_CATEGORY_COLOR = '#3b82f6';
const DEFAULT_CURRENCY = 'RUB';

type BackendCategory = {
  id: string;
  name: string;
  color?: string;
  type?: Category['type'];
  createdAt?: string;
};

type BackendTransaction = {
  id: string;
  categoryId: string;
  amount: number | string;
  date: string;
  description?: string | null;
  note?: string | null;
  currency?: string | null;
  createdAt?: string;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  async getCategories() {
    const categories = await this.request<BackendCategory[]>(`${API_BASE_URL}/categories`);
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color ?? DEFAULT_CATEGORY_COLOR,
      type: category.type ?? 'expense',
      createdAt: category.createdAt ?? new Date().toISOString(),
    }));
  }

  async getTransactions() {
    const transactions = await this.request<BackendTransaction[]>(`${API_BASE_URL}/transactions`);
    return transactions.map((transaction) => this.mapTransaction(transaction));
  }

  async createCategory(category: Category) {
    const payload = {
      name: category.name,
    };

    await this.request(`${API_BASE_URL}/categories`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateCategory(category: Category) {
    const payload = {
      name: category.name,
    };

    await this.request(`${API_BASE_URL}/categories/${category.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteCategory(categoryId: string) {
    await this.request(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  async createTransaction(transaction: Transaction) {
    const payload = {
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.note.trim() || undefined,
    };

    await this.request(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTransaction(transaction: Transaction) {
    const payload = {
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.note.trim() || undefined,
    };

    await this.request(`${API_BASE_URL}/transactions/${transaction.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteTransaction(transactionId: string) {
    await this.request(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  }

  private async request<T>(input: string, init?: RequestInit) {
    const response = await fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private mapTransaction(transaction: BackendTransaction): Transaction {
    const amount =
      typeof transaction.amount === 'number'
        ? transaction.amount
        : Number.parseFloat(String(transaction.amount));

    return {
      id: transaction.id,
      categoryId: transaction.categoryId,
      amount: Number.isFinite(amount) ? amount : 0,
      currency: transaction.currency ?? DEFAULT_CURRENCY,
      note: transaction.note ?? transaction.description ?? '',
      date: transaction.date,
      createdAt: transaction.createdAt ?? new Date().toISOString(),
    };
  }
}
