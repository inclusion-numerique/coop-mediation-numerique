import { prismaClient } from '@app/web/prismaClient'
import { ObjectId } from 'mongodb'

export const updateNonAffichageCarto = async (
  conseillers: {
    value?: {
      conseillerObj: {
        _id: ObjectId
        idPG: number
        nonAffichageCarto: boolean
      }
    }
  }[],
) => {
  const nonAffichageIds = conseillers
    .filter((conseiller) => conseiller.value?.conseillerObj.nonAffichageCarto)
    .map((conseiller) => conseiller.value?.conseillerObj._id.toString())
    .filter((id) => id != null)

  return prismaClient.mediateur.updateMany({
    where: {
      conseillerNumerique: {
        id: { notIn: nonAffichageIds },
      },
      isVisible: false,
    },
    data: { isVisible: true },
  })
}
