import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { DescriptionDuTag, NomDuTag, TagId } from '@/features/tags/domain'
import { lireUnTagActif } from '@/features/tags/implementations/prisma/tag-actif.query'
import {
  acteurMediateur,
  semerUnMediateur,
  semerUnTag,
  tagEnBase,
} from '@/features/tags/tags.cucumber'
import { modifierUnTag } from './domain/modifier-un-tag'
import { enregistrerLaModification } from './implementations/prisma/enregistrer-la-modification.mutation'

const modifierEnBase = modifierUnTag({
  lireUnTagActif,
  enregistrer: enregistrerLaModification,
})

const contexte: {
  mediateurId?: string
  tagId?: string
  issue?: Awaited<ReturnType<typeof modifierEnBase>>
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
  contexte.issue = await modifierEnBase({
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
