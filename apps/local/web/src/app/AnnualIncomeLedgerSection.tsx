import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, PageHeader, SectionCard, Select, StatusBadge } from '@adumun/react-components';
import {
  taxLedgerClient,
  type AnnualTaxLedgerResult,
  type TaxLedgerCategorySummary,
  type TaxLedgerEntry,
  type TaxLedgerFilters
} from './tax-ledger-client';
import ForeignServiceFlow from './ForeignServiceFlow';
import './annual-income-ledger.css';

type LoadState = 'LOADING' | 'EMPTY' | 'READY' | 'ERROR' | 'STALE_SUPPRESSED';

type Props = {
  commercialYear: number;
  onAddIncome?: () => void;
  onAddFeeReceipt?: () => void;
  onOpenOwner?: (entry: TaxLedgerEntry) => void;
};

type ForeignFlowState = { mode: 'CREATE' | 'EDIT'; ownerRecordId?: string } | null;

const money = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
});

const ENTRY_KIND_LABELS: Record<string, string> = {
  DEPENDENT_INCOME: 'Renta dependiente',
  DOMESTIC_FEE_INCOME: 'Honorarios / BHE',
  FOREIGN_SERVICE_INCOME: 'Honorario de fuente extranjera',
  OTHER_INCOME_SOURCE: 'Otros ingresos'
};

const STATE_LABELS: Record<string, string> = {
  RECOGNIZED: 'Reconocido',
  PENDING: 'Pendiente',
  EXCLUDED: 'Excluido'
};

