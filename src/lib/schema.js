import { getDb } from './db.js';

export function initializeDatabase() {
  const db = getDb();

  // Documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending'
    )
  `);

  // Records table (extracted data)
  db.exec(`
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
    )
  `);
}
