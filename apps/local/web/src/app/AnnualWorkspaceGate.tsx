import { useEffect, useMemo, useState } from 'react';
import WorkspaceView from './WorkspaceView';
import AnnualWorkspaceOverviewSection from './AnnualWorkspaceOverviewSection';
import ApplicabilityProfileSection from './ApplicabilityProfileSection';
import { priorYearInitializationClient, type PriorYearInitializationPreview } from './prior-year-initialization-client';
import { api, ApiRequestError, type AnnualWorkspaceList, type AnnualWorkspaceOption } from '../api';
import './annual-workspace.css';

function derivedTaxYearLabel(commercialYear: number) {
  return `AT${commercialYear + 1}`;
}

export default function AnnualWorkspaceGate() {
  const [catalog, setCatalog] = useState<AnnualWorkspaceList | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [candidateYear, setCandidateYear] = useState(new Date().getFullYear());
  const [creationMode, setCreationMode] = useState<'EMPTY' | 'PRIOR'>('EMPTY');
  const [sourceYear, setSourceYear] = useState<number | null>(null);
  const [initializationPreview, setInitializationPreview] = useState<PriorYearInitializationPreview | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const activeOption = useMemo(
    () => catalog?.workspaces.find(item => item.workspace.commercialYear === catalog.activeCommercialYear) || null,
    [catalog]
  );

  const reloadCatalog = async () => {
    const next = await api.listAnnualWorkspaces();
    setCatalog(next);
    return next;
  };

  useEffect(() => {
    reloadCatalog().catch(e => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    if (!createOpen || creationMode !== 'PRIOR' || sourceYear == null || !Number.isSafeInteger(candidateYear) || candidateYear <= 0) {
      setInitializationPreview(null);
      setSelectedCategories([]);
      return;
    }
    let cancelled = false;
    priorYearInitializationClient.preview(sourceYear, candidateYear)
      .then(preview => {
        if (cancelled) return;
        setInitializationPreview(preview);
        setSelectedCategories(preview.categories.filter(item => item.available && item.selectedByDefault).map(item => item.key));
      })
      .catch(e => {
        if (!cancelled) setError(errorMessage(e));
      });
    return () => { cancelled = true; };
  }, [createOpen, creationMode, sourceYear, candidateYear]);

  const selectWorkspace = async (option: AnnualWorkspaceOption) => {
    if (!catalog || option.workspace.commercialYear === catalog.activeCommercialYear) return;
    if (option.support.state === 'UNSUPPORTED') {
      setError(`El año comercial ${option.workspace.commercialYear} no tiene un rule set completo y no puede abrirse de forma segura.`);
      return;
    }
    const acceptWarnings = option.support.state === 'SUPPORTED_WITH_WARNINGS'
      ? window.confirm(`El año comercial ${option.workspace.commercialYear} tiene reglas operativas, pero su provenance no está completa. ¿Abrir de todas formas?`)
      : false;
    if (option.support.state === 'SUPPORTED_WITH_WARNINGS' && !acceptWarnings) return;

    setBusy(true);
    setError('');
    try {
      await api.selectAnnualWorkspace(option.workspace.commercialYear, acceptWarnings);
      await reloadCatalog();
    } catch (e) {
      if ((e as { code?: string })?.code !== 'workspace_transition_cancelled') setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const openCreate = () => {
    const activeYear = catalog?.activeCommercialYear || new Date().getFullYear();
    setCandidateYear(activeYear + 1);
    setCreationMode('EMPTY');
    setSourceYear(activeYear);
    setInitializationPreview(null);
    setSelectedCategories([]);
    setError('');
    setCreateOpen(true);
  };

  const runEmptyCreation = async (acceptWarnings = false) => {
    await api.createAnnualWorkspace(candidateYear, acceptWarnings);
  };

  const runPriorYearInitialization = async (acceptWarnings = false) => {
    if (sourceYear == null || !initializationPreview) throw new Error('Selecciona un año fuente válido y espera el preview de inicialización.');
    await priorYearInitializationClient.initialize({
      sourceCommercialYear: sourceYear,
      targetCommercialYear: candidateYear,
      categories: selectedCategories,
      acceptWarnings
    });
  };

  const createWorkspace = async () => {
    if (!Number.isSafeInteger(candidateYear) || candidateYear <= 0) {
      setError('Ingresa un año comercial válido.');
      return;
    }
    const duplicate = catalog?.workspaces.find(item => item.workspace.commercialYear === candidateYear);
    if (duplicate) {
      setError(`El año comercial ${candidateYear} ya existe. Puedes abrir ese workspace desde el selector.`);
      return;
    }
    if (creationMode === 'PRIOR' && (!initializationPreview || initializationPreview.targetAlreadyExists)) {
      setError('No se puede inicializar mientras el preview no sea válido.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      if (creationMode === 'PRIOR') await runPriorYearInitialization(false);
      else await runEmptyCreation(false);
      await reloadCatalog();
      setCreateOpen(false);
    } catch (e) {
      if ((e as { code?: string })?.code === 'tax_year_support_warning_confirmation_required') {
        const accepted = window.confirm(`${errorMessage(e)}\n\n¿Crear y abrir el año de todas formas?`);
        if (accepted) {
          try {
            if (creationMode === 'PRIOR') await runPriorYearInitialization(true);
            else await runEmptyCreation(true);
            await reloadCatalog();
            setCreateOpen(false);
            return;
          } catch (retryError) {
            setError(errorMessage(retryError));
          }
        }
      } else if (!(e instanceof ApiRequestError && e.code === 'workspace_transition_cancelled')) {
        setError(errorMessage(e));
      }
    } finally {
      setBusy(false);
    }
  };

  if (!catalog || !activeOption) {
    return <div className="annual-workspace-loading">{error || 'Cargando contexto anual…'}</div>;
  }

  const sourceOptions = catalog.workspaces.filter(item => item.workspace.commercialYear !== candidateYear);

  return <div className="annual-workspace-gate">
    <section className="annual-workspace-header" aria-label="Contexto anual activo">
      <div className="annual-workspace-field">
        <small>Año comercial</small>
        <select
          value={catalog.activeCommercialYear}
          disabled={busy}
          onChange={event => {
            const option = catalog.workspaces.find(item => item.workspace.commercialYear === Number(event.target.value));
            if (option) selectWorkspace(option);
          }}
        >
          {catalog.workspaces.map(({ workspace, support }) => <option key={workspace.id} value={workspace.commercialYear}>
            {workspace.commercialYear}{support.state === 'UNSUPPORTED' ? ' · sin reglas compatibles' : support.state === 'SUPPORTED_WITH_WARNINGS' ? ' · revisar reglas' : ''}
          </option>)}
        </select>
      </div>
      <div className="annual-workspace-derived">
        <small>Operación Renta</small>
        <strong>{activeOption.workspace.derivedTaxYearLabel}</strong>
      </div>
      <div className="annual-workspace-derived">
        <small>Estado</small>
        <strong>En preparación</strong>
      </div>
      <button className="annual-workspace-create" disabled={busy} onClick={openCreate}>+ Crear año</button>
      {busy && <span className="annual-workspace-progress">Cambiando contexto…</span>}
    </section>

    {error && <div className="annual-workspace-error">{error}<button onClick={() => setError('')}>×</button></div>}

    {createOpen && <div className="annual-workspace-modal-backdrop" role="presentation">
      <section className="annual-workspace-modal" role="dialog" aria-modal="true" aria-labelledby="create-annual-workspace-title">
        <h2 id="create-annual-workspace-title">Crear año tributario</h2>
        <label>
          <span>Año comercial</span>
          <input type="number" value={candidateYear} onChange={e => setCandidateYear(Number(e.target.value))} />
        </label>
        <div className="annual-workspace-preview">
          <span>Operación Renta</span>
          <strong>{Number.isSafeInteger(candidateYear) && candidateYear > 0 ? derivedTaxYearLabel(candidateYear) : '—'}</strong>
          <small>Derivado automáticamente; no es editable.</small>
        </div>
        <fieldset>
          <legend>¿Cómo quieres comenzar?</legend>
          <label><input type="radio" checked={creationMode === 'EMPTY'} onChange={() => setCreationMode('EMPTY')} /> Empezar vacío</label>
          <label><input type="radio" checked={creationMode === 'PRIOR'} onChange={() => setCreationMode('PRIOR')} /> Inicializar desde un año anterior</label>
        </fieldset>

        {creationMode === 'EMPTY' && <p className="annual-workspace-copy-note">Empezar vacío crea únicamente el contexto anual. No copia ingresos, boletas, hipotecas, APV, evidencia ni conciliaciones.</p>}

        {creationMode === 'PRIOR' && <div className="prior-year-initialization-preview">
          <label>
            <span>Año fuente</span>
            <select value={sourceYear ?? ''} onChange={e => setSourceYear(Number(e.target.value))}>
              {sourceOptions.map(item => <option key={item.workspace.id} value={item.workspace.commercialYear}>{item.workspace.commercialYear}</option>)}
            </select>
          </label>
          <h3>Reutilizar</h3>
          {!initializationPreview && <p>Cargando categorías reutilizables…</p>}
          {initializationPreview?.categories.map(category => <label key={category.key} className={!category.available ? 'disabled' : ''}>
            <input
              type="checkbox"
              disabled={!category.available}
              checked={selectedCategories.includes(category.key)}
              onChange={e => setSelectedCategories(current => e.target.checked
                ? [...new Set([...current, category.key])]
                : current.filter(key => key !== category.key))}
            />
            {category.label}{!category.available ? ' · No disponible en el año fuente' : ''}
          </label>)}
          <h3>No se copiarán</h3>
          <ul>
            <li>montos realizados ni movimientos de ledger</li>
            <li>boletas, retenciones ni PPM</li>
            <li>evidencia documental ni conciliaciones SII</li>
            <li>readiness/cierre del año anterior</li>
            <li>resultados calculados ni proyecciones históricas</li>
          </ul>
          <small>Lo reutilizado conserva provenance del año fuente y queda sujeto a revisión.</small>
        </div>}

        <div className="annual-workspace-modal-actions">
          <button disabled={busy} onClick={() => setCreateOpen(false)}>Cancelar</button>
          <button className="primary" disabled={busy || (creationMode === 'PRIOR' && !initializationPreview)} onClick={createWorkspace}>{busy ? 'Creando…' : creationMode === 'PRIOR' ? 'Crear e inicializar' : 'Crear y abrir'}</button>
        </div>
      </section>
    </div>}

    <AnnualWorkspaceOverviewSection commercialYear={catalog.activeCommercialYear} />
    <ApplicabilityProfileSection commercialYear={catalog.activeCommercialYear} />
    <WorkspaceView key={catalog.activeCommercialYear} />
  </div>;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}
