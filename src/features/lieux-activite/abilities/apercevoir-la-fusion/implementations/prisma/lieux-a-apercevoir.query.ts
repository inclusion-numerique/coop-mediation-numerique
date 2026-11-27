import { prismaClient } from '@/configuration/prisma'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { LieuxAApercevoir } from '../../domain'
import { lieuAFusionnerInclude } from './lieu-a-fusionner.select'
import { lieuAFusionnerToDomain } from './lieu-a-fusionner.transfer'

const SANS_EMPLOYEUSE = {
  employesIds: [],
  activitesEmployeurIds: [],
}

const lieuAApercevoir = async (lieu: LieuId) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieu },
    include: lieuAFusionnerInclude,
  })

  return ligne === null ? null : lieuAFusionnerToDomain(ligne, SANS_EMPLOYEUSE)
}

export const lieuxAApercevoir: LieuxAApercevoir = async ({ source, cible }) => {
  const [deLaSource, deLaCible] = await Promise.all([
    lieuAApercevoir(source),
    lieuAApercevoir(cible),
  ])

  return { source: deLaSource, cible: deLaCible }
}
