import type { Meta, StoryObj } from '@storybook/react'
import { repartition } from '@/features/activites/fixtures/repartition-de-demonstration'
import { MaterielsUtilises } from './MaterielsUtilises'

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/MaterielsUtilises',
  component: MaterielsUtilises,
} satisfies Meta<typeof MaterielsUtilises>

type Story = StoryObj<typeof MaterielsUtilises>

export const Ecran: Story = {
  name: 'Écran',
  render: () => <MaterielsUtilises materiels={repartition.materiels} />,
}
