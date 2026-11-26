import { cloneDeep } from 'lodash-es'
import { v5 } from 'uuid'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { compterLesAccompagnements } from '@/features/activites/abilities/compter-les-accompagnements/implementations/prisma/totaux-des-accompagnements.query'
import { totauxPresentes } from '@/features/activites/abilities/compter-les-accompagnements/ui/presenters/totaux.presenter'
import { compterLesAccompagnementsParCommune } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/implementations/prisma/accompagnements-par-commune.query'
import { parCommunePresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-commune/ui/presenters/par-commune.presenter'
import { compterLesAccompagnementsParLieu } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/implementations/prisma/accompagnements-par-lieu.query'
import { parLieuPresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-lieu/ui/presenters/par-lieu.presenter'
import { compterLesAccompagnementsParPeriode } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/implementations/prisma/accompagnements-par-periode.query'
import { parPeriodePresentes } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/ui/presenters/par-periode.presenter'
import { compterLesPersonnesAccompagneesParCommune } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/implementations/prisma/personnes-par-commune.query'
import { personnesParCommunePresentees } from '@/features/activites/abilities/compter-les-personnes-accompagnees-par-commune/ui/presenters/personnes-par-commune.presenter'
import { decrireLesPersonnesAccompagnees } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/implementations/prisma/profil-des-personnes-accompagnees.query'
import { profilPresente } from '@/features/activites/abilities/decrire-les-personnes-accompagnees/ui/presenters/profil.presenter'
import { repartirLesAccompagnements } from '@/features/activites/abilities/repartir-les-accompagnements/implementations/prisma/repartition-des-accompagnements.query'
import { repartitionPresentee } from '@/features/activites/abilities/repartir-les-accompagnements/ui/presenters/repartition.presenter'
import { repartirLesAccompagnementsParTag } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/implementations/prisma/accompagnements-par-tag.query'
import { parTagPresentes } from '@/features/activites/abilities/repartir-les-accompagnements-par-tag/ui/presenters/par-tag.presenter'
import { verifierLaPresenceDeCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/domain/verifier-la-presence-de-cras-v1'
import { mediateurAvecCrasV1 } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/implementations/prisma/mediateur-avec-cras-v1.query'
import { presenceDeCrasV1Presentee } from '@/features/activites/abilities/verifier-la-presence-de-cras-v1/ui/presenters/presence-de-cras-v1.presenter'
import { criteresDesStatistiquesDepuisLURL } from '@/features/activites/fixtures/criteres-depuis-l-url'
import { Prisma } from '@/generated/prisma/client'
import type { QuantifiedShare } from '@/libraries/proportions'
import { computeProportion, partsFixees } from '@/libraries/proportions'
import { MediateurId, perimetreDuDemandeur } from '../../../domain'
import { crasDeDemonstration } from '../../../fixtures/cras-de-demonstration'
import { enregistrerLesCras } from '../../../fixtures/enregistrer-les-cras'
import { tranchesDeDureeDesStatistiques } from '../../../ui/labels/libelles/duree-accompagnement.labels'
import {
  materielLabels,
  materielValues,
} from '../../../ui/labels/libelles/materiel.labels'
import {
  genreLabels,
  genresAffiches,
  statutSocialLabels,
  statutsSociauxAffiches,
  trancheAgeLabels,
  tranchesAgeAffichees,
} from '../../../ui/labels/libelles/profil.labels'
import {
  thematiquesAdministrativesLabels,
  thematiquesAdministrativesValues,
  thematiquesNonAdministrativesLabels,
  thematiquesNonAdministrativesValues,
} from '../../../ui/labels/libelles/thematique.labels'
import {
  typeActiviteLabels,
  typeActiviteValues,
} from '../../../ui/labels/libelles/type-activite.labels'
import {
  typeLieuLabels,
  typeLieuValues,
} from '../../../ui/labels/libelles/type-lieu.labels'
import { statistiquesDuPerimetre } from './statistiques-du-perimetre.query'
import {
  source,
  sourceOptionnelle,
  statistiquesAvec,
} from './statistiques-en-cours.query'

const statistiquesDesActivites = statistiquesAvec({
  totalCounts: source(compterLesAccompagnements, totauxPresentes),
  periode: source(compterLesAccompagnementsParPeriode, parPeriodePresentes),
  repartition: source(repartirLesAccompagnements, repartitionPresentee),
  tags: sourceOptionnelle(repartirLesAccompagnementsParTag, parTagPresentes),
  structures: sourceOptionnelle(
    compterLesAccompagnementsParLieu,
    parLieuPresentes,
  ),
  communes: sourceOptionnelle(
    compterLesAccompagnementsParCommune,
    parCommunePresentes,
  ),
  profil: source(decrireLesPersonnesAccompagnees, profilPresente),
  residences: sourceOptionnelle(
    compterLesPersonnesAccompagneesParCommune,
    personnesParCommunePresentees,
  ),
  hasCrasV1: (perimetre) =>
    verifierLaPresenceDeCrasV1({ mediateurAvecCrasV1 })({ perimetre }).then(
      presenceDeCrasV1Presentee,
    ),
})

const SEL = '1d9df140-9e43-4fa3-b7a4-6656e475ba8d'
const avecActivites = {
  utilisateur: '3c0b65b4-b1f1-47c4-8bde-2a069b6cabc5',
  mediateur: '6ba43d63-f0cc-422d-85b4-6cf7a4741cbd',
}
const sansActivites = {
  utilisateur: '7a97b1d7-75a3-42df-96c3-88ff1587ce6a',
  mediateur: '4b32d51f-f67d-4a89-8600-6c3366cf0e65',
}
const mediateque = {
  id: '683dae62-98e4-46cd-99f0-60e0d50d14d6',
  nom: 'Exemple de Mediateque',
  adresse: '2 rue des livres',
  codePostal: '69002',
  codeInsee: '69382',
  commune: 'Lyon 2eme',
  banId: '69382_0001_00002',
}
const beneficiaires = {
  minimale: '87a92992-ee1a-491b-ba68-b3b882bb569f',
  maximale: 'da657595-c2f8-4cdf-b8e1-423f3c92ae9f',
  sansAccompagnements: '9f260a29-f72e-4a6d-a752-ffdac3c339f4',
  anonyme: '174ad196-cae1-48a3-9390-e1e7bebf2d02',
}

const beneficiairesDuMediateur = [
  {
    id: beneficiaires.minimale,
    prenom: 'Jeanne',
    nom: 'Minimale',
    creation: new Date('2024-01-01'),
    modification: new Date('2024-05-05'),
  },
  {
    id: beneficiaires.maximale,
    prenom: 'Jean',
    nom: 'Maximal',
    telephone: '0123456789',
    pasDeTelephone: false,
    email: 'jean.maximal@coop-numerique.incubateur.anct.gouv.fr',
    anneeNaissance: 1980,
    adresse: '1 rue de la Paix',
    commune: 'Paris',
    communeCodePostal: '75001',
    communeCodeInsee: '75101',
    genre: 'Masculin',
    trancheAge: 'QuaranteCinquanteNeuf',
    statutSocial: 'EnEmploi',
    notes: 'Notes de Jean Maximal',
    creation: new Date('2024-01-01'),
    modification: new Date('2024-05-05'),
  },
  {
    id: beneficiaires.sansAccompagnements,
    prenom: 'Félix',
    nom: 'Sans accompagnements',
    commune: 'Crolles',
    communeCodePostal: '38920',
    communeCodeInsee: '38140',
    genre: 'Masculin',
    trancheAge: 'VingtCinqTrenteNeuf',
    statutSocial: 'EnEmploi',
    creation: new Date('2024-03-03'),
    modification: new Date('2024-06-06'),
  },
  {
    id: beneficiaires.anonyme,
    anonyme: true,
    trancheAge: 'DixHuitVingtQuatre',
    creation: new Date('2024-08-08'),
    modification: new Date('2024-08-12'),
  },
] satisfies Omit<Prisma.BeneficiaireUncheckedCreateInput, 'mediateurId'>[]

const cras = crasDeDemonstration({
  mediateurs: {
    mediateurAvecActivite: avecActivites.mediateur,
    conseillerNumerique: sansActivites.mediateur,
    coordinateurInscritAvecTout: sansActivites.mediateur,
  },
  beneficiaires: {
    minimaleMediateurAvecActivite: beneficiaires.minimale,
    maximaleMediateurAvecActivite: beneficiaires.maximale,
    anonymeMediateurAvecActivite: beneficiaires.anonyme,
    minimaleConseillerNumerique: beneficiaires.minimale,
    maximaleConseillerNumerique: beneficiaires.maximale,
    anonymeConseillerNumerique: beneficiaires.anonyme,
    minimaleCoordinateur: beneficiaires.minimale,
    maximaleCoordinateur: beneficiaires.maximale,
  },
  lieux: { mediateque },
})

const salee = (id: string) => v5(id, SEL)

const duMediateurAvecActivites = ({
  activite,
}: {
  activite: { mediateurId?: string | null }
}) => activite.mediateurId === avecActivites.mediateur

const anonymesDesCollectifs = new Set(
  cras.crasCollectifs.flatMap(({ beneficiairesAnonymes }) =>
    beneficiairesAnonymes.map(({ id }) => id),
  ),
)

const reidentifie = <
  C extends {
    activite: { id: string }
    accompagnements: {
      id?: string
      activiteId: string
      beneficiaireId: string
    }[]
  },
>(
  cra: C,
): C => ({
  ...cra,
  activite: { ...cra.activite, id: salee(cra.activite.id) },
  accompagnements: cra.accompagnements.map((accompagnement) => ({
    ...accompagnement,
    id: salee(accompagnement.id ?? accompagnement.activiteId),
    activiteId: salee(accompagnement.activiteId),
    beneficiaireId: anonymesDesCollectifs.has(accompagnement.beneficiaireId)
      ? salee(accompagnement.beneficiaireId)
      : accompagnement.beneficiaireId,
  })),
})

const crasDuTest = {
  crasIndividuels: cras.crasIndividuels
    .filter(duMediateurAvecActivites)
    .map(reidentifie),
  crasDemarchesAdministratives: cras.crasDemarchesAdministratives
    .filter(duMediateurAvecActivites)
    .map(reidentifie),
  crasCollectifs: cras.crasCollectifs
    .filter(duMediateurAvecActivites)
    .map((cra) => ({
      ...reidentifie(cra),
      beneficiairesAnonymes: cra.beneficiairesAnonymes.map((anonyme) => ({
        ...anonyme,
        id: salee(anonyme.id ?? ''),
      })),
    })),
}

const effacerLeJeuDuTest = async () => {
  const mediateurs = [avecActivites.mediateur, sansActivites.mediateur]
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurs } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurs } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurs } },
  })
  await prismaClient.mediateur.deleteMany({ where: { id: { in: mediateurs } } })
  await prismaClient.user.deleteMany({
    where: {
      id: { in: [avecActivites.utilisateur, sansActivites.utilisateur] },
    },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: mediateque.id } })
}

