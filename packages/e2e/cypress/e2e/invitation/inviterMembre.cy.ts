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
  slug,
}: {
  slug: string
  search: string
  displayName: string
  /** Identifie l'option à coup sûr : les dénominations, elles, se préfixent. */
  email: string
}) => {
  // intercept the search query to avoid timing issues and insure that the search is executed
  cy.intercept(
    `/api/trpc/mediateur.search?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22query%22%3A%22${encodeURIComponent(search)}%22%7D%7D%7D`,
  ).as(`search-${slug}`)

  cy.get('#custom-select-form-field__members').type(search)

  // wait for the search query to be completed
  cy.wait(`@search-${slug}`)

  // La liste est ordonnée par nom de famille, pas par pertinence : prendre la
  // première option sélectionne un homonyme qui trie avant celui qu'on vise
  // (« Médiateur Avec activités » précède « Médiateur Inscription »). On clique
  // donc l'option voulue, pour que le test affirme ce qu'il fait. Elle se
  // désigne par l'e-mail : « Médiateur Inscription » est aussi le début de
  // « Médiateur Inscription J+100 ».
  cy.contains('[role="option"]', email).click()

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
      email: conseillerNumerique.email,
    })

    searchAndInviteUser({
      search: 'mediateur',
      slug: 'mediateur',
      displayName: getUserDisplayName(mediateurInscription),
      email: mediateurInscription.email,
    })

    searchAndInviteUser({
      search: 'leo@med.fr',
      slug: 'leo',
      displayName: 'leo@med.fr',
      email: 'leo@med.fr',
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
