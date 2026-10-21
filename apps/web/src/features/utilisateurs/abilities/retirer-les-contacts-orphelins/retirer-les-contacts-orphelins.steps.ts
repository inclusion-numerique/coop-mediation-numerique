import assert from 'node:assert'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { retirerLesContactsOrphelins } from './commands/retirer-les-contacts-orphelins'
import type { ContactBrevo } from './domain'

const ANONYMISE = 'deleted+abcdef012345@coop-numerique.anct.gouv.fr'
const SANS_COMPTE = `parti-${v4()}@example.com`
const VIVANT = `vivant-${v4()}@example.com`

const reconciliation: {
  contacts: readonly ContactBrevo[]
  supprimes: readonly string[]
  retires: readonly string[]
} = { contacts: [], supprimes: [], retires: [] }

Given('un inscrit vivant présent dans la liste de diffusion', async () => {
  const utilisateurId = await semerUnCompteDeListe({
    prenom: 'Vivien',
    marqueur: `Brevo${v4().slice(0, 8)}`,
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-02'),
  })
  reconciliation.contacts = [
    { courriel: VIVANT, identifiantExterne: utilisateurId },
  ]
})

Given("un contact anonymisé et un contact dont le compte n'existe plus", () => {
  reconciliation.contacts = [
    ...reconciliation.contacts,
    { courriel: ANONYMISE, identifiantExterne: v4() },
    { courriel: SANS_COMPTE, identifiantExterne: v4() },
  ]
})

When('les contacts orphelins sont retirés', async () => {
  await retirerLesContactsOrphelins({
    listerLesContacts: async () => reconciliation.contacts,
    supprimerLeContact: async (courriel) => {
      reconciliation.supprimes = [...reconciliation.supprimes, courriel]
    },
    retirerLeContactDeLaListe: async (courriel) => {
      reconciliation.retires = [...reconciliation.retires, courriel]
    },
  })
})

Then('le contact anonymisé est supprimé', () => {
  assert.ok(reconciliation.supprimes.includes(ANONYMISE))
})

Then('le contact sans compte est retiré de la liste', () => {
  assert.ok(reconciliation.retires.includes(SANS_COMPTE))
})

Then("le contact de l'inscrit vivant reste dans la liste", () => {
  assert.ok(!reconciliation.retires.includes(VIVANT))
  assert.ok(!reconciliation.supprimes.includes(VIVANT))
})