type ActivitesFilters = Parameters<typeof criteresDesStatistiquesDepuisLURL>[0]

const aucunRendezVous = () => Prisma.sql`SELECT NULL WHERE FALSE`

const statistiquesDuMediateur = ({
  mediateurId,
  activitesFilters,
}: {
  mediateurId: string
  activitesFilters: ActivitesFilters
}) => {
  const perimetre = perimetreDuDemandeur({
    mediateur: MediateurId(mediateurId),
    coordinateur: null,
    equipe: [],
  })
  if (perimetre === null) throw new Error('Périmètre introuvable')
  return statistiquesDesActivites.rassembler(
    statistiquesDuPerimetre(
      statistiquesDesActivites.lancer,
      aucunRendezVous,
    )({
      perimetre,
      criteres: criteresDesStatistiquesDepuisLURL(activitesFilters),
      fin: graphOptions.fin,
    }),
  )
}

type MesStatistiquesPageData = Awaited<
  ReturnType<typeof statistiquesDuMediateur>
>

const graphOptions = {
  fin: new Date('2024-08-15'),
}

const emptyData: MesStatistiquesPageData = {
  accompagnementsParJour: [
    { label: '17/07', count: 0 },
    { label: '18/07', count: 0 },
    { label: '19/07', count: 0 },
    { label: '20/07', count: 0 },
    { label: '21/07', count: 0 },
    { label: '22/07', count: 0 },
    { label: '23/07', count: 0 },
    { label: '24/07', count: 0 },
    { label: '25/07', count: 0 },
    { label: '26/07', count: 0 },
    { label: '27/07', count: 0 },
    { label: '28/07', count: 0 },
    { label: '29/07', count: 0 },
    { label: '30/07', count: 0 },
    { label: '31/07', count: 0 },
    { label: '01/08', count: 0 },
    { label: '02/08', count: 0 },
    { label: '03/08', count: 0 },
    { label: '04/08', count: 0 },
    { label: '05/08', count: 0 },
    { label: '06/08', count: 0 },
    { label: '07/08', count: 0 },
    { label: '08/08', count: 0 },
    { label: '09/08', count: 0 },
    { label: '10/08', count: 0 },
    { label: '11/08', count: 0 },
    { label: '12/08', count: 0 },
    { label: '13/08', count: 0 },
    { label: '14/08', count: 0 },
    { label: '15/08', count: 0 },
  ],
  accompagnementsParMois: [
    { label: '09/23', count: 0 },
    { label: '10/23', count: 0 },
    { label: '11/23', count: 0 },
    { label: '12/23', count: 0 },
    { label: '01/24', count: 0 },
    { label: '02/24', count: 0 },
    { label: '03/24', count: 0 },
    { label: '04/24', count: 0 },
    { label: '05/24', count: 0 },
    { label: '06/24', count: 0 },
    { label: '07/24', count: 0 },
    { label: '08/24', count: 0 },
  ],
  totalCounts: {
    accompagnements: {
      total: 0,
      individuels: {
        total: 0,
        proportion: 0,
      },
      collectifs: {
        total: 0,
        proportion: 0,
      },
    },
    activites: {
      total: 0,
      individuels: {
        total: 0,
        proportion: 0,
      },
      collectifs: {
        total: 0,
        proportion: 0,
        participants: 0,
      },
    },
    beneficiaires: {
      total: 0,
      nouveaux: 0,
      anonymes: 0,
      suivis: 0,
    },
  },
  activites: {
    total: 0,
    typeActivites: partsFixees(typeActiviteValues, typeActiviteLabels),
    thematiques: partsFixees(
      thematiquesNonAdministrativesValues,
      thematiquesNonAdministrativesLabels,
    ),
    thematiquesDemarches: partsFixees(
      thematiquesAdministrativesValues,
      thematiquesAdministrativesLabels,
    ),
    materiels: partsFixees(materielValues, materielLabels),
    typeLieu: partsFixees(typeLieuValues, typeLieuLabels),
    durees: tranchesDeDureeDesStatistiques.map(({ key, label }) => ({
      value: key,
      label,
      count: 0,
      proportion: 0,
    })),
    tags: [],
  },
  beneficiaires: {
    total: 0,
    genres: partsFixees(genresAffiches, genreLabels),
    trancheAges: partsFixees(tranchesAgeAffichees, trancheAgeLabels),
    statutsSocial: partsFixees(statutsSociauxAffiches, statutSocialLabels),
    communes: [],
  },
  structures: [],
  communes: [],

  hasCrasV1: {
    hasCrasV1: false,
  },
}

