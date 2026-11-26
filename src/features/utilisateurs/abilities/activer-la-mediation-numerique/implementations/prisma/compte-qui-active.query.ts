import { prismaClient } from '@/configuration/prisma'
import {
  CoordinateurId,
  MediateurId,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { CompteQuiActive } from '../../domain/ports'

export const compteQuiActive = async (
  utilisateurId: UtilisateurId,
): Promise<CompteQuiActive | null> => {
  const compte = await prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: {
      id: true,
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
  })

  return compte === null
    ? null
    : {
        id: UtilisateurId(compte.id),
        rattachements: rattachements(
          compte.mediateur === null ? null : MediateurId(compte.mediateur.id),
          compte.coordinateur === null
            ? null
            : CoordinateurId(compte.coordinateur.id),
        ),
      }
}
