import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { SlugOutil } from './domain'

const consultation: { slug?: SlugOutil | null } = {}

When("on demande la fiche de l'outil {string}", (slug: string) => {
  consultation.slug = SlugOutil.safe(slug)
})

Then('la fiche existe', () => {
  assert.notStrictEqual(consultation.slug, null)
})

Then("la fiche n'existe pas", () => {
  assert.strictEqual(consultation.slug, null)
})
