import sqlite3 from 'sqlite3';

export class Database {
  private static instance: Database;
  private db!: sqlite3.Database;
  private initPromise: Promise<void>;

  private constructor() {
    this.initPromise = new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(':memory:', (err) => {
        if (err) {
          console.error('Error opening database', err.message);
          reject(err);
        } else {
          console.log('Connected to the in-memory SQLite database.');
          this.initializeSchema()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) Database.instance = new Database();
    return Database.instance;
  }

  private initializeSchema(): Promise<void> {
    return new Promise((resolve, reject) => {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS movies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          year INTEGER,
          title TEXT,
          studios TEXT,
          producers TEXT,
          winner INTEGER
        )
      `;

      this.db.run(createTableQuery, (err) => {
        if (err) {
          console.error('Error creating table', err.message);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async waitForInit(): Promise<void> {
    await this.initPromise;
  }

  public getConnection(): sqlite3.Database {
    return this.db;
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
