import type { Meta, StoryObj } from '@storybook/react'
import {
  dureeAccompagnementParDefautLabels,
  dureeAcompagnementParDefautDefaultValues,
} from '@/features/activites/ui/labels/libelles/duree-accompagnement.labels'
import { partsFixees } from '@/libraries/proportions'
import { DureesImprimees } from './DureesImprimees.slot'

const durees = partsFixees(
  dureeAcompagnementParDefautDefaultValues,
  dureeAccompagnementParDefautLabels,
  [300, 400, 200, 100],
)

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/DureesImprimees',
  component: DureesImprimees,
} satisfies Meta<typeof DureesImprimees>

type Story = StoryObj<typeof DureesImprimees>

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => <DureesImprimees durees={durees} />,
}
