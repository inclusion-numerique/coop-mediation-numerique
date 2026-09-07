import assert from 'node:assert'
import {
  getMediateursLieuxActiviteOptions,
  type LieuActiviteOption,
} from '@app/web/features/lieux-activite/abilities/lister-les-options-de-lieux'
import { ficheSemee } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { Then, When } from '@cucumber/cucumber'

const proposees: { options?: LieuActiviteOption[] } = {}

const demander = async (mediateurIds: string[]) => {
  proposees.options = await getMediateursLieuxActiviteOptions({ mediateurIds })
}

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
