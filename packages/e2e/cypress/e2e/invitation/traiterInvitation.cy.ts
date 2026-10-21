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
import {
  CoordinateurId,
  Email,
  lienInvitation,
  ReferenceInvitation,
} from '@app/web/features/equipe/domain'
import { goToMostRecentEmailReceived } from '../goToMostRecentEmailReceived'

const createInvitationUrl = ({
  email,
  coordinateurId,
}: {
  email: string
  coordinateurId: string
}) =>
  lienInvitation(
    ReferenceInvitation({
      email: Email(email),
      coordinateurId: CoordinateurId(coordinateurId),
    }),
  )

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

    cy.findByText('Accepter l’invitation').click()

    cy.get('main').should(
      'contain',
      'Accédez à ce service grâce à ProConnect, votre identifiant unique pour accéder à plusieurs services de l’État.',
    )
  })

  it('En la refusant', () => {
    cy.visit(appUrl(createInvitationUrl(invitationData)))

    cy.findByText('Refuser l’invitation').click()

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

    cy.findByText('Accepter l’invitation').click().allowNextRedirectException()

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

  it("En l'acceptant, il est invité à finaliser son inscription", () => {
    cy.signin(mediateurInscription)
    cy.visit(
      appUrl(
        createInvitationUrl({
          email: invitationData.email,
          coordinateurId: invitationData.coordinateurId,
        }),
      ),
    )

    cy.findByText('Accepter l’invitation').click()

    cy.findByRole('status').should(
      'contain',
      'Finalisez votre inscription : vous rejoindrez cette équipe dès sa validation',
    )
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
