import type { Meta, StoryObj } from '@storybook/react'
import { TagsDesAccompagnements } from './TagsDesAccompagnements'

export default {
  title: 'Statistiques des activités/Accompagnements par tag',
} satisfies Meta

type Story = StoryObj

export const Ecran: Story = {
  name: 'Écran',
  render: () => <TagsDesAccompagnements tags={[]} />,
}

export const Imprime: Story = {
  name: 'Imprimé',
  render: () => <TagsDesAccompagnements tags={[]} pourImpression />,
}
