import { useEffect, useMemo, useState } from 'react';
import {
  AppShell,
  Button,
  ContextHeader,
  ContextHeaderItem,
  FormActions,
  PageHeader,
  PrimaryNav,
  PrimaryNavGroup,
  PrimaryNavItem,
  RadioGroup,
  Select,
  StatusBadge
} from '@adumun/react-components';
import WorkspaceView, { type WorkspaceTab } from './WorkspaceView';
import AnnualWorkspaceOverviewSection from './AnnualWorkspaceOverviewSection';
import AnnualIncomeLedgerSection from './AnnualIncomeLedgerSection';
import ApplicabilityProfileSection from './ApplicabilityProfileSection';
import { priorYearInitializationClient, type PriorYearInitializationPreview } from './prior-year-initialization-client';
import { api, ApiRequestError, type AnnualWorkspaceList, type AnnualWorkspaceOption } from '../api';
import './annual-workspace.css';
import './ptl-shell.css';

type PtlSurface = 'annual-overview' | 'annual-ledger' | 'tax-profile' | WorkspaceTab;

function derivedTaxYearLabel(commercialYear: number) {
  return `AT${commercialYear + 1}`;
}

const workspaceSurfaces: readonly [WorkspaceTab, string][] = [
  ['dashboard', 'Estimación anual'],
  ['incomes', 'Ingresos laborales'],
  ['fees', 'Boletas de honorarios'],
  ['mortgages', 'Créditos hipotecarios'],
  ['apv', 'APV'],
  ['scenarios', 'Escenarios']
];

const systemSurfaces: readonly [WorkspaceTab, string][] = [
  ['settings', 'Configuración tributaria'],
  ['sources', 'Fuentes oficiales'],
  ['logs', 'Bitácora']
];

const workspacePageMeta: Record<WorkspaceTab, { title: string; description: string; eyebrow?: string }> = {
  dashboard: { eyebrow: 'Proyección', title: 'Resumen anual estimado', description: 'Integra sueldos, honorarios, premios, hipotecario y APV en una sola proyección.' },
  incomes: { eyebrow: 'Trabajo', title: 'Fuentes de ingreso laboral', description: 'Administra empleadores y un ingreso simplificado por honorarios.' },
  fees: { eyebrow: 'Trabajo', title: 'Boletas de honorarios', description: 'Registra boletas de honorarios con cálculo de retención, PPM, gastos y consolidación tributaria.' },
  mortgages: { eyebrow: 'Trabajo', title: 'Créditos hipotecarios y art. 55 bis', description: 'Registra créditos hipotecarios y estima el beneficio del artículo 55 bis de la LIR.' },
  apv: { eyebrow: 'Trabajo', title: 'Simulación APV A versus B', description: 'Compara el efecto tributario inmediato de los regímenes A y B.' },
  scenarios: { eyebrow: 'Trabajo', title: 'Simulación anual y escenarios', description: 'Compara escenarios combinando hipotecario, APV y tipos de honorarios.' },
  settings: { eyebrow: 'Sistema', title: 'Configuración tributaria', description: 'Parámetros editables del motor tributario, versionados por año comercial.' },
  sources: { eyebrow: 'Sistema', title: 'Fuentes oficiales', description: 'Fuentes oficiales consultadas y trazabilidad de reglas tributarias.' },
  logs: { eyebrow: 'Sistema', title: 'Bitácora de ejecuciones', description: 'Registro de ejecuciones síncronas y asíncronas, con filtros y paginación.' }
};

function isWorkspaceTab(surface: PtlSurface): surface is WorkspaceTab {
  return !['annual-overview', 'annual-ledger', 'tax-profile'].includes(surface);
}

