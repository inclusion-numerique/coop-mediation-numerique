import { type ActiviteConsultee, ActiviteId, MediateurId } from '../../domain'
import { lireUneActiviteDeMediation } from './lire-une-activite-de-mediation.query'
import type { RendezVousLies } from './rendez-vous-fournis.transfer'

export const activiteDeMediationLue =
  (rendezVousLies: RendezVousLies) =>
  async ({
    id,
    mediateurId,
  }: {
    readonly id: string
    readonly mediateurId: string
  }): Promise<ActiviteConsultee | null> => {
    const activiteId = ActiviteId.safe(id)
    return activiteId === null
      ? null
      : lireUneActiviteDeMediation({
          id: activiteId,
          mediateurId: MediateurId(mediateurId),
          rendezVousLies,
        })
  }
