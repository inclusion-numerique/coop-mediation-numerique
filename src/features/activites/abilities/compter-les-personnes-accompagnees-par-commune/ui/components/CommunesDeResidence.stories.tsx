import type { Meta, StoryObj } from '@storybook/react'
import { CommunesDeResidenceImprimees } from '../slots/CommunesDeResidenceImprimees.slot'
import { CommunesDeResidence } from './CommunesDeResidence'

const communes = [
  {
    nom: 'Paris',
    codeInsee: '75056',
    codePostal: '75000',
    count: 50,
    label: 'Paris',
    proportion: 20,
  },
  {
    nom: 'Lyon',
    codeInsee: '69123',
    codePostal: '69000',
    count: 30,
    label: 'Lyon',
    proportion: 12,
  },
  {
    nom: 'Marseille',
    codeInsee: '13055',
    codePostal: '13000',
    count: 40,
    label: 'Marseille',
    proportion: 16,
  },
  {
    nom: 'Nice',
    codeInsee: '06088',
    codePostal: '06000',
    count: 20,
    label: 'Nice',
    proportion: 8,
  },
]

export default {
  title: 'Statistiques des activités/Communes de résidence',
} satisfies Meta

type Story = StoryObj

export const Ecran: Story = {
  name: 'Écran',
  render: () => <CommunesDeResidence communes={communes} />,
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => (
    <CommunesDeResidenceImprimees communes={communes} total={550} />
  ),
}
