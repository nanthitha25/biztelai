import Database from 'better-sqlite3';
import path from 'path';

// Store DB inside the workspace
const dbPath = path.resolve(process.cwd(), 'biztel.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    
    // Initialize schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending'
      );
      
      CREATE TABLE IF NOT EXISTS records (
        id TEXT PRIMARY KEY,
        documentId TEXT NOT NULL,
        sequenceNo TEXT,
        date TEXT,
        shift TEXT,
        empNo TEXT,
        opnCode TEXT,
        machineNo TEXT,
        workOrderNo TEXT,
        qtyProd TEXT,
        timeTaken TEXT,
        confidenceData TEXT,
        validationErrors TEXT,
        status TEXT DEFAULT 'review',
        FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
      );
    `);
  }
  return db;
}
