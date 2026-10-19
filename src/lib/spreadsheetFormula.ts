const CELL_REF = /^([A-Z]+)(\d+)$/i;

type Token =
  | { type: 'num'; value: number }
  | { type: 'id'; value: string }
  | { type: 'op'; value: '+' | '-' }
  | { type: 'lp' }
  | { type: 'rp' }
  | { type: 'sep' }
  | { type: 'colon' };

class FormulaError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

export function columnLetter(index: number) {
  let n = index + 1;
  let letters = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

export function isFormula(value: string) {
  return value.trim().startsWith('=');
}

export function formatFormulaNumber(value: number) {
  if (!Number.isFinite(value)) return '#NUM!';
  const rounded = Math.round(value * 1e10) / 1e10;
  return rounded.toLocaleString('es-AR', { maximumFractionDigits: 10 });
}

function parseLocaleNumber(raw: string) {
  const text = raw.trim().replace(/\s/g, '');
  if (!text) return null;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(text)) {
    return Number(text.replace(/\./g, '').replace(',', '.'));
  }
  if (/^-?\d+,\d+$/.test(text)) return Number(text.replace(',', '.'));
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return null;
}

function columnIndex(letters: string) {
  let n = 0;
  for (const char of letters.toUpperCase()) {
    n = n * 26 + (char.charCodeAt(0) - 64);
  }
  return n - 1;
}

function parseRef(value: string) {
  const match = CELL_REF.exec(value.trim());
  if (!match) return null;
  return { row: Number(match[2]) - 1, col: columnIndex(match[1]) };
}

function tokenize(input: string) {
  const tokens: Token[] = [];
  let index = 0;
  while (index < input.length) {
    const char = input[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (char === '(') {
      tokens.push({ type: 'lp' });
      index += 1;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'rp' });
      index += 1;
      continue;
    }
    if (char === '+' || char === '-') {
      tokens.push({ type: 'op', value: char });
      index += 1;
      continue;
    }
    if (char === ':') {
      tokens.push({ type: 'colon' });
      index += 1;
      continue;
    }
    if (char === ';' || char === ',') {
      tokens.push({ type: 'sep' });
      index += 1;
      continue;
    }
    if (/[0-9]/.test(char)) {
      let end = index;
      let text = '';
      let decimal = false;
      while (end < input.length) {
        const current = input[end];
        if (/[0-9]/.test(current)) {
          text += current;
          end += 1;
          continue;
        }
        if ((current === ',' || current === '.') && !decimal && /[0-9]/.test(input[end + 1] ?? '')) {
          decimal = true;
          text += '.';
          end += 1;
          continue;
        }
        break;
      }
      tokens.push({ type: 'num', value: Number(text) });
      index = end;
      continue;
    }
    if (/[A-Za-z]/.test(char)) {
      let end = index + 1;
      while (end < input.length && /[A-Za-z0-9]/.test(input[end])) end += 1;
      tokens.push({ type: 'id', value: input.slice(index, end) });
      index = end;
      continue;
    }
    throw new FormulaError('#ERROR!');
  }
  return tokens;
}

class Parser {
  private pos = 0;

  constructor(
    private tokens: Token[],
    private grid: string[][],
    private stack: Set<string>
  ) {}

  parse() {
    const value = this.parseExpression();
    if (this.peek()) throw new FormulaError('#ERROR!');
    return value;
  }

  private peek() {
    return this.tokens[this.pos];
  }

  private eat() {
    const token = this.tokens[this.pos];
    this.pos += 1;
    return token;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    while (this.peek()?.type === 'op') {
      const operator = this.eat() as { type: 'op'; value: '+' | '-' };
      const right = this.parseTerm();
      value = operator.value === '+' ? value + right : value - right;
    }
    return value;
  }

