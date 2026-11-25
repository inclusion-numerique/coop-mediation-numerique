import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import { perimetreDe } from '../../statistiques.cucumber'
import { type PresenceDeCrasV1 } from './domain/index'
import { verifierLaPresenceDeCrasV1 } from './implementations/prisma/presence-de-cras-v1.query'

let presence: PresenceDeCrasV1 | undefined

When('je vérifie la présence de CRA v1 pour {string}', async (nom: string) => {
  presence = await verifierLaPresenceDeCrasV1(perimetreDe(nom))
})

Then('les CRA v1 sont {string}', (attendue: string) => {
  assert.strictEqual(presence, attendue)
})
