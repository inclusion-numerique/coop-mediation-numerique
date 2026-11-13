import { vocabulaireDeLaBarre } from '@app/web/composition/statistiques/barre'
import { MesStatistiquesPageData } from '@app/web/composition/statistiques/mes-statistiques'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@app/web/composition/statistiques/sections'
import {
  dureeAccompagnementParDefautLabels,
  dureeAcompagnementParDefautDefaultValues,
} from '@app/web/features/activites/ui/libelles/duree-accompagnement'
import {
  materielLabels,
  materielValues,
} from '@app/web/features/activites/ui/libelles/materiel'
import {
  genreLabels,
  genresAffiches,
  statutSocialLabels,
  statutsSociauxAffiches,
  trancheAgeLabels,
  tranchesAgeAffichees,
} from '@app/web/features/activites/ui/libelles/profil'
import {
  thematiquesAdministrativesLabels,
  thematiquesAdministrativesValues,
  thematiquesNonAdministrativesLabels,
  thematiquesNonAdministrativesValues,
} from '@app/web/features/activites/ui/libelles/thematique'
import {
  typeActiviteLabels,
  typeActiviteValues,
} from '@app/web/features/activites/ui/libelles/type-activite'
import {
  typeLieuLabels,
  typeLieuValues,
} from '@app/web/features/activites/ui/libelles/type-lieu'
import { REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY } from '@app/web/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.key'
import { PartageStatistiques } from '@app/web/features/mediateurs/abilities/regler-le-partage-statistiques/ui'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@app/web/features/statistiques/ui/filtres/rechercher-les-lieux-des-statistiques.key'
import { ServerActionSuccess } from '@app/web/libraries/nextjs/action/result'
import { provide } from '@app/web/libs/injection/client'
import { partsFixees } from '@app/web/libs/statistiques/parts-fixees'
import { testSessionUser } from '@app/web/test/testSessionUser'
import { Meta, StoryObj } from '@storybook/react'
import { MesStatistiques } from './MesStatistiques'

