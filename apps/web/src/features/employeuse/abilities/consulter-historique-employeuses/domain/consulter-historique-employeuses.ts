import type { EmployeuseHistorique } from '../../../domain/employeuses-historique'

/**
 * Toutes les employeuses d'un utilisateur, en cours et passées.
 *
 * Lecture d'administration : elle sert à comprendre le parcours d'un compte —
 * qui l'employait, depuis quand, et si le rattachement est encore actif. La
 * liste est vide quand l'utilisateur n'a jamais été affecté.
 */
export type ConsulterHistoriqueEmployeuses = (input: {
  userId: string
}) => Promise<EmployeuseHistorique[]>
