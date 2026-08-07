import { rattacherAUneEmployeuseDepuisSiret } from '@app/web/features/employeuse/server'
import type { ImporterStructureDepuisSiret } from '@app/web/features/inscription/abilities/initialiser-inscription/domain'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Repli SIRET : si l'utilisateur a un SIRET et pas encore d'employeuse, on la
 * rattache depuis ce seul SIRET — le rattachement appartient à la feature
 * employeuse, l'inscription ne fait que décider quand le déclencher.
 *
 * La présence d'une employeuse se teste sur les affectations `main` actives, et
 * non sur les emplois coop : depuis l'échange final de l'ADR-002 ces derniers
 * sont gelés et vides pour un nouvel utilisateur, si bien que le test legacy
 * répondait toujours « pas d'employeuse » et relançait l'import à chaque passage.
 */
export const importerStructureDepuisSiret: ImporterStructureDepuisSiret =
  async (userId) => {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        siret: true,
        personneMain: {
          select: {
            affectationsEmploi: {
              where: { estActive: true },
              select: { id: true },
            },
          },
        },
      },
    })

    if (!user?.siret) return
    if ((user.personneMain?.affectationsEmploi.length ?? 0) > 0) return

    await rattacherAUneEmployeuseDepuisSiret({ userId, siret: user.siret })
  }
