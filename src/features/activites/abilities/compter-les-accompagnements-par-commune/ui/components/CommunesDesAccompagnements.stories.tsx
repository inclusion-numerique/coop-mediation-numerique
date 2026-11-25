import type { Meta, StoryObj } from '@storybook/react'
import { CommunesDesAccompagnements } from './CommunesDesAccompagnements'

const communes = [
  {
    commune: 'Paris',
    codePostal: '75000',
    codeInsee: '75056',
    count: 120,
    label: 'Paris · 75000',
    proportion: 40,
  },
  {
    commune: 'Lyon',
    codePostal: '69000',
    codeInsee: '69123',
    count: 80,
    label: 'Lyon · 69000',
    proportion: 30,
  },
  {
    commune: 'Marseille',
    codePostal: '13000',
    codeInsee: '13055',
    count: 50,
    label: 'Marseille · 13000',
    proportion: 17,
  },
  {
    commune: 'Nice',
    codePostal: '06000',
    codeInsee: '06088',
    count: 50,
    label: 'Nice · 06000',
    proportion: 17,
  },
]

export default {
  title: 'Statistiques des activités/Accompagnements par commune',
} satisfies Meta

type Story = StoryObj

export const Ecran: Story = {
  name: 'Écran',
  render: () => <CommunesDesAccompagnements communes={communes} />,
}
