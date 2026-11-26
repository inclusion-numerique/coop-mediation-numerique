import { prismaClient } from '@/configuration/prisma'
import { inscriptionPourLIdentifiantCarto } from '../../../../implementations/prisma/registre/identifiants-carto.query'
import type { FichesAFusionner } from '../../domain'
import { ficheFusionnableToDomain } from './fiche-fusionnable.transfer'

export const fichesAFusionner: FichesAFusionner = async (lieux) =>
  (
    await prismaClient.lieuInclusion.findMany({
      where: { id: { in: [...lieux] } },
      include: { inscriptionRegistre: inscriptionPourLIdentifiantCarto },
    })
  ).map(ficheFusionnableToDomain)
