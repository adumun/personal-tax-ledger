import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, PageHeader, SectionCard, Select, StatusBadge } from '@adumun/react-components';
import {
  taxLedgerClient,
  type AnnualTaxLedgerResult,
  type TaxLedgerEntry,
  type TaxLedgerFilters
} from './tax-ledger-client';
import './annual-income-ledger.css';

type LoadState = 'LOADING' | 'EMPTY' | 'READY' | 'ERROR' | 'STALE_SUPPRESSED';

const money = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
});

const ENTRY_KIND_LABELS: Record<string, string> = {
  DEPENDENT_INCOME: 'Renta dependiente',
  DOMESTIC_FEE_INCOME: 'Honorarios / BHE',
  OTHER_INCOME_SOURCE: 'Otro ingreso'
};

const STATE_LABELS: Record<string, string> = {
  RECOGNIZED: 'Reconocido',
  PENDING: 'Pendiente',
  EXCLUDED: 'Excluido'
};

const OWNER_LABELS: Record<string, string> = {
  INCOME_SOURCE: 'Ingreso laboral',
  FEE_RECEIPT: 'Boleta de honorarios'
};

function statusTone(state: string) {
  if (state === 'RECOGNIZED') return 'success' as const;
  if (state === 'PENDING') return 'warning' as const;
  return 'neutral' as const;
}

function formatAmount(value: number | null | undefined, currency = 'CLP') {
  if (value == null) return 'No registrado';
  if (currency === 'CLP') return money.format(value);
  return `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(value)} ${currency}`;
}

function counterparty(entry: TaxLedgerEntry) {
  const summary = entry.counterpartySummary;
  if (!summary) return 'No registrado';
  if (typeof summary === 'string') return summary;
  return summary.name || summary.label || summary.displayName || 'No registrado';
}

function period(entry: TaxLedgerEntry) {
  if (entry.occurredOn) return entry.occurredOn;
  if (entry.periodRef?.startsWith('MONTH:')) return entry.periodRef.slice('MONTH:'.length);
  if (entry.periodRef?.startsWith('YEAR:')) return `Año ${entry.periodRef.slice('YEAR:'.length)}`;
  return 'No registrado';
}

function totalRegistered(result: AnnualTaxLedgerResult | null, key: 'gross' | 'withholding' | 'ppm') {
  const total = result?.factualSummary.totalsByCurrency.CLP?.[key];
  if (!total || total.presentCount === 0) return 'No registrado';
  return money.format(total.amount);
}

