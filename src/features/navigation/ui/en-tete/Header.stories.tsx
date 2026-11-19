import { Meta, StoryObj } from '@storybook/react'
import { testSessionUser } from '@/features/authentification/fixtures/testSessionUser'
import Header from '@/features/navigation/ui/en-tete/Header'

export default {
  title: 'Header',
  component: Header,
} as Meta<typeof Header>

type Story = StoryObj<typeof Header>

export const SignedOut: Story = {
  name: 'Utilisateur non connecté',
  args: { accueil: '/' },
}

export const SignedIn: Story = {
  name: 'Utilisateur connecté',
  args: { user: testSessionUser, accueil: '/coop' },
}

/* TODO: components not working, issue with storybook and next/navigation
export const SignedOutBacklink: Story = {
  name: 'Avec lien de retour',
  args: { backLink: true },
}
*/
