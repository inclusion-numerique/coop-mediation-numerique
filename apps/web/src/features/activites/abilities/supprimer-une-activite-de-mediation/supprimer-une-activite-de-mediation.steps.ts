import assert from 'node:assert'
import { supprimerUneActiviteDeMediation } from '@app/web/features/activites/abilities/supprimer-une-activite-de-mediation'
import {
  ActiviteId,
  type ActiviteIntrouvable,
  MediateurId,
  UtilisateurId,
} from '@app/web/features/activites/domain'
import type { Result } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

type Mediateur = { readonly userId: string; readonly mediateurId: string }

type Semis = {
  readonly auteur: Mediateur
  readonly autre: Mediateur
  readonly lieuId: string
  readonly tagId: string
  readonly activites: Readonly<Record<string, string>>
  readonly suivis: readonly string[]
  readonly anonymes: readonly string[]
}

let semis: Semis | undefined
let resultat: Result<void, ActiviteIntrouvable> | undefined

const semerUnMediateur = async (): Promise<Mediateur> => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `suppression-mediation-${userId}@example.com` },
  })
  const { id } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  return { userId, mediateurId: id }
}

const semerLeContexte = async () => {
  const [auteur, autre] = await Promise.all([
    semerUnMediateur(),
    semerUnMediateur(),
  ])
  const [lieu, tag] = await Promise.all([
    prismaClient.lieuInclusion.create({
      data: {
        nom: `Médiathèque ${v4()}`,
        adresse: '3 rue de la République',
        commune: 'Lyon',
        codePostal: '69001',
        activitesCount: 1,
      },
      select: { id: true },
    }),
    prismaClient.tag.create({
      data: { nom: `Tag ${v4()}`, mediateurId: auteur.mediateurId },
      select: { id: true },
    }),
  ])
  return { auteur, autre, lieuId: lieu.id, tagId: tag.id }
}

const semerDesSuivis = (mediateurId: string, nombre: number) =>
  Promise.all(
    Array.from({ length: nombre }, () =>
      prismaClient.beneficiaire
        .create({
          data: { mediateurId, prenom: 'Camille', accompagnementsCount: 1 },
          select: { id: true },
        })
        .then(({ id }) => id),
    ),
  )

const semerDesAnonymes = (mediateurId: string, nombre: number) =>
  Promise.all(
    Array.from({ length: nombre }, () =>
      prismaClient.beneficiaire
        .create({
          data: { mediateurId, anonyme: true, accompagnementsCount: 1 },
          select: { id: true },
        })
        .then(({ id }) => id),
    ),
  )

const semisCourant = (): Semis => {
  if (!semis) throw new Error('Aucune activité de médiation semée')
  return semis
}

const activiteSemee = (libelle: string): string => {
  const id = semisCourant().activites[libelle]
  if (id === undefined) throw new Error(`Aucune activité « ${libelle} »`)
  return id
}

const supprimerPar = async (mediateur: Mediateur, activiteId: string) => {
  resultat = await supprimerUneActiviteDeMediation({
    activiteId: ActiviteId(activiteId),
    mediateurId: MediateurId(mediateur.mediateurId),
    auteurId: UtilisateurId(mediateur.userId),
  })
}

Given(
  "un médiateur ayant accompagné une personne anonyme au lieu d'activité",
  async () => {
    const contexte = await semerLeContexte()
    const anonymes = await semerDesAnonymes(contexte.auteur.mediateurId, 1)
    await prismaClient.mediateur.update({
      where: { id: contexte.auteur.mediateurId },
      data: { activitesCount: 1, accompagnementsCount: 1 },
    })
    const activite = await prismaClient.activite.create({
      data: {
        mediateurId: contexte.auteur.mediateurId,
        type: 'Individuel',
        typeLieu: 'LieuActivite',
        structureId: contexte.lieuId,
        date: new Date('2026-03-03'),
        duree: 60,
        thematiques: ['Email'],
        accompagnementsCount: 1,
        accompagnements: {
          create: anonymes.map((beneficiaireId) => ({
            beneficiaireId,
            premierAccompagnement: true,
          })),
        },
        tags: { create: { tagId: contexte.tagId } },
      },
      select: { id: true },
    })
    semis = {
      ...contexte,
      activites: { principale: activite.id },
      suivis: [],
      anonymes,
    }
  },
)

