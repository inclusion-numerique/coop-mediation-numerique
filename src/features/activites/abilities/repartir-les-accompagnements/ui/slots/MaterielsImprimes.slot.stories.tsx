import type { Meta, StoryObj } from '@storybook/react'
import {
  materielLabels,
  materielValues,
} from '@/features/activites/ui/labels/libelles/materiel.labels'
import { partsFixees } from '@/libraries/proportions'
import { MaterielsImprimes } from './MaterielsImprimes.slot'

const materiels = partsFixees(
  materielValues,
  materielLabels,
  [300, 200, 150, 120, 230],
)

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/MaterielsImprimes',
  component: MaterielsImprimes,
} satisfies Meta<typeof MaterielsImprimes>

type Story = StoryObj<typeof MaterielsImprimes>

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => <MaterielsImprimes materiels={materiels} />,
}
