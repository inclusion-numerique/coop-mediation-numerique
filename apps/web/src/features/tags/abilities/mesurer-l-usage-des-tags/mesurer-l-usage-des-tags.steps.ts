import assert from 'node:assert'
import { semerUnTagUtiliseDansUneActivite } from '@app/web/features/tags/tags.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import type { UsageDesTags } from './domain'
import { usageDesTags } from './implementation'

const mesures: { avant?: UsageDesTags; apres?: UsageDesTags } = {}

const ecart = (lire: (usage: UsageDesTags) => number): number | undefined =>
  mesures.avant && mesures.apres
    ? lire(mesures.apres) - lire(mesures.avant)
    : undefined

Given("la mesure de l'usage des tags", async () => {
  mesures.avant = await usageDesTags()
})

Given('un médiateur qui a utilisé son tag dans un compte rendu', async () => {
  await semerUnTagUtiliseDansUneActivite()
})

When("l'administration mesure à nouveau l'usage des tags", async () => {
  mesures.apres = await usageDesTags()
})

Then('les créateurs de tags utilisés sont {int} de plus', (attendu: number) => {
  assert.strictEqual(
    ecart(({ createursDeTagsUtilises }) => createursDeTagsUtilises.effectif),
    attendu,
  )
})

Then(
  'les comptes rendus portant un tag sont {int} de plus',
  (attendu: number) => {
    assert.strictEqual(
      ecart(({ comptesRendusTagues }) => comptesRendusTagues.effectif),
      attendu,
    )
  },
)
