import type { Meta, StoryObj } from '@storybook/react'
import { LieuxImprimes } from '../slots/LieuxImprimes.slot'
import { LieuxDesAccompagnements } from './LieuxDesAccompagnements'

const structures = [
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
]

export default {
  title: 'Statistiques des activités/Accompagnements par lieu',
} satisfies Meta

type Story = StoryObj

export const Ecran: Story = {
  name: 'Écran',
  render: () => <LieuxDesAccompagnements structures={structures} />,
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => <LieuxImprimes structures={structures} />,
}
