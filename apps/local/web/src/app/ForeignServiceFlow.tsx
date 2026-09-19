import { useEffect, useMemo, useState } from 'react';
import { Button, SectionCard, StatusBadge } from '@adumun/react-components';
import { feeReceiptService } from '../services';
import type { FeeReceipt } from '../types';
import {
  foreignServiceClient,
  type ForeignServiceConversion,
  type ForeignServiceIncome,
  type FeeReceiptForeignSettlement
} from './foreign-service-client';
import './foreign-service-flow.css';

type FlowMode = 'CREATE' | 'EDIT';
type Jurisdiction = 'CHILE' | 'FOREIGN';

type Props = {
  commercialYear: number;
  mode: FlowMode;
  ownerRecordId?: string;
  onClose: () => void;
  onComplete: () => void;
  onCreateFeeReceipt: () => void;
};

type ForeignForm = {
  payerName: string;
  payerCountry: string;
  receivedAt: string;
  originalAmount: string;
  originalCurrency: string;
  description: string;
  foreignTaxAmountOriginal: string;
  foreignTaxCurrency: string;
  foreignTaxPaidAt: string;
  foreignTaxDocumentReference: string;
  notes: string;
};

type SettlementForm = {
  payerCountry: string;
  receivedAmount: string;
  receivedCurrency: string;
  receivedAt: string;
  providerReference: string;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForeignForm = (): ForeignForm => ({
  payerName: '',
  payerCountry: '',
  receivedAt: today(),
  originalAmount: '',
  originalCurrency: 'USD',
  description: '',
  foreignTaxAmountOriginal: '',
  foreignTaxCurrency: '',
  foreignTaxPaidAt: '',
  foreignTaxDocumentReference: '',
  notes: ''
});

const emptySettlement = (): SettlementForm => ({
  payerCountry: '',
  receivedAmount: '',
  receivedCurrency: 'USD',
  receivedAt: today(),
  providerReference: '',
  notes: ''
});

function foreignFormFromRecord(record: ForeignServiceIncome): ForeignForm {
  return {
    payerName: record.payerName,
    payerCountry: record.payerCountry,
    receivedAt: record.receivedAt || '',
    originalAmount: String(record.originalAmount),
    originalCurrency: record.originalCurrency,
    description: record.description || '',
    foreignTaxAmountOriginal: record.foreignTaxAmountOriginal == null ? '' : String(record.foreignTaxAmountOriginal),
    foreignTaxCurrency: record.foreignTaxCurrency || '',
    foreignTaxPaidAt: record.foreignTaxPaidAt || '',
    foreignTaxDocumentReference: record.foreignTaxDocumentReference || '',
    notes: record.notes || ''
  };
}

function settlementFormFromRecord(record: FeeReceiptForeignSettlement): SettlementForm {
  return {
    payerCountry: record.payerCountry,
    receivedAmount: String(record.receivedAmount),
    receivedCurrency: record.receivedCurrency,
    receivedAt: record.receivedAt,
    providerReference: record.providerReference || '',
    notes: record.notes || ''
  };
}

function money(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

function fxSourceLabel(source: ForeignServiceConversion['fxSource']) {
  return source === 'BCCH' ? 'Banco Central de Chile' : 'Conversión manual';
}

function officialResolutionReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    MISSING_RECEIVED_AT: 'falta la fecha de percepción',
    OFFICIAL_PROVIDER_UNAVAILABLE: 'la fuente oficial no está disponible en esta ejecución',
    BCCH_RATE_DATE_MISMATCH: 'la fuente oficial no devolvió una tasa para la fecha exacta',
    RATE_UNAVAILABLE: 'no existe una tasa oficial segura para la fecha indicada'
  };
  return labels[reason] || 'la conversión oficial no pudo resolverse de forma segura';
}

