import type {
  EmployeuseDesActivites,
  Jour,
  PerimetreDesActivites,
  PerimetreDesStatistiques,
} from '../../../domain'

export type ActivitesDuPerimetre = {
  readonly employeuses: readonly EmployeuseDesActivites[]
  readonly premiere: Jour | null
  readonly derniere: Jour | null
}

export const perimetreDesActivitesDe = (
  perimetre: PerimetreDesStatistiques,
): PerimetreDesActivites | null =>
  perimetre.type === 'National'
    ? null
    : perimetre.type === 'Mediateur'
      ? { mediateurs: [perimetre.mediateur], coordinateurId: null }
      : {
          mediateurs: perimetre.membres,
          coordinateurId: perimetre.coordinateur,
        }
