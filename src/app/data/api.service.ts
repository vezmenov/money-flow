import { Injectable } from '@angular/core';
import { Category, Transaction } from './finance-store.service';

const API_BASE_URL = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  async getCategories() {
    return this.request<Category[]>(`${API_BASE_URL}/categories`);
  }

  async getTransactions() {
    return this.request<Transaction[]>(`${API_BASE_URL}/transactions`);
  }

  async createCategory(category: Category) {
    await this.request(`${API_BASE_URL}/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(category: Category) {
    await this.request(`${API_BASE_URL}/categories/${category.id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(categoryId: string) {
    await this.request(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  async createTransaction(transaction: Transaction) {
    await this.request(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(transaction: Transaction) {
    await this.request(`${API_BASE_URL}/transactions/${transaction.id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
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
}
