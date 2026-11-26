import { type Result, success } from '@/libraries/result'
import type { CoordinateurId, MediateurId } from '../../../domain'
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
    mediateurId,
    coordinateurId,
    maintenant,
  }: {
    readonly mediateurId: MediateurId | null
    readonly coordinateurId: CoordinateurId | null
    readonly maintenant: Date
  }): Promise<Result<RetraitDesTags, EchecDeRetirerLesTagsDUnCompte>> => {
    const { duMediateur, duCoordinateur } = await lireLesTagsDuCompte({
      mediateurId,
      coordinateurId,
    })
    const detenus = await lireLesTagsDetenus(destinatairesDe(duCoordinateur))
    const { copies, reprises } = essaimageDes({
      tags: duCoordinateur,
      detenus,
      partant: mediateurId,
    })

    const applique = await appliquerLeRetrait({
      supprimeLe: maintenant,
      supprimes: [...duMediateur, ...duCoordinateur.map(({ id }) => id)],
      copies,
      reprises,
    })

    return success({ supprimeLe: maintenant, ...applique })
  }
