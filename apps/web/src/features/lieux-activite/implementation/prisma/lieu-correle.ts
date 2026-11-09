import type { Prisma } from '@app/web/generated/prisma/client'
import {
  type Correle,
  correler,
  type LieuAMaterialiser,
} from '@app/web/libraries/lieu-identite'
import { depublierAuRegistre } from './registre/depublier-au-registre'

export type { Correle, LieuAMaterialiser }

const auMemeEndroit = ({ codeInsee, codePostal }: LieuAMaterialiser) => ({
  banId: { not: null },
  OR: [...(codeInsee ? [{ codeInsee }] : []), { codePostal }],
})

export const lieuCorrele = async (
  transaction: Prisma.TransactionClient,
  lieu: LieuAMaterialiser,
): Promise<Correle | null> => {
  const selection = {
    id: true,
    nom: true,
    adresse: true,
    latitude: true,
    longitude: true,
    commune: true,
    codePostal: true,
    codeInsee: true,
    suppression: true,
    typologies: true,
  } as const

  if (!lieu.codeInsee) return null

  const candidats = await transaction.lieuInclusion.findMany({
    where: auMemeEndroit(lieu),
    orderBy: { creation: 'asc' },
    select: selection,
  })

  return correler(candidats, lieu)
}

export const preparerCorrele = async (
  transaction: Prisma.TransactionClient,
  correle: Correle,
  maintenant: Date,
): Promise<{ readonly id: string } | null> => {
  if (correle.suppression === null) return { id: correle.id }

  if (!correle.forte) return null

  const releve = await transaction.lieuInclusion.update({
    where: { id: correle.id },
    data: {
      suppression: null,
      suppressionParId: null,
      visiblePourCartographieNationale: false,
      derniereModificationSource: null,
    },
    select: { id: true },
  })

  await depublierAuRegistre(transaction, { lieuId: releve.id, maintenant })

  return releve
}
