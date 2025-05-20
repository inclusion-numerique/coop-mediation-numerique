import { prismaClient } from '@app/web/prismaClient'
import { ObjectId } from 'mongodb'

const withoutIdPg = ({
  mediateur,
}: {
  mediateur: {
    conseillerNumerique: { idPg: number | null } | null
  } | null
}) => mediateur?.conseillerNumerique?.idPg == null

export const updateConseillersIdPg = async (
  users: {
    mediateur:
      | ({
          conseillerNumerique: {
            id: string
            idPg: number | null
          } | null
        } & {
          id: string
        })
      | null
  }[],
  conseillers: {
    value?: {
      conseillerObj: { _id: ObjectId; idPG: number; nonAffichageCarto: boolean }
    }
  }[],
) => {
  const usersWithoutIdPg = users.filter(withoutIdPg)

  for (const user of usersWithoutIdPg) {
    if (user.mediateur == null) continue

    const match = conseillers.find(
      (conseiller) =>
        conseiller.value?.conseillerObj._id.toString() ===
        user.mediateur?.conseillerNumerique?.id,
    )

    if (match == null) continue

    await prismaClient.conseillerNumerique.update({
      where: { mediateurId: user.mediateur.id },
      data: { idPg: match.value?.conseillerObj.idPG },
    })
  }

  return usersWithoutIdPg
}
