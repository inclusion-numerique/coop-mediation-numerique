import { Meta, StoryObj } from '@storybook/react'
import type { AccueilRdvsData } from '../getAccueilPageDataFor'
import Rdvs from './Rdvs'

export default {
  title: 'Coop/Accueil/Rdvs',
  component: Rdvs,
} as Meta<typeof Rdvs>

type Story = StoryObj<typeof Rdvs>

const createRdv = (date: Date, status: 'unknown' | 'seen' = 'unknown') => ({
  id: Math.floor(Math.random() * 1000),
  durationInMinutes: 30,
  date,
  endDate: new Date(date.getTime() + 30 * 60 * 1000),
  createdBy: 'test-agent',
  status,
  badgeStatus: status,
  organisation: {
    id: 1,
    name: 'Organisation 1',
  },
  motif: {
    id: 1,
    name: 'Accompagnement individuel',
    collectif: false,
  },
  name: null,
  maxParticipantsCount: null,
  url: 'https://rdv.example.com',
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
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

export const NoRdvs: Story = {
  args: {
    rdvs: {
      next: null,
      futur: [],
      passes: [],
      honores: [],
    },
    user: { timezone: 'Europe/Paris' },
  },
}

export const FutureRdvs: Story = {
  args: {
    rdvs: {
      next: createRdv(tomorrow),
      futur: [
        createRdv(tomorrow),
        createRdv(new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)),
      ],
      passes: [],
      honores: [],
    },
    user: { timezone: 'Europe/Paris' },
  },
}

export const PastAndFutureRdvs: Story = {
  args: {
    rdvs: {
      next: createRdv(tomorrow),
      futur: [createRdv(tomorrow)],
      passes: [createRdv(yesterday)],
      honores: [],
    },
    user: { timezone: 'Europe/Paris' },
  },
}

export const HonoredAndFutureRdvs: Story = {
  args: {
    rdvs: {
      next: createRdv(tomorrow),
      futur: [createRdv(tomorrow)],
      passes: [],
      honores: [createRdv(lastWeek, 'seen')],
    },
    user: { timezone: 'Europe/Paris' },
  },
}
