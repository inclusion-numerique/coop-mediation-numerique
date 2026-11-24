import type { Meta, StoryObj } from '@storybook/react'
import { repartition } from '@/features/activites/fixtures/repartition-de-demonstration'
import { MaterielsImprimes } from './MaterielsImprimes.slot'

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/MaterielsImprimes',
  component: MaterielsImprimes,
} satisfies Meta<typeof MaterielsImprimes>

type Story = StoryObj<typeof MaterielsImprimes>

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => <MaterielsImprimes materiels={repartition.materiels} />,
}
