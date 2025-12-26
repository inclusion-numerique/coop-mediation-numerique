import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { MediateurList, MediateurListProps } from './MediateurList'
import { MediateurListItem } from './MediateurListItem'

export default {
  title: 'Équipe/Liste des médiateurs',
  component: MediateurListItem,
} as Meta<typeof MediateurListItem>

type Story = StoryObj<typeof MediateurListItem>

const Template = (props: MediateurListProps) => (
  <MediateurList mediateurs={[props]} baseHref="/" />
)

export const conseillerNumeriqueFinDeContrat: Story = {
  name: 'Conseiller numérique fin de contrat',
  args: {
    firstName: 'Henri',
    lastName: 'Doe',
    email: 'henri@doe.com',
    phone: '0345678901',
    status: 'Actif',
    isConseillerNumerique: true,
    finDeContrat: '15.11.2024',
  },
  render: Template,
}

export const ConseillerNumeriqueActif: Story = {
  name: 'Conseiller numérique actif',
  args: {
    firstName: 'Alice',
    lastName: 'Doe',
    email: 'alice@doe.com',
    phone: '0456789012',
    status: 'Actif',
    isConseillerNumerique: true,
  },
  render: Template,
}

export const ConseillerNumeriqueInactif: Story = {
  name: 'Conseiller numérique inactif',
  args: {
    firstName: 'Olivier',
    lastName: 'Doe',
    email: 'olivier@doe.com',
    phone: '0234567890',
    status: 'Inactif depuis le 04.11.2024',
    isConseillerNumerique: true,
  },
  render: Template,
}

export const MediateurIvitationEnoyee: Story = {
  name: 'Invitation envoyé à un médiateur',
  args: {
    firstName: 'Mary',
    lastName: 'Doe',
    email: 'mary@doe.com',
    phone: '0123456789',
    status: 'Invitation envoyée',
  },
  render: Template,
}

export const MediateurActif: Story = {
  name: 'Médiateur actif',
  args: {
    firstName: 'Alfred',
    lastName: 'Doe',
    email: 'alfred@doe.com',
    phone: '0678901234',
    status: 'Actif',
  },
  render: Template,
}

export const MediateurIvitationEnoyeeMailOnly: Story = {
  name: 'Invitation envoyé à un médiateur non inscrit',
  args: {
    email: 'john@doe.com',
    status: 'Invitation envoyée',
  },
  render: Template,
}
