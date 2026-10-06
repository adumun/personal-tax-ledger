import { useEffect, useState } from 'react';
import { PageHeader, SectionCard, StatusBadge } from '@adumun/react-components';
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

function rulesTone(state: string) {
  if (state === 'SUPPORTED') return 'success' as const;
  if (state === 'SUPPORTED_WITH_WARNINGS') return 'warning' as const;
  if (state === 'UNSUPPORTED') return 'critical' as const;
  return 'neutral' as const;
}

function formatUpdatedAt(value: string | null) {
  if (!value) return 'Sin actualización registrada';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(value)).replace(',', ' ·');
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
      eyebrow="Período"
      title="Resumen del año"
      titleId="annual-overview-title"
      description="Estado del período activo y de la información que ya tienes registrada."
    />

    {error && <div className="annual-workspace-error">{error}</div>}
    {!overview && !error && <p>Cargando resumen del período…</p>}

    {overview && <div className="annual-overview-grid">
      <SectionCard title="Período" titleId="annual-period-title" className="annual-overview-card">
        <dl>
          <div><dt>Año comercial</dt><dd>{overview.period.commercialYear}</dd></div>
          <div><dt>Operación Renta</dt><dd>{overview.period.derivedTaxYearLabel}</dd></div>
          <div><dt>Estado</dt><dd><StatusBadge tone="warning" dot>{overview.period.lifecycleState === 'PREPARING' ? 'En preparación' : overview.period.lifecycleState}</StatusBadge></dd></div>
          <div><dt>Actualizado</dt><dd>{formatUpdatedAt(overview.period.updatedAt)}</dd></div>
        </dl>
      </SectionCard>

      <SectionCard title="Perfil del año" titleId="annual-profile-summary-title" className="annual-overview-card">
        <p><strong>{overview.profile.answeredCount} de {overview.profile.totalCount}</strong> respondidos</p>
        <div className="annual-overview-statuses">
          <StatusBadge tone={overview.profile.pendingCount > 0 ? 'warning' : 'success'}>{overview.profile.pendingCount} pendiente{overview.profile.pendingCount === 1 ? '' : 's'}</StatusBadge>
          <StatusBadge tone={overview.profile.needsReviewCount > 0 ? 'critical' : 'neutral'}>{overview.profile.needsReviewCount} por revisar</StatusBadge>
        </div>
      </SectionCard>

      <SectionCard title="Información disponible" titleId="annual-information-title" className="annual-overview-card annual-overview-wide">
        <dl className="annual-overview-information">
          <div><dt>Ingresos laborales</dt><dd>{countLabel(overview.information.dependentIncomeSources, 'fuente', 'fuentes')}</dd></div>
          <div><dt>Boletas de honorarios</dt><dd>{countLabel(overview.information.feeReceipts, 'registrada', 'registradas')}</dd></div>
          <div><dt>Hipotecario</dt><dd>{countLabel(overview.information.mortgages, 'crédito registrado', 'créditos registrados')}</dd></div>
          <div><dt>Evidencia</dt><dd>{overview.information.evidence.label}</dd></div>
        </dl>
      </SectionCard>

      <SectionCard
        title="Reglas del período"
        titleId="annual-rules-title"
        className="annual-overview-card annual-overview-wide annual-overview-rules"
        actions={<StatusBadge tone={rulesTone(overview.rules.state)} dot>{rulesLabel(overview.rules.state)}</StatusBadge>}
      >
        {overview.rules.state === 'UNSUPPORTED' && <p>Faltan reglas requeridas para trabajar este período con seguridad.</p>}
        {overview.rules.state === 'SUPPORTED_WITH_WARNINGS' && <p>Las reglas son utilizables, pero existen observaciones de procedencia que conviene revisar.</p>}
        {overview.rules.state === 'SUPPORTED' && <p>El período dispone de las reglas necesarias para continuar trabajando.</p>}
      </SectionCard>
    </div>}
  </section>;
}
