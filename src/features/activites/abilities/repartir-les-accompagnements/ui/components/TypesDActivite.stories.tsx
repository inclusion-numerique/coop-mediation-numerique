import type { Meta, StoryObj } from '@storybook/react'
import {
  typeActiviteLabels,
  typeActiviteValues,
} from '@/features/activites/ui/labels/libelles/type-activite.labels'
import { partsFixees } from '@/libraries/proportions'
import { TypesDActivite } from './TypesDActivite'

const typeActivites = partsFixees(
  typeActiviteValues,
  typeActiviteLabels,
  [400, 350, 250],
)

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/TypesDActivite',
  component: TypesDActivite,
} satisfies Meta<typeof TypesDActivite>

type Story = StoryObj<typeof TypesDActivite>

export const Ecran: Story = {
  name: 'Écran',
  render: () => <TypesDActivite typeActivites={typeActivites} ateliers={400} />,
}
