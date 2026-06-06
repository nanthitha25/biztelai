import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { validateRecords } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  const db = getDb();
  if (documentId) {
    const records = db.prepare('SELECT * FROM records WHERE documentId = ?').all(documentId);
    return NextResponse.json(records);
  }

  // If no documentId, return all documents
  const docs = db.prepare('SELECT * FROM documents ORDER BY uploadedAt DESC').all();
  return NextResponse.json(docs);
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, updates } = body;
    
    // Validate the updated record
    const validated = validateRecords([updates])[0];

    const db = getDb();
    const updateStmt = db.prepare(`
      INSERT INTO records (
        id, documentId, sequenceNo, date, shift, empNo, opnCode, machineNo, 
        workOrderNo, qtyProd, timeTaken, validationErrors, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        date = excluded.date,
        shift = excluded.shift,
        empNo = excluded.empNo,
        opnCode = excluded.opnCode,
        machineNo = excluded.machineNo,
        workOrderNo = excluded.workOrderNo,
        qtyProd = excluded.qtyProd,
        timeTaken = excluded.timeTaken,
        validationErrors = excluded.validationErrors,
        status = excluded.status
    `);

    updateStmt.run(
      id,
      validated.documentId,
      String(validated.sequenceNo || ''),
      String(validated.date || ''),
      String(validated.shift || ''),
      String(validated.empNo || ''),
      String(validated.opnCode || ''),
      String(validated.machineNo || ''),
      String(validated.workOrderNo || ''),
      String(validated.qtyProd || ''),
      String(validated.timeTaken || ''),
      JSON.stringify(validated.validationErrors),
      validated.validationErrors.length === 0 ? 'approved' : 'review'
    );

    return NextResponse.json({ success: true, record: validated });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
