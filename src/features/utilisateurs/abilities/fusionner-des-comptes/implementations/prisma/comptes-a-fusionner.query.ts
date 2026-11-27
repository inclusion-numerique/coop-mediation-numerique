import { prismaClient } from '@/configuration/prisma'
import {
  AdresseCourriel,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { roleLu } from '../../../../implementations/prisma/role.transfer'
import type { CompteAFusionner, EtatDuPartage } from '../../domain'

const etatDuPartage = (
  partage: { readonly deleted: Date | null } | null,
): EtatDuPartage => {
  if (partage === null) return { _tag: 'SansPartage' }
  return partage.deleted === null
    ? { _tag: 'Partage' }
    : { _tag: 'PartageRevoque' }
}

const compteAFusionner = async (
  id: UtilisateurId,
): Promise<CompteAFusionner | null> => {
  const row = await prismaClient.user.findUnique({
    where: { id },
    select: {
      email: true,
      role: true,
      deleted: true,
      mediateur: {
        select: { partageStatistiques: { select: { deleted: true } } },
      },
      coordinateur: {
        select: { PartageStatistiques: { select: { deleted: true } } },
      },
    },
  })

  return row === null
    ? null
    : {
        id,
        courriel: AdresseCourriel(row.email),
        role: roleLu(row.role),
        supprime: row.deleted !== null,
        mediateur:
          row.mediateur === null
            ? null
            : {
                partage: etatDuPartage(
                  row.mediateur.partageStatistiques[0] ?? null,
                ),
              },
        coordinateur:
          row.coordinateur === null
            ? null
            : {
                partage: etatDuPartage(row.coordinateur.PartageStatistiques),
              },
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
