import type { Meta, StoryObj } from '@storybook/react'
import { repartition } from '@/features/activites/fixtures/repartition-de-demonstration'
import { DureesDesAccompagnements } from './DureesDesAccompagnements'

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/DureesDesAccompagnements',
  component: DureesDesAccompagnements,
} satisfies Meta<typeof DureesDesAccompagnements>

type Story = StoryObj<typeof DureesDesAccompagnements>

export const Ecran: Story = {
  name: 'Écran',
  render: () => <DureesDesAccompagnements durees={repartition.durees} />,
}
