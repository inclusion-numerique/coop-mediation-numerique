import { prismaClient } from '@app/web/prismaClient'
import {
  descriptionAvecLaNote,
  type HorairesAReprendre,
} from '../domain/horaires-a-reprendre'
import type { ReprendreLesHoraires } from '../domain/reprise-des-horaires'

type Ecriture = {
  readonly horaires: string | null
  readonly presentationDetail?: string
}

const ecriture = (
  aReprendre: HorairesAReprendre,
  description: string | null,
): Ecriture => {
  if (aReprendre.verdict === 'a-corriger')
    return { horaires: aReprendre.corriges }

  if (aReprendre.verdict === 'a-effacer') return { horaires: null }

  const augmentee = descriptionAvecLaNote(description, aReprendre.note)

  return augmentee == null
    ? { horaires: null }
    : { horaires: null, presentationDetail: augmentee }
}

export const reprendreLesHoraires: ReprendreLesHoraires = async (
  lieuId,
  aReprendre,
) => {
  const ligne = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuId },
    select: { modification: true, presentationDetail: true },
  })

  if (ligne == null) return

  const aEcrire = ecriture(aReprendre, ligne.presentationDetail)

  await prismaClient.$transaction(async (transaction) => {
    await transaction.lieuInclusion.update({
      where: { id: lieuId },
      data: { ...aEcrire, modification: ligne.modification },
    })

    await transaction.lieuInclusionRegistreMain.updateMany({
      where: { structureCoopId: lieuId },
      data: aEcrire,
    })
  })
}