  private parseTerm(): number {
    if (this.peek()?.type === 'op' && (this.peek() as { value: string }).value === '-') {
      this.eat();
      return -this.parseTerm();
    }
    if (this.peek()?.type === 'op' && (this.peek() as { value: string }).value === '+') {
      this.eat();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const token = this.peek();
    if (!token) throw new FormulaError('#ERROR!');
    if (token.type === 'num') {
      this.eat();
      return token.value;
    }
    if (token.type === 'lp') {
      this.eat();
      const value = this.parseExpression();
      if (this.peek()?.type !== 'rp') throw new FormulaError('#ERROR!');
      this.eat();
      return value;
    }
    if (token.type === 'id') {
      this.eat();
      if (this.peek()?.type === 'lp') return this.parseFunction(token.value);
      const ref = parseRef(token.value);
      if (!ref) throw new FormulaError('#NOMBRE?');
      return this.readNumber(ref.row, ref.col);
    }
    throw new FormulaError('#ERROR!');
  }

  private parseFunction(name: string) {
    const fn = name.toUpperCase();
    this.eat();
    if (fn === 'RESTA') {
      const left = this.parseExpression();
      if (this.peek()?.type !== 'sep') throw new FormulaError('#ERROR!');
      this.eat();
      const right = this.parseExpression();
      if (this.peek()?.type !== 'rp') throw new FormulaError('#ERROR!');
      this.eat();
      return left - right;
    }
    if (fn === 'SUMA' || fn === 'SUM' || fn === 'PROMEDIO' || fn === 'AVERAGE' || fn === 'AVG') {
      const values = this.parseNumberList();
      if (this.peek()?.type !== 'rp') throw new FormulaError('#ERROR!');
      this.eat();
      if (fn === 'SUMA' || fn === 'SUM') {
        return values.reduce((total, value) => total + value, 0);
      }
      if (values.length === 0) throw new FormulaError('#DIV/0!');
      return values.reduce((total, value) => total + value, 0) / values.length;
    }
    throw new FormulaError('#NOMBRE?');
  }

  private parseNumberList() {
    if (this.peek()?.type === 'rp') return [];
    const values = this.parseListArg();
    while (this.peek()?.type === 'sep') {
      this.eat();
      values.push(...this.parseListArg());
    }
    return values;
  }

  private parseListArg() {
    const token = this.peek();
    if (token?.type === 'id' && parseRef(token.value) && this.tokens[this.pos + 1]?.type === 'colon') {
      const start = parseRef(token.value)!;
      this.eat();
      this.eat();
      const endToken = this.eat();
      if (!endToken || endToken.type !== 'id') throw new FormulaError('#ERROR!');
      const end = parseRef(endToken.value);
      if (!end) throw new FormulaError('#REF!');
      return this.readRange(start, end);
    }
    return [this.parseExpression()];
  }

  private readRange(start: { row: number; col: number }, end: { row: number; col: number }) {
    const rowStart = Math.min(start.row, end.row);
    const rowEnd = Math.max(start.row, end.row);
    const colStart = Math.min(start.col, end.col);
    const colEnd = Math.max(start.col, end.col);
    const values: number[] = [];
    for (let row = rowStart; row <= rowEnd; row += 1) {
      for (let col = colStart; col <= colEnd; col += 1) {
        const value = this.readLoose(row, col);
        if (value != null) values.push(value);
      }
    }
    return values;
  }

  private readNumber(row: number, col: number) {
    this.ensureInside(row, col);
    const raw = this.grid[row][col] ?? '';
    if (!raw.trim()) return 0;
    if (isFormula(raw)) return this.readFormula(row, col, raw);
    const value = parseLocaleNumber(raw);
    if (value == null) throw new FormulaError('#VALOR!');
    return value;
  }

  private readLoose(row: number, col: number) {
    this.ensureInside(row, col);
    const raw = this.grid[row][col] ?? '';
    if (!raw.trim()) return null;
    if (isFormula(raw)) return this.readFormula(row, col, raw);
    return parseLocaleNumber(raw);
  }

  private readFormula(row: number, col: number, raw: string) {
    const key = `${row},${col}`;
    if (this.stack.has(key)) throw new FormulaError('#CIRCULAR!');
    this.stack.add(key);
    try {
      const nested = new Parser(tokenize(raw.trim().slice(1)), this.grid, this.stack);
      return nested.parse();
    } finally {
      this.stack.delete(key);
    }
  }

  private ensureInside(row: number, col: number) {
    if (row < 0 || col < 0 || row >= this.grid.length || col >= (this.grid[row]?.length ?? 0)) {
      throw new FormulaError('#REF!');
    }
  }
}

export function displayCell(raw: string, grid: string[][], row: number, col: number) {
  if (!isFormula(raw)) return raw;
  try {
    const value = new Parser(tokenize(raw.trim().slice(1)), grid, new Set([`${row},${col}`])).parse();
    return formatFormulaNumber(value);
  } catch (error) {
    if (error instanceof FormulaError) return error.code;
    return '#ERROR!';
  }
}
