import { appUrl } from '@app/e2e/support/helpers'
import { conseillerNumerique } from '@app/fixtures/users/conseillerNumerique'
import { coordinateurInscrit } from '@app/fixtures/users/coordinateurInscrit'
import { mediateurInscription } from '@app/fixtures/users/mediateurInscription'
import { getUserDisplayName } from '@app/web/utils/user'
import { goToMostRecentEmailReceived } from '../goToMostRecentEmailReceived'

const searchAndInviteUser = ({
  displayName,
  email,
  search,
}: {
  search: string
  displayName: string
  email: string
}) => {
  cy.findByLabelText('Rechercher par nom ou adresse e-mail').type(search)

  cy.contains('[role="option"]', email, { timeout: 10_000 }).click()

  cy.findByRole('button', { name: displayName })
}

describe('ETQ coordinateur, je peux inviter un médiateur à rejoindre mon équipe', () => {
  before(() => {
    cy.execute('resetFixtures', {})
  })

  it('Je vois le médiateur invité dans la liste des médiateurs', () => {
    cy.signin(coordinateurInscrit)

    cy.visit(appUrl('/coop/mon-equipe'))
    cy.findAllByRole('link', { name: 'Inviter une personne' }).first().click()

    cy.visit(appUrl('/coop/mon-equipe/inviter'))

    searchAndInviteUser({
      search: 'conseiller',
      displayName: getUserDisplayName(conseillerNumerique),
      email: conseillerNumerique.email,
    })

    searchAndInviteUser({
      search: 'mediateur',
      displayName: getUserDisplayName(mediateurInscription),
      email: mediateurInscription.email,
    })

    searchAndInviteUser({
      search: 'leo@med.fr',
      displayName: 'leo@med.fr',
      email: 'leo@med.fr',
    })

    cy.findByRole('button', { name: 'Inviter' }).click()

    cy.findByRole('status').should(
      'contain',
      'Un email d’invitation a été envoyé aux membres que vous souhaitez ajouter à votre équipe',
    )

    cy.contains('tbody tr', 'Médiateur Inscription')
      .should('contain', 'Invitation en attente')
      .should('contain', 'Invitation envoyée')

    cy.contains('tbody tr', 'Conseiller Num Inscrit')
      .should('contain', 'Invitation en attente')
      .should('contain', 'Invitation envoyée')

    cy.contains('tbody tr', 'leo@med.fr').should(
      'contain',
      'Invitation envoyée',
    )

    goToMostRecentEmailReceived({
      subjectInclude:
        'Invitation à rejoindre une équipe sur La Coop de la médiation numérique',
    })
  })
})
