// /app/api/load-csv/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), 'bp_readings.csv');

    if (!fs.existsSync(csvFilePath)) {
      return NextResponse.json({ success: false, error: 'CSV file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(csvFilePath, 'utf8');

    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      quoteChar: '"',
      dynamicTyping: true,
      transformHeader: (h) => h.trim(),
    });

    if (parsed.errors.length > 0) {
      console.warn('CSV parsing errors:', parsed.errors);
    }

    // ✅ Return data as it is (NO SORTING)
    return NextResponse.json({ success: true, data: parsed.data });

  } catch (err) {
    console.error('Error reading CSV:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
