import { MediateurId } from '@app/web/features/mediateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import { type Contrat, etatContrat } from '../../domain/rupture-en-attente'

export type MediateurEtContrats = {
  readonly id: MediateurId
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
        id: MediateurId(mediateur.id),
        visibiliteChoisieLe: mediateur.visibiliteChoisieLe,
        contrats: (mediateur.user.personneMain?.contrats ?? []).map(
          ({ dateDebut, dateRupture }) => ({
            debut: dateDebut,
            etat: etatContrat(dateRupture),
          }),
        ),
      }
}
