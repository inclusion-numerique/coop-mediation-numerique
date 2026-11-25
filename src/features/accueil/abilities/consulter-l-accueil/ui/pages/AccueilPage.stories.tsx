import type { Meta, StoryObj } from '@storybook/react'
import {
  consulterLAccueil,
  Email,
  MediateurId,
  NomComplet,
  Prenom,
} from '../../domain/index'
import { AccueilPage } from './AccueilPage'

const accueil = consulterLAccueil({
  prenom: Prenom.safe('John'),
  nomComplet: NomComplet.safe('John Doe'),
  email: Email('john@doe.com'),
  mediateurId: MediateurId('a3c1c0d2-5b7e-4f7a-9d1e-2f8b6c4d0e11'),
  coordinateurId: null,
  presentationVue: false,
})

export default {
  title: 'Coop/Accueil',
  component: AccueilPage,
} as Meta<typeof AccueilPage>

type Story = StoryObj<typeof AccueilPage>

export const Mediateur: Story = {
  name: 'Accueil',
  ...(accueil === null ? {} : { args: { accueil } }),
}
