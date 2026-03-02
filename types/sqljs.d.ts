// Type definitions for sql.js database operations
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

interface SqlJsConfig {
  locateFile?: (file: string) => string;
  wasmBinary?: ArrayBuffer;
}

interface SqlJsStatic {
  Database: new (data?: Uint8Array) => Database;
}

type InitSqlJs = (config?: SqlJsConfig) => Promise<SqlJsStatic>;

export { Database, Statement, QueryResult, SqlJsConfig, SqlJsStatic, InitSqlJs };
