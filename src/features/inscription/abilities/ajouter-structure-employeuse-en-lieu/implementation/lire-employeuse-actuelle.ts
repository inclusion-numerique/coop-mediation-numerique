import { employeuseActuelleId } from '@app/web/features/inscription/acl/employeuse-actuelle.adapter'
import { EmployeuseId, type LireEmployeuseActuelle } from '../domain'

/**
 * Passe par la couche anti-corruption de la feature : l'employeuse appartient à
 * une autre feature, et l'inscription ne lit pas `main` en direct.
 *
 * `null` est une réponse, pas une panne — un compte peut n'avoir aucune
 * affectation active (inscription en cours, employeuse jamais déclarée).
 */
export const lireEmployeuseActuelle: LireEmployeuseActuelle = async (
  userId,
) => {
  const id = await employeuseActuelleId({ userId })

  return id === null ? null : EmployeuseId(id)
}
