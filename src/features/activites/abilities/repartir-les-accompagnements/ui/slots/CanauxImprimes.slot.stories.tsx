import type { Meta, StoryObj } from '@storybook/react'
import { repartition } from '@/features/activites/fixtures/repartition-de-demonstration'
import { CanauxImprimes } from './CanauxImprimes.slot'

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/CanauxImprimes',
  component: CanauxImprimes,
} satisfies Meta<typeof CanauxImprimes>

type Story = StoryObj<typeof CanauxImprimes>

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => <CanauxImprimes typeLieu={repartition.typeLieu} />,
}
