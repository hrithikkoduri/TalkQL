export type DBType = 'sqlite' | 'mysql' | 'postgresql' | 'mssql' | 'snowflake' | 'csv';

export interface DBParams {
  sqlite: {
    url?: string;
    file?: File;
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
  snowflake: {
    account: string;
    user: string;
    password: string;
    warehouse: string;
    database: string;
    schema: string;
  };
  csv: {
    url?: string;
    file?: File;
  };
}