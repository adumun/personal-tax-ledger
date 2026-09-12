# Block 01 — UI / Interaction Design Contract

**Standard:** `STD-EXP-UIDEF-001@0.1.0-draft`  
**Scope:** Annual Workspace & Tax Profile  
**Status:** `DOGFOOD / L1-L2 DESIGN CONTRACT`

## Design intent

The current application already has a left navigation, annual dashboard, year-scoped data and `Configuración tributaria`. This block must evolve the annual context without forcing a wholesale shell redesign.

### Structural decision

1. Add a persistent **Workspace Context Header** above the active content area.
2. Add a dedicated navigation destination **Año tributario**.
3. Move primary year selection/creation into the workspace context; `Configuración tributaria` remains focused on tax parameters/rules.
4. Preserve existing downstream tabs/surfaces and current visual language until a separate redesign Story says otherwise.

## DESIGN-AW-001 — Workspace Context Header

**Stories:** AW-001, AW-006  
**Fidelity:** L1  
**Impact:** NEW_SECTION

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Año comercial [ 2026 ▾ ]   Operación Renta AT2027   Estado: En preparación│
│                                               [ + Crear año ]              │
└────────────────────────────────────────────────────────────────────────────┘
```

### Placement

- persistent inside the product shell, directly above the current page title/subtitle;
- visible in all year-scoped product surfaces;
- does not replace the page-specific title.

### Required behavior

- selector lists existing workspaces first;
- an absent supported year is reached through `+ Crear año`, not silently materialized;
- AT label is derived and non-editable;
- while switching: controls that can cause year-scoped mutation are disabled or guarded until context is trustworthy;
- if switching fails, previous valid context remains visually identified.

### States

`DEFAULT`, `LOADING`, `SYSTEM_ERROR`, `READ_ONLY` where later lifecycle requires it.

---

## DESIGN-AW-002 — Create Annual Workspace

**Story:** AW-002  
**Fidelity:** L2  
**Impact:** NEW_SCREEN / modal flow

```text
┌──────────────── Crear año tributario ────────────────┐
│ Año comercial                                        │
│ [ 2026 ▾ ]                                           │
│                                                      │
│ Operación Renta                                      │
│ AT2027  (derivado automáticamente)                   │
│                                                      │
│ ¿Cómo quieres comenzar?                              │
│ (●) Empezar vacío                                    │
│ ( ) Inicializar desde un año anterior                │
│                                                      │
│ [Cancelar]                         [Continuar]        │
└──────────────────────────────────────────────────────┘
```

### Validation/copy

- duplicate year: inline domain error + action `Abrir año existente`;
- unsupported/no-rule year: explicit warning/block according to product support policy;
- `Continuar` in empty mode leads to confirmation/creation;
- prior-year option goes to DESIGN-AW-003.

### Copy

Required labels are product copy, not implementation placeholders:

- `Año comercial`
- `Operación Renta`
- `Empezar vacío`
- `Inicializar desde un año anterior`
- `Crear año tributario`

---

## DESIGN-AW-003 — Prior-year Initialization Preview

**Story:** AW-003  
**Fidelity:** L2  
**Impact:** FLOW_CHANGE

```text
┌──────────── Inicializar desde año anterior ─────────────┐
│ Año fuente: [ 2025 ▾ ]                                 │
│                                                        │
│ Reutilizar                                              │
│ [x] Perfil de aplicabilidad como propuesta             │
│ [x] Configuraciones reutilizables compatibles          │
│ [ ] Plantillas de fuentes recurrentes                  │
│                                                        │
│ No se copiarán                                          │
│ • montos realizados                                     │
│ • boletas / retenciones / PPM                           │
│ • evidencia                                              │
│ • conciliaciones                                         │
│ • resultados y proyecciones                              │
│                                                        │
│ [Atrás]                              [Crear e inicializar]│
└─────────────────────────────────────────────────────────┘
```

### Required semantics

The `No se copiarán` section is mandatory. The user must not infer that initialization clones the tax year.

If a category is not yet supported, it must not appear as checked/enabled.

---

## DESIGN-AW-004 — Annual Applicability Profile

**Story:** AW-004  
**Fidelity:** L2  
**Impact:** NEW_SECTION, FIELD_ADDITION

Surface: `Año tributario`.

```text
Perfil del año
Define qué situaciones esperas tener este año. Esto no registra montos ni confirma
que hayan ocurrido; sirve para preparar PTL y detectar información pendiente.

