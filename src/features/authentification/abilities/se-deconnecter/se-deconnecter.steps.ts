import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import {
  semerUnePersonneConnectee,
  sessionOuverte,
} from '@/features/authentification/authentification.cucumber'
import { supprimerSession } from './implementations/prisma'

const appareils: { jetons: readonly string[] } = { jetons: [] }

const jetonDe = (rang: number): string => {
  const jeton = appareils.jetons.at(rang)
  assert.ok(jeton, `Aucune session sur l'appareil n° ${rang + 1}`)
  return jeton
}

Given('une personne connectée sur deux appareils', async () => {
  appareils.jetons = await semerUnePersonneConnectee(2)
})

When('elle se déconnecte du premier appareil', async () => {
  await supprimerSession(jetonDe(0))
})

Then('la session du premier appareil est fermée', async () => {
  assert.strictEqual(await sessionOuverte(jetonDe(0)), false)
})

Then('la session du second appareil reste ouverte', async () => {
  assert.strictEqual(await sessionOuverte(jetonDe(1)), true)
})
