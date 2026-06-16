import assert from 'node:assert'
import { detecterDoublons } from '@app/web/features/beneficiaire/abilities/detecter-doublons/implementation'
import {
  seedBeneficiaire,
  testMediateurId,
} from '@app/web/features/beneficiaire/beneficiaire.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

type Detection = Awaited<ReturnType<typeof detecterDoublons>>

let seededIds: string[] = []
let detection: Detection | undefined

Given('un doublon évident pour ce médiateur', async () => {
  const data = {
    prenom: 'Alice',
    nom: 'Testdoublon',
    telephone: '0102030405',
    email: 'dup@example.com',
  }
  seededIds = await Promise.all([
    seedBeneficiaire(data),
    seedBeneficiaire(data),
  ])
})

Given('deux bénéficiaires distincts pour ce médiateur', async () => {
  seededIds = await Promise.all([
    seedBeneficiaire({
      prenom: 'Alicia',
      nom: 'Testuniquea',
      telephone: '0102030401',
      email: 'a-unique@example.com',
    }),
    seedBeneficiaire({
      prenom: 'Bob',
      nom: 'Testuniqueb',
      telephone: '0102030402',
      email: 'b-unique@example.com',
    }),
  ])
})

When('je détecte les doublons', async () => {
  detection = await detecterDoublons({ mediateurId: testMediateurId })
})

Then('un doublon impliquant les bénéficiaires créés est détecté', () => {
  assert.ok(detection)
  const ids = new Set<string>(seededIds)
  assert.ok(
    detection.duplicates.some((d) => ids.has(d.a.id) && ids.has(d.b.id)),
    'Le doublon créé devrait être détecté',
  )
})

Then("aucun doublon n'implique les bénéficiaires créés", () => {
  assert.ok(detection)
  const ids = new Set<string>(seededIds)
  assert.ok(
    detection.duplicates.every((d) => !ids.has(d.a.id) && !ids.has(d.b.id)),
    'Aucun doublon ne devrait impliquer les bénéficiaires distincts',
  )
})
