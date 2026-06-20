/* js/db.js — IndexedDB abstraction */

let db;

function initDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('anushreeVastralaya', 1);
    r.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('customers'))
        d.createObjectStore('customers', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('transactions'))
        d.createObjectStore('transactions', { keyPath: 'id' });
    };
    r.onsuccess = e => { db = e.target.result; res(); };
    r.onerror = () => rej(r.error);
  });
}

const dbAll = store => new Promise(res => {
  const r = db.transaction(store, 'readonly').objectStore(store).getAll();
  r.onsuccess = () => res(r.result || []);
});

const dbClear = store => new Promise((res, rej) => {
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).clear();
  tx.oncomplete = res;
  tx.onerror = () => rej(tx.error);
  tx.onabort = () => rej(tx.error);
});

const dbPut = (store, obj) => new Promise((res, rej) => {
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).put(obj);
  tx.oncomplete = res;
  tx.onerror = () => rej(tx.error);
  tx.onabort = () => rej(tx.error);
});

const dbDel = (store, id) => new Promise((res, rej) => {
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).delete(id);
  tx.oncomplete = res;
  tx.onerror = () => rej(tx.error);
  tx.onabort = () => rej(tx.error);
});
