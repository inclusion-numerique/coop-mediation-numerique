import { prismaClient } from '@/configuration/prisma/prismaClient'
import type {
  LancerSynchronisation,
  SynchroniserUnCompte,
} from '../domain/declencher-synchronisation'

export const lancerSynchronisation =
  (synchroniserUnCompte: SynchroniserUnCompte): LancerSynchronisation =>
  async ({ utilisateurId, organisationIds }) => {
    const utilisateur = await prismaClient.user.findUniqueOrThrow({
      where: { id: utilisateurId },
      select: {
        mediateur: { select: { id: true } },
        rdvAccount: { select: { id: true } },
      },
    })

    if (utilisateur.rdvAccount === null) {
      return { derive: 0 }
    }

    const { drift } = await synchroniserUnCompte({
      compteId: utilisateur.rdvAccount.id,
      mediateurId: utilisateur.mediateur?.id,
      organisationIds:
        organisationIds === undefined ? undefined : [...organisationIds],
    })

    return { derive: drift }
  }
