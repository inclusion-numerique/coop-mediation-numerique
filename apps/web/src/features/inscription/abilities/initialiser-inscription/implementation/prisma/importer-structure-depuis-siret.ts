import { sessionUserHasStructureEmployeuse } from '@app/web/auth/sessionUser'
import type { ImporterStructureDepuisSiret } from '@app/web/features/inscription/abilities/initialiser-inscription/domain'
import { importStructureEmployeuseFromSiret } from '@app/web/features/structures/importStructureEmployeuseFromSiret'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Repli SIRET (fidèle au legacy) : si l'utilisateur a un SIRET et pas encore de
 * structure employeuse, crée la structure depuis ce SIRET.
 */
export const importerStructureDepuisSiret: ImporterStructureDepuisSiret =
  async (userId) => {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        siret: true,
        emplois: {
          select: {
            id: true,
            structure: { select: { nom: true, codeInsee: true } },
          },
          where: { suppression: null },
        },
      },
    })

    if (!user || !user.siret || sessionUserHasStructureEmployeuse(user)) return

    await importStructureEmployeuseFromSiret({ userId, siret: user.siret })
  }
