import type { Meta, StoryObj } from '@storybook/react'
import { repartition } from '@/features/activites/fixtures/repartition-de-demonstration'
import { DemarchesDesAccompagnements } from './DemarchesDesAccompagnements'

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/DemarchesDesAccompagnements',
  component: DemarchesDesAccompagnements,
} satisfies Meta<typeof DemarchesDesAccompagnements>

type Story = StoryObj<typeof DemarchesDesAccompagnements>

export const Ecran: Story = {
  name: 'Écran',
  render: () => (
    <DemarchesDesAccompagnements
      thematiquesDemarches={repartition.thematiquesDemarches}
    />
  ),
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => (
    <DemarchesDesAccompagnements
      thematiquesDemarches={repartition.thematiquesDemarches}
      pourImpression
    />
  ),
}