Given(
  'un médiateur ayant animé un atelier pour {int} bénéficiaires suivis et {int} personnes anonymes',
  async (nombreDeSuivis: number, nombreDAnonymes: number) => {
    const contexte = await semerLeContexte()
    const [suivis, anonymes] = await Promise.all([
      semerDesSuivis(contexte.auteur.mediateurId, nombreDeSuivis),
      semerDesAnonymes(contexte.auteur.mediateurId, nombreDAnonymes),
    ])
    await prismaClient.mediateur.update({
      where: { id: contexte.auteur.mediateurId },
      data: {
        activitesCount: 1,
        accompagnementsCount: nombreDeSuivis + nombreDAnonymes,
      },
    })
    const activite = await prismaClient.activite.create({
      data: {
        mediateurId: contexte.auteur.mediateurId,
        type: 'Collectif',
        typeLieu: 'Autre',
        lieuCommune: 'Lyon',
        lieuCodePostal: '69001',
        lieuCodeInsee: '69123',
        date: new Date('2026-03-03'),
        duree: 90,
        thematiques: ['Email'],
        accompagnementsCount: nombreDeSuivis + nombreDAnonymes,
        accompagnements: {
          create: [...suivis, ...anonymes].map((beneficiaireId) => ({
            beneficiaireId,
            premierAccompagnement: true,
          })),
        },
      },
      select: { id: true },
    })
    semis = {
      ...contexte,
      activites: { principale: activite.id },
      suivis,
      anonymes,
    }
  },
)

Given(
  'un bénéficiaire suivi accompagné le 3 mars puis le 10 mars',
  async () => {
    const contexte = await semerLeContexte()
    const [suivi] = await semerDesSuivis(contexte.auteur.mediateurId, 1)
    if (suivi === undefined) throw new Error('Aucun bénéficiaire semé')
    await prismaClient.beneficiaire.update({
      where: { id: suivi },
      data: { accompagnementsCount: 2 },
    })
    await prismaClient.mediateur.update({
      where: { id: contexte.auteur.mediateurId },
      data: { activitesCount: 2, accompagnementsCount: 2 },
    })
    const accompagnement = (jour: string, premier: boolean) =>
      prismaClient.activite
        .create({
          data: {
            mediateurId: contexte.auteur.mediateurId,
            type: 'Individuel',
            typeLieu: 'ADistance',
            date: new Date(`2026-03-${jour}`),
            duree: 30,
            thematiques: ['Email'],
            accompagnementsCount: 1,
            accompagnements: {
              create: { beneficiaireId: suivi, premierAccompagnement: premier },
            },
          },
          select: { id: true },
        })
        .then(({ id }) => id)
    semis = {
      ...contexte,
      activites: {
        '3 mars': await accompagnement('03', true),
        '10 mars': await accompagnement('10', false),
      },
      suivis: [suivi],
      anonymes: [],
    }
  },
)

When('le médiateur supprime cette activité de médiation', async () => {
  await supprimerPar(semisCourant().auteur, activiteSemee('principale'))
})

When('un autre médiateur supprime cette activité de médiation', async () => {
  await supprimerPar(semisCourant().autre, activiteSemee('principale'))
})

When("le médiateur supprime l'accompagnement du 3 mars", async () => {
  await supprimerPar(semisCourant().auteur, activiteSemee('3 mars'))
})

Then("la suppression de l'activité de médiation réussit", () => {
  assert.strictEqual(resultat?.success, true)
})

