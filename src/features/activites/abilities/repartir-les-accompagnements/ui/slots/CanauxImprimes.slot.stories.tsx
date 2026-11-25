import type { Meta, StoryObj } from '@storybook/react'
import {
  typeLieuLabels,
  typeLieuValues,
} from '@/features/activites/ui/labels/libelles/type-lieu.labels'
import { partsFixees } from '@/libraries/proportions'
import { CanauxImprimes } from './CanauxImprimes.slot'

const typeLieu = partsFixees(
  typeLieuValues,
  typeLieuLabels,
  [250, 450, 50, 250],
)

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/CanauxImprimes',
  component: CanauxImprimes,
} satisfies Meta<typeof CanauxImprimes>

type Story = StoryObj<typeof CanauxImprimes>

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => <CanauxImprimes typeLieu={typeLieu} />,
}
