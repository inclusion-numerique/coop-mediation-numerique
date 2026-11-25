import { prismaClient } from '@/configuration/prisma'
import type {
  ImporterStructureDepuisSiret,
  RattacherDepuisSiret,
} from '@/features/inscription/abilities/initialiser-inscription/domain'

export const importerStructureDepuisSiret =
  (rattacherDepuisSiret: RattacherDepuisSiret): ImporterStructureDepuisSiret =>
  async (userId) => {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        siret: true,
        personneMain: {
          select: { employeuseActuelle: { select: { personneId: true } } },
        },
      },
    })

    if (!user?.siret) return
    if (user.personneMain?.employeuseActuelle) return

    await rattacherDepuisSiret({ userId, siret: user.siret })
  }
