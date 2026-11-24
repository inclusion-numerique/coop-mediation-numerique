import type { Meta, StoryObj } from '@storybook/react'
import { repartition } from '@/features/activites/fixtures/repartition-de-demonstration'
import { ThematiquesDesAccompagnements } from './ThematiquesDesAccompagnements'

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/ThematiquesDesAccompagnements',
  component: ThematiquesDesAccompagnements,
} satisfies Meta<typeof ThematiquesDesAccompagnements>

type Story = StoryObj<typeof ThematiquesDesAccompagnements>

export const Ecran: Story = {
  name: 'Écran',
  render: () => (
    <ThematiquesDesAccompagnements thematiques={repartition.thematiques} />
  ),
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => (
    <ThematiquesDesAccompagnements
      thematiques={repartition.thematiques}
      pourImpression
    />
  ),
}
