interface LogEntry {
  id: number;
  module: string;
  query: string;
  result: string;
  timestamp: string;
}

interface Database {
  run(sql: string, ...params: unknown[]): void;
  exec(sql: string, ...params: unknown[]): QueryResult[];
  export(): Uint8Array;
  prepare(sql: string): Statement;
  close(): void;
}

interface Statement {
  run(...params: unknown[]): void;
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  bind(...params: unknown[]): void;
  free(): void;
}

interface QueryResult {
  columns: string[];
  values: unknown[][];
}

let db: Database | null = null;

const init = async(data: Uint8Array | null) => {
  const wasmUrl = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.wasm';
  const wasmResponse = await fetch(wasmUrl);
  const wasmBinary = await wasmResponse.arrayBuffer();

  const initSqlJs = (await import('https://esm.sh/sql.js@1.13.0')).default;
  const SQL = await initSqlJs({ wasmBinary });

  if (data) {
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        module TEXT,
        query TEXT,
        result TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
};

self.onmessage = async(e: MessageEvent) => {
  const { id, type, payload } = e.data;

  try {
    switch (type) {
    case 'INIT': {
      await init(payload);
      self.postMessage({ id, type: 'SUCCESS' });
      break;
    }

    case 'LOG': {
      if (!db) {
        throw new Error('DB not initialized');
      }
      db.run('INSERT INTO logs (module, query, result) VALUES (?, ?, ?)', [payload.module, payload.query, payload.result]);

      // Export for persistence
      const binary = db.export();
      // Send persist message separately
      self.postMessage({ type: 'PERSIST', payload: binary });
      self.postMessage({ id, type: 'SUCCESS' });
      break;
    }

    case 'GET': {
      if (!db) {
        throw new Error('DB not initialized');
      }
      let res;
      if (payload.module) {
        res = db.exec('SELECT * FROM logs WHERE module = ? ORDER BY timestamp DESC', [payload.module]);
      } else {
        res = db.exec('SELECT * FROM logs ORDER BY timestamp DESC');
      }

      const logs = [];
      if (res.length > 0) {
        const columns = res[0].columns;
        logs.push(...res[0].values.map((row: unknown[]) => {
          const obj: Record<string, unknown> = {};
          columns.forEach((col: string, i: number) => {
            obj[col] = row[i];
          });
          return obj as unknown as LogEntry;
        }));
      }
      self.postMessage({ id, type: 'SUCCESS', payload: logs });
      break;
    }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({ id, type: 'ERROR', error: errorMessage });
  }
};
