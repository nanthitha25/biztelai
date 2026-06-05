import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  
  const rawShiftSummary = db.prepare('SELECT shift, COUNT(*) as count FROM records GROUP BY shift').all();
  const normalizedShifts = {};
  rawShiftSummary.forEach(row => {
    let shift = String(row.shift || '').toUpperCase().trim();
    if (shift === 'I') shift = '1';
    if (shift === 'II') shift = '2';
    if (shift === 'III') shift = '3';
    if (!shift) shift = 'Unknown';
    normalizedShifts[shift] = (normalizedShifts[shift] || 0) + row.count;
  });
  
  const shiftSummary = Object.keys(normalizedShifts).map(shift => ({
    shift,
    count: normalizedShifts[shift]
  }));

  const stats = {
    totalUploads: db.prepare('SELECT COUNT(*) as count FROM documents').get().count,
    totalRecords: db.prepare('SELECT COUNT(*) as count FROM records').get().count,
    recordsNeedingReview: db.prepare("SELECT COUNT(*) as count FROM records WHERE validationErrors != '[]' OR status = 'review'").get().count,
    shiftSummary,
    machineSummary: db.prepare('SELECT machineNo, SUM(CAST(qtyProd AS NUMERIC)) as totalQty FROM records GROUP BY machineNo').all(),
  };

  return NextResponse.json(stats);
}
