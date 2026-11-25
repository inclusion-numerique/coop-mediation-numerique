import type { Meta, StoryObj } from '@storybook/react'
import {
  dureeAccompagnementParDefautLabels,
  dureeAcompagnementParDefautDefaultValues,
} from '@/features/activites/ui/labels/libelles/duree-accompagnement.labels'
import { partsFixees } from '@/libraries/proportions'
import { DureesDesAccompagnements } from './DureesDesAccompagnements'

const durees = partsFixees(
  dureeAcompagnementParDefautDefaultValues,
  dureeAccompagnementParDefautLabels,
  [300, 400, 200, 100],
)

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/DureesDesAccompagnements',
  component: DureesDesAccompagnements,
} satisfies Meta<typeof DureesDesAccompagnements>

type Story = StoryObj<typeof DureesDesAccompagnements>

export const Ecran: Story = {
  name: 'Écran',
  render: () => <DureesDesAccompagnements durees={durees} />,
}
