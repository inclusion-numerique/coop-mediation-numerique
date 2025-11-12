import { Meta, StoryObj } from '@storybook/react'
import Rdvs from './Rdvs'

export default {
  title: 'Coop/Accueil/Rdvs',
  component: Rdvs,
} as Meta<typeof Rdvs>

type Story = StoryObj<typeof Rdvs>

const createRdv = (date: Date, status: 'unknown' | 'seen' = 'unknown') => ({
  id: Math.floor(Math.random() * 1000),
  durationInMin: 30,
  startsAt: date,
  endsAt: new Date(date.getTime() + 30 * 60 * 1000),
  createdBy: 'test-agent',
  status,
  badgeStatus: status,
  organisation: {
    id: 1,
    name: 'Organisation 1',
  },
  lieu: null,
  motif: {
    id: 1,
    name: 'Accompagnement individuel',
    collectif: false,
  },
  name: null,
  maxParticipantsCount: null,
  urlForAgents: 'https://rdv.example.com',
  agents: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'John Doe',
      email: 'john@example.com',
    },
  ],
  participations: [
    {
      id: 1,
      status,
      sendReminderNotification: true,
      sendLifecycleNotifications: true,
      user: {
        id: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        displayName: 'Jane Smith',
        email: 'jane@example.com',
        beneficiaire: {
          id: '1',
          prenom: 'Jane',
          nom: 'Smith',
          mediateurId: '1',
        },
      },
    },
  ],
})

const now = new Date()
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

export const NoRdvs: Story = {
  args: {
    rdvs: {
      syncDataOnLoad: false,
      next: null,
      futur: 0,
      passes: 0,
      honores: 0,
      organisation: {
        id: 1,
        name: 'Organisation 1',
      },
    },
    user: { id: '1', timezone: 'Europe/Paris' },
  },
}

export const FutureRdvs: Story = {
  args: {
    rdvs: {
      syncDataOnLoad: false,
      next: createRdv(tomorrow),
      futur: 2,
      passes: 0,
      honores: 0,
      organisation: {
        id: 1,
        name: 'Organisation 1',
      },
    },
    user: { id: '1', timezone: 'Europe/Paris' },
  },
}

export const PastAndFutureRdvs: Story = {
  args: {
    rdvs: {
      syncDataOnLoad: false,
      next: createRdv(tomorrow),
      futur: 1,
      passes: 1,
      honores: 1,
      organisation: {
        id: 1,
        name: 'Organisation 1',
      },
    },
    user: { id: '1', timezone: 'Europe/Paris' },
  },
}

export const HonoredAndFutureRdvs: Story = {
  args: {
    rdvs: {
      syncDataOnLoad: false,
      next: createRdv(tomorrow),
      futur: 1,
      passes: 0,
      honores: 1,
      organisation: {
        id: 1,
        name: 'Organisation 1',
      },
    },
    user: { id: '1', timezone: 'Europe/Paris' },
  },
}
