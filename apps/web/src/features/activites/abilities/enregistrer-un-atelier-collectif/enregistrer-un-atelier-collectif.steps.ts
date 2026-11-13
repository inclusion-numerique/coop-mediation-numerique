import assert from 'node:assert'
import {
  type AtelierEnregistre,
  type EchecDEnregistrement,
  enregistrerUnAtelierCollectif,
  type SaisieCollective,
} from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif'
import {
  ActiviteId,
  aucuneParticipationAnonyme,
  BeneficiaireId,
  DateDActivite,
  DureeEnMinutes,
  Effectif,
  MediateurId,
  participantsAnonymesDe,
  ThematiqueDeMediation,
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
  readonly suivis: readonly string[]
  readonly activiteId: string | null
}

let semis: Semis | undefined
let resultat: Result<AtelierEnregistre, EchecDEnregistrement> | undefined

const semerUnMediateur = async (): Promise<Mediateur> => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `saisie-collective-${userId}@example.com` },
  })
  const { id } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  return { userId, mediateurId: id }
}

const semerLeContexte = async (): Promise<Semis> => {
  const [auteur, autre] = await Promise.all([
    semerUnMediateur(),
    semerUnMediateur(),
  ])
  const suivis = await Promise.all(
    ['Camille', 'Dominique'].map((prenom) =>
      prismaClient.beneficiaire
        .create({
          data: { mediateurId: auteur.mediateurId, prenom },
          select: { id: true },
        })
        .then(({ id }) => id),
    ),
  )
  return { auteur, autre, suivis, activiteId: null }
}

const semisCourant = (): Semis => {
  if (!semis) throw new Error('Aucun médiateur semé')
  return semis
}

const anonymes = (total: number, femmes: number, dejaAccompagnes: number) => {
  const resultatAnonymes = participantsAnonymesDe({
    ...aucuneParticipationAnonyme,
    total: Effectif(total),
    dejaAccompagnes: Effectif(dejaAccompagnes),
    genres: { masculin: Effectif(0), feminin: Effectif(femmes) },
  })
  assert.ok(resultatAnonymes.success)
  return resultatAnonymes.data
}

const saisie = (
  modification: Partial<SaisieCollective> = {},
): SaisieCollective => ({
  id: null,
  date: DateDActivite('2026-11-03'),
  duree: DureeEnMinutes(90),
  lieu: { _tag: 'ADistance' },
  thematiques: { mediation: [ThematiqueDeMediation('Email')], demarche: null },
  equipement: { _tag: 'NonRenseigne' },
  tags: [],
  notes: null,
  rdvId: null,
  titre: null,
  niveau: null,
  suivis: semisCourant().suivis.map(BeneficiaireId),
  anonymes: anonymes(3, 2, 1),
  ...modification,
})

const enregistrerPar = async (
  mediateur: Mediateur,
  saisieCollective: SaisieCollective,
) => {
  resultat = await enregistrerUnAtelierCollectif({
    saisie: saisieCollective,
    mediateurId: MediateurId(mediateur.mediateurId),
    auteurId: UtilisateurId(mediateur.userId),
    employeuseDeLaDate: () => Promise.resolve(null),
    lieuUtilisable: () => Promise.resolve(true),
    tagsUtilisables: () => Promise.resolve([]),
    marquerLeRendezVousHonore: () => Promise.resolve(),
  })
}

const atelierEnregistre = (): string => {
  assert.ok(resultat?.success)
  return resultat.data.id
}

Given('un médiateur ayant {int} bénéficiaires suivis', async (_: number) => {
  semis = await semerLeContexte()
})

Given(
  'un médiateur ayant enregistré un atelier pour ses 2 bénéficiaires suivis et 3 anonymes',
  async () => {
    semis = await semerLeContexte()
    await enregistrerPar(semisCourant().auteur, saisie())
    semis = { ...semisCourant(), activiteId: atelierEnregistre() }
  },
)

Given(
  'un médiateur dont un ancien bénéficiaire anonymisé participe à deux ateliers',
  async () => {
    const contexte = await semerLeContexte()
    const anonymise = await prismaClient.beneficiaire.create({
      data: {
        mediateurId: contexte.auteur.mediateurId,
        anonyme: true,
        commune: 'Lyon',
        communeCodePostal: '69001',
        communeCodeInsee: '69123',
        accompagnementsCount: 2,
      },
      select: { id: true },
    })
    const atelier = (jour: string) =>
      prismaClient.activite
        .create({
          data: {
            mediateurId: contexte.auteur.mediateurId,
            type: 'Collectif',
            typeLieu: 'ADistance',
            date: new Date(`2026-11-${jour}`),
            duree: 60,
            thematiques: ['Email'],
            accompagnementsCount: 1,
            accompagnements: { create: { beneficiaireId: anonymise.id } },
          },
          select: { id: true },
        })
        .then(({ id }) => id)
    const [premier] = await Promise.all([atelier('02'), atelier('03')])
    semis = {
      ...contexte,
      suivis: [...contexte.suivis, anonymise.id],
      activiteId: premier,
    }
  },
)

