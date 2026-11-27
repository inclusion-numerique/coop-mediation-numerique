import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import {
  type CompteSeme,
  semerCompte,
} from '@/features/utilisateurs/utilisateurs.cucumber'
import type { CompteTrouve } from './domain'
import { rechercherDesComptesAFusionner } from './implementations/prisma/rechercher-des-comptes-a-fusionner.query'

const recherche: {
  aGarder?: CompteSeme
  enDouble?: CompteSeme
  trouves?: readonly CompteTrouve[]
} = {}

const aGarder = (): CompteSeme => {
  assert.ok(recherche.aGarder, 'Aucun compte à garder semé')
  return recherche.aGarder
}

const enDouble = (): CompteSeme => {
  assert.ok(recherche.enDouble, 'Aucun compte en double semé')
  return recherche.enDouble
}

const chercher = async (compte: CompteSeme) => {
  recherche.trouves = await rechercherDesComptesAFusionner({
    recherche: compte.userId,
    cibleId: aGarder().userId,
  })
}

Given('un compte à garder et un compte en double', async () => {
  recherche.aGarder = await semerCompte()
  recherche.enDouble = await semerCompte()
})

When(
  "l'administration cherche le compte en double par son adresse",
  async () => {
    await chercher(enDouble())
  },
)

When(
  "l'administration cherche le compte à garder par son adresse",
  async () => {
    await chercher(aGarder())
  },
)

Then('seul le compte en double est proposé', () => {
  assert.deepStrictEqual(
    recherche.trouves?.map(({ id }) => id),
    [enDouble().userId],
  )
})

Then("aucun compte n'est proposé à la fusion", () => {
  assert.deepStrictEqual(recherche.trouves, [])
})
