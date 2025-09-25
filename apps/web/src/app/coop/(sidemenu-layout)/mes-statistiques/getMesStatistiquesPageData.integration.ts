import { refreshFixturesComputedFields } from '@app/fixtures/refreshFixturesComputedFields'
import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { mediateque, seedStructures } from '@app/fixtures/structures'
import { conseillerNumerique } from '@app/fixtures/users/conseillerNumerique'
import {
  mediateurAvecActivite,
  mediateurAvecActiviteMediateurId,
  mediateurAvecActiviteUserId,
} from '@app/fixtures/users/mediateurAvecActivite'
import {
  mediateurSansActivites,
  mediateurSansActivitesUserId,
} from '@app/fixtures/users/mediateurSansActivites'
import { computeProportion } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/allocatePercentages'
import {
  getMesStatistiquesPageData,
  MesStatistiquesGraphOptions,
  MesStatistiquesPageData,
} from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import { QuantifiedShare } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/quantifiedShare'
import { emptyQuantifiedSharesFromEnum } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/statistiquesFixturesHelpers'
import {
  genreLabels,
  statutSocialLabels,
  trancheAgeLabels,
} from '@app/web/beneficiaire/beneficiaire'
import { dureeAccompagnementStatisticsRanges } from '@app/web/features/activites/use-cases/cra/fields/duree-accompagnement'
import { materielLabels } from '@app/web/features/activites/use-cases/cra/fields/materiel'
import {
  thematiquesAdministrativesLabels,
  thematiquesNonAdministrativesLabels,
} from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { typeActiviteLabels } from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import { typeLieuLabels } from '@app/web/features/activites/use-cases/cra/fields/type-lieu'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import { getInitialBeneficiairesOptionsForSearch } from '@app/web/features/beneficiaires/db/getInitialBeneficiairesOptionsForSearch'
import { prismaClient } from '@app/web/prismaClient'
import { UserDisplayName, UserProfile } from '@app/web/utils/user'
import { cloneDeep } from 'lodash-es'

/**
 * Base empty data for all tests
 */

// Fixed graph end date
const graphOptions = {
  fin: new Date('2024-08-15'),
} satisfies MesStatistiquesGraphOptions

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
    { label: 'Sep.', count: 0 },
    { label: 'Oct.', count: 0 },
    { label: 'Nov.', count: 0 },
    { label: 'Déc.', count: 0 },
    { label: 'Jan.', count: 0 },
    { label: 'Fév.', count: 0 },
    { label: 'Mars', count: 0 },
    { label: 'Avr.', count: 0 },
    { label: 'Mai', count: 0 },
    { label: 'Juin', count: 0 },
    { label: 'Juil.', count: 0 },
    { label: 'Août', count: 0 },
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
    typeActivites: emptyQuantifiedSharesFromEnum(typeActiviteLabels),
    thematiques: emptyQuantifiedSharesFromEnum(
      thematiquesNonAdministrativesLabels,
    ),
    thematiquesDemarches: emptyQuantifiedSharesFromEnum(
      thematiquesAdministrativesLabels,
    ),
    materiels: emptyQuantifiedSharesFromEnum(materielLabels),
    typeLieu: emptyQuantifiedSharesFromEnum(typeLieuLabels),
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
    genres: emptyQuantifiedSharesFromEnum(genreLabels),
    trancheAges: emptyQuantifiedSharesFromEnum(trancheAgeLabels),
    statutsSocial: emptyQuantifiedSharesFromEnum(statutSocialLabels),
    communes: [],
  },
  structures: [],

  activitesFilters: {},
  communesOptions: [],
  departementsOptions: [],
  tagsOptions: [],
  initialBeneficiairesOptions: [],
  initialMediateursOptions: [],
  lieuxActiviteOptions: [],
  activiteSourceOptions: [],
  activiteDates: {
    first: undefined,
    last: undefined,
  },
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

