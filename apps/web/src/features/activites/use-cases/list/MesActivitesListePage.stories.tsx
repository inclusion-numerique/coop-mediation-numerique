import { testSessionUser } from '@app/web/test/testSessionUser'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { groupActivitesAndRdvsByDate } from './components/groupActivitesAndRdvsByDate'
import MesActivitesListeEmptyPage from './components/MesActivitesListeEmptyPage'
import MesActivitesListeLayout from './components/MesActivitesListeLayout'
import { ActivitesListPageData } from './getActivitesListPageData'
import MesActivitesListePage from './MesActivitesListePage'
import {
  activitesForModalStories,
  rdvsForStories,
} from './storybook/ActiviteDetailsStoriesData'

const TemplateListe = ({ data }: { data: ActivitesListPageData }) => (
  <MesActivitesListeLayout vue="liste">
    <MesActivitesListePage data={Promise.resolve(data)} />
  </MesActivitesListeLayout>
)

const TemplateEmpty = () => (
  <MesActivitesListeLayout vue="liste" empty>
    <MesActivitesListeEmptyPage />
  </MesActivitesListeLayout>
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
