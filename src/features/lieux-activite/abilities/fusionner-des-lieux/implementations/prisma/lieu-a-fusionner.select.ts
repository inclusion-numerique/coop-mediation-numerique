import type { Prisma } from '@/generated/prisma/client'
import { inscriptionPourLIdentifiantCarto } from '../../../../implementations/prisma/registre/identifiants-carto.query'

export const lieuAFusionnerInclude = {
  inscriptionRegistre: inscriptionPourLIdentifiantCarto,
  mediateursEnActivite: {
    where: { suppression: null },
    select: { mediateurId: true },
  },
  activites: {
    where: { suppression: null },
    select: { id: true },
  },
} satisfies Prisma.LieuInclusionInclude

export type LieuAFusionnerRow = Prisma.LieuInclusionGetPayload<{
  include: typeof lieuAFusionnerInclude
}>
