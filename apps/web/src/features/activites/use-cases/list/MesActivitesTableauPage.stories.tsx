import { testSessionUser } from '@app/web/test/testSessionUser'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import ActivitesListeLayout from './components/ActivitesListeLayout'
import MesActivitesListeEmptyPage from './components/MesActivitesListeEmptyPage'
import { ActivitesListPageData } from './getActivitesListPageData'
import MesActivitesTableauPage from './MesActivitesTableauPage'
import {
  activitesForModalStories,
  rdvsForStories,
} from './storybook/ActiviteDetailsStoriesData'

const TemplateTableau = ({ data }: { data: ActivitesListPageData }) => (
  <ActivitesListeLayout vue="tableau" href="/coop/mes-activites">
    <MesActivitesTableauPage data={Promise.resolve(data)} />
  </ActivitesListeLayout>
)

const TemplateEmpty = () => (
  <ActivitesListeLayout vue="tableau" href="/coop/mes-activites" empty>
    <MesActivitesListeEmptyPage />
  </ActivitesListeLayout>
)

const meta: Meta<typeof MesActivitesTableauPage> = {
  title: 'Activités/Liste/Tableau',
  component: MesActivitesTableauPage,
}

export default meta

type Story = StoryObj<typeof TemplateTableau>

export const SansActivites: Story = {
  name: 'Sans bénéficiaires',
  render: () => <TemplateEmpty />,
  args: {},
}

const dataAvecActivites = {
  searchParams: {},
  mediateurId: '1',
  isFiltered: false,
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
    pageSize: 50,
  },
  activiteDates: {
    first: new Date('2024-03-02'),
    last: new Date('2024-08-30'),
  },
  user: testSessionUser,
  activitesByDate: [],
} satisfies ActivitesListPageData

export const AvecActivites: Story = {
  name: 'Avec activités',
  render: (args) => <TemplateTableau {...args} />,
  args: {
    data: dataAvecActivites,
  },
}
