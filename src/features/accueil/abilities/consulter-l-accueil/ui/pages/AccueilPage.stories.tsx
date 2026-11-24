import type { Meta, StoryObj } from '@storybook/react'
import { consulterLAccueil } from '../../domain/index'
import { visiteurDe } from '../../implementations/session/visiteur.query'
import { AccueilPage } from './AccueilPage'

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
  component: AccueilPage,
} as Meta<typeof AccueilPage>

type Story = StoryObj<typeof AccueilPage>

export const Mediateur: Story = {
  name: 'Accueil',
  ...(accueil === null ? {} : { args: { accueil } }),
}
