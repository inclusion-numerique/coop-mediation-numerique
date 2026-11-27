import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { AdresseCourriel, UtilisateurId } from '@/features/utilisateurs/domain'
import { semerUnCompteDeListe } from '@/features/utilisateurs/utilisateurs.cucumber'
import { success } from '@/libraries/result'
import type { CompteDuContact, ContactBrevo } from './domain'
import {
  type BilanDesContacts,
  retirerLesContactsOrphelins,
} from './domain/retirer-les-contacts-orphelins'
import { inscritsVivantsParmi } from './implementations/prisma/inscrits-vivants.query'

const compte = (identifiant: string): CompteDuContact => ({
  _tag: 'Compte',
  utilisateurId: UtilisateurId(identifiant),
})

const ANONYMISE = AdresseCourriel(
  'deleted+abcdef012345@coop-numerique.anct.gouv.fr',
)
const SANS_COMPTE = AdresseCourriel(`parti-${v4()}@example.com`)
const VIVANT = AdresseCourriel(`vivant-${v4()}@example.com`)
const DEJA_SORTI = AdresseCourriel(`deja-sorti-${v4()}@example.com`)

const reconciliation: {
  contacts: readonly ContactBrevo[]
  horsDeLaListe: readonly AdresseCourriel[]
  supprimes: readonly AdresseCourriel[]
  retires: readonly AdresseCourriel[]
  bilan: BilanDesContacts | null
} = {
  contacts: [],
  horsDeLaListe: [],
  supprimes: [],
  retires: [],
  bilan: null,
}

Given('un inscrit vivant présent dans la liste de diffusion', async () => {
  const utilisateurId = await semerUnCompteDeListe({
    prenom: 'Vivien',
    marqueur: `Brevo${v4().slice(0, 8)}`,
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-02'),
  })
  reconciliation.contacts = [
    { courriel: VIVANT, compte: compte(utilisateurId) },
  ]
})

Given("un contact anonymisé et un contact dont le compte n'existe plus", () => {
  reconciliation.contacts = [
    ...reconciliation.contacts,
    { courriel: ANONYMISE, compte: compte(v4()) },
    { courriel: SANS_COMPTE, compte: compte(v4()) },
  ]
})

Given("un contact dont le compte n'existe plus, déjà sorti de la liste", () => {
  reconciliation.contacts = [{ courriel: DEJA_SORTI, compte: compte(v4()) }]
  reconciliation.horsDeLaListe = [DEJA_SORTI]
})

When('les contacts orphelins sont retirés', async () => {
  const resultat = await retirerLesContactsOrphelins({
    inscritsVivantsParmi,
    supprimerLeContact: async (courriel) => {
      reconciliation.supprimes = [...reconciliation.supprimes, courriel]
      return success(undefined)
    },
    retirerLeContactDeLaListe: async (courriel) => {
      if (reconciliation.horsDeLaListe.includes(courriel)) {
        return success({ _tag: 'DejaAbsent' })
      }
      reconciliation.retires = [...reconciliation.retires, courriel]
      return success({ _tag: 'Retire' })
    },
    lireLaPresenceDuContact: async () =>
      success({ _tag: 'Present', listes: 1 }),
  })({ contacts: reconciliation.contacts })
  reconciliation.bilan = resultat.data
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

Then("aucun contact n'est compté comme retiré", () => {
  assert.equal(reconciliation.bilan?.orphelinsRetires.length, 0)
  assert.deepEqual(reconciliation.bilan?.echecs, [])
})
