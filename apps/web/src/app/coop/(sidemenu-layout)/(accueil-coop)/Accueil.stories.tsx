import { Meta, StoryObj } from '@storybook/react'
import { Accueil } from './Accueil'

export default {
  title: 'Coop/Accueil',
  component: Accueil,
} as Meta<typeof Accueil>

type Story = StoryObj<typeof Accueil>

export const Statistiques: Story = {
  name: 'Accueil',
  args: {
    firstName: 'John',
    name: 'Doe',
    email: 'john@doe.com',
    activites: [],
    timezone: 'Europe/Paris',
  },
}