const OWNER_LABELS: Record<string, string> = {
  INCOME_SOURCE: 'Ingreso laboral',
  FEE_RECEIPT: 'Boleta de honorarios',
  FOREIGN_SERVICE_INCOME: 'Servicio de fuente extranjera'
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

function categoryAmount(summary: TaxLedgerCategorySummary, key: 'gross' | 'withholding' | 'ppm') {
  const total = summary.totalsByCurrency.CLP?.[key];
  if (!total || total.presentCount === 0) return 'No registrado';
  return money.format(total.amount);
}

function FactualCategoryCard({ entryKind, summary, onTrace }: { entryKind: string; summary: TaxLedgerCategorySummary; onTrace: () => void }) {
  const recognized = summary.recognitionCounts.RECOGNIZED || 0;
  const pending = summary.recognitionCounts.PENDING || 0;
  const excluded = summary.recognitionCounts.EXCLUDED || 0;
  return <article className="annual-income-position-card">
    <div className="annual-income-position-card-heading">
      <div><small>Categoría</small><strong>{ENTRY_KIND_LABELS[entryKind] || entryKind}</strong></div>
      <StatusBadge tone={pending > 0 ? 'warning' : 'neutral'}>{summary.entryCount} entradas</StatusBadge>
    </div>
    <dl>
      <div><dt>Bruto factual reconocido</dt><dd>{categoryAmount(summary, 'gross')}</dd></div>
      <div><dt>Retención registrada</dt><dd>{categoryAmount(summary, 'withholding')}</dd></div>
      <div><dt>PPM registrado</dt><dd>{categoryAmount(summary, 'ppm')}</dd></div>
    </dl>
    <p>{recognized} reconocidas · {pending} pendientes · {excluded} excluidas</p>
    <Button variant="ghost" onClick={onTrace}>Ver entradas</Button>
  </article>;
}

export default function AnnualIncomeLedgerSection({ commercialYear, onAddIncome, onAddFeeReceipt, onOpenOwner }: Props) {
  const [filters, setFilters] = useState<TaxLedgerFilters>({});
  const [result, setResult] = useState<AnnualTaxLedgerResult | null>(null);
  const [positionResult, setPositionResult] = useState<AnnualTaxLedgerResult | null>(null);
  const [state, setState] = useState<LoadState>('LOADING');
  const [error, setError] = useState('');
  const [foreignFlow, setForeignFlow] = useState<ForeignFlowState>(null);
  const requestSerial = useRef(0);

  const reload = async () => {
    const serial = ++requestSerial.current;
    setState('LOADING');
    setError('');
    try {
      const hasFilters = Boolean(filters.entryKind || filters.ownerAggregate || filters.recognitionState);
      const [next, annualPosition] = await Promise.all([
        taxLedgerClient.list(filters),
        hasFilters ? taxLedgerClient.list({}) : taxLedgerClient.list(filters)
      ]);
      if (serial !== requestSerial.current) return;
      if (next.commercialYear !== commercialYear || annualPosition.commercialYear !== commercialYear) {
        setResult(null);
        setPositionResult(null);
        setState('STALE_SUPPRESSED');
        return;
      }
      setResult(next);
      setPositionResult(annualPosition);
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
    const withholding = totalRegistered(positionResult, 'withholding');
    const ppm = totalRegistered(positionResult, 'ppm');
    if (withholding === 'No registrado' && ppm === 'No registrado') return 'No registrado';
    return `${withholding} · PPM ${ppm}`;
  }, [positionResult]);

  const factualCategories = useMemo(
    () => Object.entries(positionResult?.factualSummary.totalsByEntryKind || {}),
    [positionResult]
  );

  const openEntry = (entry: TaxLedgerEntry) => {
    if (entry.ownerAggregate === 'FOREIGN_SERVICE_INCOME') {
      setForeignFlow({ mode: 'EDIT', ownerRecordId: entry.ownerRecordId });
      return;
    }
    onOpenOwner?.(entry);
  };

  const completeForeignFlow = () => {
    setForeignFlow(null);
    void reload();
  };

  const createBheFromForeignFlow = () => {
    setForeignFlow(null);
    onAddFeeReceipt?.();
  };

  return <section className="annual-income-ledger" aria-labelledby="annual-income-ledger-title">
    <PageHeader
      eyebrow="Ingresos"
      title="Ingresos del año"
      titleId="annual-income-ledger-title"
      description={`Año comercial ${commercialYear} · Operación Renta AT${commercialYear + 1}. Hechos registrados y consolidados en una sola vista.`}
      actions={<div className="annual-income-ledger-owner-actions">
        <Button onClick={onAddIncome}>+ Renta / ingreso</Button>
        <Button onClick={onAddFeeReceipt}>+ BHE</Button>
        <Button onClick={() => setForeignFlow({ mode: 'CREATE' })}>+ Servicio con pagador extranjero</Button>
      </div>}
    />

    <SectionCard className="annual-income-ledger-card">
      <section className="annual-income-position" aria-labelledby="annual-income-position-title">
        <div className="annual-income-position-heading">
          <div>
            <small>Posición factual anual</small>
            <h2 id="annual-income-position-title">Lo registrado para {commercialYear}</h2>
            <p>Resume hechos del ledger reconocidos por categoría. No calcula tu impuesto anual ni anticipa devolución o pago.</p>
          </div>
        </div>

        <div className="annual-income-ledger-summary" aria-label="Resumen factual anual del ledger">
          <article><small>Entradas registradas</small><strong>{positionResult?.factualSummary.entryCount ?? '—'}</strong></article>
          <article><small>Monto bruto disponible</small><strong>{totalRegistered(positionResult, 'gross')}</strong></article>
          <article><small>Retenciones / PPM registrados</small><strong>{registeredWithholding}</strong></article>
        </div>

        {factualCategories.length > 0 && <div className="annual-income-position-categories">
          {factualCategories.map(([entryKind, summary]) => <FactualCategoryCard
            key={entryKind}
            entryKind={entryKind}
            summary={summary}
            onTrace={() => setFilters(current => ({ ...current, entryKind }))}
          />)}
        </div>}
      </section>

      <div className="annual-income-ledger-toolbar">
        <Select label="Tipo" value={filters.entryKind || ''} onChange={event => setFilters(current => ({ ...current, entryKind: event.target.value || undefined }))}>
          <option value="">Todos</option>
          <option value="DEPENDENT_INCOME">Renta dependiente</option>
          <option value="DOMESTIC_FEE_INCOME">Honorarios / BHE</option>
          <option value="FOREIGN_SERVICE_INCOME">Honorario de fuente extranjera</option>
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
      {state === 'EMPTY' && <div className="annual-income-ledger-state empty"><strong>No hay ingresos registrados para este filtro.</strong><span>La ausencia de registros no se interpreta como $0 de ingresos. La posición factual anual permanece visible arriba.</span></div>}

      {state === 'READY' && result && <div className="annual-income-ledger-table-wrap">
        <table className="annual-income-ledger-table">
          <thead><tr><th>Fecha / período</th><th>Tipo</th><th>Pagador / empleador</th><th>Monto registrado</th><th>Retención / PPM</th><th>Estado</th><th>Origen</th><th>Acción</th></tr></thead>
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
            <td data-label="Acción"><Button variant="ghost" onClick={() => openEntry(entry)}>Ver / editar</Button></td>
          </tr>)}</tbody>
        </table>
      </div>}

      <p className="annual-income-ledger-boundary">Las acciones abren el editor del agregado propietario. El ledger continúa siendo una proyección de solo lectura y no crea una segunda escritura. Una BHE en CLP con settlement extranjero sigue siendo una sola entrada de ingreso. Esta vista no representa el impuesto final, una devolución estimada, el estado de preparación tributaria ni una conciliación con el SII.</p>
    </SectionCard>

    {foreignFlow && <ForeignServiceFlow
      commercialYear={commercialYear}
      mode={foreignFlow.mode}
      ownerRecordId={foreignFlow.ownerRecordId}
      onClose={() => setForeignFlow(null)}
      onComplete={completeForeignFlow}
      onCreateFeeReceipt={createBheFromForeignFlow}
    />}
  </section>;
}