Then(
  "la suppression de l'activité de médiation échoue avec {string}",
  (attendu: string) => {
    assert.strictEqual(
      resultat?.success === false ? resultat.error._tag : null,
      attendu,
    )
  },
)

const suppressionDeLActivite = async () =>
  (
    await prismaClient.activite.findUniqueOrThrow({
      where: { id: activiteSemee('principale') },
      select: { suppression: true },
    })
  ).suppression

Then("l'activité de médiation est marquée supprimée", async () => {
  assert.notStrictEqual(await suppressionDeLActivite(), null)
})

Then("l'activité de médiation n'est pas marquée supprimée", async () => {
  assert.strictEqual(await suppressionDeLActivite(), null)
})

Then(
  "l'activité de médiation n'a plus d'accompagnement ni de tag",
  async () => {
    const activiteId = activiteSemee('principale')
    const [accompagnements, tags] = await Promise.all([
      prismaClient.accompagnement.count({ where: { activiteId } }),
      prismaClient.activitesTags.count({ where: { activiteId } }),
    ])
    assert.deepStrictEqual(
      { accompagnements, tags },
      {
        accompagnements: 0,
        tags: 0,
      },
    )
  },
)

const anonymesRestants = () =>
  prismaClient.beneficiaire.count({
    where: { id: { in: [...semisCourant().anonymes] } },
  })

Then("la personne anonyme n'existe plus", async () => {
  assert.strictEqual(await anonymesRestants(), 0)
})

Then("les personnes anonymes n'existent plus", async () => {
  assert.strictEqual(await anonymesRestants(), 0)
})

Then(
  'chaque bénéficiaire suivi compte {int} accompagnement',
  async (attendu: number) => {
    const suivis = await prismaClient.beneficiaire.findMany({
      where: { id: { in: [...semisCourant().suivis] } },
      select: { accompagnementsCount: true },
    })
    assert.deepStrictEqual(
      suivis.map(({ accompagnementsCount }) => accompagnementsCount),
      semisCourant().suivis.map(() => attendu),
    )
  },
)

Then(
  'le médiateur compte {int} activité et {int} accompagnement',
  async (activites: number, accompagnements: number) => {
    const mediateur = await prismaClient.mediateur.findUniqueOrThrow({
      where: { id: semisCourant().auteur.mediateurId },
      select: { activitesCount: true, accompagnementsCount: true },
    })
    assert.deepStrictEqual(mediateur, {
      activitesCount: activites,
      accompagnementsCount: accompagnements,
    })
  },
)

Then("le lieu d'activité compte {int} activité", async (attendu: number) => {
  const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
    where: { id: semisCourant().lieuId },
    select: { activitesCount: true },
  })
  assert.strictEqual(lieu.activitesCount, attendu)
})

Then(
  "l'accompagnement du 10 mars devient le premier accompagnement du bénéficiaire",
  async () => {
    const accompagnement = await prismaClient.accompagnement.findFirstOrThrow({
      where: { activiteId: activiteSemee('10 mars') },
      select: { premierAccompagnement: true },
    })
    assert.strictEqual(accompagnement.premierAccompagnement, true)
  },
)

After(async () => {
  const seme = semis
  semis = undefined
  resultat = undefined
  if (!seme) return

  const mediateurIds = [seme.auteur.mediateurId, seme.autre.mediateurId]
  const activiteIds = Object.values(seme.activites)

  await prismaClient.accompagnement.deleteMany({
    where: { activiteId: { in: activiteIds } },
  })
  await prismaClient.activitesTags.deleteMany({
    where: { activiteId: { in: activiteIds } },
  })
  await prismaClient.activite.deleteMany({ where: { id: { in: activiteIds } } })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.tag.deleteMany({ where: { id: seme.tagId } })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: seme.lieuId } })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [seme.auteur.userId, seme.autre.userId] } },
  })
})
