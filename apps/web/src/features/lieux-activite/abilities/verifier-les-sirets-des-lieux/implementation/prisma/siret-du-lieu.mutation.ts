import { prismaClient } from '@app/web/prismaClient'
import type { EffacerLeSiret, MarquerLeSiretVerifie } from '../../domain'

export const effacerLeSiret: EffacerLeSiret = async ({ id }) => {
  await prismaClient.lieuInclusion.update({
    where: { id },
    data: { siret: null, synchronisationSiret: null },
  })
}

export const marquerLeSiretVerifie: MarquerLeSiretVerifie = async ({ id }) => {
  await prismaClient.lieuInclusion.update({
    where: { id },
    data: { synchronisationSiret: new Date() },
  })
}
