import assert from 'node:assert'
import { semerUnCraV1 } from '@app/web/features/activites/activites.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import { crasV1Exposes } from './implementation'

const exposition: {
  semes: readonly { readonly id: string; readonly createdAt: Date }[]
  exposes: readonly string[]
} = { semes: [], exposes: [] }

const futurLointain = (): Date =>
  new Date(Date.UTC(2100, 0, 1) + Math.floor(Math.random() * 1e10))

const seme = (rang: number) => {
  const cra = exposition.semes.at(rang)
  assert.ok(cra, 'CRA v1 non semé')
  return cra
}

Given('un CRA v1 importé à exposer', async () => {
  exposition.semes = [await semerUnCraV1(futurLointain())]
})

Given('deux CRA v1 importés à la suite à exposer', async () => {
  const plusAncien = futurLointain()
  exposition.semes = [
    await semerUnCraV1(plusAncien),
    await semerUnCraV1(new Date(plusAncien.getTime() + 1)),
  ]
})

When("l'API liste les CRA v1", async () => {
  const { cras } = await crasV1Exposes({
    take: 500,
    skip: undefined,
    creeLe: undefined,
  })
  exposition.exposes = cras.map(({ id }) => id)
})

When("l'API liste les CRA v1 après le plus récent des deux", async () => {
  const { cras } = await crasV1Exposes({
    take: 1,
    skip: 1,
    creeLe: seme(1).createdAt.toISOString(),
  })
  exposition.exposes = cras.map(({ id }) => id)
})

Then('ce CRA v1 est exposé', () => {
  assert.ok(exposition.exposes.includes(seme(0).id))
})

Then('seul le plus ancien des deux ouvre la page', () => {
  assert.deepStrictEqual(exposition.exposes, [seme(0).id])
})
