import { useEffect, useState } from 'react';
import { getAnnualWorkspaceOverview, type AnnualWorkspaceOverview } from './annual-workspace-overview-client';

function countLabel(count: number, singular: string, plural: string) {
  return count === 0 ? 'No registrado' : `${count} ${count === 1 ? singular : plural}`;
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
    <header>
      <h2 id="annual-overview-title">Año tributario</h2>
      <p>Contexto estructural del período. El resultado tributario se muestra en Resumen anual.</p>
    </header>

    {error && <div className="annual-workspace-error">{error}</div>}
    {!overview && !error && <p>Cargando resumen estructural…</p>}

    {overview && <div className="annual-overview-grid">
      <article className="annual-overview-card">
        <h3>Período</h3>
        <dl>
          <div><dt>Año comercial</dt><dd>{overview.period.commercialYear}</dd></div>
          <div><dt>Operación Renta</dt><dd>{overview.period.derivedTaxYearLabel}</dd></div>
          <div><dt>Estado</dt><dd>{overview.period.lifecycleState === 'PREPARING' ? 'En preparación' : overview.period.lifecycleState}</dd></div>
          <div><dt>Actualizado</dt><dd>{overview.period.updatedAt ? new Date(overview.period.updatedAt).toLocaleString() : 'Sin actualización registrada'}</dd></div>
        </dl>
      </article>

      <article className="annual-overview-card">
        <h3>Perfil del año</h3>
        <p><strong>{overview.profile.answeredCount} de {overview.profile.totalCount}</strong> respondidos</p>
        <p>{overview.profile.pendingCount} pendientes · {overview.profile.needsReviewCount} por revisar</p>
      </article>

      <article className="annual-overview-card annual-overview-wide">
        <h3>Información disponible</h3>
        <dl>
          <div><dt>Ingresos laborales</dt><dd>{countLabel(overview.information.dependentIncomeSources, 'fuente', 'fuentes')}</dd></div>
          <div><dt>Boletas de honorarios</dt><dd>{countLabel(overview.information.feeReceipts, 'registrada', 'registradas')}</dd></div>
          <div><dt>Hipotecario</dt><dd>{countLabel(overview.information.mortgages, 'crédito registrado', 'créditos registrados')}</dd></div>
          <div><dt>Evidencia</dt><dd>{overview.information.evidence.label}</dd></div>
        </dl>
      </article>

      <article className="annual-overview-card annual-overview-wide">
        <h3>Reglas del período</h3>
        <p>Estado: <strong>{overview.rules.state}</strong></p>
        {overview.rules.state === 'UNSUPPORTED' && <p>Faltan reglas requeridas para este período.</p>}
        {overview.rules.state === 'SUPPORTED_WITH_WARNINGS' && <p>Las reglas son utilizables, pero existen advertencias de provenance.</p>}
      </article>
    </div>}
  </section>;
}
