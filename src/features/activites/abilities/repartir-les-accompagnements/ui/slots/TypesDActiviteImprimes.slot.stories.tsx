import type { Meta, StoryObj } from '@storybook/react'
import {
  typeActiviteLabels,
  typeActiviteValues,
} from '@/features/activites/ui/labels/libelles/type-activite.labels'
import { partsFixees } from '@/libraries/proportions'
import { TypesDActiviteImprimes } from './TypesDActiviteImprimes.slot'

const typeActivites = partsFixees(
  typeActiviteValues,
  typeActiviteLabels,
  [400, 350, 250],
)

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
      typeActivites={typeActivites}
      participations={1350}
    />
  ),
}
