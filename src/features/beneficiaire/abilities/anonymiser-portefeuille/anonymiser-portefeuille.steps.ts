import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { anonymiserPortefeuille } from '@/features/beneficiaire/abilities/anonymiser-portefeuille/implementations/prisma/anonymiser-portefeuille.mutation'
import {
  portefeuilleSeme,
  semerPortefeuille,
} from '@/features/beneficiaire/beneficiaire.cucumber'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'

const contexte: {
  anonymises?: number | undefined
} = {}

Given('un portefeuille de deux bénéficiaires identifiés', async () => {
  await semerPortefeuille()
})

Given('un portefeuille de deux bénéficiaires de Nice', async () => {
  const { mediateurId } = await semerPortefeuille()
  await prismaClient.beneficiaire.updateMany({
    where: { mediateurId },
    data: {
      commune: 'Nice',
      communeCodePostal: '06100,06000,06200,06300',
      communeCodeInsee: '06088',
    },
  })
})

When("j'anonymise le portefeuille de ce médiateur", async () => {
  contexte.anonymises = (
    await anonymiserPortefeuille({
      mediateurId: MediateurId(portefeuilleSeme().mediateurId),
      maintenant: new Date(),
    })
  ).anonymises
})

When("j'anonymise à nouveau le portefeuille de ce médiateur", async () => {
  contexte.anonymises = (
    await anonymiserPortefeuille({
      mediateurId: MediateurId(portefeuilleSeme().mediateurId),
      maintenant: new Date(),
    })
  ).anonymises
})

Then("l'anonymisation porte sur {int} bénéficiaire", (attendu: number) => {
  assert.strictEqual(contexte.anonymises, attendu)
})

Then("l'anonymisation porte sur {int} bénéficiaires", (attendu: number) => {
  assert.strictEqual(contexte.anonymises, attendu)
})

const anonymise = {
  prenom: null,
  nom: null,
  telephone: null,
  email: null,
  notes: null,
  adresse: null,
  anonyme: true,
  supprime: true,
}

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

  assert.deepStrictEqual(
    beneficiaires.map(({ suppression, ...identite }) => ({
      ...identite,
      supprime: suppression !== null,
    })),
    [anonymise, anonymise],
  )
})

Then(
  'les bénéficiaires du portefeuille gardent leur valeur statistique',
  async () => {
    const beneficiaires = await prismaClient.beneficiaire.findMany({
      where: { mediateurId: portefeuilleSeme().mediateurId },
      select: { anneeNaissance: true, commune: true, genre: true },
    })

    assert.deepStrictEqual(
      beneficiaires,
      beneficiaires.map(() => ({
        anneeNaissance: 1980,
        commune: 'Reims',
        genre: 'Masculin',
      })),
    )
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

Then(
  'les bénéficiaires du portefeuille ne gardent que le code postal {string}',
  async (codePostal: string) => {
    const beneficiaires = await prismaClient.beneficiaire.findMany({
      where: { mediateurId: portefeuilleSeme().mediateurId },
      select: {
        commune: true,
        communeCodePostal: true,
        communeCodeInsee: true,
      },
    })
    assert.deepStrictEqual(
      beneficiaires,
      beneficiaires.map(() => ({
        commune: 'Nice',
        communeCodePostal: codePostal,
        communeCodeInsee: '06088',
      })),
    )
  },
)
