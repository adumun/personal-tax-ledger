let db;

export function configureFeeReceiptForeignSettlementDatabase(database) {
  db = database;
  db.exec(`
    CREATE TABLE IF NOT EXISTS fee_receipt_foreign_settlements (
      fee_receipt_id TEXT PRIMARY KEY,
      payer_country TEXT NOT NULL,
      service_source_jurisdiction TEXT NOT NULL CHECK (service_source_jurisdiction = 'CHILE'),
      received_amount TEXT NOT NULL,
      received_currency TEXT NOT NULL,
      received_at TEXT NOT NULL,
      provider_reference TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (fee_receipt_id) REFERENCES fee_receipts(id) ON DELETE CASCADE
    );
  `);
}

function ensureDb() {
  if (!db) throw new Error('fee receipt foreign settlement database is not configured');
}

function normalizeCurrency(value) {
  const currency = String(value ?? '').trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new TypeError('receivedCurrency must be an ISO 4217 currency code');
  return currency;
}

function normalizeCountry(value) {
  const country = String(value ?? '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw new TypeError('payerCountry must be an ISO 3166-1 alpha-2 code');
  return country;
}

function normalizeDate(value) {
  const date = String(value ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new TypeError('receivedAt must use YYYY-MM-DD');
  return date;
}

function normalizeAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new TypeError('receivedAmount must be a positive finite number');
  return amount;
}

function rowToSettlement(row) {
  if (!row) return null;
  return {
    feeReceiptId: row.fee_receipt_id,
    payerCountry: row.payer_country,
    serviceSourceJurisdiction: row.service_source_jurisdiction,
    receivedAmount: Number(row.received_amount),
    receivedCurrency: row.received_currency,
    receivedAt: row.received_at,
    providerReference: row.provider_reference ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function getFeeReceiptForeignSettlement(feeReceiptId) {
  ensureDb();
  return rowToSettlement(db.prepare(`
    SELECT * FROM fee_receipt_foreign_settlements WHERE fee_receipt_id = ?
  `).get(feeReceiptId));
}

export function upsertFeeReceiptForeignSettlement(feeReceiptId, input) {
  ensureDb();
  const payerCountry = normalizeCountry(input.payerCountry);
  const receivedAmount = normalizeAmount(input.receivedAmount);
  const receivedCurrency = normalizeCurrency(input.receivedCurrency);
  const receivedAt = normalizeDate(input.receivedAt);
  const providerReference = input.providerReference == null || input.providerReference === '' ? null : String(input.providerReference).slice(0, 500);
  const notes = input.notes == null || input.notes === '' ? null : String(input.notes).slice(0, 2000);

  db.prepare(`
    INSERT INTO fee_receipt_foreign_settlements (
      fee_receipt_id, payer_country, service_source_jurisdiction,
      received_amount, received_currency, received_at, provider_reference, notes
    ) VALUES (?, ?, 'CHILE', ?, ?, ?, ?, ?)
    ON CONFLICT(fee_receipt_id) DO UPDATE SET
      payer_country = excluded.payer_country,
      received_amount = excluded.received_amount,
      received_currency = excluded.received_currency,
      received_at = excluded.received_at,
      provider_reference = excluded.provider_reference,
      notes = excluded.notes,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    feeReceiptId,
    payerCountry,
    JSON.stringify(receivedAmount),
    receivedCurrency,
    receivedAt,
    providerReference,
    notes
  );

  return getFeeReceiptForeignSettlement(feeReceiptId);
}
