import type { Meta, StoryObj } from '@storybook/react'
import { repartition } from '@/features/activites/fixtures/repartition-de-demonstration'
import { DureesImprimees } from './DureesImprimees.slot'

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/DureesImprimees',
  component: DureesImprimees,
} satisfies Meta<typeof DureesImprimees>

type Story = StoryObj<typeof DureesImprimees>

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => <DureesImprimees durees={repartition.durees} />,
}