export default function AnnualIncomeLedgerSection({ commercialYear }: { commercialYear: number }) {
  const [filters, setFilters] = useState<TaxLedgerFilters>({});
  const [result, setResult] = useState<AnnualTaxLedgerResult | null>(null);
  const [state, setState] = useState<LoadState>('LOADING');
  const [error, setError] = useState('');
  const requestSerial = useRef(0);

  const reload = async () => {
    const serial = ++requestSerial.current;
    setState('LOADING');
    setError('');
    try {
      const next = await taxLedgerClient.list(filters);
      if (serial !== requestSerial.current) return;
      if (next.commercialYear !== commercialYear) {
        setResult(null);
        setState('STALE_SUPPRESSED');
        return;
      }
      setResult(next);
      setState(next.entries.length === 0 ? 'EMPTY' : 'READY');
    } catch (cause) {
      if (serial !== requestSerial.current) return;
      setError(cause instanceof Error ? cause.message : String(cause));
      setState('ERROR');
    }
  };

  useEffect(() => {
    void reload();
    return () => { requestSerial.current += 1; };
  }, [commercialYear, filters.entryKind, filters.recognitionState]);

  const registeredWithholding = useMemo(() => {
    const withholding = totalRegistered(result, 'withholding');
    const ppm = totalRegistered(result, 'ppm');
    if (withholding === 'No registrado' && ppm === 'No registrado') return 'No registrado';
    return `${withholding} · PPM ${ppm}`;
  }, [result]);

  return <section className="annual-income-ledger" aria-labelledby="annual-income-ledger-title">
    <PageHeader
      eyebrow="Ingresos"
      title="Ingresos del año"
      titleId="annual-income-ledger-title"
      description={`Año comercial ${commercialYear} · Operación Renta AT${commercialYear + 1}. Hechos registrados y consolidados en una sola vista.`}
      actions={<StatusBadge tone="info">Solo lectura</StatusBadge>}
    />

    <SectionCard className="annual-income-ledger-card">
      <div className="annual-income-ledger-summary" aria-label="Resumen factual del ledger">
        <article><small>Entradas registradas</small><strong>{result?.factualSummary.entryCount ?? '—'}</strong></article>
        <article><small>Monto bruto disponible</small><strong>{totalRegistered(result, 'gross')}</strong></article>
        <article><small>Retenciones / PPM registrados</small><strong>{registeredWithholding}</strong></article>
      </div>

      <div className="annual-income-ledger-toolbar">
        <Select label="Tipo" value={filters.entryKind || ''} onChange={event => setFilters(current => ({ ...current, entryKind: event.target.value || undefined }))}>
          <option value="">Todos</option>
          <option value="DEPENDENT_INCOME">Renta dependiente</option>
          <option value="DOMESTIC_FEE_INCOME">Honorarios / BHE</option>
          <option value="OTHER_INCOME_SOURCE">Otros ingresos</option>
        </Select>
        <Select label="Estado" value={filters.recognitionState || ''} onChange={event => setFilters(current => ({ ...current, recognitionState: event.target.value || undefined }))}>
          <option value="">Todos</option>
          <option value="RECOGNIZED">Reconocido</option>
          <option value="PENDING">Pendiente</option>
          <option value="EXCLUDED">Excluido</option>
        </Select>
        {state === 'LOADING' ? <span className="annual-income-ledger-refreshing" role="status">Actualizando…</span> : null}
      </div>

      {state === 'LOADING' && !result && <div className="annual-income-ledger-state" role="status">Cargando ingresos del año…</div>}
      {state === 'ERROR' && <div className="annual-income-ledger-state error" role="alert"><strong>No se pudieron cargar los ingresos del año.</strong><span>{error}</span><Button onClick={() => void reload()}>Reintentar</Button></div>}
      {state === 'STALE_SUPPRESSED' && <div className="annual-income-ledger-state" role="status">Se descartó una respuesta de un año anterior. Actualizando el período activo…</div>}
      {state === 'EMPTY' && <div className="annual-income-ledger-state empty"><strong>No hay ingresos registrados para este año.</strong><span>La ausencia de registros no se interpreta como $0 de ingresos.</span></div>}

      {state === 'READY' && result && <div className="annual-income-ledger-table-wrap">
        <table className="annual-income-ledger-table">
          <thead><tr><th>Fecha / período</th><th>Tipo</th><th>Pagador / empleador</th><th>Monto registrado</th><th>Retención / PPM</th><th>Estado</th><th>Origen</th></tr></thead>
          <tbody>{result.entries.map(entry => <tr key={entry.ledgerEntryId} className={entry.recognitionState === 'EXCLUDED' ? 'excluded' : ''}>
            <td data-label="Fecha / período">{period(entry)}</td>
            <td data-label="Tipo"><strong>{ENTRY_KIND_LABELS[entry.entryKind] || entry.entryKind}</strong></td>
            <td data-label="Pagador / empleador">{counterparty(entry)}</td>
            <td data-label="Monto registrado">{formatAmount(entry.amounts.gross ?? entry.amounts.net, entry.amounts.currency)}</td>
            <td data-label="Retención / PPM">{entry.amounts.withholding != null
              ? formatAmount(entry.amounts.withholding, entry.amounts.currency)
              : entry.amounts.ppm != null
                ? `PPM ${formatAmount(entry.amounts.ppm, entry.amounts.currency)}`
                : 'No registrado'}</td>
            <td data-label="Estado"><StatusBadge tone={statusTone(entry.recognitionState)}>{STATE_LABELS[entry.recognitionState] || entry.recognitionState}</StatusBadge></td>
            <td data-label="Origen">{OWNER_LABELS[entry.ownerAggregate] || entry.ownerAggregate}</td>
          </tr>)}</tbody>
        </table>
      </div>}

      <p className="annual-income-ledger-boundary">Esta vista muestra hechos registrados y su origen. No representa el impuesto final, una devolución estimada, el estado de preparación tributaria ni una conciliación con el SII.</p>
    </SectionCard>
  </section>;
}
