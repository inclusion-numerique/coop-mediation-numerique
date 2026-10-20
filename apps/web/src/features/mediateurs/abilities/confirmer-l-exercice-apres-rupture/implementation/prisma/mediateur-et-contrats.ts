import { prismaClient } from '@app/web/prismaClient'
import type { MediateurId } from '../../domain/mediateur-id'
import { type Contrat, etatContrat } from '../../domain/rupture-en-attente'

export type MediateurEtContrats = {
  readonly id: string
  readonly isVisible: boolean
  readonly visibiliteChoisieLe: Date | null
  readonly contrats: readonly Contrat[]
}

export const lireMediateurEtContrats = async (
  mediateurId: MediateurId,
): Promise<MediateurEtContrats | null> => {
  const mediateur = await prismaClient.mediateur.findFirst({
    where: { id: mediateurId, user: { deleted: null } },
    select: {
      id: true,
      isVisible: true,
      visibiliteChoisieLe: true,
      user: {
        select: {
          personneMain: {
            select: {
              contrats: { select: { dateDebut: true, dateRupture: true } },
            },
          },
        },
      },
    },
  })

  return mediateur == null
    ? null
    : {
        id: mediateur.id,
        isVisible: mediateur.isVisible,
        visibiliteChoisieLe: mediateur.visibiliteChoisieLe,
        contrats: (mediateur.user.personneMain?.contrats ?? []).map(
          ({ dateDebut, dateRupture }) => ({
            debut: dateDebut,
            etat: etatContrat(dateRupture),
          }),
        ),
      }
}
