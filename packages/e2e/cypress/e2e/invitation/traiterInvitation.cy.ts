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

    goToMostRecentEmailReceived({
      subjectInclude: `${invitationData.email} a accepté votre invitation à rejoindre votre équipe`,
    })
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

    executeInscriptionFlow({
      signin: true,
      user: mediateurInscription,
      expectSuccessToast: true,
      expectOnboarding: 'mediateur',
      skipOnboarding: true,
      expectedSteps: [
        // quickly do the steps without any check() that are done in other cypress e2e inscription tests
        {
          step: 'choisir-role',
          role: 'Mediateur',
          acceptCgu: true,
        },
        {
          step: 'verifier-informations',
          accept: true,
        },
        {
          step: 'lieux-activite',
          structureEmployeuseIsLieuActivite: true,
        },
        {
          step: 'lieux-activite',
        },
        {
          step: 'recapitulatif',
          conseillerNumeriqueRoleNotice: 'none',
        },
      ],
    })

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

  it.only("En tentant de l'accepter, mais avec un mauvais lien", () => {
    const invitationUrl = createInvitationUrl({
      email: invitationData.email,
      coordinateurId: invitationData.coordinateurId,
    })

    cy.visit(appUrl('/invitations/error'))

    cy.visit(appUrl(invitationUrl))

    cy.intercept('/api/trpc/mediateur.acceptInvitation*').as(
      'acceptInvitationMutation',
    )

    cy.findByText('Accepter l’invitation').click().allowNextRedirectException()

    cy.wait('@acceptInvitationMutation', { timeout: 15_000 })

    cy.visit(appUrl(invitationUrl))

    cy.get('h1').should('contain', 'Cette invitation n’est plus valide.')
  })
})
