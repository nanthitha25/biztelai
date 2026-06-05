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
      UPDATE records 
      SET date = ?, shift = ?, empNo = ?, opnCode = ?, machineNo = ?, 
          workOrderNo = ?, qtyProd = ?, timeTaken = ?, validationErrors = ?, status = ?
      WHERE id = ?
    `);

    updateStmt.run(
      validated.date,
      validated.shift,
      validated.empNo,
      validated.opnCode,
      validated.machineNo,
      validated.workOrderNo,
      validated.qtyProd,
      validated.timeTaken,
      JSON.stringify(validated.validationErrors),
      validated.validationErrors.length === 0 ? 'approved' : 'review',
      id
    );

    return NextResponse.json({ success: true, record: validated });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
