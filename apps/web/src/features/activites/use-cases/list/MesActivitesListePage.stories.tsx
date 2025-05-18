import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import MesActivitesListePage from './MesActivitesListePage'
import MesActivitesListeEmptyPage from './components/MesActivitesListeEmptyPage'
import MesActivitesListeLayout from './components/MesActivitesListeLayout'
import { ActivitesListPageData } from './getActivitesListPageData'
import {
  activitesForModalStories,
  rdvsForStories,
} from './storybook/ActiviteDetailsStoriesData'
import { groupActivitesAndRdvsByDate } from '@app/web/features/activites/use-cases/list/db/activitesQueries'

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
    matchesCount: activitesForModalStories.length,
    moreResults: 0,
    totalPages: 1,
    activites: activitesForModalStories,
    page: 1,
    pageSize: 20,
  },
  activiteDates: {
    first: new Date('2024-03-02'),
    last: new Date('2024-08-30'),
  },
  activitesByDate: groupActivitesAndRdvsByDate({
    activites: activitesForModalStories,
    rdvs: rdvsForStories,
  }),
} satisfies ActivitesListPageData

export const AvecActivites: Story = {
  name: 'Avec activités',
  render: (args) => <TemplateListe {...args} />,
  args: {
    data: dataAvecActivites,
  },
}