const statistiquesPageData = {
  activiteDates: {
    first: new Date('2024-03-02'),
    last: new Date('2024-08-30'),
  },
  accompagnementsParJour: [
    { label: '01/08', count: 8 },
    { label: '02/08', count: 7 },
    { label: '03/08', count: 9 },
    { label: '04/08', count: 6 },
    { label: '05/08', count: 9 },
    { label: '06/08', count: 0 },
    { label: '07/08', count: 0 },
    { label: '08/08', count: 9 },
    { label: '09/08', count: 5 },
    { label: '10/08', count: 40 },
    { label: '11/08', count: 6 },
    { label: '12/08', count: 7 },
    { label: '13/08', count: 0 },
    { label: '14/08', count: 0 },
    { label: '15/08', count: 8 },
    { label: '16/08', count: 9 },
    { label: '17/08', count: 6 },
    { label: '18/08', count: 7 },
    { label: '19/08', count: 9 },
    { label: '20/08', count: 0 },
    { label: '21/08', count: 0 },
    { label: '22/08', count: 9 },
    { label: '23/08', count: 7 },
    { label: '24/08', count: 8 },
    { label: '25/08', count: 6 },
    { label: '26/08', count: 9 },
    { label: '27/08', count: 0 },
    { label: '28/08', count: 0 },
    { label: '29/08', count: 10 },
    { label: '30/08', count: 9 },
  ],
  accompagnementsParMois: [
    { label: 'Mars', count: 305 },
    { label: 'Avr.', count: 275 },
    { label: 'Mai', count: 320 },
    { label: 'Juin', count: 330 },
    { label: 'Juil.', count: 340 },
    { label: 'Août', count: 350 },
  ],
  totalCounts: {
    accompagnements: {
      total: 3300,
      individuels: {
        total: 1650,
        proportion: 50,
      },
      collectifs: {
        total: 1350,
        proportion: 40,
      },
    },
    activites: {
      total: 1000,
      individuels: {
        total: 500,
        proportion: 50,
      },
      collectifs: {
        total: 400,
        proportion: 40,
        participants: 2500,
      },
    },
    beneficiaires: {
      total: 550,
      nouveaux: 0,
      anonymes: 120,
      suivis: 430,
    },
  },
  activites: {
    total: 1000,
    typeActivites: partsFixees(
      typeActiviteValues,
      typeActiviteLabels,
      [400, 350, 250],
    ),
    thematiques: partsFixees(
      thematiquesNonAdministrativesValues,
      thematiquesNonAdministrativesLabels,
      [80, 100, 90, 70, 60, 40, 30, 20, 25, 10, 10, 10, 10, 5],
    ),
    thematiquesDemarches: partsFixees(
      thematiquesAdministrativesValues,
      thematiquesAdministrativesLabels,
      [100, 90, 80, 60, 50, 40, 30, 20, 10, 10],
    ),
    materiels: partsFixees(
      materielValues,
      materielLabels,
      [300, 200, 150, 120, 230],
    ),
    typeLieu: partsFixees(typeLieuValues, typeLieuLabels, [250, 450, 50, 250]),
    durees: partsFixees(
      dureeAcompagnementParDefautDefaultValues,
      dureeAccompagnementParDefautLabels,
      [300, 400, 200, 100],
    ),
    tags: [],
  },
  beneficiaires: {
    total: 550,
    genres: partsFixees(genresAffiches, genreLabels, [70, 80, 400]),
    trancheAges: partsFixees(
      tranchesAgeAffichees,
      trancheAgeLabels,
      [50, 60, 80, 100, 120, 140, 200],
    ),
    statutsSocial: partsFixees(
      statutsSociauxAffiches,
      statutSocialLabels,
      [50, 60, 70, 80, 290],
    ),
    communes: [
      {
        nom: 'Paris',
        codeInsee: '75056',
        codePostal: '75000',
        count: 50,
        label: 'Paris',
        proportion: 20,
      },
      {
        nom: 'Lyon',
        codeInsee: '69123',
        codePostal: '69000',
        count: 30,
        label: 'Lyon',
        proportion: 12,
      },
      {
        nom: 'Marseille',
        codeInsee: '13055',
        codePostal: '13000',
        count: 40,
        label: 'Marseille',
        proportion: 16,
      },
      {
        nom: 'Nice',
        codeInsee: '06088',
        codePostal: '06000',
        count: 20,
        label: 'Nice',
        proportion: 8,
      },
    ],
  },
  structures: [
    {
      id: '1',
      count: 120,
      label: 'Structure A',
      proportion: 40,
    },
    {
      id: '2',
      count: 80,
      label: 'Structure B',
      proportion: 30,
    },
    {
      id: '3',
      count: 50,
      label: 'Structure C',
      proportion: 17,
    },
    {
      id: '4',
      count: 50,
      label: 'Structure D',
      proportion: 17,
    },
  ],
  communes: [
    {
      commune: 'Paris',
      codePostal: '75000',
      codeInsee: '75056',
      count: 120,
      label: 'Paris · 75000',
      proportion: 40,
    },
    {
      commune: 'Lyon',
      codePostal: '69000',
      codeInsee: '69123',
      count: 80,
      label: 'Lyon · 69000',
      proportion: 30,
    },
    {
      commune: 'Marseille',
      codePostal: '13000',
      codeInsee: '13055',
      count: 50,
      label: 'Marseille · 13000',
      proportion: 17,
    },
    {
      commune: 'Nice',
      codePostal: '06000',
      codeInsee: '06088',
      count: 50,
      label: 'Nice · 06000',
      proportion: 17,
    },
  ],
  activitesFilters: {},
  communesOptions: [],
  departementsOptions: [],
  initialBeneficiairesOptions: [],
  initialMediateursOptions: [],
  lieuxActiviteOptions: [],
  structuresEmployeusesOptions: [],
  tagsOptions: [],
  hasCrasV1: {
    hasCrasV1: false,
  },
  vocabulaire: vocabulaireDeLaBarre,
  activiteSourceOptions: [],
} satisfies MesStatistiquesPageData

export default {
  title: 'Mes statistiques',
  component: MesStatistiques,
  decorators: [
    (Story) => {
      provide(RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY, async () =>
        ServerActionSuccess([]),
      )
      provide(REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY, async () =>
        ServerActionSuccess(undefined),
      )
      return <Story />
    },
  ],
} satisfies Meta<typeof MesStatistiques>

type Story = StoryObj<typeof MesStatistiques>

export const Statistiques: Story = {
  name: 'Statistiques',
  args: {
    ...statistiquesPageData,
    user: testSessionUser,
    hasCrasV1: statistiquesPageData.hasCrasV1.hasCrasV1,
    accompagnementsCount:
      statistiquesPageData.totalCounts.accompagnements.total,
    partage: <PartageStatistiques liens={[]} />,
    impression: impressionDesStatistiques(statistiquesPageData),
    generale: sectionGenerale(statistiquesPageData, {}),
    activites: sectionActivites(statistiquesPageData, { canManageTags: true }),
    beneficiaires: sectionBeneficiaires(statistiquesPageData),
  },
}
