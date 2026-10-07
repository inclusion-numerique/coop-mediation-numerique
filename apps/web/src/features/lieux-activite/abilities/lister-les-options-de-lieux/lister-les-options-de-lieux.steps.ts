import assert from 'node:assert'
import {
  getLieuxDesActivitesOptions,
  getMediateursLieuxActiviteOptions,
  type LieuActiviteOption,
} from '@app/web/features/lieux-activite/abilities/lister-les-options-de-lieux'
import { ficheSemee } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

const proposees: { options?: LieuActiviteOption[] } = {}

const demander = async (mediateurIds: string[]) => {
  proposees.options = await getMediateursLieuxActiviteOptions({ mediateurIds })
}

Given('ce médiateur a des activités dans ce lieu', async () => {
  await prismaClient.activite.create({
    data: {
      mediateurId: ficheSemee().mediateurRattacheId,
      structureId: ficheSemee().lieuId,
      type: 'Individuel',
      typeLieu: 'LieuActivite',
      date: new Date('2026-02-01'),
      duree: 60,
      accompagnementsCount: 1,
    },
  })
})

Given('ce médiateur a quitté ce lieu', async () => {
  await prismaClient.mediateurEnActivite.updateMany({
    where: {
      mediateurId: ficheSemee().mediateurRattacheId,
      structureId: ficheSemee().lieuId,
    },
    data: { fin: new Date('2026-03-01') },
  })
})

When(
  'on demande les lieux pour filtrer les activités de ce médiateur',
  async () => {
    proposees.options = await getLieuxDesActivitesOptions({
      mediateurIds: [ficheSemee().mediateurRattacheId],
      mediateurId: ficheSemee().mediateurRattacheId,
    })
  },
)

When('on demande les options de lieux de ce médiateur', async () => {
  await demander([ficheSemee().mediateurRattacheId])
})

When("on demande les options de lieux d'un médiateur étranger", async () => {
  await demander([ficheSemee().mediateurEtrangerId])
})

When('on demande les options de lieux de personne', async () => {
  await demander([])
})

Then('ce lieu est proposé', () => {
  assert.deepStrictEqual(
    proposees.options?.map(({ value }) => value),
    [ficheSemee().lieuId],
  )
})

Then("aucun lieu n'est proposé", () => {
  assert.deepStrictEqual(proposees.options, [])
})
