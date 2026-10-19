function escapeCsvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  if (/[;"\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function spreadsheetToCsv(columns: string[], rows: Record<string, unknown>[]) {
  const lines = [
    columns.map(escapeCsvCell).join(';'),
    ...rows.map((row) => columns.map((column) => escapeCsvCell(row[column])).join(';')),
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

export function spreadsheetFilename(title: string) {
  const safe = title.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim() || 'planilla';
  return `${safe}.csv`;
}

export function downloadSpreadsheet(
  title: string,
  columns: string[],
  rows: Record<string, unknown>[]
) {
  const blob = new Blob([spreadsheetToCsv(columns, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = spreadsheetFilename(title);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
