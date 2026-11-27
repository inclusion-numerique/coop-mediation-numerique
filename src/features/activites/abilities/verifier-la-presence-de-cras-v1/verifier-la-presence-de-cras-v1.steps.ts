import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import type { Result } from '@/libraries/result'
import { perimetreDe } from '../../statistiques.cucumber'
import {
  type PresenceDeCrasV1,
  verifierLaPresenceDeCrasV1,
} from './domain/index'
import { mediateurAvecCrasV1 } from './implementations/prisma/mediateur-avec-cras-v1.query'

const etat: {
  presence?: Result<PresenceDeCrasV1, never>
} = {}

When('je vérifie la présence de CRA v1 pour {string}', async (nom: string) => {
  etat.presence = await verifierLaPresenceDeCrasV1({ mediateurAvecCrasV1 })({
    perimetre: perimetreDe(nom),
  })
})

Then('les CRA v1 sont {string}', (attendue: string) => {
  assert.ok(etat.presence)
  assert.strictEqual(etat.presence.data, attendue)
})
