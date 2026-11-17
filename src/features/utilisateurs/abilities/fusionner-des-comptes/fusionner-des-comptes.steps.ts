import assert from 'node:assert'
import {
  type CompteSeme,
  semerCompte,
} from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { fusionnerDesComptes } from './commands/fusionner-des-comptes'

const fusion: {
  source?: CompteSeme
  cible?: CompteSeme
  resultat?: Awaited<ReturnType<typeof fusionnerDesComptes>>
  contratId?: number
} = {}

const source = (): CompteSeme => {
  assert.ok(fusion.source, 'Aucune source semée')
  return fusion.source
}

const cible = (): CompteSeme => {
  assert.ok(fusion.cible, 'Aucune cible semée')
  return fusion.cible
}

const mediateurDeLaCible = async (): Promise<string> =>
  (
    await prismaClient.mediateur.findUniqueOrThrow({
      where: { userId: cible().userId },
      select: { id: true },
    })
  ).id

Given('un compte source et un compte cible à fusionner', async () => {
  fusion.source = await semerCompte()
  fusion.cible = await semerCompte()
})

Given('la source est reliée à RDV Service Public', async () => {
  await prismaClient.rdvAccount.create({
    data: {
      id: Math.floor(Math.random() * 1_000_000_000),
      userId: source().userId,
    },
  })
})

Given("la source a modifié un lieu d'activité", async () => {
  await prismaClient.lieuInclusion.update({
    where: { id: cible().lieuId },
    data: { derniereModificationParId: source().userId },
  })
})

Given("la source est connue de l'Entrepôt avec un contrat", async () => {
  const personne = await prismaClient.personneMain.create({
    data: { coopId: source().userId },
    select: { id: true },
  })
  const { id } = await prismaClient.contratMain.create({
    data: { personneId: personne.id, dateDebut: new Date('2024-01-01') },
    select: { id: true },
  })
  fusion.contratId = id
})

Given("la cible est connue de l'Entrepôt", async () => {
  await prismaClient.personneMain.create({ data: { coopId: cible().userId } })
})

Given('la cible est supprimée', async () => {
  await prismaClient.user.update({
    where: { id: cible().userId },
    data: { deleted: new Date('2026-08-01') },
  })
})

When("l'administration fusionne la source dans la cible", async () => {
  fusion.resultat = await fusionnerDesComptes({
    sourceId: source().userId,
    cibleId: cible().userId,
  })
})

When("l'administration fusionne la source avec elle-même", async () => {
  fusion.resultat = await fusionnerDesComptes({
    sourceId: source().userId,
    cibleId: source().userId,
  })
})

Then('la fusion des comptes aboutit', () => {
  assert.ok(fusion.resultat?.success, 'La fusion a échoué')
})

Then(
  "la fusion des comptes échoue avec l'erreur {string}",
  (attendu: string) => {
    const { resultat } = fusion
    assert.ok(resultat && !resultat.success, 'La fusion a abouti')
    assert.strictEqual(resultat.error._tag, attendu)
  },
)

Then("le compte source n'existe plus", async () => {
  assert.strictEqual(
    await prismaClient.user.count({ where: { id: source().userId } }),
    0,
  )
})

Then('le compte source existe toujours', async () => {
  assert.strictEqual(
    await prismaClient.user.count({ where: { id: source().userId } }),
    1,
  )
})

Then('le bénéficiaire de la source appartient à la cible', async () => {
  const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: source().beneficiaireId },
    select: { mediateurId: true },
  })
  assert.strictEqual(beneficiaire.mediateurId, await mediateurDeLaCible())
})

Then("l'activité de la source appartient à la cible", async () => {
  const activite = await prismaClient.activite.findUniqueOrThrow({
    where: { id: source().activiteId },
    select: { mediateurId: true },
  })
  assert.strictEqual(activite.mediateurId, await mediateurDeLaCible())
})

Then('la liaison ProConnect de la source appartient à la cible', async () => {
  const liaison = await prismaClient.account.findUniqueOrThrow({
    where: {
      provider_providerAccountId: {
        provider: 'proconnect',
        providerAccountId: `sub-${source().userId}`,
      },
    },
    select: { userId: true },
  })
  assert.strictEqual(liaison.userId, cible().userId)
})

Then('le compte RDV Service Public appartient à la cible', async () => {
  assert.strictEqual(
    await prismaClient.rdvAccount.count({ where: { userId: cible().userId } }),
    1,
  )
})

Then('la dernière modification du lieu est attribuée à la cible', async () => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: cible().lieuId },
    select: { derniereModificationParId: true },
  })
  assert.strictEqual(lieu.derniereModificationParId, cible().userId)
})

Then('le contrat de la source appartient à la cible', async () => {
  assert.ok(fusion.contratId, 'Aucun contrat semé')
  const contrat = await prismaClient.contratMain.findUniqueOrThrow({
    where: { id: fusion.contratId },
    select: { personne: { select: { coopId: true } } },
  })
  assert.strictEqual(contrat.personne.coopId, cible().userId)
})

Then("l'Entrepôt ne connaît plus qu'une personne pour la cible", async () => {
  assert.strictEqual(
    await prismaClient.personneMain.count({
      where: { coopId: { in: [source().userId, cible().userId] } },
    }),
    1,
  )
})
