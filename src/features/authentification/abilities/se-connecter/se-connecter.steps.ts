import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import {
  adresseDeRetourApresConnexion,
  pageDAccueil,
} from '@/features/authentification/domain/page-d-accueil'
import { RoleDeLaSession } from '@/features/authentification/domain/role-de-la-session'

type Personne = Parameters<typeof pageDAccueil>[0]

const validee = new Date('2026-01-15')

const personnes: Readonly<Record<string, Personne>> = {
  'visiteur sans session': null,
  administrateur: {
    role: RoleDeLaSession('Admin'),
    inscriptionValidee: null,
    mediateur: null,
    coordinateur: null,
  },
  "utilisateur dont l'inscription n'est pas validée": {
    role: RoleDeLaSession('User'),
    inscriptionValidee: null,
    mediateur: { id: 'mediateur' },
    coordinateur: null,
  },
  'utilisateur validé sans profil de médiateur ni coordinateur': {
    role: RoleDeLaSession('User'),
    inscriptionValidee: validee,
    mediateur: null,
    coordinateur: null,
  },
  'médiateur inscrit': {
    role: RoleDeLaSession('User'),
    inscriptionValidee: validee,
    mediateur: { id: 'mediateur' },
    coordinateur: null,
  },
  'coordinateur inscrit': {
    role: RoleDeLaSession('User'),
    inscriptionValidee: validee,
    mediateur: null,
    coordinateur: { id: 'coordinateur' },
  },
}

const connexion: { personne?: Personne; page?: string } = {}

const personneDecrite = (): Personne => {
  assert.ok('personne' in connexion, "Aucune personne n'a été décrite")
  return connexion.personne
}

Given('la personne {string}', (personne: string) => {
  assert.ok(personne in personnes, `Personne inconnue : ${personne}`)
  connexion.personne = personnes[personne]
})

When('il arrive sur la coop', () => {
  connexion.page = pageDAccueil(personneDecrite())
})

When('il vient de se connecter', () => {
  connexion.page = adresseDeRetourApresConnexion(personneDecrite())
})

Then('il est conduit vers {string}', (page: string) => {
  assert.strictEqual(connexion.page, page)
})
