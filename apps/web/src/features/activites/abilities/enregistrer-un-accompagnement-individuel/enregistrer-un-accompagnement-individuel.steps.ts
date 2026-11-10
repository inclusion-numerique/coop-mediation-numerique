import assert from 'node:assert'
import {
  type AccompagnementEnregistre,
  type EchecDEnregistrement,
  enregistrerUnAccompagnementIndividuel,
  type SaisieIndividuelle,
} from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel'
import {
  ActiviteId,
  BeneficiaireId,
  Commune,
  DateDActivite,
  DureeEnMinutes,
  Genre,
  LieuActiviteId,
  MediateurId,
  StatutSocial,
  ThematiqueDeMediation,
  TrancheDAge,
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
  readonly suiviId: string
  readonly activiteId: string | null
}

let semis: Semis | undefined
let resultat: Result<AccompagnementEnregistre, EchecDEnregistrement> | undefined

const semerUnMediateur = async (): Promise<Mediateur> => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `saisie-individuelle-${userId}@example.com` },
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
  const [lieu, suivi] = await Promise.all([
    prismaClient.lieuInclusion.create({
      data: {
        nom: `Médiathèque ${v4()}`,
        adresse: '3 rue de la République',
        commune: 'Lyon',
        codePostal: '69001',
      },
      select: { id: true },
    }),
    prismaClient.beneficiaire.create({
      data: { mediateurId: auteur.mediateurId, prenom: 'Camille' },
      select: { id: true },
    }),
  ])
  return { auteur, autre, lieuId: lieu.id, suiviId: suivi.id }
}

const semisCourant = (): Semis => {
  if (!semis) throw new Error('Aucun médiateur semé')
  return semis
}

const saisie = (
  modification: Partial<SaisieIndividuelle> = {},
): SaisieIndividuelle => ({
  id: null,
  date: DateDActivite('2026-11-03'),
  duree: DureeEnMinutes(30),
  lieu: {
    _tag: 'LieuActivite',
    lieuActiviteId: LieuActiviteId(semisCourant().lieuId),
  },
  thematiques: { mediation: [ThematiqueDeMediation('Email')], demarche: null },
  equipement: { _tag: 'NonRenseigne' },
  tags: [],
  notes: null,
  rdvId: null,
  beneficiaire: {
    id: BeneficiaireId(semisCourant().suiviId),
    dejaAccompagne: false,
    profil: {
      genre: Genre('NonCommunique'),
      trancheDAge: TrancheDAge('NonCommunique'),
      statutSocial: StatutSocial('NonCommunique'),
      residence: null,
    },
  },
  autonomie: null,
  orientation: { _tag: 'NonRenseignee' },
  ...modification,
})

const enregistrerPar = async (
  mediateur: Mediateur,
  saisieIndividuelle: SaisieIndividuelle,
  lieuOuvert = true,
) => {
  resultat = await enregistrerUnAccompagnementIndividuel({
    saisie: saisieIndividuelle,
    mediateurId: MediateurId(mediateur.mediateurId),
    auteurId: UtilisateurId(mediateur.userId),
    employeuseDeLaDate: async () => null,
    lieuUtilisable: async () => lieuOuvert,
    tagsUtilisables: async () => [],
    marquerLeRendezVousHonore: () => Promise.resolve(),
  })
}

const activiteEnregistree = (): string => {
  assert.ok(resultat?.success)
  return resultat.data.id
}

Given(
  'un médiateur exerçant dans un lieu, avec un bénéficiaire suivi',
  async () => {
    semis = { ...(await semerLeContexte()), activiteId: null }
  },
)

Given(
  "un médiateur ayant enregistré l'accompagnement de son bénéficiaire suivi",
  async () => {
    semis = { ...(await semerLeContexte()), activiteId: null }
    await enregistrerPar(semisCourant().auteur, saisie())
    semis = { ...semisCourant(), activiteId: activiteEnregistree() }
  },
)

Given('un médiateur ayant animé un atelier collectif', async () => {
  const contexte = await semerLeContexte()
  const { id } = await prismaClient.activite.create({
    data: {
      mediateurId: contexte.auteur.mediateurId,
      type: 'Collectif',
      typeLieu: 'ADistance',
      date: new Date('2026-11-03'),
      duree: 60,
      thematiques: ['Email'],
      accompagnementsCount: 1,
      accompagnements: { create: { beneficiaireId: contexte.suiviId } },
    },
    select: { id: true },
  })
  semis = { ...contexte, activiteId: id }
})

const activiteSemee = (): string => {
  const { activiteId } = semisCourant()
  assert.ok(activiteId)
  return activiteId
}

When(
  "le médiateur enregistre l'accompagnement de ce bénéficiaire à son lieu d'activité",
  async () => {
    await enregistrerPar(semisCourant().auteur, saisie())
  },
)