export default function AnnualWorkspaceGate() {
  const [catalog, setCatalog] = useState<AnnualWorkspaceList | null>(null);
  const [surface, setSurface] = useState<PtlSurface>('annual-overview');
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
      setError(`El año comercial ${option.workspace.commercialYear} no tiene un conjunto de reglas completo y no puede abrirse de forma segura.`);
      return;
    }
    const acceptWarnings = option.support.state === 'SUPPORTED_WITH_WARNINGS'
      ? window.confirm(`El año comercial ${option.workspace.commercialYear} tiene reglas operativas, pero su procedencia no está completa. ¿Abrir de todas formas?`)
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
    if (sourceYear == null || !initializationPreview) throw new Error('Selecciona un año fuente válido y espera la vista previa de inicialización.');
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
      setError(`El año comercial ${candidateYear} ya existe. Puedes abrir ese período desde el selector.`);
      return;
    }
    if (creationMode === 'PRIOR' && (!initializationPreview || initializationPreview.targetAlreadyExists)) {
      setError('No se puede inicializar mientras la vista previa no sea válida.');
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

  const navigation = <PrimaryNav
    label="Navegación principal"
    brand={<div className="ptl-brand"><span>PTL</span><div><strong>Personal Tax Ledger</strong><small>Impuestos personales · Chile</small></div></div>}
  >
    <PrimaryNavGroup label="Período">
      <PrimaryNavItem current={surface === 'annual-overview'} onSelect={() => setSurface('annual-overview')}>Resumen del año</PrimaryNavItem>
      <PrimaryNavItem current={surface === 'annual-ledger'} onSelect={() => setSurface('annual-ledger')}>Ingresos del año</PrimaryNavItem>
      <PrimaryNavItem current={surface === 'tax-profile'} onSelect={() => setSurface('tax-profile')}>Perfil del año</PrimaryNavItem>
    </PrimaryNavGroup>
    <PrimaryNavGroup label="Trabajo">
      {workspaceSurfaces.map(([key, label]) => <PrimaryNavItem key={key} current={surface === key} onSelect={() => setSurface(key)}>{label}</PrimaryNavItem>)}
    </PrimaryNavGroup>
    <PrimaryNavGroup label="Sistema">
      {systemSurfaces.map(([key, label]) => <PrimaryNavItem key={key} current={surface === key} onSelect={() => setSurface(key)}>{label}</PrimaryNavItem>)}
    </PrimaryNavGroup>
  </PrimaryNav>;

  const contextHeader = <ContextHeader
    title="Período activo"
    subtitle="Este período aplica a toda la aplicación."
    actions={<Button variant="ghost" disabled={busy} onClick={openCreate}>+ Crear año</Button>}
  >
    <ContextHeaderItem label="Año comercial">
      <Select
        label="Año comercial activo"
        value={catalog.activeCommercialYear}
        disabled={busy}
        aria-label="Año comercial activo"
        onChange={event => {
          const option = catalog.workspaces.find(item => item.workspace.commercialYear === Number(event.target.value));
          if (option) void selectWorkspace(option);
        }}
      >
        {catalog.workspaces.map(({ workspace, support }) => <option key={workspace.id} value={workspace.commercialYear}>
          {workspace.commercialYear}{support.state === 'UNSUPPORTED' ? ' · sin reglas compatibles' : support.state === 'SUPPORTED_WITH_WARNINGS' ? ' · revisar reglas' : ''}
        </option>)}
      </Select>
    </ContextHeaderItem>
    <ContextHeaderItem label="Operación Renta"><strong>{activeOption.workspace.derivedTaxYearLabel}</strong></ContextHeaderItem>
    <ContextHeaderItem label="Estado"><StatusBadge tone="warning" dot>En preparación</StatusBadge></ContextHeaderItem>
    {busy ? <ContextHeaderItem label="Actualización"><span>Cambiando período…</span></ContextHeaderItem> : null}
  </ContextHeader>;

  return <div className="ptl-application">
    <AppShell navigation={navigation} header={contextHeader} mainLabel="Área de trabajo de Personal Tax Ledger">
      {error && <div className="annual-workspace-error">{error}<button onClick={() => setError('')}>×</button></div>}

      {surface === 'annual-overview' && <AnnualWorkspaceOverviewSection commercialYear={catalog.activeCommercialYear} />}
      {surface === 'annual-ledger' && <AnnualIncomeLedgerSection commercialYear={catalog.activeCommercialYear} />}
      {surface === 'tax-profile' && <ApplicabilityProfileSection commercialYear={catalog.activeCommercialYear} />}
      {isWorkspaceTab(surface) && <>
        <PageHeader
          eyebrow={workspacePageMeta[surface].eyebrow}
          title={workspacePageMeta[surface].title}
          description={workspacePageMeta[surface].description}
          actions={surface === 'dashboard' ? <StatusBadge tone="warning">No vinculante</StatusBadge> : undefined}
        />
        <div className="legacy-workspace-page"><WorkspaceView key={catalog.activeCommercialYear} tab={surface} /></div>
      </>}
    </AppShell>

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
        <RadioGroup
          label="¿Cómo quieres comenzar?"
          value={creationMode}
          onChange={setCreationMode}
          options={[
            { value: 'EMPTY', label: 'Empezar vacío' },
            { value: 'PRIOR', label: 'Inicializar desde un año anterior' }
          ]}
        />

        {creationMode === 'EMPTY' && <p className="annual-workspace-copy-note">Empezar vacío crea únicamente el contexto anual. No copia ingresos, boletas, hipotecas, APV, evidencia ni conciliaciones.</p>}

        {creationMode === 'PRIOR' && <div className="prior-year-initialization-preview">
          <Select label="Año fuente" value={sourceYear ?? ''} onChange={e => setSourceYear(Number(e.target.value))}>
            {sourceOptions.map(item => <option key={item.workspace.id} value={item.workspace.commercialYear}>{item.workspace.commercialYear}</option>)}
          </Select>
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
            <li>estado de preparación o cierre del año anterior</li>
            <li>resultados calculados ni proyecciones históricas</li>
          </ul>
          <small>Lo reutilizado conserva la procedencia del año fuente y queda sujeto a revisión.</small>
        </div>}

        <FormActions
          secondary={<Button disabled={busy} onClick={() => setCreateOpen(false)}>Cancelar</Button>}
          primary={<Button variant="primary" loading={busy} disabled={creationMode === 'PRIOR' && !initializationPreview} onClick={createWorkspace}>{creationMode === 'PRIOR' ? 'Crear e inicializar' : 'Crear y abrir'}</Button>}
        />
      </section>
    </div>}
  </div>;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}
