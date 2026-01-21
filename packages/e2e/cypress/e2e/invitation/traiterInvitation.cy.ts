import { appUrl } from '@app/e2e/support/helpers'
import {
  conseillerNumerique,
  conseillerNumeriqueMediateurId,
} from '@app/fixtures/users/conseillerNumerique'
import { coordinateurInscritCoordinateurId } from '@app/fixtures/users/coordinateurInscrit'
import {
  mediateurInscription,
  mediateurInscriptionMediateurId,
} from '@app/fixtures/users/mediateurInscription'
import { createInvitationUrl } from '@app/web/features/invitation/createInvitationUrl'
import { goToMostRecentEmailReceived } from '../goToMostRecentEmailReceived'

describe('ETQ visiteur, je peux donner suite à une invitation', () => {
  const invitationData = {
    email: 'une-nouvelle-personne@coop-numerique.anct.gouv.fr',
    coordinateurId: coordinateurInscritCoordinateurId,
  }
  beforeEach(() => {
    cy.execute('resetFixtures', {})
    cy.execute('createInvitation', invitationData)
  })

  it("En l'acceptant", () => {
    cy.visit(
      appUrl(
        createInvitationUrl({
          email: invitationData.email,
          coordinateurId: coordinateurInscritCoordinateurId,
        }),
      ),
    )

    cy.intercept('/api/trpc/mediateur.acceptInvitation*').as('mutation')

    cy.findByText('Accepter l’invitation').click().allowNextRedirectException()

    cy.wait('@mutation')

    cy.findByRole('status').should('contain', 'Vous avez accepté l’invitation')

    cy.get('main').should(
      'contain',
      'Accédez à ce service grâce à ProConnect, votre identifiant unique pour accéder à plusieurs services de l’État.',
    )
  })

  it('En la refusant', () => {
    cy.visit(appUrl(createInvitationUrl(invitationData)))

    cy.intercept('/api/trpc/mediateur.declineInvitation*').as('mutation')

    cy.findByText('Refuser l’invitation').click()

    cy.wait('@mutation')

    cy.get('h1').should(
      'contain',
      'Vous avez refusé de rejoindre cette équipe.',
    )

    goToMostRecentEmailReceived({
      subjectInclude: `${invitationData.email} a refusé l‘invitation à rejoindre votre équipe`,
    })
  })
})

describe('ETQ médiateur inscrit, je peux donner suite à une invitation', () => {
  const invitationData = {
    email: conseillerNumerique.email,
    mediateurId: conseillerNumeriqueMediateurId,
    coordinateurId: coordinateurInscritCoordinateurId,
  }

  beforeEach(() => {
    cy.execute('resetFixtures', {})
    cy.execute('createInvitation', invitationData)
  })

  it("En l'acceptant", () => {
    cy.signin(conseillerNumerique)

    cy.visit(
      appUrl(
        createInvitationUrl({
          email: invitationData.email,
          coordinateurId: invitationData.coordinateurId,
        }),
      ),
    )

    cy.intercept('/api/trpc/mediateur.acceptInvitation*').as('mutation')

    cy.findByText('Accepter l’invitation').click().allowNextRedirectException()

    cy.wait('@mutation')

    cy.findByRole('status').should('contain', 'Vous avez accepté l’invitation')

    cy.get('tbody tr')
      .eq(0)
      .should('contain', 'Inscrit')
      .should('contain', 'Conseiller numérique')
      .should('contain', 'Inactif')

    goToMostRecentEmailReceived({
      subjectInclude: `${conseillerNumerique.email} a accepté votre invitation à rejoindre votre équipe`,
    })
  })
})

describe('ETQ médiateur non inscrit, je peux donner suite à une invitation', () => {
  const invitationData = {
    email: mediateurInscription.email,
    mediateurId: mediateurInscriptionMediateurId,
    coordinateurId: coordinateurInscritCoordinateurId,
  }

  beforeEach(() => {
    cy.execute('resetFixtures', {})
    cy.execute('createInvitation', invitationData)
  })

  it("En l'acceptant", () => {
    cy.signin(mediateurInscription)
    cy.visit(
      appUrl(
        createInvitationUrl({
          email: invitationData.email,
          coordinateurId: invitationData.coordinateurId,
        }),
      ),
    )

    cy.intercept('/api/trpc/mediateur.acceptInvitation*').as('mutation')

    cy.findByText('Accepter l’invitation').click().allowNextRedirectException()

    cy.wait('@mutation')

    cy.findByRole('status').should('contain', 'Vous avez accepté l’invitation')
  })

  it("En tentant de l'accepter, mais en étant authentifié avec le mauvais compte", () => {
    cy.signin(conseillerNumerique)

    cy.visit(
      appUrl(
        createInvitationUrl({
          email: invitationData.email,
          coordinateurId: invitationData.coordinateurId,
        }),
      ),
    )

    cy.get('h1').should(
      'contain',
      'Problème d’identification sur votre adresse email',
    )
  })
})
