import assert from 'node:assert'
import { anonymiserPortefeuille } from '@app/web/features/beneficiaire/abilities/anonymiser-portefeuille'
import {
  portefeuilleSeme,
  semerPortefeuille,
} from '@app/web/features/beneficiaire/beneficiaire.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

let anonymises: number | undefined

Given('un portefeuille de deux bénéficiaires identifiés', async () => {
  await semerPortefeuille()
})

When("j'anonymise le portefeuille de ce médiateur", async () => {
  anonymises = (
    await anonymiserPortefeuille({
      mediateurId: portefeuilleSeme().mediateurId,
    })
  ).anonymises
})

When("j'anonymise à nouveau le portefeuille de ce médiateur", async () => {
  anonymises = (
    await anonymiserPortefeuille({
      mediateurId: portefeuilleSeme().mediateurId,
    })
  ).anonymises
})

Then("l'anonymisation porte sur {int} bénéficiaire", (attendu: number) => {
  assert.strictEqual(anonymises, attendu)
})

Then("l'anonymisation porte sur {int} bénéficiaires", (attendu: number) => {
  assert.strictEqual(anonymises, attendu)
})

Then("les bénéficiaires du portefeuille n'ont plus d'identité", async () => {
  const beneficiaires = await prismaClient.beneficiaire.findMany({
    where: { mediateurId: portefeuilleSeme().mediateurId },
    select: {
      prenom: true,
      nom: true,
      telephone: true,
      email: true,
      notes: true,
      adresse: true,
      anonyme: true,
      suppression: true,
    },
  })

  assert.strictEqual(beneficiaires.length, 2)
  for (const beneficiaire of beneficiaires) {
    assert.strictEqual(beneficiaire.prenom, null)
    assert.strictEqual(beneficiaire.nom, null)
    assert.strictEqual(beneficiaire.telephone, null)
    assert.strictEqual(beneficiaire.email, null)
    assert.strictEqual(beneficiaire.notes, null)
    assert.strictEqual(beneficiaire.adresse, null)
    assert.strictEqual(beneficiaire.anonyme, true)
    assert.ok(beneficiaire.suppression)
  }
})

Then(
  'les bénéficiaires du portefeuille gardent leur valeur statistique',
  async () => {
    const beneficiaires = await prismaClient.beneficiaire.findMany({
      where: { mediateurId: portefeuilleSeme().mediateurId },
      select: { anneeNaissance: true, commune: true, genre: true },
    })

    for (const beneficiaire of beneficiaires) {
      assert.strictEqual(beneficiaire.anneeNaissance, 1980)
      assert.strictEqual(beneficiaire.commune, 'Reims')
      assert.strictEqual(beneficiaire.genre, 'Masculin')
    }
  },
)

Then(
  "les bénéficiaires du portefeuille ne référencent plus d'usager RDV",
  async () => {
    const restants = await prismaClient.beneficiaire.count({
      where: {
        mediateurId: portefeuilleSeme().mediateurId,
        rdvUserId: { not: null },
      },
    })

    assert.strictEqual(restants, 0)
  },
)

Then(
  'le compteur de bénéficiaires du portefeuille est remis à zéro',
  async () => {
    const mediateur = await prismaClient.mediateur.findUniqueOrThrow({
      where: { id: portefeuilleSeme().mediateurId },
      select: { beneficiairesCount: true },
    })

    assert.strictEqual(mediateur.beneficiairesCount, 0)
  },
)