When(
  "le médiateur enregistre l'accompagnement d'une personne anonyme déjà accompagnée, à domicile à Lyon",
  async () => {
    const lyon = Commune({
      nom: 'Lyon',
      codePostal: '69001',
      codeInsee: '69123',
    })
    await enregistrerPar(
      semisCourant().auteur,
      saisie({
        lieu: { _tag: 'Domicile', commune: lyon },
        beneficiaire: {
          id: null,
          dejaAccompagne: true,
          profil: {
            genre: Genre('Feminin'),
            trancheDAge: TrancheDAge('SoixanteDixPlus'),
            statutSocial: StatutSocial('Retraite'),
            residence: lyon,
          },
        },
      }),
    )
  },
)

When(
  'le médiateur porte la durée de cet accompagnement à {int} minutes',
  async (minutes: number) => {
    await enregistrerPar(
      semisCourant().auteur,
      saisie({
        id: ActiviteId(activiteSemee()),
        duree: DureeEnMinutes(minutes),
      }),
    )
  },
)

When(
  'un autre médiateur porte la durée de cet accompagnement à {int} minutes',
  async (minutes: number) => {
    await enregistrerPar(
      semisCourant().autre,
      saisie({
        id: ActiviteId(activiteSemee()),
        duree: DureeEnMinutes(minutes),
      }),
    )
  },
)

When(
  "un autre médiateur enregistre l'accompagnement de ce bénéficiaire",
  async () => {
    await enregistrerPar(semisCourant().autre, saisie())
  },
)

When(
  "le médiateur enregistre l'accompagnement de ce bénéficiaire dans un lieu qui ne lui est pas ouvert",
  async () => {
    await enregistrerPar(semisCourant().auteur, saisie(), false)
  },
)

When(
  'le médiateur enregistre cet atelier comme un accompagnement individuel',
  async () => {
    await enregistrerPar(
      semisCourant().auteur,
      saisie({ id: ActiviteId(activiteSemee()) }),
    )
  },
)

Then("l'enregistrement de l'accompagnement individuel réussit", () => {
  assert.strictEqual(resultat?.success, true)
})

Then(
  "l'enregistrement de l'accompagnement individuel échoue avec {string}",
  (attendu: string) => {
    assert.strictEqual(
      resultat?.success === false ? resultat.error._tag : null,
      attendu,
    )
  },
)

Then(
  "l'accompagnement est le premier accompagnement du bénéficiaire",
  async () => {
    const accompagnement = await prismaClient.accompagnement.findFirstOrThrow({
      where: { activiteId: activiteEnregistree() },
      select: { beneficiaireId: true, premierAccompagnement: true },
    })
    assert.deepStrictEqual(accompagnement, {
      beneficiaireId: semisCourant().suiviId,
      premierAccompagnement: true,
    })
  },
)

Then(
  'le bénéficiaire, le médiateur et le lieu comptent chacun {int} accompagnement',
  async (attendu: number) => {
    const [beneficiaire, mediateur, lieu] = await Promise.all([
      prismaClient.beneficiaire.findUniqueOrThrow({
        where: { id: semisCourant().suiviId },
        select: { accompagnementsCount: true },
      }),
      prismaClient.mediateur.findUniqueOrThrow({
        where: { id: semisCourant().auteur.mediateurId },
        select: { accompagnementsCount: true, activitesCount: true },
      }),
      prismaClient.lieuInclusion.findUniqueOrThrow({
        where: { id: semisCourant().lieuId },
        select: { activitesCount: true },
      }),
    ])
    assert.deepStrictEqual(
      [
        beneficiaire.accompagnementsCount,
        mediateur.accompagnementsCount,
        mediateur.activitesCount,
        lieu.activitesCount,
      ],
      [attendu, attendu, attendu, attendu],
    )
  },
)

Then(
  'une personne anonyme est accompagnée à Lyon, sans que ce soit son premier accompagnement',
  async () => {
    const accompagnement = await prismaClient.accompagnement.findFirstOrThrow({
      where: { activiteId: activiteEnregistree() },
      select: {
        premierAccompagnement: true,
        beneficiaire: { select: { anonyme: true, communeCodeInsee: true } },
        activite: { select: { lieuCodeInsee: true } },
      },
    })
    assert.deepStrictEqual(accompagnement, {
      premierAccompagnement: false,
      beneficiaire: { anonyme: true, communeCodeInsee: '69123' },
      activite: { lieuCodeInsee: '69123' },
    })
  },
)

Then("l'accompagnement dure {int} minutes", async (attendu: number) => {
  const activite = await prismaClient.activite.findUniqueOrThrow({
    where: { id: activiteSemee() },
    select: { duree: true },
  })
  assert.strictEqual(activite.duree, attendu)
})

After(async () => {
  const seme = semis
  semis = undefined
  resultat = undefined
  if (!seme) return

  const mediateurIds = [seme.auteur.mediateurId, seme.autre.mediateurId]
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activitesTags.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.lieuInclusionRegistreMain.deleteMany({
    where: { structureCoopId: seme.lieuId },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: seme.lieuId } })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [seme.auteur.userId, seme.autre.userId] } },
  })
})
