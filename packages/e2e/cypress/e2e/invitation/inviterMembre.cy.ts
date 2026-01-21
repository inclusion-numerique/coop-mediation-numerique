import { appUrl } from '@app/e2e/support/helpers'
import { conseillerNumerique } from '@app/fixtures/users/conseillerNumerique'
import { coordinateurInscrit } from '@app/fixtures/users/coordinateurInscrit'
import { mediateurInscription } from '@app/fixtures/users/mediateurInscription'
import { getUserDisplayName } from '@app/web/utils/user'
import { goToMostRecentEmailReceived } from '../goToMostRecentEmailReceived'

const searchAndInviteUser = ({
  displayName,
  search,
  slug,
}: {
  slug: string
  search: string
  displayName: string
}) => {
  // intercept the search query to avoid timing issues and insure that the search is executed
  cy.intercept(
    `/api/trpc/mediateur.search?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22query%22%3A%22${encodeURIComponent(search)}%22%7D%7D%7D`,
  ).as(`search-${slug}`)

  cy.get('#custom-select-form-field__members').type(search)

  // wait for the search query to be completed
  cy.wait(`@search-${slug}`)

  // select the first result on the dropdown and click on it
  cy.get('#custom-select-form-field__members')
    .type('{downarrow}')
    .type('{enter}')

  // selection tag should be present
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

    cy.contains('Rechercher par nom ou adresse e-mail').click()

    searchAndInviteUser({
      search: 'conseiller',
      slug: 'conseiller',
      displayName: getUserDisplayName(conseillerNumerique),
    })

    searchAndInviteUser({
      search: 'mediateur',
      slug: 'mediateur',
      displayName: getUserDisplayName(mediateurInscription),
    })

    searchAndInviteUser({
      search: 'leo@med.fr',
      slug: 'leo',
      displayName: 'leo@med.fr',
    })

    cy.intercept('/api/trpc/mediateur.invite*').as('mutation')

    cy.get('form').submit()

    cy.wait('@mutation')

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
