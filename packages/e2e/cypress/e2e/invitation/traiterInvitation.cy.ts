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
import { executeInscriptionFlow } from '../inscription/executeInscriptionFlow'

describe('ETQ visiteur, je peux donner suite à une invitation', () => {
  beforeEach(() => {
    cy.execute('resetFixtures', {})
    cy.execute('createInvitation', {
      email: 'leo@med.fr',
      coordinateurId: coordinateurInscritCoordinateurId,
    })
  })

  it("En l'acceptant", () => {
    cy.visit(
      appUrl(
        '/invitations/eJwNyTEOgCAMAMC_dBZjwBJ0cvUZFdoEAzZBnYx_11vvgf3UA-YHuFIuMENhXSqnXhp0EFVbygddfLc1_RstIaE4g35jM3pnzWTRmRAG2ZzIxDTC-37U_xrV',
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

    goToMostRecentEmailReceived({
      subjectInclude:
        'leo@med.fr a accepté votre invitation à rejoindre votre équipe',
    })
  })

  it('En la refusant', () => {
    cy.visit(
      appUrl(
        '/invitations/eJwNyTEOgCAMAMC_dBZjwBJ0cvUZFdoEAzZBnYx_11vvgf3UA-YHuFIuMENhXSqnXhp0EFVbygddfLc1_RstIaE4g35jM3pnzWTRmRAG2ZzIxDTC-37U_xrV',
      ),
    )

    cy.intercept('/api/trpc/mediateur.declineInvitation*').as('mutation')

    cy.findByText('Refuser l’invitation').click()

    cy.wait('@mutation')

    cy.get('h1').should(
      'contain',
      'Vous avez refusé de rejoindre cette équipe.',
    )

    goToMostRecentEmailReceived({
      subjectInclude:
        'leo@med.fr a refusé l‘invitation à rejoindre votre équipe',
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

    cy.get('ul.fr-list-group>li')
      .eq(0)
      .should('contain', 'Inscrit')
      .should('contain', 'Conseiller numérique')
      .should('contain', 'Inactif')

    goToMostRecentEmailReceived({
      subjectInclude: `${conseillerNumerique.email} a accepté votre invitation à rejoindre votre équipe`,
    })
  })
})

describe.skip('ETQ médiateur non inscrit, je peux donner suite à une invitation', () => {
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

    executeInscriptionFlow({
      signin: true,
      user: mediateurInscription,
      expectedSteps: [
        {
          step: 'recapitulatif',
        },
      ],
    })

    cy.findByText('Voir plus tard').click()

    cy.visit(appUrl(`/coop/mes-equipes/${coordinateurInscritCoordinateurId}`))

    cy.get('ul.fr-list-group>li')
      .eq(0)
      .should('contain', 'Inscription')
      .should('contain', 'Médiateur numérique')
      .should('contain', 'Inactif')

    goToMostRecentEmailReceived({
      subjectInclude: `${mediateurInscription.email} a accepté votre invitation à rejoindre votre équipe`,
    })
  })

  it("En tentant de l'accepter, mais en étant authentifié avec le mauvais compte", () => {
    cy.signin(conseillerNumerique)

    cy.visit(
      appUrl(
        '/invitations/eJwljEEOwiAQAP-yZ5cYKE3bk1efsYXFrBGoFLw0_btEj5OZzAHPPSdYDuBI8oIFInuhyq2gpN0V2arkdHM5b_hXHTG1yEXejRUlV9Ujt48KBS7Qu-Il_QZ333dOkyUbDNpxZRxGo3HW1uA0XcNqQpiZBjjPLyKILmE',
      ),
    )

    cy.get('h1').should(
      'contain',
      'Problème d’identification sur votre adresse email',
    )
  })

  it("En tentant de l'accepter, mais avec un mauvais lien", () => {
    cy.visit(appUrl('/invitations/error'))

    cy.visit(
      appUrl(
        '/invitations/eJwljEEOwiAQAP-yZ5cYKE3bk1efsYXFrBGoFLw0_btEj5OZzAHPPSdYDuBI8oIFInuhyq2gpN0V2arkdHM5b_hXHTG1yEXejRUlV9Ujt48KBS7Qu-Il_QZ333dOkyUbDNpxZRxGo3HW1uA0XcNqQpiZBjjPLyKILmE',
      ),
    )

    cy.findByText('Accepter l’invitation').click().allowNextRedirectException()

    cy.visit(
      appUrl(
        '/invitations/eJwljEEOwiAQAP-yZ5cYKE3bk1efsYXFrBGoFLw0_btEj5OZzAHPPSdYDuBI8oIFInuhyq2gpN0V2arkdHM5b_hXHTG1yEXejRUlV9Ujt48KBS7Qu-Il_QZ333dOkyUbDNpxZRxGo3HW1uA0XcNqQpiZBjjPLyKILmE',
      ),
    )

    cy.get('h1').should('contain', 'Cette invitation n’est plus valide.')
  })
})
