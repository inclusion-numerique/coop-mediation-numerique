import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { consulterLAccueil } from '@/features/accueil/abilities/consulter-l-accueil/domain/consulter-l-accueil'
import { UtilisateurId } from '@/features/accueil/abilities/consulter-l-accueil/domain/utilisateur-id'
import { lireLeVisiteur } from '@/features/accueil/abilities/consulter-l-accueil/implementations/prisma/visiteur.query'
import {
  semerUnVisiteur,
  type VisiteurASemer,
} from '@/features/accueil/accueil.cucumber'

const mediatrice: VisiteurASemer = {
  prenom: 'Camille',
  nom: 'Camille Martin',
  mediateur: true,
  coordinateur: false,
  presentationVue: false,
}

const consultation: {
  visiteur?: VisiteurASemer
  email?: string
  resultat?: Awaited<ReturnType<ReturnType<typeof consulterLAccueil>>>
} = {}

const accueil = () => {
  assert.ok(consultation.resultat?.success, "L'accueil a échoué")
  return consultation.resultat.data
}

Given(
  'une médiatrice prénommée {string}, nommée {string}',
  (prenom: string, nom: string) => {
    consultation.visiteur = { ...mediatrice, prenom, nom }
  },
)

Given('un coordinateur qui est aussi médiateur', () => {
  consultation.visiteur = { ...mediatrice, coordinateur: true }
})

Given("une médiatrice qui n'a pas vu la présentation", () => {
  consultation.visiteur = mediatrice
})

Given('une médiatrice qui a vu la présentation', () => {
  consultation.visiteur = { ...mediatrice, presentationVue: true }
})

When(/^(?:elle|il) consulte l'accueil$/, async () => {
  assert.ok(consultation.visiteur, 'Aucun visiteur')
  const { id, email } = await semerUnVisiteur(consultation.visiteur)
  consultation.email = email
  consultation.resultat = await consulterLAccueil({ lireLeVisiteur })({
    utilisateurId: UtilisateurId(id),
  })
})

Then("l'accueil la salue par {string}", (attendue: string) => {
  assert.strictEqual(accueil().salutation, attendue)
})

Then("l'accueil la salue par son adresse électronique", () => {
  assert.strictEqual(accueil().salutation, consultation.email)
})

Then("l'accueil est celui d'un coordinateur", () => {
  assert.strictEqual(accueil().profil._tag, 'Coordinateur')
})

Then("l'accueil est celui d'un médiateur", () => {
  assert.strictEqual(accueil().profil._tag, 'Mediateur')
})

Then("l'accueil lui souhaite la bienvenue", () => {
  assert.deepStrictEqual(accueil().profil, {
    ...accueil().profil,
    bienvenue: true,
  })
})

Then("l'accueil ne lui souhaite plus la bienvenue", () => {
  assert.deepStrictEqual(accueil().profil, {
    ...accueil().profil,
    bienvenue: false,
  })
})
