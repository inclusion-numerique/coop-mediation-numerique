import type { Meta, StoryObj } from '@storybook/react'
import { consulterLAccueil, visiteurDe } from '../..'
import { Accueil } from './Accueil'

const accueil = consulterLAccueil(
  visiteurDe({
    firstName: 'John',
    name: 'John Doe',
    email: 'john@doe.com',
    mediateur: { id: 'a3c1c0d2-5b7e-4f7a-9d1e-2f8b6c4d0e11' },
    coordinateur: null,
    hasSeenOnboarding: null,
  }),
)

export default {
  title: 'Coop/Accueil',
  component: Accueil,
} as Meta<typeof Accueil>

type Story = StoryObj<typeof Accueil>

export const Mediateur: Story = {
  name: 'Accueil',
  args: accueil === null ? undefined : { accueil },
}
