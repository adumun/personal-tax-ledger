# Arquitectura

Documentación técnica para entender límites, dependencias y flujos del monorepo.

## Lectura recomendada

1. [`adr/0001-clean-hexagonal-architecture.md`](adr/0001-clean-hexagonal-architecture.md): decisión arquitectónica Clean/Hexagonal (objetivo).
2. [`target-package-map.md`](target-package-map.md): mapa objetivo de packages y vertical slices.
3. [`architecture-guardrails.md`](architecture-guardrails.md): guardrails automatizados y excepciones transitorias.
4. [`current-state.md`](current-state.md): qué existe hoy y cómo se conecta.
5. [`target-state.md`](target-state.md): principios y límites que deben conservarse.
6. [`module-destination-map.md`](module-destination-map.md): ubicación de cada responsabilidad.
7. [`package-policy.md`](package-policy.md): superficie pública de paquetes.
8. [`react-dogfood-extraction-driver.md`](react-dogfood-extraction-driver.md): regla operativa de PTL como primer dogfood/extraction driver del perfil React y de `adumun/react-components`.
9. [`http-route-catalog.md`](http-route-catalog.md): contrato operativo de endpoints.
10. [`migration-sequence.md`](migration-sequence.md): contexto histórico de la migración.
11. [`aggregate-migration-pattern.md`](aggregate-migration-pattern.md): procedimiento para migrar un agregado.

## React / UI compartida

PTL opera como primer consumidor de prueba y driver de extracción para `PROFILE-ENG-REACT-001`. Antes de crear una responsabilidad React transversal local, se debe revisar `adumun/react-components` y, si falta, reconciliar los casos de uso relevantes existentes en otros productos React ADÜMÜN antes de promover una implementación compartida.

La autoridad normativa está en `adumun/platform-standards`; la implementación reutilizable está en `adumun/react-components`; el dominio tributario permanece en PTL.

## Verificaciones

```bash
npm run architecture:check
npm run build:packages
npm run typecheck
```

El checker de arquitectura inspecciona imports de `packages/*` y `apps/*`, detecta ciclos y protege las fronteras de `core`/`contracts`.
