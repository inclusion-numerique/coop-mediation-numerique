import { testSessionUser } from '@app/web/test/testSessionUser'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import ActivitesListeLayout from './components/ActivitesListeLayout'
import { groupActivitesAndRdvsByDate } from './components/groupActivitesAndRdvsByDate'
import MesActivitesListeEmptyPage from './components/MesActivitesListeEmptyPage'
import { ActivitesListPageData } from './getActivitesListPageData'
import MesActivitesListePage from './MesActivitesListePage'
import {
  activitesForModalStories,
  rdvsForStories,
} from './storybook/ActiviteDetailsStoriesData'

const TemplateListe = ({ data }: { data: ActivitesListPageData }) => (
  <ActivitesListeLayout vue="liste" href="/coop/mes-activites">
    <MesActivitesListePage data={Promise.resolve(data)} />
  </ActivitesListeLayout>
)

const TemplateEmpty = () => (
  <ActivitesListeLayout vue="liste" empty href="/coop/mes-activites">
    <MesActivitesListeEmptyPage />
  </ActivitesListeLayout>
)

const meta: Meta<typeof MesActivitesListePage> = {
  title: 'Activités/Liste/Cards',
  component: MesActivitesListePage,
}

export default meta

type Story = StoryObj<typeof TemplateListe>

export const SansActivites: Story = {
  name: 'Sans activités',
  render: () => <TemplateEmpty />,
  args: {},
}

const dataAvecActivites = {
  searchParams: {},
  isFiltered: false,
  mediateurId: '1',
  searchResult: {
    activitesMatchesCount: activitesForModalStories.length,
    accompagnementsMatchesCount: activitesForModalStories
      .map(({ accompagnements }) => accompagnements.length)
      .reduce((a, b) => a + b, 0),
    moreResults: 0,
    totalPages: 1,
    items: [
      ...activitesForModalStories.map((activite) => ({
        kind: 'activite' as const,
        ...activite,
      })),
      ...rdvsForStories.map((rdv) => ({
        kind: 'rdv' as const,
        ...rdv,
      })),
    ],
    rdvMatchesCount: rdvsForStories.length,
    matchesCount: activitesForModalStories.length + rdvsForStories.length,
    page: 1,
    pageSize: 20,
  },
  activiteDates: {
    first: new Date('2024-03-02'),
    last: new Date('2024-08-30'),
  },
  user: testSessionUser,
  activitesByDate: groupActivitesAndRdvsByDate({
    items: [
      ...activitesForModalStories.map((activite) => ({
        kind: 'activite' as const,
        ...activite,
      })),
      ...rdvsForStories.map((rdv) => ({
        kind: 'rdv' as const,
        ...rdv,
      })),
    ],
  }),
} satisfies ActivitesListPageData

export const AvecActivites: Story = {
  name: 'Avec activités',
  render: (args) => <TemplateListe {...args} />,
  args: {
    data: dataAvecActivites,
  },
}

const dataAvecActivitesEtRdvs = {
  ...dataAvecActivites,
  user: {
    ...testSessionUser,
    rdvAccount: {
      error: null,
      id: 1,
      invalidWebhookOrganisationIds: [2],
      hasOauthTokens: true,
      includeRdvsInActivitesList: true,
      syncFrom: null,
      updated: new Date().toISOString(),
      created: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      organisations: [],
    },
  },
} satisfies ActivitesListPageData

export const AvecActivitesEtRdvsButton: Story = {
  name: 'Avec activités et rendez-vous',
  render: (args) => <TemplateListe {...args} />,
  args: {
    data: dataAvecActivitesEtRdvs,
  },
}
