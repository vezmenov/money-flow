import { writable } from 'svelte/store';
import {
  addRecord,
  deleteRecord,
  getAllRecords,
  openDb,
  STORES,
  updateRecord,
} from '../lib/db';

const categories = writable([]);
const transactions = writable([]);

const loadCategories = async () => {
  await openDb();
  const data = await getAllRecords(STORES.categories);
  categories.set(data);
};

const loadTransactions = async () => {
  await openDb();
  const data = await getAllRecords(STORES.transactions);
  transactions.set(data);
};

const addCategory = async (category) => {
  await addRecord(STORES.categories, category);
  await loadCategories();
};

const updateCategory = async (category) => {
  await updateRecord(STORES.categories, category);
  await loadCategories();
};

const removeCategory = async (categoryId) => {
  await deleteRecord(STORES.categories, categoryId);
  await loadCategories();
};

const addTransaction = async (transaction) => {
  await addRecord(STORES.transactions, transaction);
  await loadTransactions();
};

const updateTransaction = async (transaction) => {
  await updateRecord(STORES.transactions, transaction);
  await loadTransactions();
};

const removeTransaction = async (transactionId) => {
  await deleteRecord(STORES.transactions, transactionId);
  await loadTransactions();
};

const initStore = async () => {
  await Promise.all([loadCategories(), loadTransactions()]);
};

export {
  categories,
  transactions,
  addCategory,
  addTransaction,
  initStore,
  loadCategories,
  loadTransactions,
  removeCategory,
  removeTransaction,
  updateCategory,
  updateTransaction,
};
