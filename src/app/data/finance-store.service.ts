import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

export type Category = {
  id: string;
  name: string;
  color: string;
  type: 'expense' | 'income';
  createdAt: string;
};

export type Transaction = {
  id: string;
  amount: number;
  currency: string;
  categoryId: string;
  note: string;
  date: string;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class FinanceStoreService {
  readonly categories = signal<Category[]>([]);
  readonly transactions = signal<Transaction[]>([]);

  constructor(private readonly api: ApiService) {}

  private async loadCategories() {
    const data = await this.api.getCategories();
    this.categories.set(data);
  }

  private async loadTransactions() {
    const data = await this.api.getTransactions();
    this.transactions.set(data);
  }

  async addCategory(category: Category) {
    await this.api.createCategory(category);
    await this.loadCategories();
  }

  async updateCategory(category: Category) {
    await this.api.updateCategory(category);
    await this.loadCategories();
  }

  async removeCategory(categoryId: string) {
    await this.api.deleteCategory(categoryId);
    await this.loadCategories();
  }

  async addTransaction(transaction: Transaction) {
    await this.api.createTransaction(transaction);
    await this.loadTransactions();
  }

  async updateTransaction(transaction: Transaction) {
    await this.api.updateTransaction(transaction);
    await this.loadTransactions();
  }

  async removeTransaction(transactionId: string) {
    await this.api.deleteTransaction(transactionId);
    await this.loadTransactions();
  }

  async initStore() {
    await Promise.all([this.loadCategories(), this.loadTransactions()]);
  }
}