┌─────────────────────────────────────────┬───────────────────────────────┐
│ Situación                               │ Aplica                        │
├─────────────────────────────────────────┼───────────────────────────────┤
│ Renta dependiente / empleador           │ [ Sí | No | Aún no sé ]      │
│ Honorarios / BHE nacionales             │ [ Sí | No | Aún no sé ]      │
│ Pagador o cliente extranjero            │ [ Sí | No | Aún no sé ]      │
│ APV                                     │ [ Sí | No | Aún no sé ]      │
│ Crédito hipotecario relevante           │ [ Sí | No | Aún no sé ]      │
│ Evaluar gastos efectivos                │ [ Sí | No | Aún no sé ]      │
│ AFP / salud a considerar                │ [ Sí | No | Aún no sé ]      │
└─────────────────────────────────────────┴───────────────────────────────┘

[Guardar perfil]
```

### Rules

- no monetary inputs here;
- `Aún no sé` is a first-class value, not validation failure;
- if canonical facts contradict a `No`, show an inline `NEEDS_REVIEW` condition and link to the conflicting domain data; do not delete anything;
- profile status must remain semantically distinct from readiness and reconciliation.

### States

`DEFAULT`, `SUCCESS`, `VALIDATION_ERROR`, `DOMAIN_ERROR`, `NEEDS_REVIEW`, `READ_ONLY`.

---

## DESIGN-AW-005 — Annual Workspace Overview

**Story:** AW-005  
**Fidelity:** L2  
**Impact:** NEW_SCREEN

Navigation label: **Año tributario**.

```text
Año tributario
Contexto estructural del período. El resultado tributario se muestra en Resumen anual.

┌─ Período ──────────────────────┐  ┌─ Perfil del año ──────────────┐
│ Año comercial: 2026            │  │ 5 de 7 respondidos            │
│ Operación Renta: AT2027        │  │ 2 por revisar                 │
│ Estado: En preparación         │  │ [Revisar perfil]              │
│ Actualizado: 12-09-2026 16:40  │  └───────────────────────────────┘
└────────────────────────────────┘

┌─ Información disponible ────────────────────────────────────────────────┐
│ Ingresos laborales          2 fuentes                    [Ver ingresos] │
│ Boletas de honorarios       1 registrada                 [Ver boletas]  │
│ Hipotecario                 No registrado                [Registrar]    │
│ Evidencia                   Capacidad aún no disponible  [—]            │
└─────────────────────────────────────────────────────────────────────────┘

┌─ Reglas del período ────────────────────────────────────────────────────┐
│ Regla/modelo: <rule version>   Parámetros: <estado>     [Ver config.]  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Hard boundary

This view MUST NOT show:

- `te devolverán $X`;
- `debes pagar $X`;
- tax-health score;
- SII reconciliation status;
- optimization recommendation;

unless/ until the owning later capabilities are integrated by explicit Stories.

### Empty vs zero

`No registrado` means no data; it must never render as `$0` if zero could be misread as a calculated tax/economic fact.

---

## DESIGN-AW-006 — Stale Edit after Workspace Change

**Story:** AW-006  
**Fidelity:** L1  
**Impact:** STATE_CHANGE

When a user has an unsaved year-scoped form and requests another workspace:

```text
┌──────────── Cambiar de año ─────────────┐
│ Tienes cambios sin guardar del año 2025.│
│                                        │
│ [Seguir en 2025]  [Descartar y cambiar]│
└────────────────────────────────────────┘
```

Alternative behavior is allowed only if the form is safely autosaved under the original workspace and the UI truthfully communicates that persistence. Silent rebinding of an open edit form from one year to another is forbidden.

## Responsive requirements

L1/L2 evidence for this block requires:

- workspace year/AT/state remains visible on supported narrow layouts;
- if header actions collapse, year switching and context status remain reachable;
- profile tri-state controls remain operable without horizontal overflow;
- annual overview cards may stack vertically but must preserve labels and calls to action.

## Accessibility requirements

- selector/tri-state controls have explicit programmatic labels;
- status is not communicated by color alone;
- dialog focus behavior and keyboard traversal follow `STD-EXP-A11Y-001`;
- inline validation is associated with the relevant field;
- the derived AT label is readable text, not decorative-only content.

## Design artifacts not required yet

A pixel-perfect L3 visual specification is **not** required for Block 01 before implementation because the current PTL shell and component language already exist. L3 becomes necessary only if implementation reveals a material shell redesign or design-system divergence.
