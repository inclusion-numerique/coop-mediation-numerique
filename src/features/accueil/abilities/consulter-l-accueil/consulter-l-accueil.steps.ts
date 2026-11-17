import assert from 'node:assert'
import {
  type Accueil,
  consulterLAccueil,
  type UtilisateurConnecte,
  visiteurDe,
} from '@app/web/features/accueil/abilities/consulter-l-accueil'
import { Given, Then, When } from '@cucumber/cucumber'

type Utilisateur = UtilisateurConnecte

const MEDIATEUR = { id: 'a3c1c0d2-5b7e-4f7a-9d1e-2f8b6c4d0e11' }
const COORDINATEUR = { id: 'b4d2d1e3-6c8f-4a8b-8e2f-3a9c7d5e1f22' }

const utilisatrice: Utilisateur = {
  firstName: 'Camille',
  name: 'Camille Martin',
  email: 'camille@example.org',
  mediateur: MEDIATEUR,
  coordinateur: null,
  hasSeenOnboarding: null,
}

let visiteur: Utilisateur = utilisatrice
let accueil: Accueil | null = null

Given(
  "une médiatrice prénommée {string}, nommée {string}, d'adresse {string}",
  (firstName: string, name: string, email: string) => {
    visiteur = { ...utilisatrice, firstName, name, email }
  },
)

Given('un coordinateur qui est aussi médiateur', () => {
  visiteur = { ...utilisatrice, coordinateur: COORDINATEUR }
})

Given("une médiatrice qui n'a pas vu la présentation", () => {
  visiteur = utilisatrice
})

Given('une médiatrice qui a vu la présentation', () => {
  visiteur = { ...utilisatrice, hasSeenOnboarding: '2026-10-01T10:00:00Z' }
})

When(/^(?:elle|il) consulte l'accueil$/, () => {
  accueil = consulterLAccueil(visiteurDe(visiteur))
})

Then("l'accueil la salue par {string}", (attendue: string) => {
  assert.strictEqual(accueil?.salutation, attendue)
})

Then("l'accueil est celui d'un coordinateur", () => {
  assert.strictEqual(accueil?.profil._tag, 'Coordinateur')
})

Then("l'accueil est celui d'un médiateur", () => {
  assert.strictEqual(accueil?.profil._tag, 'Mediateur')
})

Then("l'accueil lui souhaite la bienvenue", () => {
  assert.strictEqual(
    accueil?.profil._tag === 'Mediateur' && accueil.profil.bienvenue,
    true,
  )
})

Then("l'accueil ne lui souhaite plus la bienvenue", () => {
  assert.strictEqual(
    accueil?.profil._tag === 'Mediateur' && accueil.profil.bienvenue,
    false,
  )
})
