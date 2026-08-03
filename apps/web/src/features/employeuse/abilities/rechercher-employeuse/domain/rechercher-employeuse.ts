import type { Employeuse } from '../../../domain/employeuse'

/**
 * Recherche d'employeuses parmi celles déjà enregistrées.
 *
 * Sert les choix : autocomplétion d'inscription, rapprochement en
 * administration. Les termes de la recherche sont conjonctifs — « croix rouge
 * nantes » cherche une structure qui satisfait les deux — et chacun est
 * confronté au nom, au SIRET et à l'adresse, parce qu'on ne sait pas ce que la
 * personne a en tête quand elle tape.
 *
 * Les employeuses supprimées côté Entrepôt sont exclues : on ne rattache
 * personne à une structure qui n'existe plus.
 */
export type RechercherEmployeuse = (input: {
  recherche: string
  limite?: number
}) => Promise<{
  employeuses: Employeuse[]
  total: number
}>
