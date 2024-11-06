export type DBType = 'sqlite' | 'mysql' | 'postgresql' | 'mssql';

export interface DBParams {
  sqlite: {
    url?: string;
    db_path?: string;
  };
  mysql: {
    user: string;
    password: string;
    host: string;
    port: string;
    database: string;
  };
  postgresql: {
    user: string;
    password: string;
    host: string;
    port: string;
    database: string;
  };
  mssql: {
    user: string;
    password: string;
    host: string;
    port: string;
    database: string;
    driver: string;
  };
}