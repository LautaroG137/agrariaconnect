const MAX_COLUMNS = 100;
const MAX_ROWS = 2000;

export type ImportedSheet = {
  title: string;
  columns: string[];
  rows: Record<string, string>[];
};

function cellText(value: unknown) {
  if (value == null) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

function filledCount(row: unknown[]) {
  return row.reduce<number>((count, cell) => count + (cellText(cell) ? 1 : 0), 0);
}

function headerRowIndex(matrix: unknown[][]) {
  for (let index = 0; index < matrix.length; index++) {
    const count = filledCount(matrix[index] ?? []);
    if (count === 0) continue;
    const next = matrix.slice(index + 1).find((row) => filledCount(row) > 0);
    if (count === 1 && next && filledCount(next) > 1) continue;
    return index;
  }
  return -1;
}

function uniqueColumnName(raw: string, index: number, used: Set<string>) {
  const base = (raw || `Columna ${index + 1}`).slice(0, 80);
  const key = base.toLowerCase();
  if (!used.has(key)) {
    used.add(key);
    return base;
  }
  let suffix = 2;
  let next = `${base} ${suffix}`;
  while (used.has(next.toLowerCase())) {
    suffix += 1;
    next = `${base} ${suffix}`;
  }
  used.add(next.toLowerCase());
  return next.slice(0, 80);
}

function fileTitle(filename: string) {
  const withoutExtension = filename.replace(/\.(xlsx|xlsm|xls)$/i, '').trim();
  return (withoutExtension || 'Planilla importada').slice(0, 120);
}

export async function parseExcelArrayBuffer(buffer: ArrayBuffer, filename: string): Promise<ImportedSheet[]> {
  if (!/\.(xlsx|xlsm|xls)$/i.test(filename)) {
    throw new Error('Elegí un archivo de Excel (.xlsx o .xls).');
  }

  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array' });
  const baseTitle = fileTitle(filename);
  const imported: ImportedSheet[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      defval: '',
      blankrows: false,
    });
    const headerIndex = headerRowIndex(matrix);
    if (headerIndex < 0) continue;

    const headerRow = matrix[headerIndex] ?? [];
    const dataRows = matrix.slice(headerIndex + 1);
    let lastColumn = headerRow.length - 1;
    for (const row of dataRows) lastColumn = Math.max(lastColumn, row.length - 1);
    if (lastColumn < 0) continue;

    const keptColumns: number[] = [];
    for (let column = 0; column <= lastColumn; column++) {
      const header = cellText(headerRow[column]);
      const hasData = dataRows.some((row) => cellText(row[column]) !== '');
      if (header || hasData) keptColumns.push(column);
    }
    if (keptColumns.length === 0) continue;
    if (keptColumns.length > MAX_COLUMNS) {
      throw new Error(`"${sheetName}" tiene más de ${MAX_COLUMNS} columnas.`);
    }

    const used = new Set<string>();
    const columns = keptColumns.map((column) =>
      uniqueColumnName(cellText(headerRow[column]), column, used)
    );
    const rows: Record<string, string>[] = [];
    for (const row of dataRows) {
      const record: Record<string, string> = {};
      let empty = true;
      keptColumns.forEach((sourceColumn, index) => {
        const text = cellText(row[sourceColumn]);
        if (text) empty = false;
        record[columns[index]] = text;
      });
      if (empty) continue;
      rows.push(record);
      if (rows.length > MAX_ROWS) {
        throw new Error(`"${sheetName}" tiene más de ${MAX_ROWS} filas.`);
      }
    }

    const title = workbook.SheetNames.length === 1 ? baseTitle : `${baseTitle} - ${sheetName}`.slice(0, 120);
    imported.push({ title, columns, rows });
  }

  if (imported.length === 0) {
    throw new Error('El archivo no tiene datos para importar.');
  }
  return imported;
}

export async function parseExcelFile(file: File) {
  return parseExcelArrayBuffer(await file.arrayBuffer(), file.name);
}
