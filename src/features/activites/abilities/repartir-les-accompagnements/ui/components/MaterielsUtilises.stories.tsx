import type { Meta, StoryObj } from '@storybook/react'
import {
  materielLabels,
  materielValues,
} from '@/features/activites/ui/labels/libelles/materiel.labels'
import { partsFixees } from '@/libraries/proportions'
import { MaterielsUtilises } from './MaterielsUtilises'

const materiels = partsFixees(
  materielValues,
  materielLabels,
  [300, 200, 150, 120, 230],
)

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/MaterielsUtilises',
  component: MaterielsUtilises,
} satisfies Meta<typeof MaterielsUtilises>

type Story = StoryObj<typeof MaterielsUtilises>

export const Ecran: Story = {
  name: 'Écran',
  render: () => <MaterielsUtilises materiels={materiels} />,
}