describe('getMesStatistiquesPageData', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
    await resetFixtureUser(mediateurSansActivites, false)
    await resetFixtureUser(conseillerNumerique, false)
    await refreshFixturesComputedFields()
  }, 100_000)

  describe('mediateur sans activites', () => {
    test('should give empty data without filters', async () => {
      const user = await prismaClient.user.findUnique({
        where: { id: mediateurSansActivitesUserId },
        select: {
          mediateur: true,
          emplois: {
            include: {
              structure: true,
            },
          },
        },
      })

      const data = await getMesStatistiquesPageData({
        user: user as unknown as UserDisplayName & UserProfile,
        activitesFilters: {},
        graphOptions,
      })
      expect(data).toEqual({
        ...emptyData,
        lieuxActiviteOptions: [
          {
            label: mediateque.nom,
            value: mediateque.id,
            extra: {
              activites: 4,
              adresse: '2 rue des livres, 69002 Lyon 2eme',
              mostUsed: true,
              nom: 'Exemple de Mediateque',
            },
          },
        ],
      })
    })
  })

  describe('mediateur avec activites', () => {
    const cases: {
      title: string
      activitesFilters: ActivitesFilters
      expected: Omit<MesStatistiquesPageData, 'activitesFilters'>
    }[] = [
      {
        title: 'should compute all data without filters',
        activitesFilters: {},
        expected: createExpectedData((data) => {
          // Should have 22 activites
          const totalActivites = 22

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
                total: 2,
                proportion: computeProportion(14, totalAccompagnements),
              },
              individuels: {
                total: 8,
                proportion: computeProportion(8, totalAccompagnements),
              },
            },
          }

          data.activites.total = totalActivites

          expectDayCount(data, '28/07', 2)
          expectDayCount(data, '02/08', 2)
          expectDayCount(data, '03/08', 2)
          expectDayCount(data, '04/08', 2)
          expectDayCount(data, '05/08', 1)

          expectMonthCount(data, 'Juin', 1)
          expectMonthCount(data, 'Juil.', 14)
          expectMonthCount(data, 'Août', 7)

          expectEnum(data.activites.typeLieu, 'Domicile', 2, 22)
          expectEnum(data.activites.typeLieu, 'ADistance', 20, 22)
          expectEnum(data.activites.typeLieu, 'LieuActivite', 0, 22)
          expectEnum(data.activites.typeLieu, 'Autre', 0, 22)

          expectEnum(data.activites.durees, '120', 22, totalActivites)

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
            totalActivites,
          )
          expectEnum(
            data.activites.typeActivites,
            'Individuel',
            8,
            totalActivites,
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
              codePostal: mediateque.codePostal,
              codeInsee: mediateque.codeInsee,
              commune: mediateque.commune,
              count: 2,
              proportion: 100,
              nom: mediateque.nom,
              label: mediateque.nom,
            },
          ]

          data.activiteDates.first = new Date('2024-06-15')
          data.activiteDates.last = new Date('2024-08-05')

          return data
        }),
      },
    ]

    const mediateurId = mediateurAvecActiviteMediateurId

    let expectedCommon: Pick<
      MesStatistiquesPageData,
      | 'communesOptions'
      | 'departementsOptions'
      | 'initialBeneficiairesOptions'
      | 'lieuxActiviteOptions'
      | 'activiteSourceOptions'
    >

    beforeAll(async () => {
      expectedCommon = {
        communesOptions: [
          {
            value: '69382',
            label: 'Lyon 2eme · 69002',
          },
          {
            value: '75101',
            label: 'Paris 1er · 75001',
          },
        ],
        departementsOptions: [
          {
            value: '69',
            label: '69 · Rhône',
          },
          {
            value: '75',
            label: '75 · Paris',
          },
        ],
        initialBeneficiairesOptions:
          await getInitialBeneficiairesOptionsForSearch({ mediateurId }),
        lieuxActiviteOptions: [
          {
            label: mediateque.nom,
            value: mediateque.id,
            extra: {
              activites: 4,
              adresse: '2 rue des livres, 69002 Lyon 2eme',
              mostUsed: true,
              nom: 'Exemple de Mediateque',
            },
          },
        ],
        activiteSourceOptions: [],
      }
    })

    test.each(cases)('$title', async ({ activitesFilters, expected }) => {
      const user = await prismaClient.user.findUnique({
        where: { id: mediateurAvecActiviteUserId },
        select: {
          mediateur: true,
          emplois: {
            include: {
              structure: true,
            },
          },
        },
      })

      const data = await getMesStatistiquesPageData({
        user: user as unknown as UserDisplayName & UserProfile,
        activitesFilters,
        graphOptions,
      })

      const completeExpectedData = {
        ...expected,
        ...expectedCommon,
        activitesFilters,
      } satisfies MesStatistiquesPageData

      expect(data).toEqual(completeExpectedData)
    })
  })
})
