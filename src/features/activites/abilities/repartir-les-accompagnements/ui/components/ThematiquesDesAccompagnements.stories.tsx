import type { Meta, StoryObj } from '@storybook/react'
import {
  thematiquesNonAdministrativesLabels,
  thematiquesNonAdministrativesValues,
} from '@/features/activites/ui/labels/libelles/thematique.labels'
import { partsFixees } from '@/libraries/proportions'
import { ThematiquesDesAccompagnements } from './ThematiquesDesAccompagnements'

const thematiques = partsFixees(
  thematiquesNonAdministrativesValues,
  thematiquesNonAdministrativesLabels,
  [80, 100, 90, 70, 60, 40, 30, 20, 25, 10, 10, 10, 10, 5],
)

export default {
  title:
    'Statistiques des activités/Répartition des accompagnements/ThematiquesDesAccompagnements',
  component: ThematiquesDesAccompagnements,
} satisfies Meta<typeof ThematiquesDesAccompagnements>

type Story = StoryObj<typeof ThematiquesDesAccompagnements>

export const Ecran: Story = {
  name: 'Écran',
  render: () => <ThematiquesDesAccompagnements thematiques={thematiques} />,
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => (
    <ThematiquesDesAccompagnements thematiques={thematiques} pourImpression />
  ),
}
