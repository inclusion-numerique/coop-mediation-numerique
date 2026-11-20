import { cloneDeep } from 'lodash-es'
import { beforeAll, describe, expect, test } from 'vitest'
import { prismaClient } from '@/configuration/prisma/prismaClient'
import { seedPersonnesMain } from '@/features/utilisateurs/fixtures/personnesMainConseillerNumerique'
import { resetFixtureUser } from '@/features/utilisateurs/fixtures/resetFixtureUser'
import { conseillerNumerique } from '@/features/utilisateurs/fixtures/users/conseillerNumerique'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
} from '@/features/utilisateurs/fixtures/users/mediateurAvecActivite'
import {
  mediateurSansActivites,
  mediateurSansActivitesMediateurId,
} from '@/features/utilisateurs/fixtures/users/mediateurSansActivites'
import { mediateque, seedStructures } from '@/fixtures/structures'
import { Prisma } from '@/generated/prisma/client'
import { computeProportion } from '@/libraries/proportions'
import { partsFixees } from '@/libraries/proportions/parts-fixees'
import type { QuantifiedShare } from '@/libraries/proportions/quantifiedShare'
import {
  criteresDesStatistiques,
  MediateurId,
  perimetreDuDemandeur,
} from '../../domain'
import { dureeAccompagnementStatisticsRanges } from '../../ui/libelles/duree-accompagnement'
import { materielLabels, materielValues } from '../../ui/libelles/materiel'
import {
  genreLabels,
  genresAffiches,
  statutSocialLabels,
  statutsSociauxAffiches,
  trancheAgeLabels,
  tranchesAgeAffichees,
} from '../../ui/libelles/profil'
import {
  thematiquesAdministrativesLabels,
  thematiquesAdministrativesValues,
  thematiquesNonAdministrativesLabels,
  thematiquesNonAdministrativesValues,
} from '../../ui/libelles/thematique'
import {
  typeActiviteLabels,
  typeActiviteValues,
} from '../../ui/libelles/type-activite'
import { typeLieuLabels, typeLieuValues } from '../../ui/libelles/type-lieu'
import { statistiquesDuPerimetre } from './statistiques-du-perimetre'
import { rassembler } from './statistiques-fournies'

type ActivitesFilters = Parameters<typeof criteresDesStatistiques>[0]

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
  return rassembler(
    statistiquesDuPerimetre(aucunRendezVous)({
      perimetre,
      filtres: activitesFilters,
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
    durees: dureeAccompagnementStatisticsRanges.map(({ key, label }) => ({
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
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
    await resetFixtureUser(mediateurSansActivites, false)
    await resetFixtureUser(conseillerNumerique, false)
    await seedPersonnesMain(prismaClient, [
      mediateurAvecActivite,
      mediateurSansActivites,
      conseillerNumerique,
    ])
  }, 100_000)

  describe('mediateur sans activites', () => {
    test('should give empty data without filters', async () => {
      const data = await statistiquesDuMediateur({
        mediateurId: mediateurSansActivitesMediateurId,
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
        mediateurId: mediateurAvecActiviteMediateurId,
        activitesFilters,
      })

      expect(data).toEqual(expected)
    })
  })
})
