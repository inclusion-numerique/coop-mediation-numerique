import assert from 'node:assert'
import {
  listerMesLieuxActivite,
  type MonLieuActivite,
  TriDesLieux,
} from '@app/web/features/lieux-activite/abilities/lister-mes-lieux-activite'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { ficheSemee } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Then, When } from '@cucumber/cucumber'

const liste: { lieux?: readonly MonLieuActivite[] } = {}

const lister = async (mediateurId: string, tri?: string) => {
  liste.lieux = await listerMesLieuxActivite({
    mediateurId: MediateurId(mediateurId),
    tri: TriDesLieux(tri),
  })
}

When("ce médiateur liste ses lieux d'activité", async () => {
  await lister(ficheSemee().mediateurRattacheId)
})

When("un médiateur étranger liste ses lieux d'activité", async () => {
  await lister(ficheSemee().mediateurEtrangerId)
})

When('ce médiateur liste ses lieux avec le tri « au hasard »', async () => {
  await lister(ficheSemee().mediateurRattacheId, 'au hasard')
})

When(
  "ce médiateur quitte ce lieu puis liste ses lieux d'activité",
  async () => {
    await prismaClient.mediateurEnActivite.updateMany({
      where: {
        mediateurId: ficheSemee().mediateurRattacheId,
        structureId: ficheSemee().lieuId,
      },
      data: { fin: new Date() },
    })

    await lister(ficheSemee().mediateurRattacheId)
  },
)

Then('la liste contient ce lieu', () => {
  assert.deepStrictEqual(
    liste.lieux?.map(({ lieuInclusion }) => lieuInclusion.id),
    [ficheSemee().lieuId],
  )
})

Then('la liste est vide', () => {
  assert.deepStrictEqual(liste.lieux, [])
})
