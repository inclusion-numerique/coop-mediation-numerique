import { prismaClient } from '@/configuration/prisma'
import { MediateurId } from '@/features/mediateurs/domain'
import type { LireMediateurEtContrats } from '../../domain/choisir-la-visibilite-apres-rupture'
import { etatContrat } from '../../domain/rupture-en-attente'

export const lireMediateurEtContrats: LireMediateurEtContrats = async (
  mediateurId,
) => {
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
