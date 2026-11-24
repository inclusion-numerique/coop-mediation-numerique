import type { Meta, StoryObj } from '@storybook/react'
import { repartition } from '@/features/activites/fixtures/repartition-de-demonstration'
import { TypesDActivite } from './TypesDActivite'

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/TypesDActivite',
  component: TypesDActivite,
} satisfies Meta<typeof TypesDActivite>

type Story = StoryObj<typeof TypesDActivite>

export const Ecran: Story = {
  name: 'Écran',
  render: () => (
    <TypesDActivite typeActivites={repartition.typeActivites} ateliers={400} />
  ),
}
