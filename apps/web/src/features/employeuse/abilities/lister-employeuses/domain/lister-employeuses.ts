import type { Employeuse } from '../../../domain/employeuse'

/**
 * Une employeuse dans la liste d'administration : l'entité, plus le nombre de
 * personnes qu'elle emploie aujourd'hui. Ce compte n'appartient pas à
 * l'employeuse — c'est une mesure faite au moment de la lecture.
 */
export type EmployeuseListee = {
  readonly employeuse: Employeuse
  readonly personnesEmployees: number
}

/**
 * Critères de parcours de la liste. Ce sont ceux d'un tableau de données —
 * recherche, page, tri — parce que c'est exactement l'usage : parcourir
 * l'ensemble, là où l'autocomplétion sert à choisir.
 */
export type CriteresListeEmployeuses = {
  readonly recherche: string
  readonly page: number
  readonly parPage: number
  readonly triPar: string | null
  readonly sens: 'asc' | 'desc' | null
}

/**
 * Liste paginée des employeuses, pour l'administration. La règle de recherche
 * est celle de `rechercher-employeuse` : termes cumulés, confrontés au nom, au
 * SIRET et à l'adresse, employeuses supprimées exclues.
 */
export type ListerEmployeuses = (
  criteres: CriteresListeEmployeuses,
) => Promise<{
  employeuses: EmployeuseListee[]
  total: number
  pages: number
}>
