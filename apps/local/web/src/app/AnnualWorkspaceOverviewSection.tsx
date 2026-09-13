import { useEffect, useState } from 'react';
import { PageHeader } from '@adumun/react-components';
import { getAnnualWorkspaceOverview, type AnnualWorkspaceOverview } from './annual-workspace-overview-client';

function countLabel(count: number, singular: string, plural: string) {
  return count === 0 ? 'No registrado' : `${count} ${count === 1 ? singular : plural}`;
}

function rulesLabel(state: string) {
  if (state === 'SUPPORTED') return 'Reglas disponibles';
  if (state === 'SUPPORTED_WITH_WARNINGS') return 'Reglas disponibles con observaciones';
  if (state === 'UNSUPPORTED') return 'Reglas incompletas';
  return state;
}

export default function AnnualWorkspaceOverviewSection({ commercialYear }: { commercialYear: number }) {
  const [overview, setOverview] = useState<AnnualWorkspaceOverview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setOverview(null);
    setError('');
    getAnnualWorkspaceOverview()
      .then(value => { if (!cancelled) setOverview(value); })
      .catch(error => { if (!cancelled) setError(error instanceof Error ? error.message : String(error)); });
    return () => { cancelled = true; };
  }, [commercialYear]);

  return <section className="annual-overview" aria-labelledby="annual-overview-title">
    <PageHeader
      title="Año tributario"
      titleId="annual-overview-title"
      description="Estado estructural del período activo y de la información que ya tienes registrada."
    />

    {error && <div className="annual-workspace-error">{error}</div>}
    {!overview && !error && <p>Cargando resumen del período…</p>}

    {overview && <div className="annual-overview-grid">
      <article className="annual-overview-card">
        <h2>Período</h2>
        <dl>
          <div><dt>Año comercial</dt><dd>{overview.period.commercialYear}</dd></div>
          <div><dt>Operación Renta</dt><dd>{overview.period.derivedTaxYearLabel}</dd></div>
          <div><dt>Estado</dt><dd>{overview.period.lifecycleState === 'PREPARING' ? 'En preparación' : overview.period.lifecycleState}</dd></div>
          <div><dt>Actualizado</dt><dd>{overview.period.updatedAt ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(overview.period.updatedAt)) : 'Sin actualización registrada'}</dd></div>
        </dl>
      </article>

      <article className="annual-overview-card">
        <h2>Perfil del año</h2>
        <p><strong>{overview.profile.answeredCount} de {overview.profile.totalCount}</strong> respondidos</p>
        <p>{overview.profile.pendingCount} pendientes · {overview.profile.needsReviewCount} por revisar</p>
      </article>

      <article className="annual-overview-card annual-overview-wide">
        <h2>Información disponible</h2>
        <dl>
          <div><dt>Ingresos laborales</dt><dd>{countLabel(overview.information.dependentIncomeSources, 'fuente', 'fuentes')}</dd></div>
          <div><dt>Boletas de honorarios</dt><dd>{countLabel(overview.information.feeReceipts, 'registrada', 'registradas')}</dd></div>
          <div><dt>Hipotecario</dt><dd>{countLabel(overview.information.mortgages, 'crédito registrado', 'créditos registrados')}</dd></div>
          <div><dt>Evidencia</dt><dd>{overview.information.evidence.label}</dd></div>
        </dl>
      </article>

      <article className="annual-overview-card annual-overview-wide">
        <h2>Reglas del período</h2>
        <p><strong>{rulesLabel(overview.rules.state)}</strong></p>
        {overview.rules.state === 'UNSUPPORTED' && <p>Faltan reglas requeridas para trabajar este período con seguridad.</p>}
        {overview.rules.state === 'SUPPORTED_WITH_WARNINGS' && <p>Las reglas son utilizables, pero existen observaciones de procedencia que conviene revisar.</p>}
      </article>
    </div>}
  </section>;
}
