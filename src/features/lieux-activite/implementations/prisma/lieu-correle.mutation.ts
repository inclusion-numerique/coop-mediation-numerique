import {
  type Correle,
  correler,
  type LieuAMaterialiser,
} from '@/features/lieux-activite/domain/lieu-identite'
import type { Prisma } from '@/generated/prisma/client'
import { depublierAuRegistre } from './registre/depublier-au-registre.mutation'

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

export const releverLeLieu = async (
  transaction: Prisma.TransactionClient,
  lieuId: string,
  maintenant: Date,
): Promise<{ readonly id: string }> => {
  const releve = await transaction.lieuInclusion.update({
    where: { id: lieuId },
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

export const preparerCorrele = async (
  transaction: Prisma.TransactionClient,
  correle: Correle,
  maintenant: Date,
): Promise<{ readonly id: string } | null> => {
  if (correle.suppression === null) return { id: correle.id }

  if (!correle.forte) return null

  return releverLeLieu(transaction, correle.id, maintenant)
}
