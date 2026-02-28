
const WORKER_CODE = `
import initSqlJs from 'https://esm.sh/sql.js@1.13.0';
let db = null;
const init = async (data) => {
  try {
    const res = await fetch('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.wasm');
    const wasmBinary = await res.arrayBuffer();
    const initFn = typeof initSqlJs === 'function' ? initSqlJs : initSqlJs.default;
    const SQL = await initFn({ wasmBinary });
    db = data ? new SQL.Database(data) : new SQL.Database();
    if (!data) db.run("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, module TEXT, query TEXT, result TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
    return true;
  } catch (e) { return false; }
};
self.onmessage = async (e) => {
  const { id, type, payload } = e.data;
  try {
    if (type === 'INIT') { await init(payload); self.postMessage({ id, type: 'SUCCESS' }); }
    else if (type === 'LOG') {
      db.run("INSERT INTO logs (module, query, result) VALUES (?, ?, ?)", [payload.module, payload.query, payload.result]);
      self.postMessage({ type: 'PERSIST', payload: db.export() });
      self.postMessage({ id, type: 'SUCCESS' });
    }
    else if (type === 'GET') {
      const res = payload.module ? db.exec("SELECT * FROM logs WHERE module = ? ORDER BY timestamp DESC", [payload.module]) : db.exec("SELECT * FROM logs ORDER BY timestamp DESC");
      const logs = res.length > 0 ? res[0].values.map(row => Object.fromEntries(res[0].columns.map((col, i) => [col, row[i]]))) : [];
      self.postMessage({ id, type: 'SUCCESS', payload: logs });
    }
    else if (type === 'PRUNE') {
      db.run("DELETE FROM logs WHERE module != 'CURATOR_BOOKS' AND id NOT IN (SELECT id FROM logs WHERE module != 'CURATOR_BOOKS' ORDER BY timestamp DESC LIMIT ?)", [payload.keepCount || 20]);
      self.postMessage({ type: 'PERSIST', payload: db.export() });
      self.postMessage({ id, type: 'SUCCESS' });
    }
    else if (type === 'EXPORT') { self.postMessage({ id, type: 'SUCCESS', payload: db.export() }); }
    else if (type === 'CLEAR_ALL') { db.run("DELETE FROM logs"); self.postMessage({ type: 'PERSIST', payload: db.export() }); self.postMessage({ id, type: 'SUCCESS' }); }
  } catch (err) { self.postMessage({ id, type: 'ERROR', error: err.message }); }
};
`;

let worker: Worker | null = null;
let initPromise: Promise<void> | null = null;
const queue = new Map<string, { resolve: (d: any) => void, reject: (e: any) => void }>();
const DB_NAME = 'SyllabusArchive';
const STORE = 'Files';
const KEY = 'sqlite_db';

const openIDB = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = () => req.result.createObjectStore(STORE);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const saveToIDB = async(data: Uint8Array) => {
  const db = await openIDB();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(data, KEY);
};

const loadFromIDB = async(): Promise<Uint8Array | null> => {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

export const initDB = async() => {
  if (initPromise) {
    return initPromise;
  }
  initPromise = (async() => {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    worker = new Worker(URL.createObjectURL(blob), { type: 'module' });
    worker.onmessage = (e) => {
      const { id, type, payload, error } = e.data;
      if (type === 'PERSIST') {
        saveToIDB(payload); window.dispatchEvent(new CustomEvent('db_persisted', { detail: { size: payload.byteLength } }));
      } else if (id && queue.has(id)) {
        const { resolve, reject } = queue.get(id)!;
        queue.delete(id);
        error ? reject(new Error(error)) : resolve(payload);
      }
    };
    const data = await loadFromIDB();
    const id = Math.random().toString(36).slice(2);
    return new Promise((res, rej) => {
      queue.set(id, { resolve: res, reject: rej });
      worker!.postMessage({ id, type: 'INIT', payload: data });
    });
  })();
  return initPromise;
};

export const logCalculation = (module: string, query: string, result: any) => {
  initDB().then(() => worker?.postMessage({ id: Math.random().toString(36).slice(2), type: 'LOG', payload: { module, query, result: JSON.stringify(result) } }));
};

export interface LogEntry { id: number; module: string; query: string; result: string; timestamp: string; }

export const getLogs = async <T = LogEntry>(moduleFilter?: string): Promise<T[]> => {
  await initDB();
  const id = Math.random().toString(36).slice(2);
  return new Promise((res, rej) => {
    queue.set(id, { resolve: res, reject: rej });
    worker!.postMessage({ id, type: 'GET', payload: { module: moduleFilter } });
  });
};

export const pruneLogs = async(keepCount = 20) => {
  await initDB();
  const id = Math.random().toString(36).slice(2);
  return new Promise((res, rej) => {
    queue.set(id, { resolve: res, reject: rej });
    worker!.postMessage({ id, type: 'PRUNE', payload: { keepCount } });
  });
};

export const clearAllLogs = async() => {
  await initDB();
  const id = Math.random().toString(36).slice(2);
  return new Promise((res, rej) => {
    queue.set(id, { resolve: res, reject: rej });
    worker!.postMessage({ id, type: 'CLEAR_ALL' });
  });
};

export const exportDBBinary = async(): Promise<Uint8Array | null> => {
  await initDB();
  const id = Math.random().toString(36).slice(2);
  return new Promise((res, rej) => {
    queue.set(id, { resolve: res, reject: rej });
    worker!.postMessage({ id, type: 'EXPORT' });
  });
};

export const getStorageUsage = () => ({ bytes: 0, percentage: 0, isIndexedDB: true });
