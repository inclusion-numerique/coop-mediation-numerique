import { prismaClient } from '@/configuration/prisma'
import {
  AdresseCourriel,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { roleLu } from '../../../../implementations/prisma/role.transfer'
import type { CompteAFusionner } from '../../domain'

const compteAFusionner = async (
  id: UtilisateurId,
): Promise<CompteAFusionner | null> => {
  const row = await prismaClient.user.findUnique({
    where: { id },
    select: { email: true, role: true, deleted: true },
  })

  return row === null
    ? null
    : {
        id,
        courriel: AdresseCourriel(row.email),
        role: roleLu(row.role),
        supprime: row.deleted !== null,
      }
}

export const comptesAFusionner = async ({
  sourceId,
  cibleId,
}: {
  readonly sourceId: UtilisateurId
  readonly cibleId: UtilisateurId
}): Promise<{
  readonly source: CompteAFusionner | null
  readonly cible: CompteAFusionner | null
}> => {
  const [source, cible] = await Promise.all([
    compteAFusionner(sourceId),
    compteAFusionner(cibleId),
  ])

  return { source, cible }
}
