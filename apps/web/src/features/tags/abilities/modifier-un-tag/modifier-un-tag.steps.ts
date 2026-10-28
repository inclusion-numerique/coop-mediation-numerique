import assert from 'node:assert'
import {
  DescriptionDuTag,
  NomDuTag,
  TagId,
} from '@app/web/features/tags/domain'
import {
  acteurMediateur,
  semerUnMediateur,
  semerUnTag,
  tagEnBase,
} from '@app/web/features/tags/tags.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import { modifierUnTag } from './implementation'

const contexte: {
  mediateurId?: string
  tagId?: string
  issue?: Awaited<ReturnType<typeof modifierUnTag>>
} = {}

const tagId = (): string => {
  assert.ok(contexte.tagId)
  return contexte.tagId
}

const renommer = async (
  mediateurId: string,
  nom: string,
  description: string | null,
) => {
  contexte.issue = await modifierUnTag({
    tagId: TagId(tagId()),
    acteur: acteurMediateur({ mediateurId }),
    nom: NomDuTag(nom),
    description: description === null ? null : DescriptionDuTag(description),
  })
}

Given(
  'un médiateur qui possède le tag personnel {string}',
  async (nom: string) => {
    const { mediateurId } = await semerUnMediateur()
    contexte.mediateurId = mediateurId
    contexte.tagId = await semerUnTag({ nom, mediateurId })
  },
)

When(
  'ce médiateur renomme son tag en {string} décrit par {string}',
  async (nom: string, description: string) => {
    assert.ok(contexte.mediateurId)
    await renommer(contexte.mediateurId, nom, description)
  },
)

When(
  'ce médiateur renomme son tag en {string} sans description',
  async (nom: string) => {
    assert.ok(contexte.mediateurId)
    await renommer(contexte.mediateurId, nom, null)
  },
)

When('un autre médiateur renomme ce tag en {string}', async (nom: string) => {
  const { mediateurId } = await semerUnMediateur()
  await renommer(mediateurId, nom, null)
})

Then('la modification du tag réussit', () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then('la modification du tag est refusée', () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then(
  "le tag s'appelle désormais {string} et se décrit par {string}",
  async (nom: string, description: string) => {
    const tag = await tagEnBase(tagId())
    assert.strictEqual(tag?.nom, nom)
    assert.strictEqual(tag?.description, description)
  },
)

Then("le tag n'a plus de description", async () => {
  assert.strictEqual((await tagEnBase(tagId()))?.description, null)
})

Then("le tag s'appelle toujours {string}", async (nom: string) => {
  assert.strictEqual((await tagEnBase(tagId()))?.nom, nom)
})