Given(
  'un médiateur ayant accompagné individuellement un bénéficiaire suivi',
  async () => {
    const contexte = await semerLeContexte()
    const [suivi] = contexte.suivis
    assert.ok(suivi)
    const { id } = await prismaClient.activite.create({
      data: {
        mediateurId: contexte.auteur.mediateurId,
        type: 'Individuel',
        typeLieu: 'ADistance',
        date: new Date('2026-11-03'),
        duree: 30,
        thematiques: ['Email'],
        accompagnementsCount: 1,
        accompagnements: { create: { beneficiaireId: suivi } },
      },
      select: { id: true },
    })
    semis = { ...contexte, activiteId: id }
  },
)

const activiteSemee = (): string => {
  const { activiteId } = semisCourant()
  assert.ok(activiteId)
  return activiteId
}

When(
  'le médiateur enregistre un atelier pour ses 2 bénéficiaires suivis et 3 anonymes, dont 2 femmes et 1 déjà accompagné',
  async () => {
    await enregistrerPar(semisCourant().auteur, saisie())
  },
)

When(
  'le médiateur ne garde dans cet atelier que son premier bénéficiaire suivi et 1 anonyme',
  async () => {
    const [premier] = semisCourant().suivis
    assert.ok(premier)
    await enregistrerPar(
      semisCourant().auteur,
      saisie({
        id: ActiviteId(activiteSemee()),
        suivis: [BeneficiaireId(premier)],
        anonymes: anonymes(1, 0, 0),
      }),
    )
  },
)

When(
  'un autre médiateur enregistre un atelier pour ces bénéficiaires',
  async () => {
    await enregistrerPar(semisCourant().autre, saisie())
  },
)

When(
  'le médiateur réécrit le premier de ces ateliers avec {int} anonyme',
  async (total: number) => {
    await enregistrerPar(
      semisCourant().auteur,
      saisie({
        id: ActiviteId(activiteSemee()),
        suivis: [],
        anonymes: anonymes(total, 0, 0),
      }),
    )
  },
)

When('le médiateur enregistre un atelier sans participant', async () => {
  await enregistrerPar(
    semisCourant().auteur,
    saisie({ suivis: [], anonymes: anonymes(0, 0, 0) }),
  )
})

When(
  'le médiateur enregistre cet accompagnement comme un atelier',
  async () => {
    await enregistrerPar(
      semisCourant().auteur,
      saisie({ id: ActiviteId(activiteSemee()) }),
    )
  },
)

Then("l'enregistrement de l'atelier collectif réussit", () => {
  assert.strictEqual(resultat?.success, true)
})

Then(
  "l'enregistrement de l'atelier collectif échoue avec {string}",
  (attendu: string) => {
    assert.strictEqual(
      resultat?.success === false ? resultat.error._tag : null,
      attendu,
    )
  },
)

const accompagnementsDeLAtelier = () =>
  prismaClient.accompagnement.findMany({
    where: { activiteId: atelierEnregistre() },
    select: {
      premierAccompagnement: true,
      beneficiaire: { select: { anonyme: true, genre: true } },
    },
  })

Then(
  "l'atelier compte {int} accompagnements, dont {int} anonymes et {int} femmes",
  async (total: number, anonymesAttendus: number, femmes: number) => {
    const accompagnements = await accompagnementsDeLAtelier()
    const anonymesLus = accompagnements.filter(
      ({ beneficiaire }) => beneficiaire.anonyme,
    )
    assert.deepStrictEqual(
      [
        accompagnements.length,
        anonymesLus.length,
        anonymesLus.filter(
          ({ beneficiaire }) => beneficiaire.genre === 'Feminin',
        ).length,
      ],
      [total, anonymesAttendus, femmes],
    )
  },
)

Then(
  "{int} participant anonyme n'en est pas à son premier accompagnement",
  async (attendu: number) => {
    const accompagnements = await accompagnementsDeLAtelier()
    assert.strictEqual(
      accompagnements.filter(
        ({ beneficiaire, premierAccompagnement }) =>
          beneficiaire.anonyme && !premierAccompagnement,
      ).length,
      attendu,
    )
  },
)

Then(
  "chaque bénéficiaire suivi de l'atelier compte {int} accompagnement",
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
  "l'ancien bénéficiaire anonymisé compte {int} accompagnement",
  async (attendu: number) => {
    const anonymise = semisCourant().suivis.at(-1)
    assert.ok(anonymise)
    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: anonymise },
      select: { accompagnementsCount: true },
    })
    assert.strictEqual(beneficiaire.accompagnementsCount, attendu)
  },
)

Then(
  'le bénéficiaire retiré compte {int} accompagnement',
  async (attendu: number) => {
    const retire = semisCourant().suivis.at(1)
    assert.ok(retire)
    const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
      where: { id: retire },
      select: { accompagnementsCount: true },
    })
    assert.strictEqual(beneficiaire.accompagnementsCount, attendu)
  },
)

Then(
  'le médiateur compte {int} activité et {int} accompagnements',
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

After(async () => {
  const seme = semis
  semis = undefined
  resultat = undefined
  if (!seme) return

  const mediateurIds = [seme.auteur.mediateurId, seme.autre.mediateurId]
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [seme.auteur.userId, seme.autre.userId] } },
  })
})
