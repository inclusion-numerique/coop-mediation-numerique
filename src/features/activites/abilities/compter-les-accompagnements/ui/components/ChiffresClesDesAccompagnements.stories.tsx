import type { Meta, StoryObj } from '@storybook/react'
import { ChiffresClesImprimes } from '../slots/ChiffresClesImprimes.slot'
import { ChiffresClesDesAccompagnements } from './ChiffresClesDesAccompagnements'

const totalCounts = {
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
}

export default {
  title: 'Statistiques des activités/Chiffres clés',
} satisfies Meta

type Story = StoryObj

export const Ecran: Story = {
  name: 'Écran',
  render: () => <ChiffresClesDesAccompagnements totalCounts={totalCounts} />,
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => <ChiffresClesImprimes totalCounts={totalCounts} />,
}
