import type { Meta, StoryObj } from '@storybook/react'
import { type Accueil, MediateurId, Salutation } from '../../domain/index'
import { AccueilPage } from './AccueilPage'

const accueil: Accueil = {
  salutation: Salutation('John'),
  profil: {
    _tag: 'Mediateur',
    mediateurId: MediateurId('a3c1c0d2-5b7e-4f7a-9d1e-2f8b6c4d0e11'),
    bienvenue: true,
  },
}

export default {
  title: 'Coop/Accueil',
  component: AccueilPage,
} as Meta<typeof AccueilPage>

type Story = StoryObj<typeof AccueilPage>

export const Mediateur: Story = {
  name: 'Accueil',
  args: { accueil },
}
