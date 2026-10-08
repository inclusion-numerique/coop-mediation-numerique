import { AFFICHER_RDVS_DANS_ACTIVITES_ACTION_KEY } from '@app/web/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.key'
import { RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/action/rattraper-rdvs-sans-webhook.key'
import { ServerActionSuccess } from '@app/web/libraries/nextjs/action/result'
import { provide } from '@app/web/libs/injection/client'
import { testSessionUser } from '@app/web/test/testSessionUser'
import type { Meta, StoryObj } from '@storybook/react'
import ActivitesListeLayout from './components/ActivitesListeLayout'
import { groupActivitesAndRdvsByDate } from './components/groupActivitesAndRdvsByDate'
import MesActivitesListeEmptyPage from './components/MesActivitesListeEmptyPage'
import { provideRdvStatusUpdateDefaults } from './components/RdvStatusUpdateModal/rdv-status-update.story-defaults'
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
  decorators: [
    (Story) => {
      provideRdvStatusUpdateDefaults()
      provide(AFFICHER_RDVS_DANS_ACTIVITES_ACTION_KEY, async () =>
        ServerActionSuccess(),
      )
      provide(RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY, async () =>
        ServerActionSuccess({ derive: 0, synchroniseeLe: null }),
      )
      return <Story />
    },
  ],
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
      statut: 'connecte' as const,
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

const dataSansActivitesAvecRdvServicePublic = {
  ...dataAvecActivitesEtRdvs,
  searchResult: {
    ...dataAvecActivites.searchResult,
    activitesMatchesCount: 0,
    accompagnementsMatchesCount: 0,
    totalPages: 0,
    items: [],
    rdvMatchesCount: 0,
    matchesCount: 0,
  },
  activitesByDate: [],
  user: {
    ...dataAvecActivitesEtRdvs.user,
    rdvAccount: {
      ...dataAvecActivitesEtRdvs.user.rdvAccount,
      invalidWebhookOrganisationIds: [],
      includeRdvsInActivitesList: false,
    },
  },
} satisfies ActivitesListPageData

export const SansActivitesAvecRdvServicePublic: Story = {
  name: 'Sans activités avec RDV Service Public lié',
  render: (args) => <TemplateListe {...args} />,
  args: {
    data: dataSansActivitesAvecRdvServicePublic,
  },
}
