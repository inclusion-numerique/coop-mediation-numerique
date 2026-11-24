import type { Meta, StoryObj } from '@storybook/react'
import { repartition } from '@/features/activites/fixtures/repartition-de-demonstration'
import { CanauxDesAccompagnements } from './CanauxDesAccompagnements'

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/CanauxDesAccompagnements',
  component: CanauxDesAccompagnements,
} satisfies Meta<typeof CanauxDesAccompagnements>

type Story = StoryObj<typeof CanauxDesAccompagnements>

export const Ecran: Story = {
  name: 'Écran',
  render: () => <CanauxDesAccompagnements typeLieu={repartition.typeLieu} />,
}
