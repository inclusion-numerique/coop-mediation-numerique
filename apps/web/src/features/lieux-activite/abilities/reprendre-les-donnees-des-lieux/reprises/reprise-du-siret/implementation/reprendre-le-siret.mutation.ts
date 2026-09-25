import { prismaClient } from '@app/web/prismaClient'
import type { ReprendreLeSiret } from '../domain/reprise-du-siret'
import type { SiretAReprendre } from '../domain/siret-a-reprendre'

type Ecriture = {
  readonly lieu: {
    readonly siret: string | null
    readonly synchronisationSiret?: null
    readonly nom?: string
    readonly nomUsage?: string
  }
  readonly registre: { readonly nom?: string; readonly nomUsage?: string }
}

const ecriture = (aReprendre: SiretAReprendre): Ecriture | null => {
  if (aReprendre.verdict === 'a-effacer')
    return { lieu: { siret: null, synchronisationSiret: null }, registre: {} }
  if (aReprendre.verdict === 'a-corriger')
    return { lieu: { siret: aReprendre.corrige }, registre: {} }
  if (aReprendre.verdict === 'a-renommer')
    return {
      lieu: {
        siret: aReprendre.siret,
        nom: aReprendre.nom,
        nomUsage: aReprendre.nomUsage,
      },
      registre: { nom: aReprendre.nom, nomUsage: aReprendre.nomUsage },
    }

  return null
}

export const reprendreLeSiret: ReprendreLeSiret = async (
  lieuId,
  aReprendre,
) => {
  const aEcrire = ecriture(aReprendre)
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true },
  })

  if (ligne == null || aEcrire == null) return

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: { ...aEcrire.lieu, modification: ligne.modification },
    })

    if (Object.keys(aEcrire.registre).length === 0) return

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: aEcrire.registre,
    })
  })
}
