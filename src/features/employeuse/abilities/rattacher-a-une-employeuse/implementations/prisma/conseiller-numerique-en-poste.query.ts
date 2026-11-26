import { prismaClient } from '@/configuration/prisma'
import type { LireLeStatutDeConseillerNumerique } from '../../domain/ports'

export const statutDeConseillerNumerique: LireLeStatutDeConseillerNumerique =
  async (userId) => {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        personneMain: {
          select: {
            conseillerNumeriqueEnPoste: { select: { personneId: true } },
          },
        },
      },
    })

    if (user === null) return { _tag: 'CompteInconnu' }

    return user.personneMain?.conseillerNumeriqueEnPoste == null
      ? { _tag: 'HorsPoste' }
      : { _tag: 'EnPoste' }
  }
