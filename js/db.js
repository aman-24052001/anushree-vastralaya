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

const dbPut = (store, obj) => new Promise(res => {
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).put(obj);
  tx.oncomplete = res;
});

const dbDel = (store, id) => new Promise(res => {
  const tx = db.transaction(store, 'readwrite');
  tx.objectStore(store).delete(id);
  tx.oncomplete = res;
});
