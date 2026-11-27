import { type Result, success } from '@/libraries/result'
import { mediateurDe, type Role } from '../../../domain'
import type { EchecDeRetirerLesTagsDUnCompte } from './errors'
import { destinatairesDe, essaimageDes } from './essaimage'
import type { RetirerLesTagsDUnComptePorts } from './ports'
import type { RetraitDesTags } from './retrait-des-tags'

export const retirerLesTagsDUnCompte =
  ({
    lireLesTagsDuCompte,
    lireLesTagsDetenus,
    appliquerLeRetrait,
  }: RetirerLesTagsDUnComptePorts) =>
  async ({
    compte,
    maintenant,
  }: {
    readonly compte: Role
    readonly maintenant: Date
  }): Promise<Result<RetraitDesTags, EchecDeRetirerLesTagsDUnCompte>> => {
    const { duMediateur, duCoordinateur } = await lireLesTagsDuCompte(compte)
    const detenus = await lireLesTagsDetenus(destinatairesDe(duCoordinateur))
    const { copies, reprises } = essaimageDes({
      tags: duCoordinateur,
      detenus,
      partant: mediateurDe(compte),
    })

    const applique = await appliquerLeRetrait({
      supprimeLe: maintenant,
      supprimes: [...duMediateur, ...duCoordinateur.map(({ id }) => id)],
      copies,
      reprises,
    })

    return success({ supprimeLe: maintenant, ...applique })
  }
