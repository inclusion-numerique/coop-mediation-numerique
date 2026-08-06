import type { EmployeuseActuelle } from '../../../domain/employeuse-actuelle'

/**
 * Employeuse courante d'un utilisateur de la coop.
 *
 * Le chemin de lecture est entièrement dans `main` depuis l'ADR-002 :
 * `coop.users → main.personne` (par `coop_id`) `→ affectations actives →
 * structure_administrative`, les dates venant de `main.contrat`. `null` quand
 * l'utilisateur n'a aucune affectation active — ce qui est un état normal, pas
 * une erreur (utilisateur en cours d'inscription, ou sans employeuse déclarée).
 */
export type ConsulterEmployeuseActuelle = (input: {
  userId: string
}) => Promise<EmployeuseActuelle | null>
