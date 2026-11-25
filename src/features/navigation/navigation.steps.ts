import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { type AccesALaCoop, accesALaCoop, type RoleDuCompte } from './domain'

const roles: readonly RoleDuCompte[] = ['User', 'Admin']

const roleDuCompte = (role: string): RoleDuCompte => {
  const trouve = roles.find((candidat) => candidat === role)
  assert.ok(trouve, `Rôle inconnu : ${role}`)
  return trouve
}

const contexte: {
  compte?: {
    readonly role: RoleDuCompte
    readonly inscriptionAchevee: boolean
  }
  acces?: AccesALaCoop
} = {}

const acces = (): AccesALaCoop => {
  assert.ok(contexte.acces, "L'accès à la coop n'a pas été demandé")
  return contexte.acces
}

Given(
  /^un compte "([^"]+)" dont l'inscription (est|n'est pas) achevée$/,
  (role: string, etat: string) => {
    contexte.compte = {
      role: roleDuCompte(role),
      inscriptionAchevee: etat === 'est',
    }
  },
)

When("ce compte demande l'accès à la coop", () => {
  assert.ok(contexte.compte, "Aucun compte n'a été décrit")
  contexte.acces = accesALaCoop(contexte.compte)
})

Then(
  'la coop lui est réservée aux utilisateurs, en tant que {string}',
  (role: string) => {
    assert.deepStrictEqual(acces(), { _tag: 'ReserveAuxUtilisateurs', role })
  },
)

Then('la coop lui reste fermée tant que son inscription est inachevée', () => {
  assert.deepStrictEqual(acces(), { _tag: 'InscriptionInachevee' })
})

Then('la coop lui est ouverte', () => {
  assert.deepStrictEqual(acces(), { _tag: 'Ouvert' })
})
