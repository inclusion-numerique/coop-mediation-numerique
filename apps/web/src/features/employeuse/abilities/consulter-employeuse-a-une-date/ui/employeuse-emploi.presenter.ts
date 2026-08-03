import type { Employeuse } from '../../../domain/employeuse'
import {
  type EmployeuseAffichage,
  employeuseAffichage,
} from '../../../ui/employeuse.presenter'

/**
 * Employeuse rattachée à un emploi, telle que l'attendent les cartes
 * « ma structure employeuse » et « structure employeuse de l'acteur ».
 *
 * `complementAdresse` est toujours `null` : `main` ne le porte pas (ADR-002,
 * décision 6 révisée). Il reste dans la forme parce que la carte le compose
 * avec l'adresse, et qu'il vit toujours côté lieu.
 */
export type EmploiEmployeuseAffichage = EmployeuseAffichage & {
  complementAdresse: string | null
}

export const emploiEmployeuseAffichage = (
  employeuse: Employeuse,
): EmploiEmployeuseAffichage => ({
  ...employeuseAffichage(employeuse),
  complementAdresse: null,
})
