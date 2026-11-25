import type { Meta, StoryObj } from '@storybook/react'
import {
  typeLieuLabels,
  typeLieuValues,
} from '@/features/activites/ui/labels/libelles/type-lieu.labels'
import { partsFixees } from '@/libraries/proportions'
import { CanauxDesAccompagnements } from './CanauxDesAccompagnements'

const typeLieu = partsFixees(
  typeLieuValues,
  typeLieuLabels,
  [250, 450, 50, 250],
)

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/CanauxDesAccompagnements',
  component: CanauxDesAccompagnements,
} satisfies Meta<typeof CanauxDesAccompagnements>

type Story = StoryObj<typeof CanauxDesAccompagnements>

export const Ecran: Story = {
  name: 'Écran',
  render: () => <CanauxDesAccompagnements typeLieu={typeLieu} />,
}