export default function ForeignServiceFlow({ commercialYear, mode, ownerRecordId, onClose, onComplete, onCreateFeeReceipt }: Props) {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | ''>(mode === 'EDIT' ? 'FOREIGN' : '');
  const [payerCountry, setPayerCountry] = useState('');
  const [foreignForm, setForeignForm] = useState<ForeignForm>(emptyForeignForm);
  const [foreignRecord, setForeignRecord] = useState<ForeignServiceIncome | null>(null);
  const [conversions, setConversions] = useState<ForeignServiceConversion[]>([]);
  const [manualRate, setManualRate] = useState('');
  const [manualRateDate, setManualRateDate] = useState(today());
  const [manualReference, setManualReference] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
  const [selectedReceiptId, setSelectedReceiptId] = useState('');
  const [settlement, setSettlement] = useState<SettlementForm>(emptySettlement);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [conversionError, setConversionError] = useState('');
  const [conversionInfo, setConversionInfo] = useState('');

  const currentConversion = useMemo(
    () => foreignRecord?.currentConversionId
      ? conversions.find(item => item.id === foreignRecord.currentConversionId) || null
      : null,
    [foreignRecord, conversions]
  );

  const loadForeign = async (id: string) => {
    const [record, history] = await Promise.all([
      foreignServiceClient.get(id),
      foreignServiceClient.listConversions(id)
    ]);
    if (record.taxYear !== commercialYear) throw new Error('El registro pertenece a otro año comercial.');
    setForeignRecord(record);
    setForeignForm(foreignFormFromRecord(record));
    setPayerCountry(record.payerCountry);
    setConversions(history);
    setManualRateDate(record.receivedAt || today());
  };

  useEffect(() => {
    if (mode !== 'EDIT' || !ownerRecordId) return;
    let cancelled = false;
    setBusy(true);
    loadForeign(ownerRecordId)
      .catch(cause => { if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause)); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [mode, ownerRecordId, commercialYear]);

  useEffect(() => {
    if (jurisdiction !== 'CHILE') return;
    let cancelled = false;
    feeReceiptService.list({ taxYear: commercialYear })
      .then(list => { if (!cancelled) setReceipts(list); })
      .catch(cause => { if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause)); });
    return () => { cancelled = true; };
  }, [jurisdiction, commercialYear]);

  useEffect(() => {
    if (!selectedReceiptId) return;
    let cancelled = false;
    foreignServiceClient.getSettlement(selectedReceiptId)
      .then(record => {
        if (cancelled) return;
        if (record) setSettlement(settlementFormFromRecord(record));
        else setSettlement(current => ({ ...emptySettlement(), payerCountry: payerCountry || current.payerCountry }));
      })
      .catch(cause => { if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause)); });
    return () => { cancelled = true; };
  }, [selectedReceiptId]);

  const chooseJurisdiction = (value: Jurisdiction) => {
    setJurisdiction(value);
    setError('');
    setInfo('');
    setConversionError('');
    setConversionInfo('');
    if (value === 'FOREIGN') setForeignForm(current => ({ ...current, payerCountry: payerCountry || current.payerCountry }));
    else setSettlement(current => ({ ...current, payerCountry: payerCountry || current.payerCountry }));
  };

  const saveForeignFact = async () => {
    const amount = Number(foreignForm.originalAmount);
    if (!foreignForm.payerName.trim() || !/^[A-Za-z]{2}$/.test(foreignForm.payerCountry.trim()) || !(amount > 0) || !foreignForm.receivedAt) {
      setError('Completa pagador, país, fecha de percepción y monto original.');
      return;
    }
    setBusy(true); setError(''); setInfo('');
    try {
      const payload = {
        taxYear: commercialYear,
        payerName: foreignForm.payerName.trim(),
        payerCountry: foreignForm.payerCountry.trim().toUpperCase(),
        serviceSourceJurisdiction: 'FOREIGN' as const,
        receivedAt: foreignForm.receivedAt,
        originalAmount: amount,
        originalCurrency: foreignForm.originalCurrency.trim().toUpperCase(),
        description: foreignForm.description || null,
        foreignTaxAmountOriginal: foreignForm.foreignTaxAmountOriginal ? Number(foreignForm.foreignTaxAmountOriginal) : null,
        foreignTaxCurrency: foreignForm.foreignTaxCurrency ? foreignForm.foreignTaxCurrency.trim().toUpperCase() : null,
        foreignTaxPaidAt: foreignForm.foreignTaxPaidAt || null,
        foreignTaxDocumentReference: foreignForm.foreignTaxDocumentReference || null,
        notes: foreignForm.notes || null
      };
      const saved = foreignRecord
        ? await foreignServiceClient.update(foreignRecord.id, payload)
        : await foreignServiceClient.create(payload);
      setForeignRecord(saved);
      setForeignForm(foreignFormFromRecord(saved));
      setConversions(await foreignServiceClient.listConversions(saved.id));
      setManualRateDate(saved.receivedAt || today());
      setInfo(foreignRecord
        ? 'Hecho económico actualizado. Si cambió un dato que determina la conversión, la conversión anterior dejó de ser vigente y su historial se conserva.'
        : 'Hecho de fuente extranjera guardado. Falta resolver su conversión a CLP para reconocerlo en el ledger.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally { setBusy(false); }
  };

  const resolveOfficial = async () => {
    if (!foreignRecord) return;
    setBusy(true); setError(''); setInfo(''); setConversionError(''); setConversionInfo('');
    try {
      const result = await foreignServiceClient.resolveOfficial(foreignRecord.id);
      if (result.status === 'RESOLVED') {
        await loadForeign(foreignRecord.id);
        setConversionInfo('Conversión oficial resuelta y congelada con su procedencia.');
      } else {
        setConversionInfo(`La conversión oficial requiere revisión porque ${officialResolutionReasonLabel(result.reason)}. Puedes conservar el registro pendiente o ingresar una conversión manual documentada.`);
      }
    } catch (cause) {
      setConversionError(cause instanceof Error ? cause.message : String(cause));
    } finally { setBusy(false); }
  };

  const saveManualConversion = async () => {
    if (!foreignRecord || !(Number(manualRate) > 0) || !manualRateDate || !manualReference.trim() || !manualReason.trim()) {
      setConversionError('La conversión manual exige tasa, fecha, fuente/referencia y razón.');
      setConversionInfo('');
      return;
    }
    setBusy(true); setError(''); setInfo(''); setConversionError(''); setConversionInfo('');
    try {
      await foreignServiceClient.addManualConversion(foreignRecord.id, {
        fxRate: Number(manualRate),
        fxRateDate: manualRateDate,
        fxSourceReference: manualReference.trim(),
        fxReason: manualReason.trim()
      });
      await loadForeign(foreignRecord.id);
      setManualRate(''); setManualReference(''); setManualReason('');
      setConversionInfo('Conversión manual guardada como un nuevo snapshot; el historial anterior permanece disponible.');
    } catch (cause) {
      setConversionError(cause instanceof Error ? cause.message : String(cause));
    } finally { setBusy(false); }
  };

  const saveSettlement = async () => {
    if (!selectedReceiptId || !/^[A-Za-z]{2}$/.test(settlement.payerCountry.trim()) || !(Number(settlement.receivedAmount) > 0) || !settlement.receivedAt) {
      setError('Selecciona una BHE y completa país, monto recibido y fecha de pago.');
      return;
    }
    setBusy(true); setError(''); setInfo('');
    try {
      await foreignServiceClient.saveSettlement(selectedReceiptId, {
        payerCountry: settlement.payerCountry.trim().toUpperCase(),
        receivedAmount: Number(settlement.receivedAmount),
        receivedCurrency: settlement.receivedCurrency.trim().toUpperCase(),
        receivedAt: settlement.receivedAt,
        providerReference: settlement.providerReference || null,
        notes: settlement.notes || null
      });
      onComplete();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally { setBusy(false); }
  };

  return <div className="foreign-service-flow-backdrop" role="presentation">
    <section className="foreign-service-flow" role="dialog" aria-modal="true" aria-labelledby="foreign-service-flow-title">
      <header>
        <div>
          <small>Ingresos del año · {commercialYear}</small>
          <h2 id="foreign-service-flow-title">Servicio con pagador extranjero</h2>
          <p>El país del pagador y la fuente del ingreso son dimensiones distintas. PTL no determina automáticamente dónde se prestó materialmente el servicio.</p>
        </div>
        <Button variant="ghost" onClick={onClose}>Cerrar</Button>
      </header>

      {error && <div className="foreign-service-flow-message error" role="alert">{error}</div>}
      {info && <div className="foreign-service-flow-message" role="status">{info}</div>}

      {mode === 'CREATE' && !jurisdiction && <SectionCard>
        <div className="foreign-service-flow-grid">
          <label><span>País del pagador (ISO, 2 letras)</span><input value={payerCountry} maxLength={2} placeholder="US" onChange={e => setPayerCountry(e.target.value.toUpperCase())} /></label>
        </div>
        <fieldset className="foreign-service-jurisdiction">
          <legend>¿Dónde se prestó materialmente el servicio?</legend>
          <button type="button" onClick={() => chooseJurisdiction('CHILE')}><strong>Chile</strong><span>El hecho tributario sigue siendo la BHE en CLP.</span></button>
          <button type="button" onClick={() => chooseJurisdiction('FOREIGN')}><strong>Extranjero</strong><span>Se registra un honorario genuinamente de fuente extranjera.</span></button>
        </fieldset>
      </SectionCard>}

      {jurisdiction === 'CHILE' && <SectionCard>
        <h3>Servicio prestado en Chile</h3>
        <p>La BHE continúa siendo el único hecho de ingreso del ledger. El pago en moneda extranjera se registra sólo como settlement/provenance y no genera una segunda fila.</p>
        <div className="foreign-service-flow-actions"><Button variant="ghost" onClick={onCreateFeeReceipt}>+ Crear BHE</Button></div>
        <div className="foreign-service-flow-grid">
          <label><span>BHE propietaria</span><select value={selectedReceiptId} onChange={e => setSelectedReceiptId(e.target.value)}><option value="">Selecciona una BHE</option>{receipts.map(receipt => <option key={receipt.id} value={receipt.id}>{receipt.issueDate} · {receipt.clientName} · {money(receipt.grossAmount)}</option>)}</select></label>
          <label><span>País del pagador</span><input maxLength={2} value={settlement.payerCountry} onChange={e => setSettlement(current => ({ ...current, payerCountry: e.target.value.toUpperCase() }))} /></label>
          <label><span>Monto recibido</span><input type="number" min="0" step="0.01" value={settlement.receivedAmount} onChange={e => setSettlement(current => ({ ...current, receivedAmount: e.target.value }))} /></label>
          <label><span>Moneda recibida</span><input maxLength={3} value={settlement.receivedCurrency} onChange={e => setSettlement(current => ({ ...current, receivedCurrency: e.target.value.toUpperCase() }))} /></label>
          <label><span>Fecha del pago</span><input type="date" value={settlement.receivedAt} onChange={e => setSettlement(current => ({ ...current, receivedAt: e.target.value }))} /></label>
          <label><span>Referencia banco / proveedor</span><input value={settlement.providerReference} onChange={e => setSettlement(current => ({ ...current, providerReference: e.target.value }))} /></label>
          <label className="wide"><span>Notas</span><textarea value={settlement.notes} onChange={e => setSettlement(current => ({ ...current, notes: e.target.value }))} /></label>
        </div>
        <div className="foreign-service-flow-actions"><Button disabled={busy || !selectedReceiptId} onClick={saveSettlement}>Guardar settlement y volver al ledger</Button><Button variant="ghost" onClick={onClose}>Cancelar</Button></div>
      </SectionCard>}

      {jurisdiction === 'FOREIGN' && <>
        <SectionCard>
          <div className="foreign-service-flow-section-heading"><div><h3>Honorario de fuente extranjera</h3><p>El año se deriva de la fecha de percepción. El monto original nunca se reemplaza por la conversión CLP.</p></div>{foreignRecord ? <StatusBadge tone={currentConversion?.conversionStatus === 'RESOLVED' ? 'success' : 'warning'}>{currentConversion?.conversionStatus === 'RESOLVED' ? 'Conversión resuelta' : 'Pendiente de conversión'}</StatusBadge> : null}</div>
          <div className="foreign-service-flow-grid">
            <label><span>Pagador</span><input value={foreignForm.payerName} onChange={e => setForeignForm(current => ({ ...current, payerName: e.target.value }))} /></label>
            <label><span>País del pagador</span><input maxLength={2} value={foreignForm.payerCountry} onChange={e => setForeignForm(current => ({ ...current, payerCountry: e.target.value.toUpperCase() }))} /></label>
            <label><span>Fecha de percepción</span><input type="date" value={foreignForm.receivedAt} onChange={e => setForeignForm(current => ({ ...current, receivedAt: e.target.value }))} /></label>
            <label><span>Monto original</span><input type="number" min="0" step="0.01" value={foreignForm.originalAmount} onChange={e => setForeignForm(current => ({ ...current, originalAmount: e.target.value }))} /></label>
            <label><span>Moneda original</span><input maxLength={3} value={foreignForm.originalCurrency} onChange={e => setForeignForm(current => ({ ...current, originalCurrency: e.target.value.toUpperCase() }))} /></label>
            <label><span>Descripción</span><input value={foreignForm.description} onChange={e => setForeignForm(current => ({ ...current, description: e.target.value }))} /></label>
            <label><span>Impuesto extranjero pagado/retenido (opcional)</span><input type="number" min="0" step="0.01" value={foreignForm.foreignTaxAmountOriginal} onChange={e => setForeignForm(current => ({ ...current, foreignTaxAmountOriginal: e.target.value }))} /></label>
            <label><span>Moneda del impuesto</span><input maxLength={3} value={foreignForm.foreignTaxCurrency} onChange={e => setForeignForm(current => ({ ...current, foreignTaxCurrency: e.target.value.toUpperCase() }))} /></label>
            <label><span>Fecha del impuesto</span><input type="date" value={foreignForm.foreignTaxPaidAt} onChange={e => setForeignForm(current => ({ ...current, foreignTaxPaidAt: e.target.value }))} /></label>
            <label><span>Referencia documental</span><input value={foreignForm.foreignTaxDocumentReference} onChange={e => setForeignForm(current => ({ ...current, foreignTaxDocumentReference: e.target.value }))} /></label>
            <label className="wide"><span>Notas</span><textarea value={foreignForm.notes} onChange={e => setForeignForm(current => ({ ...current, notes: e.target.value }))} /></label>
          </div>
          <p className="foreign-service-boundary">Registrar impuesto extranjero aquí conserva el hecho; PTL no calcula en esta story el crédito del artículo 41 A.</p>
          <div className="foreign-service-flow-actions"><Button disabled={busy} onClick={saveForeignFact}>{foreignRecord ? 'Guardar corrección del hecho' : 'Guardar hecho'}</Button>{foreignRecord ? <Button variant="ghost" onClick={onComplete}>Volver al ledger</Button> : <Button variant="ghost" onClick={onClose}>Cancelar</Button>}</div>
        </SectionCard>

        {foreignRecord && <SectionCard>
          <div className="foreign-service-flow-section-heading"><div><h3>Conversión a CLP</h3><p>Una conversión reconocida queda congelada con tasa, fecha, fuente y referencia. Corregirla agrega un snapshot; no sobrescribe el histórico.</p></div>{currentConversion ? <StatusBadge tone={currentConversion.fxSource === 'BCCH' ? 'success' : 'warning'}>{fxSourceLabel(currentConversion.fxSource)}</StatusBadge> : <StatusBadge tone="warning">Requiere revisión</StatusBadge>}</div>
          {conversionError && <div className="foreign-service-flow-message error" role="alert">{conversionError}</div>}
          {conversionInfo && <div className="foreign-service-flow-message" role="status">{conversionInfo}</div>}
          {currentConversion ? <dl className="foreign-service-conversion-current"><div><dt>Monto CLP vigente</dt><dd>{money(currentConversion.clpAmount)}</dd></div><div><dt>Tipo de cambio</dt><dd>{currentConversion.fxRate}</dd></div><div><dt>Fecha tasa</dt><dd>{currentConversion.fxRateDate}</dd></div><div><dt>Fuente / referencia</dt><dd>{fxSourceLabel(currentConversion.fxSource)} · {currentConversion.fxSourceReference}</dd></div></dl> : <p>Este hecho permanece pendiente: todavía no aporta un monto CLP reconocido al ledger.</p>}
          <div className="foreign-service-flow-actions"><Button variant="ghost" disabled={busy} onClick={resolveOfficial}>Intentar resolver con fuente oficial</Button></div>

          <h4>Conversión manual documentada</h4>
          <div className="foreign-service-flow-grid">
            <label><span>Tipo de cambio</span><input type="number" min="0" step="0.000001" value={manualRate} onChange={e => setManualRate(e.target.value)} /></label>
            <label><span>Fecha de la tasa</span><input type="date" value={manualRateDate} onChange={e => setManualRateDate(e.target.value)} /></label>
            <label><span>Fuente / referencia</span><input value={manualReference} onChange={e => setManualReference(e.target.value)} /></label>
            <label><span>Razón de uso manual</span><input value={manualReason} onChange={e => setManualReason(e.target.value)} /></label>
          </div>
          <div className="foreign-service-flow-actions"><Button disabled={busy} onClick={saveManualConversion}>Guardar nuevo snapshot manual</Button></div>

          {conversions.length > 0 && <div className="foreign-service-history"><h4>Historial de conversiones</h4><ol>{conversions.map(item => <li key={item.id}><strong>{fxSourceLabel(item.fxSource)} · {item.fxRateDate}</strong><span>{item.fxRate} → {money(item.clpAmount)}</span><small>{item.supersedesConversionId ? `Reemplaza la conversión anterior (${item.supersedesConversionId})` : 'Conversión inicial'} · {item.fxSourceReference}</small></li>)}</ol></div>}
        </SectionCard>}
      </>}
    </section>
  </div>;
}
