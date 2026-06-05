import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { extractOperationalData } from '@/lib/extractor';
import { validateRecords } from '@/lib/validation';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save image to public folder for preview
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const documentId = crypto.randomUUID();
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${documentId}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    const originalUrl = `/uploads/${filename}`;

    const base64Image = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // 1. Extract Data
    const rawRecords = await extractOperationalData(base64Image, mimeType);

    // 2. Validate Data
    const validatedRecords = validateRecords(rawRecords);

    // 3. Save to DB
    const db = getDb();
    
    // Using transaction for atomicity
    const insertTransaction = db.transaction(() => {
      // Modify documents table implicitly or just save filename
      const insertDoc = db.prepare('INSERT INTO documents (id, filename, status) VALUES (?, ?, ?)');
      insertDoc.run(documentId, originalUrl, 'processed');

      const insertRec = db.prepare(`
        INSERT INTO records (
          id, documentId, sequenceNo, date, shift, empNo, opnCode, 
          machineNo, workOrderNo, qtyProd, timeTaken, confidenceData, validationErrors
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const record of validatedRecords) {
        insertRec.run(
          crypto.randomUUID(),
          documentId,
          String(record.sequenceNo || ''),
          String(record.date || ''),
          String(record.shift || ''),
          String(record.empNo || ''),
          String(record.opnCode || ''),
          String(record.machineNo || ''),
          String(record.workOrderNo || ''),
          String(record.qtyProd || ''),
          String(record.timeTaken || ''),
          JSON.stringify(record.confidence || {}),
          JSON.stringify(record.validationErrors || [])
        );
      }
    });

    insertTransaction();

    return NextResponse.json({ success: true, documentId });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to process document: ' + error.message }, { status: 500 });
  }
}
