import type { Meta, StoryObj } from '@storybook/react'
import { repartition } from '@/features/activites/fixtures/repartition-de-demonstration'
import { TypesDActiviteImprimes } from './TypesDActiviteImprimes.slot'

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/TypesDActiviteImprimes',
  component: TypesDActiviteImprimes,
} satisfies Meta<typeof TypesDActiviteImprimes>

type Story = StoryObj<typeof TypesDActiviteImprimes>

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => (
    <TypesDActiviteImprimes
      typeActivites={repartition.typeActivites}
      participations={1350}
    />
  ),
}
