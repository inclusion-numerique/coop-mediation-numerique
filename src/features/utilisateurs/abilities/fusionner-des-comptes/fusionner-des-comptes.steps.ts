import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { fusionnerDesComptes } from '@/features/utilisateurs/abilities/fusionner-des-comptes/domain/fusionner-des-comptes'
import { comptesAFusionner } from '@/features/utilisateurs/abilities/fusionner-des-comptes/implementations/prisma/comptes-a-fusionner.query'
import { fusionner } from '@/features/utilisateurs/abilities/fusionner-des-comptes/implementations/prisma/fusionner.mutation'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import {
  retirerLeContactDeLaListe,
  supprimerLeContact,
} from '@/features/utilisateurs/implementations/brevo/contact-brevo.mutation'
import { lireLaPresenceDuContact } from '@/features/utilisateurs/implementations/brevo/contact-brevo.query'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import {
  type CompteSeme,
  semerCompte,
  semerUnCompteDeListe,
} from '@/features/utilisateurs/utilisateurs.cucumber'

const fusionnerDesComptesAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  fusionnerDesComptes({
    lireLesComptesAFusionner: comptesAFusionner,
    fusionner: fusionner(synchroniserLaPersonne),
    retirerLeContactDeLaListe,
    lireLaPresenceDuContact,
    supprimerLeContact,
  })

const fusion: {
  source?: CompteSeme
  cible?: CompteSeme
  cibleId?: string
  resultat?: Awaited<ReturnType<ReturnType<typeof fusionnerDesComptesAvec>>>
  contratId?: number
  equipeId?: string
} = {}

const source = (): CompteSeme => {
  assert.ok(fusion.source, 'Aucune source semée')
  return fusion.source
}

const cible = (): CompteSeme => {
  assert.ok(fusion.cible, 'Aucune cible semée')
  return fusion.cible
}

const cibleId = (): string => {
  assert.ok(fusion.cibleId, 'Aucune cible semée')
  return fusion.cibleId
}

const equipe = (): string => {
  assert.ok(fusion.equipeId, 'Aucune équipe semée')
  return fusion.equipeId
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
  fusion.cibleId = fusion.cible.userId
})

Given(
  'un compte source médiateur et une cible sans rôle à fusionner',
  async () => {
    fusion.source = await semerCompte()
    fusion.cibleId = await semerUnCompteDeListe({
      prenom: 'Camille',
      marqueur: `Fusion${v4().slice(0, 8)}`,
      creeLe: new Date('2026-01-01'),
      inscritLe: new Date('2026-01-02'),
      mediateur: null,
      coordinateur: null,
    })
  },
)

Given(
  'la source a révoqué le partage de ses statistiques que la cible maintient',
  async () => {
    await Promise.all(
      [
        { mediateurId: source().mediateurId, deleted: new Date('2026-10-01') },
        { mediateurId: cible().mediateurId, deleted: null },
      ].map(({ mediateurId, deleted }) =>
        prismaClient.partageStatistiques.upsert({
          where: { mediateurId },
          create: { mediateurId, deleted },
          update: { deleted },
        }),
      ),
    )
  },
)

Given(
  'la source et la cible ont accepté une invitation de la même équipe',
  async () => {
    const { coordinateurId } = await semerCompte({ avecCoordinateur: true })
    assert.ok(coordinateurId, 'Aucun coordinateur semé')
    fusion.equipeId = coordinateurId
    await prismaClient.invitationEquipe.createMany({
      data: [source(), cible()].map(({ courriel, mediateurId }) => ({
        email: courriel,
        coordinateurId,
        mediateurId,
        acceptee: new Date('2026-11-23'),
      })),
    })
    await prismaClient.mediateurCoordonne.createMany({
      data: [source(), cible()].map(({ mediateurId }) => ({
        mediateurId,
        coordinateurId,
      })),
    })
  },
)

Given("l'invitation de la cible n'est rattachée qu'à son adresse", async () => {
  await prismaClient.invitationEquipe.update({
    where: {
      email_coordinateurId: {
        email: cible().courriel,
        coordinateurId: equipe(),
      },
    },
    data: { mediateurId: null },
  })
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
  fusion.resultat = await fusionnerDesComptesAvec(async () => undefined)({
    sourceId: UtilisateurId.safe(source().userId),
    cibleId: UtilisateurId.safe(cibleId()),
    maintenant: new Date(),
  })
})

When("l'administration fusionne la source avec elle-même", async () => {
  fusion.resultat = await fusionnerDesComptesAvec(async () => undefined)({
    sourceId: UtilisateurId.safe(source().userId),
    cibleId: UtilisateurId.safe(source().userId),
    maintenant: new Date(),
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

Then(
  "la cible n'a plus qu'une invitation de l'équipe, rattachée à son compte",
  async () => {
    assert.deepStrictEqual(
      await prismaClient.invitationEquipe.findMany({
        where: { coordinateurId: equipe() },
        select: { email: true, mediateurId: true },
      }),
      [{ email: cible().courriel, mediateurId: await mediateurDeLaCible() }],
    )
  },
)

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

Then(
  'la cible est devenue médiatrice et porte le bénéficiaire de la source',
  async () => {
    const [mediateur, beneficiaire] = await Promise.all([
      prismaClient.mediateur.findUniqueOrThrow({
        where: { userId: cibleId() },
        select: { id: true },
      }),
      prismaClient.beneficiaire.findUniqueOrThrow({
        where: { id: source().beneficiaireId },
        select: { mediateurId: true },
      }),
    ])
    assert.strictEqual(beneficiaire.mediateurId, mediateur.id)
  },
)

Then('le partage des statistiques de la cible est révoqué', async () => {
  const partage = await prismaClient.partageStatistiques.findUniqueOrThrow({
    where: { mediateurId: cible().mediateurId },
    select: { deleted: true },
  })
  assert.ok(partage.deleted, 'Le partage de la cible est toujours actif')
})
