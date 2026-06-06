import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  
  const rawShiftSummary = db.prepare(`
    SELECT shift, COUNT(*) as count 
    FROM records 
    WHERE date != '' OR shift != '' OR empNo != '' OR opnCode != '' OR machineNo != '' OR workOrderNo != '' OR qtyProd != ''
    GROUP BY shift
  `).all();
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
    totalRecords: db.prepare(`
      SELECT COUNT(*) as count 
      FROM records 
      WHERE date != '' OR shift != '' OR empNo != '' OR opnCode != '' OR machineNo != '' OR workOrderNo != '' OR qtyProd != ''
    `).get().count,
    recordsNeedingReview: db.prepare("SELECT COUNT(*) as count FROM records WHERE validationErrors != '[]'").get().count,
    shiftSummary,
  };

  const rawMachineSummary = db.prepare(`
    SELECT machineNo, SUM(CAST(qtyProd AS NUMERIC)) as totalQty 
    FROM records 
    WHERE date != '' OR shift != '' OR empNo != '' OR opnCode != '' OR machineNo != '' OR workOrderNo != '' OR qtyProd != ''
    GROUP BY machineNo
  `).all();
  const normalizedMachines = {};
  rawMachineSummary.forEach(row => {
    let machine = String(row.machineNo || '').toUpperCase().trim();
    if (!machine) machine = 'Unknown';
    normalizedMachines[machine] = (normalizedMachines[machine] || 0) + (row.totalQty || 0);
  });
  
  stats.machineSummary = Object.keys(normalizedMachines).map(machineNo => ({
    machineNo,
    totalQty: normalizedMachines[machineNo]
  }));

  // Fetch documents for the Total Uploads and Past Scans table
  stats.documents = db.prepare('SELECT id, filename, uploadedAt, status FROM documents ORDER BY uploadedAt DESC').all();

  // Fetch validation errors list
  const errorsQuery = `
    SELECT r.id, r.sequenceNo, r.validationErrors, r.documentId, d.filename 
    FROM records r 
    JOIN documents d ON r.documentId = d.id 
    WHERE r.validationErrors != '[]'
  `;
  stats.validationErrorsList = db.prepare(errorsQuery).all();

  // Fetch all records for the Records Extracted modal
  stats.allRecords = db.prepare(`
    SELECT r.id, r.date, r.shift, r.empNo, r.opnCode, r.machineNo, r.workOrderNo, r.qtyProd, r.timeTaken, r.status, d.filename 
    FROM records r
    JOIN documents d ON r.documentId = d.id
    WHERE r.date != '' OR r.shift != '' OR r.empNo != '' OR r.opnCode != '' OR r.machineNo != '' OR r.workOrderNo != '' OR r.qtyProd != ''
    ORDER BY r.id DESC
  `).all();

  return NextResponse.json(stats);
}
