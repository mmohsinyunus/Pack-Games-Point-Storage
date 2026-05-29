import { google, sheets_v4 } from 'googleapis';

let sheetsClient: sheets_v4.Sheets | null = null;

export function getSheetsClient(): sheets_v4.Sheets {
  if (sheetsClient) return sheetsClient;

  const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const credB64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;

  let credentials: object;
  if (credB64) {
    credentials = JSON.parse(Buffer.from(credB64, 'base64').toString('utf-8'));
  } else if (credJson) {
    credentials = JSON.parse(credJson);
  } else {
    throw new Error(
      'Missing Google credentials. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_B64.'
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

export const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// Ensure sheet tabs exist with correct headers
export const SHEET_HEADERS: Record<string, string[]> = {
  Players: ['id', 'name', 'email', 'avatarColor', 'totalPoints', 'createdAt'],
  Games: ['id', 'name', 'description', 'suit', 'createdAt'],
  Rounds: ['id', 'gameId', 'gameName', 'name', 'date', 'status', 'createdAt', 'closedAt'],
  Points: ['id', 'roundId', 'playerId', 'gameId', 'points', 'recordedAt'],
};

export async function ensureSheetHeaders(sheetName: string): Promise<void> {
  const sheets = getSheetsClient();
  const headers = SHEET_HEADERS[sheetName];
  if (!headers) return;

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!1:1`,
    });
    const row = res.data.values?.[0];
    if (!row || row.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] },
      });
    }
  } catch {
    // Sheet tab doesn't exist — create it then write headers
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
  }
}

// Returns 1-based row index for a row whose column A matches `id`. Returns -1 if not found.
export async function findRowIndex(sheetName: string, id: string): Promise<number> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:A`,
  });
  const rows = res.data.values ?? [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i]?.[0] === id) return i + 1; // 1-based
  }
  return -1;
}

// Read all rows (excluding header) and map to objects using the header row
export async function readAllRows<T>(sheetName: string): Promise<T[]> {
  await ensureSheetHeaders(sheetName);
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:Z`,
  });
  const rows = res.data.values ?? [];
  if (rows.length < 2) return [];
  const headers = rows[0] as string[];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
    return obj as T;
  });
}

// Append a new row using the sheet's header order
export async function appendRow(sheetName: string, data: Record<string, unknown>): Promise<void> {
  await ensureSheetHeaders(sheetName);
  const headers = SHEET_HEADERS[sheetName];
  const row = headers.map((h) => {
    const v = data[h];
    return v === undefined || v === null ? '' : String(v);
  });
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
}

// Update an existing row in place
export async function updateRow(
  sheetName: string,
  id: string,
  data: Record<string, unknown>
): Promise<boolean> {
  await ensureSheetHeaders(sheetName);
  const rowIndex = await findRowIndex(sheetName, id);
  if (rowIndex === -1) return false;

  const headers = SHEET_HEADERS[sheetName];
  const row = headers.map((h) => {
    const v = data[h];
    return v === undefined || v === null ? '' : String(v);
  });
  const sheets = getSheetsClient();
  const colEnd = String.fromCharCode(64 + headers.length); // e.g. 'F'
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A${rowIndex}:${colEnd}${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
  return true;
}

// Delete a row by id (shifts subsequent rows up)
export async function deleteRow(sheetName: string, id: string): Promise<boolean> {
  const rowIndex = await findRowIndex(sheetName, id);
  if (rowIndex === -1) return false;

  // Get sheetId (numeric) for the tab
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetMeta = meta.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  const sheetTabId = sheetMeta?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetTabId,
            dimension: 'ROWS',
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }],
    },
  });
  return true;
}
