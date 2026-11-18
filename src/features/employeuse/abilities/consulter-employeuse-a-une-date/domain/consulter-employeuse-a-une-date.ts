import type { Employeuse } from '../../../domain/employeuse'

/**
 * Employeuse d'un utilisateur **à une date donnée**.
 *
 * C'est la lecture des écrits rétro-datés : un compte rendu d'activité saisi
 * aujourd'hui pour une intervention d'il y a six mois doit être rattaché à
 * l'employeuse de l'époque. Le contrat qui couvre la date fait foi ; à défaut,
 * l'employeuse courante (voir `employeuseALaDate`).
 */
export type ConsulterEmployeuseAUneDate = (input: {
  userId: string
  date: Date
}) => Promise<Employeuse | null>
