import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import type { ProfilInscriptionValue } from '@/features/inscription/domain/profil-inscription'
import {
  donneesDeVerifierInformations,
  type VerifierInformationsPageData,
} from './ui/presenters/verifier-informations.presenter'

type InscritAVerifier = Parameters<typeof donneesDeVerifierInformations>[0]

const profils: Readonly<Record<string, ProfilInscriptionValue>> = {
  médiateur: 'Mediateur',
  'conseiller numérique': 'ConseillerNumerique',
  coordinateur: 'Coordinateur',
  'coordinateur de conseillers numériques': 'CoordinateurConseillerNumerique',
}

const inscrit = (
  profilInscription: ProfilInscriptionValue | null,
): InscritAVerifier => ({
  profilInscription,
  isConseillerNumerique: profilInscription === 'ConseillerNumerique',
  name: 'Camille Martin',
  email: 'camille.martin@example.com',
  emplois: [],
})

const verification: {
  inscrit?: InscritAVerifier
  donnees?: VerifierInformationsPageData
} = {}

const inscritDecrit = (): InscritAVerifier => {
  assert.ok(verification.inscrit, "Aucun inscrit n'a été décrit")
  return verification.inscrit
}

const donnees = (): VerifierInformationsPageData => {
  assert.ok(verification.donnees, "L'inscrit n'a pas vérifié ses informations")
  return verification.donnees
}

const employer = (nom: string | null) => {
  verification.inscrit = {
    ...inscritDecrit(),
    emplois: [{ structure: { nom, codeInsee: '69266' } }],
  }
}

Given('un inscrit au profil {string}', (profil: string) => {
  const profilDecrit = profils[profil]
  assert.ok(profilDecrit, `Profil inconnu : ${profil}`)
  verification.inscrit = inscrit(profilDecrit)
})

Given("un inscrit qui n'a pas encore choisi de profil", () => {
  verification.inscrit = inscrit(null)
})

Given('employé par {string}', (nom: string) => {
  employer(nom)
})

Given('employé par une structure sans dénomination', () => {
  employer(null)
})

When('il vérifie ses informations', () => {
  verification.donnees = donneesDeVerifierInformations(inscritDecrit())
})

Then("l'étape suivante est {string}", (chemin: string) => {
  assert.strictEqual(donnees().nextStepPath, chemin)
})

Then('le retour mène à {string}', (chemin: string) => {
  assert.strictEqual(donnees().backHref, chemin)
})

Then('le profil affiché est {string}', (libelle: string) => {
  assert.strictEqual(donnees().profilLabel, libelle)
})

Then("l'employeuse affichée est {string}", (nom: string) => {
  assert.strictEqual(donnees().structureEmployeuse?.nom, nom)
})

Then("aucune employeuse n'est affichée", () => {
  assert.strictEqual(donnees().structureEmployeuse, undefined)
})
