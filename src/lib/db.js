const DB_NAME = 'money-flow';
const DB_VERSION = 1;
const STORES = {
  categories: 'categories',
  transactions: 'transactions',
  meta: 'meta',
};

let dbPromise;

const requestToPromise = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const openDb = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORES.categories)) {
          const store = db.createObjectStore(STORES.categories, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.transactions)) {
          const store = db.createObjectStore(STORES.transactions, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('categoryId', 'categoryId', { unique: false });
          store.createIndex('currency', 'currency', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.meta)) {
          db.createObjectStore(STORES.meta, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return dbPromise;
};

const getStore = async (storeName, mode = 'readonly') => {
  const db = await openDb();
  return db.transaction(storeName, mode).objectStore(storeName);
};

const getAllRecords = async (storeName) => {
  const store = await getStore(storeName);
  return requestToPromise(store.getAll());
};

const getRecord = async (storeName, key) => {
  const store = await getStore(storeName);
  return requestToPromise(store.get(key));
};

const addRecord = async (storeName, value) => {
  const store = await getStore(storeName, 'readwrite');
  return requestToPromise(store.add(value));
};

const updateRecord = async (storeName, value) => {
  const store = await getStore(storeName, 'readwrite');
  return requestToPromise(store.put(value));
};

const deleteRecord = async (storeName, key) => {
  const store = await getStore(storeName, 'readwrite');
  return requestToPromise(store.delete(key));
};

export {
  addRecord,
  deleteRecord,
  getAllRecords,
  getRecord,
  openDb,
  updateRecord,
  STORES,
};
