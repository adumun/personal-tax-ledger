import { randomUUID } from 'node:crypto';

let db;

export function configureForeignServiceIncomeDatabase(database) {
  db = database;
  db.exec(`
    CREATE TABLE IF NOT EXISTS foreign_service_income (
      id TEXT PRIMARY KEY,
      tax_year INTEGER NOT NULL,
      payer_name TEXT NOT NULL,
      payer_country TEXT NOT NULL,
      service_source_jurisdiction TEXT NOT NULL CHECK (service_source_jurisdiction = 'FOREIGN'),
      received_at TEXT,
      original_amount TEXT NOT NULL,
      original_currency TEXT NOT NULL,
      description TEXT,
      current_conversion_id TEXT,
      foreign_tax_amount_original TEXT,
      foreign_tax_currency TEXT,
      foreign_tax_paid_at TEXT,
      foreign_tax_document_reference TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_foreign_service_income_tax_year ON foreign_service_income(tax_year);
    CREATE INDEX IF NOT EXISTS idx_foreign_service_income_received_at ON foreign_service_income(received_at);

    CREATE TABLE IF NOT EXISTS foreign_service_fx_conversions (
      id TEXT PRIMARY KEY,
      foreign_service_income_id TEXT NOT NULL,
      original_amount TEXT NOT NULL,
      original_currency TEXT NOT NULL,
      fx_rate TEXT NOT NULL,
      fx_rate_date TEXT NOT NULL,
      fx_source TEXT NOT NULL CHECK (fx_source IN ('BCCH','MANUAL')),
      fx_source_reference TEXT NOT NULL,
      fx_reason TEXT,
      clp_amount TEXT NOT NULL,
      conversion_status TEXT NOT NULL CHECK (conversion_status IN ('RESOLVED','NEEDS_REVIEW')),
      supersedes_conversion_id TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (foreign_service_income_id) REFERENCES foreign_service_income(id) ON DELETE CASCADE,
      FOREIGN KEY (supersedes_conversion_id) REFERENCES foreign_service_fx_conversions(id)
    );
    CREATE INDEX IF NOT EXISTS idx_foreign_service_fx_income ON foreign_service_fx_conversions(foreign_service_income_id);
  `);
}

function ensureDb() {
  if (!db) throw new Error('foreign service database is not configured');
}

function numberOrNull(value) {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCurrency(value, field = 'currency') {
  const currency = String(value ?? '').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new TypeError(`${field} must be an ISO 4217 currency code`);
  return currency;
}

function normalizePositiveAmount(value, field) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new TypeError(`${field} must be a positive finite number`);
  return amount;
}

function normalizeDate(value) {
  if (value == null || value === '') return null;
  const date = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new TypeError('date must use YYYY-MM-DD');
  return date;
}

function deriveTaxYear(receivedAt, explicitTaxYear) {
  if (receivedAt) return Number(receivedAt.slice(0, 4));
  const year = Number(explicitTaxYear);
  if (!Number.isSafeInteger(year) || year < 2000 || year > 2100) throw new TypeError('taxYear is required while receivedAt is unknown');
  return year;
}