const createExpectedData = (
  transform: (data: typeof emptyData) => MesStatistiquesPageData,
) => transform(cloneDeep(emptyData))

const expectDayCount = (
  data: MesStatistiquesPageData,
  day: string,
  count: number,
) => {
  const item = data.accompagnementsParJour.find(({ label }) => label === day)
  if (!item) {
    throw new Error(`Day ${day} not found`)
  }
  item.count = count
}

const expectMonthCount = (
  data: MesStatistiquesPageData,
  month: string,
  count: number,
) => {
  const item = data.accompagnementsParMois.find(({ label }) => label === month)
  if (!item) {
    throw new Error(`Month ${month} not found`)
  }
  item.count = count
}

const expectEnum = <T extends string>(
  enumCounts: (QuantifiedShare<string> & { value: T })[],
  value: T,
  count: number,
  total: number,
) => {
  const item = enumCounts.find(({ value: itemValue }) => itemValue === value)
  if (!item) {
    throw new Error(`Value ${value} not found`)
  }
  item.count = count
  item.proportion = computeProportion(count, total)
}

describe('statistiques du périmètre d’un médiateur', () => {
  beforeAll(async () => {
    await effacerLeJeuDuTest()
    await prismaClient.lieuInclusion.create({ data: mediateque })
    await prismaClient.user.createMany({
      data: [avecActivites, sansActivites].map(({ utilisateur }) => ({
        id: utilisateur,
        email: `statistiques-${utilisateur}@integration.test`,
      })),
    })
    await prismaClient.mediateur.createMany({
      data: [avecActivites, sansActivites].map(
        ({ utilisateur, mediateur }) => ({
          id: mediateur,
          userId: utilisateur,
        }),
      ),
    })
    await prismaClient.beneficiaire.createMany({
      data: beneficiairesDuMediateur.map((beneficiaire) => ({
        ...beneficiaire,
        mediateurId: avecActivites.mediateur,
      })),
    })
    await enregistrerLesCras({ transaction: prismaClient, ...crasDuTest })
  })

  afterAll(effacerLeJeuDuTest)

  describe('mediateur sans activites', () => {
    test('should give empty data without filters', async () => {
      const data = await statistiquesDuMediateur({
        mediateurId: sansActivites.mediateur,
        activitesFilters: {},
      })
      expect(data).toEqual(emptyData)
    })
  })

  describe('mediateur avec activites', () => {
    const cases: {
      title: string
      activitesFilters: ActivitesFilters
      expected: MesStatistiquesPageData
    }[] = [
      {
        title: 'should compute all data without filters',
        activitesFilters: {},
        expected: createExpectedData((data) => {
          // Should have 13 beneficiaires
          const totalBeneficiaires = 13

          const totalAccompagnements = 22

          data.totalCounts = {
            activites: {
              total: 10,
              individuels: {
                total: 8,
                proportion: 80,
              },
              collectifs: {
                total: 2,
                proportion: 20,
                participants: 14,
              },
            },
            beneficiaires: {
              total: totalBeneficiaires,
              nouveaux: 0,
              suivis: 2,
              anonymes: 11,
            },
            accompagnements: {
              total: totalAccompagnements,
              collectifs: {
                total: 14,
                proportion: computeProportion(14, totalAccompagnements),
              },
              individuels: {
                total: 8,
                proportion: computeProportion(8, totalAccompagnements),
              },
            },
          }

          data.activites.total = totalAccompagnements

          expectDayCount(data, '28/07', 2)
          expectDayCount(data, '02/08', 2)
          expectDayCount(data, '03/08', 2)
          expectDayCount(data, '04/08', 2)
          expectDayCount(data, '05/08', 1)

          expectMonthCount(data, '06/24', 1)
          expectMonthCount(data, '07/24', 14)
          expectMonthCount(data, '08/24', 7)

          expectEnum(data.activites.typeLieu, 'Domicile', 2, 22)
          expectEnum(data.activites.typeLieu, 'ADistance', 18, 22)
          expectEnum(data.activites.typeLieu, 'LieuActivite', 2, 22)
          expectEnum(data.activites.typeLieu, 'Autre', 0, 22)

          expectEnum(data.activites.durees, '120', 22, totalAccompagnements)

          expectEnum(data.activites.materiels, 'Ordinateur', 4, 13)
          expectEnum(data.activites.materiels, 'Telephone', 2, 13)
          expectEnum(data.activites.materiels, 'Tablette', 3, 13)
          expectEnum(data.activites.materiels, 'Autre', 4, 13)
          // before

          expectEnum(data.activites.thematiques, 'Email', 4, 39)
          expectEnum(data.activites.thematiques, 'ReseauxSociaux', 14, 39)
          expectEnum(data.activites.thematiques, 'Sante', 2, 39)
          expectEnum(
            data.activites.thematiques,
            'InsertionProfessionnelle',
            1,
            39,
          )
          expectEnum(data.activites.thematiques, 'Parentalite', 1, 39)
          expectEnum(data.activites.thematiques, 'CultureNumerique', 13, 39)
          expectEnum(
            data.activites.thematiques,
            'AideAuxDemarchesAdministratives',
            4,
            39,
          )

          expectEnum(
            data.activites.thematiquesDemarches,
            'FamilleScolarite',
            1,
            8,
          )
          expectEnum(data.activites.thematiquesDemarches, 'SocialSante', 3, 8)
          expectEnum(data.activites.thematiquesDemarches, 'Logement', 1, 8)
          expectEnum(
            data.activites.thematiquesDemarches,
            'TransportsMobilite',
            1,
            8,
          )
          expectEnum(data.activites.thematiquesDemarches, 'Justice', 1, 8)
          expectEnum(
            data.activites.thematiquesDemarches,
            'EtrangersEurope',
            1,
            8,
          )

          // after
          expectEnum(
            data.activites.typeActivites,
            'Collectif',
            14,
            totalAccompagnements,
          )
          expectEnum(
            data.activites.typeActivites,
            'Individuel',
            8,
            totalAccompagnements,
          )

          expectEnum(
            data.beneficiaires.genres,
            'Masculin',
            1,
            totalBeneficiaires,
          )
          expectEnum(
            data.beneficiaires.genres,
            'NonCommunique',
            12,
            totalBeneficiaires,
          )

          expectEnum(
            data.beneficiaires.statutsSocial,
            'EnEmploi',
            9,
            totalBeneficiaires,
          )
          expectEnum(
            data.beneficiaires.statutsSocial,
            'Scolarise',
            2,
            totalBeneficiaires,
          )
          expectEnum(
            data.beneficiaires.statutsSocial,
            'NonCommunique',
            2,
            totalBeneficiaires,
          )

          expectEnum(
            data.beneficiaires.trancheAges,
            'QuaranteCinquanteNeuf',
            6,
            totalBeneficiaires,
          )
          expectEnum(
            data.beneficiaires.trancheAges,
            'VingtCinqTrenteNeuf',
            3,
            totalBeneficiaires,
          )
          expectEnum(
            data.beneficiaires.trancheAges,
            'DixHuitVingtQuatre',
            1,
            totalBeneficiaires,
          )
          expectEnum(
            data.beneficiaires.trancheAges,
            'NonCommunique',
            3,
            totalBeneficiaires,
          )

          data.beneficiaires.total = totalBeneficiaires

          data.beneficiaires.communes = [
            {
              codeInsee: null,
              codePostal: null,
              count: 12,
              label: 'Non communiqué',
              nom: null,
              proportion: 92.308,
            },
            {
              codeInsee: '75101',
              codePostal: '75001',
              label: 'Paris · 75001',
              nom: 'Paris',
              count: 1,
              proportion: 7.692,
            },
          ]

          data.structures = [
            {
              id: mediateque.id,
              count: 2,
              proportion: 100,
              label: mediateque.nom,
            },
          ]

          data.communes = [
            {
              codeInsee: null,
              codePostal: null,
              commune: null,
              count: 17,
              label: 'Non communiqué',
              proportion: 77.273,
            },
            {
              codeInsee: '69382',
              codePostal: '69002',
              commune: 'Lyon 2eme',
              count: 3,
              label: 'Lyon 2eme · 69002',
              proportion: 13.636,
            },
            {
              codeInsee: '75101',
              codePostal: '75001',
              commune: 'Paris 1er',
              count: 2,
              label: 'Paris 1er · 75001',
              proportion: 9.091,
            },
          ]

          return data
        }),
      },
    ]

    test.each(cases)('$title', async ({ activitesFilters, expected }) => {
      const data = await statistiquesDuMediateur({
        mediateurId: avecActivites.mediateur,
        activitesFilters,
      })

      expect(data).toEqual(expected)
    })
  })
})
