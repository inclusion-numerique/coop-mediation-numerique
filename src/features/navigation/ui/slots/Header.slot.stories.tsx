import { Meta, StoryObj } from '@storybook/react'
import Header from '@/features/navigation/ui/slots/Header.slot'
import type { UtilisateurDeLaNavigation } from '../components/en-tete/HeaderUserMenu'

const utilisateur: UtilisateurDeLaNavigation = {
  role: 'User',
  inscriptionValidee: null,
  name: 'Jean Biche',
  email: 'jean.biche@example.com',
  firstName: 'Jean',
  lastName: 'Biche',
  usurper: null,
  emplois: [],
  coordinateur: null,
  mediateur: null,
}

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
  args: { user: utilisateur, accueil: '/coop' },
}

/* TODO: components not working, issue with storybook and next/navigation
export const SignedOutBacklink: Story = {
  name: 'Avec lien de retour',
  args: { backLink: true },
}
*/
