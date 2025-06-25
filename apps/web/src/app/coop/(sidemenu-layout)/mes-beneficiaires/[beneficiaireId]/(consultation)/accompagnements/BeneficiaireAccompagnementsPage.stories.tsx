import {
  beneficiaireMaximaleMediateurAvecActivite,
  beneficiaireMinimaleMediateurAvecActivite,
} from '@app/fixtures/beneficiaires'
import ViewBeneficiaireLayout from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/ViewBeneficiaireLayout'
import ViewBeneficiaireAccompagnementsPage from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/ViewBeneficiaireAccompagnementsPage'
import { BeneficiaireAccompagnementsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireAccompagnementsPageData'
import { ActiviteListItem } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { rdvsForStories } from '@app/web/features/activites/use-cases/list/storybook/ActiviteDetailsStoriesData'
import type { Rdv } from '@app/web/rdv-service-public/Rdv'
import { testSessionUser } from '@app/web/test/testSessionUser'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

const Template = ({ data }: { data: BeneficiaireAccompagnementsPageData }) => (
  <ViewBeneficiaireLayout
    beneficiaire={data.beneficiaire}
    user={testSessionUser}
  >
    <ViewBeneficiaireAccompagnementsPage data={data} />
  </ViewBeneficiaireLayout>
)

const meta: Meta<typeof ViewBeneficiaireAccompagnementsPage> = {
  title: 'Mes bénéficiaires/Consultation/Accompagnements',
  component: ViewBeneficiaireAccompagnementsPage,
}

export default meta

type Story = StoryObj<typeof ViewBeneficiaireAccompagnementsPage>

const beneficiaireSansAccompagnements = {
  ...beneficiaireMinimaleMediateurAvecActivite,
  _count: {
    accompagnements: 0,
  },
} satisfies BeneficiaireAccompagnementsPageData['beneficiaire']

const sansAccompagnements = {
  beneficiaire: beneficiaireSansAccompagnements,
  activites: [],
  rdvs: [],
  activitesAndRdvs: [],
  user: testSessionUser,
} satisfies BeneficiaireAccompagnementsPageData

export const SansAccompagnements: Story = {
  name: 'Sans accompagnements',
  render: (args) => <Template {...args} />,
  args: {
    data: sansAccompagnements,
  },
}

const beneficiaireAvecAccompagnements = {
  ...beneficiaireMaximaleMediateurAvecActivite,
  _count: {
    accompagnements: 6,
  },
} satisfies BeneficiaireAccompagnementsPageData['beneficiaire']

const activites = [
  {
    type: 'Collectif',
    id: '1',
    timezone: 'Europe/Paris',
    mediateurId: '2',
    date: new Date('2024-07-07T00:00:00.000Z'),
    creation: new Date('2024-07-07T00:00:00.000Z'),
    modification: new Date('2024-07-07T00:00:00.000Z'),
    niveau: 'Intermediaire',
    thematiques: ['ReseauxSociaux', 'CultureNumerique'],
    autonomie: null,
    orienteVersStructure: null,
    structureDeRedirection: null,
    precisionsDemarche: null,
    materiel: [],
    typeLieu: 'Autre',
    titreAtelier: 'Vos données personnelles sur instagram et facebook',
    lieuCodePostal: '69002',
    lieuCommune: 'Lyon 2',
    structure: null,
    notes: null,
    accompagnements: [
      {
        premierAccompagnement: false,
        beneficiaire: beneficiaireAvecAccompagnements,
      },
    ],
    lieuCodeInsee: null,
    duree: 60,
    rdvServicePublicId: 13,
  },
  {
    timezone: 'Europe/Paris',
    type: 'Individuel',
    id: '2',
    mediateurId: '3',
    accompagnements: [
      {
        premierAccompagnement: false,
        beneficiaire: beneficiaireAvecAccompagnements,
      },
    ],
    date: new Date('2024-07-05T00:00:00.000Z'),
    creation: new Date('2024-07-05T00:00:00.000Z'),
    modification: new Date('2024-07-05T00:00:00.000Z'),
    thematiques: ['Email', 'Parentalite'],
    autonomie: 'EntierementAccompagne',
    duree: 60,
    typeLieu: 'ADistance',
    precisionsDemarche: null,
    niveau: null,
    titreAtelier: null,
    lieuCodePostal: null,
    lieuCommune: null,
    lieuCodeInsee: null,
    structureDeRedirection: null,
    orienteVersStructure: null,
    materiel: [],
    notes: null,
    structure: null,
    rdvServicePublicId: null,
  },
  {
    timezone: 'Europe/Paris',
    type: 'Individuel',
    id: '3',
    mediateurId: '3',
    accompagnements: [
      {
        premierAccompagnement: false,
        beneficiaire: beneficiaireAvecAccompagnements,
      },
    ],
    date: new Date('2024-07-05T00:00:00.000Z'),
    creation: new Date('2024-07-05T00:00:00.000Z'),
    modification: new Date('2024-07-05T00:00:00.000Z'),
    thematiques: [
      'Email',
      'Sante',
      'BanqueEtAchatsEnLigne',
      'PrendreEnMainDuMateriel',
      'InsertionProfessionnelle',
      'NavigationSurInternet',
      'CreerAvecLeNumerique',
      'ScolariteEtNumerique',
    ],
    titreAtelier: null,
    niveau: null,
    precisionsDemarche: null,
    autonomie: null,
    duree: 60,
    typeLieu: 'ADistance',
    lieuCodePostal: null,
    lieuCommune: null,
    lieuCodeInsee: null,
    structureDeRedirection: null,
    orienteVersStructure: null,
    materiel: [],
    notes: null,
    structure: null,
    rdvServicePublicId: 13,
  },
  {
    timezone: 'Europe/Paris',
    type: 'Individuel',
    id: '4',
    mediateurId: '3',
    accompagnements: [
      {
        premierAccompagnement: false,
        beneficiaire: beneficiaireAvecAccompagnements,
      },
    ],
    date: new Date('2024-07-05T00:00:00.000Z'),
    creation: new Date('2024-07-05T00:00:00.000Z'),
    modification: new Date('2024-07-05T00:00:00.000Z'),
    autonomie: 'Autonome',
    duree: 60,
    precisionsDemarche: 'Demande de logement social',
    typeLieu: 'ADistance',
    lieuCodePostal: null,
    lieuCommune: null,
    lieuCodeInsee: null,
    structureDeRedirection: null,
    materiel: [],
    notes: null,
    niveau: null,
    titreAtelier: null,
    orienteVersStructure: false,
    structure: null,
    thematiques: ['SocialSante', 'Logement'],
    rdvServicePublicId: null,
  },
  {
    timezone: 'Europe/Paris',
    type: 'Individuel',
    id: '5',
    mediateurId: '3',
    accompagnements: [
      {
        premierAccompagnement: false,
        beneficiaire: beneficiaireAvecAccompagnements,
      },
    ],
    date: new Date('2024-07-05T00:00:00.000Z'),
    creation: new Date('2024-07-05T00:00:00.000Z'),
    modification: new Date('2024-07-05T00:00:00.000Z'),
    autonomie: null,
    duree: 60,
    precisionsDemarche: 'Déclaration de situation judiciaire',
    typeLieu: 'ADistance',
    lieuCodePostal: null,
    lieuCommune: null,
    lieuCodeInsee: null,
    structureDeRedirection: null,
    materiel: [],
    notes: null,
    niveau: null,
    titreAtelier: null,
    orienteVersStructure: false,
    structure: null,
    thematiques: ['SocialSante', 'Justice'],
    rdvServicePublicId: 13,
  },
  {
    timezone: 'Europe/Paris',
    type: 'Collectif',
    id: '6',
    mediateurId: '3',
    accompagnements: [
      {
        premierAccompagnement: false,
        beneficiaire: beneficiaireAvecAccompagnements,
      },
    ],
    date: new Date('2024-07-05T00:00:00.000Z'),
    creation: new Date('2024-07-05T00:00:00.000Z'),
    modification: new Date('2024-07-05T00:00:00.000Z'),
    niveau: 'Debutant',
    thematiques: [
      'Email',
      'ReseauxSociaux',
      'BanqueEtAchatsEnLigne',
      'PrendreEnMainDuMateriel',
      'InsertionProfessionnelle',
      'NavigationSurInternet',
      'CreerAvecLeNumerique',
      'ScolariteEtNumerique',
    ],
    autonomie: null,
    orienteVersStructure: null,
    typeLieu: 'Autre',
    precisionsDemarche: null,
    structureDeRedirection: null,
    titreAtelier: "Introduction à l'utilisation d'outils numériques",
    lieuCodePostal: '69002',
    lieuCommune: 'Lyon 2',
    lieuCodeInsee: null,
    materiel: [],
    duree: 60,
    structure: null,
    notes: null,
    rdvServicePublicId: 12,
  },
] satisfies ActiviteListItem[]

const rdvs = rdvsForStories satisfies Rdv[]

const avecAccompagnements = {
  beneficiaire: beneficiaireAvecAccompagnements,
  activites,
  rdvs,
  activitesAndRdvs: [...rdvs, ...activites].sort((a, b) => {
    return a.date.getTime() - b.date.getTime()
  }),
  user: testSessionUser,
} satisfies BeneficiaireAccompagnementsPageData

export const AvecAccompagnements: Story = {
  name: 'Avec accompagnements',
  render: (args) => <Template {...args} />,
  args: {
    data: avecAccompagnements,
  },
}
