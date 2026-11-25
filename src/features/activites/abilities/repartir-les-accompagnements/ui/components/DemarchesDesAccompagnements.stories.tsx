import type { Meta, StoryObj } from '@storybook/react'
import {
  thematiquesAdministrativesLabels,
  thematiquesAdministrativesValues,
} from '@/features/activites/ui/labels/libelles/thematique.labels'
import { partsFixees } from '@/libraries/proportions'
import { DemarchesDesAccompagnements } from './DemarchesDesAccompagnements'

const thematiquesDemarches = partsFixees(
  thematiquesAdministrativesValues,
  thematiquesAdministrativesLabels,
  [100, 90, 80, 60, 50, 40, 30, 20, 10, 10],
)

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/DemarchesDesAccompagnements',
  component: DemarchesDesAccompagnements,
} satisfies Meta<typeof DemarchesDesAccompagnements>

type Story = StoryObj<typeof DemarchesDesAccompagnements>

export const Ecran: Story = {
  name: 'Écran',
  render: () => (
    <DemarchesDesAccompagnements thematiquesDemarches={thematiquesDemarches} />
  ),
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => (
    <DemarchesDesAccompagnements
      thematiquesDemarches={thematiquesDemarches}
      pourImpression
    />
  ),
}