function rowToIncome(row) {
  if (!row) return null;
  return {
    id: row.id,
    taxYear: Number(row.tax_year),
    payerName: row.payer_name,
    payerCountry: row.payer_country,
    serviceSourceJurisdiction: row.service_source_jurisdiction,
    receivedAt: row.received_at ?? null,
    originalAmount: Number(row.original_amount),
    originalCurrency: row.original_currency,
    description: row.description ?? null,
    currentConversionId: row.current_conversion_id ?? null,
    foreignTaxAmountOriginal: numberOrNull(row.foreign_tax_amount_original),
    foreignTaxCurrency: row.foreign_tax_currency ?? null,
    foreignTaxPaidAt: row.foreign_tax_paid_at ?? null,
    foreignTaxDocumentReference: row.foreign_tax_document_reference ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function rowToConversion(row) {
  if (!row) return null;
  return {
    id: row.id,
    foreignServiceIncomeId: row.foreign_service_income_id,
    originalAmount: Number(row.original_amount),
    originalCurrency: row.original_currency,
    fxRate: Number(row.fx_rate),
    fxRateDate: row.fx_rate_date,
    fxSource: row.fx_source,
    fxSourceReference: row.fx_source_reference,
    fxReason: row.fx_reason ?? null,
    clpAmount: Number(row.clp_amount),
    conversionStatus: row.conversion_status,
    supersedesConversionId: row.supersedes_conversion_id ?? null,
    createdAt: row.created_at
  };
}

export function listForeignServiceIncome(filters = {}) {
  ensureDb();
  const where = [];
  const args = [];
  if (filters.taxYear != null) { where.push('tax_year = ?'); args.push(Number(filters.taxYear)); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  return db.prepare(`SELECT * FROM foreign_service_income ${clause} ORDER BY COALESCE(received_at, '9999-12-31') DESC, id DESC`).all(...args).map(rowToIncome);
}

export function getForeignServiceIncome(id) {
  ensureDb();
  return rowToIncome(db.prepare('SELECT * FROM foreign_service_income WHERE id = ?').get(id));
}

export function createForeignServiceIncome(input) {
  ensureDb();
  const receivedAt = normalizeDate(input.receivedAt);
  const originalAmount = normalizePositiveAmount(input.originalAmount, 'originalAmount');
  const originalCurrency = normalizeCurrency(input.originalCurrency, 'originalCurrency');
  const payerName = String(input.payerName ?? '').trim();
  if (!payerName) throw new TypeError('payerName is required');
  const payerCountry = String(input.payerCountry ?? '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(payerCountry)) throw new TypeError('payerCountry must be an ISO 3166-1 alpha-2 code');
  if (input.serviceSourceJurisdiction !== 'FOREIGN') throw new TypeError('foreign_service_income only accepts FOREIGN source jurisdiction');
  const taxYear = deriveTaxYear(receivedAt, input.taxYear);
  const id = input.id || `fsi-${randomUUID()}`;
  const foreignTaxCurrency = input.foreignTaxCurrency ? normalizeCurrency(input.foreignTaxCurrency, 'foreignTaxCurrency') : null;
  const foreignTaxAmount = input.foreignTaxAmountOriginal == null ? null : normalizePositiveAmount(input.foreignTaxAmountOriginal, 'foreignTaxAmountOriginal');

  db.prepare(`
    INSERT INTO foreign_service_income (
      id, tax_year, payer_name, payer_country, service_source_jurisdiction,
      received_at, original_amount, original_currency, description,
      foreign_tax_amount_original, foreign_tax_currency, foreign_tax_paid_at,
      foreign_tax_document_reference, notes
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, taxYear, payerName, payerCountry, 'FOREIGN', receivedAt,
    JSON.stringify(originalAmount), originalCurrency, input.description ?? null,
    foreignTaxAmount == null ? null : JSON.stringify(foreignTaxAmount), foreignTaxCurrency,
    normalizeDate(input.foreignTaxPaidAt), input.foreignTaxDocumentReference ?? null, input.notes ?? null
  );
  return getForeignServiceIncome(id);
}

export function updateForeignServiceEconomicFact(id, input) {
  ensureDb();
  const existing = getForeignServiceIncome(id);
  if (!existing) return null;
  const receivedAt = normalizeDate(input.receivedAt ?? existing.receivedAt);
  const originalAmount = normalizePositiveAmount(input.originalAmount ?? existing.originalAmount, 'originalAmount');
  const originalCurrency = normalizeCurrency(input.originalCurrency ?? existing.originalCurrency, 'originalCurrency');
  const taxYear = deriveTaxYear(receivedAt, input.taxYear ?? existing.taxYear);
  db.prepare(`
    UPDATE foreign_service_income SET
      tax_year = ?, payer_name = ?, payer_country = ?, received_at = ?,
      original_amount = ?, original_currency = ?, description = ?, notes = ?,
      current_conversion_id = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    taxYear,
    String(input.payerName ?? existing.payerName).trim(),
    String(input.payerCountry ?? existing.payerCountry).trim().toUpperCase(),
    receivedAt,
    JSON.stringify(originalAmount), originalCurrency,
    input.description ?? existing.description,
    input.notes ?? existing.notes,
    id
  );
  return getForeignServiceIncome(id);
}

export function appendForeignServiceConversion(incomeId, input) {
  ensureDb();
  const income = getForeignServiceIncome(incomeId);
  if (!income) return null;
  const fxSource = String(input.fxSource ?? '').toUpperCase();
  if (!['BCCH', 'MANUAL'].includes(fxSource)) throw new TypeError('fxSource must be BCCH or MANUAL');
  const fxRate = normalizePositiveAmount(input.fxRate, 'fxRate');
  const fxRateDate = normalizeDate(input.fxRateDate);
  if (!fxRateDate) throw new TypeError('fxRateDate is required');
  const reference = String(input.fxSourceReference ?? '').trim();
  if (!reference) throw new TypeError('fxSourceReference is required');
  const reason = input.fxReason == null ? null : String(input.fxReason).trim();
  if (fxSource === 'MANUAL' && !reason) throw new TypeError('fxReason is required for MANUAL conversions');
  const status = input.conversionStatus === 'NEEDS_REVIEW' ? 'NEEDS_REVIEW' : 'RESOLVED';
  const clpAmount = Number.isFinite(Number(input.clpAmount))
    ? normalizePositiveAmount(input.clpAmount, 'clpAmount')
    : Math.round((income.originalAmount * fxRate) * 100) / 100;
  const id = input.id || `fsfx-${randomUUID()}`;
  const supersedes = income.currentConversionId;

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`
      INSERT INTO foreign_service_fx_conversions (
        id, foreign_service_income_id, original_amount, original_currency,
        fx_rate, fx_rate_date, fx_source, fx_source_reference, fx_reason,
        clp_amount, conversion_status, supersedes_conversion_id
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      id, incomeId, JSON.stringify(income.originalAmount), income.originalCurrency,
      JSON.stringify(fxRate), fxRateDate, fxSource, reference, reason,
      JSON.stringify(clpAmount), status, supersedes
    );
    db.prepare('UPDATE foreign_service_income SET current_conversion_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id, incomeId);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return rowToConversion(db.prepare('SELECT * FROM foreign_service_fx_conversions WHERE id = ?').get(id));
}

export function listForeignServiceConversions(incomeId) {
  ensureDb();
  return db.prepare('SELECT * FROM foreign_service_fx_conversions WHERE foreign_service_income_id = ? ORDER BY created_at ASC, id ASC')
    .all(incomeId)
    .map(rowToConversion);
}

export function getForeignServiceCurrentConversion(incomeId) {
  ensureDb();
  const income = getForeignServiceIncome(incomeId);
  if (!income?.currentConversionId) return null;
  return rowToConversion(db.prepare('SELECT * FROM foreign_service_fx_conversions WHERE id = ?').get(income.currentConversionId));
}
