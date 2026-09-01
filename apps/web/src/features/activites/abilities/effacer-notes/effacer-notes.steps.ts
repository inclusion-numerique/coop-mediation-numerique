import assert from 'node:assert'
import { effacerNotes } from '@app/web/features/activites/abilities/effacer-notes'
import {
  comptesRendusSemes,
  semerComptesRendus,
} from '@app/web/features/activites/activites.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

let effacees: number | undefined

const cible = () => ({
  mediateurId: comptesRendusSemes().mediateurId,
  coordinateurId: comptesRendusSemes().coordinateurId,
})

Given('des comptes rendus porteurs de texte libre', async () => {
  await semerComptesRendus()
})

When("j'efface le texte libre de ces comptes rendus", async () => {
  effacees = (await effacerNotes(cible())).effacees
})

When("j'efface à nouveau le texte libre de ces comptes rendus", async () => {
  effacees = (await effacerNotes(cible())).effacees
})

Then("l'effacement porte sur {int} comptes rendus", (attendu: number) => {
  assert.strictEqual(effacees, attendu)
})

Then("l'effacement porte sur {int} compte rendu", (attendu: number) => {
  assert.strictEqual(effacees, attendu)
})

Then('aucun compte rendu ne porte plus de texte libre', async () => {
  const { mediateurId, coordinateurId } = cible()

  assert.strictEqual(
    await prismaClient.activite.count({
      where: { mediateurId, notes: { not: null } },
    }),
    0,
  )
  assert.strictEqual(
    await prismaClient.activiteCoordination.count({
      where: { coordinateurId, notes: { not: null } },
    }),
    0,
  )
})

Then('les comptes rendus sont toujours en base', async () => {
  const { mediateurId, coordinateurId } = cible()

  assert.strictEqual(
    await prismaClient.activite.count({ where: { mediateurId } }),
    2,
  )
  assert.strictEqual(
    await prismaClient.activiteCoordination.count({
      where: { coordinateurId },
    }),
    1,
  )
})
