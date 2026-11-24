import { appUrl } from '@e2e/support/helpers'
import { goToMostRecentEmailReceived } from '@e2e/support/maildev'
import { conseillerNumerique } from '@/features/utilisateurs/fixtures/conseillers/conseiller-numerique'
import { coordinateurInscrit } from '@/features/utilisateurs/fixtures/coordinateurs/coordinateur-inscrit'
import { mediateurInscription } from '@/features/utilisateurs/fixtures/mediateurs/mediateur-inscription'
import { nomAffiche } from '@/libraries/nom-affiche'

const nomAfficheDe = (utilisateur: {
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  email: string
}) =>
  nomAffiche({
    prenom: utilisateur.firstName ?? null,
    nom: utilisateur.lastName ?? null,
    nomComplet: utilisateur.name ?? null,
    courriel: utilisateur.email,
  })

const searchAndInviteUser = ({
  displayName,
  email,
  search,
}: {
  search: string
  displayName: string
  email: string
}) => {
  cy.findByRole('combobox').type(search)

  cy.contains('[role="option"]', email, { timeout: 10_000 }).click()

  cy.findByRole('button', { name: displayName })
}

describe('ETQ coordinateur, je peux inviter un médiateur à rejoindre mon équipe', () => {
  before(() => {
    cy.execute('preparerLesPersonas', {
      ids: [
        conseillerNumerique.id,
        mediateurInscription.id,
        coordinateurInscrit.id,
      ],
    })
  })

  it('Je vois le médiateur invité dans la liste des médiateurs', () => {
    cy.signin(coordinateurInscrit)

    cy.visit(appUrl('/coop/mon-equipe'))
    cy.findAllByRole('link', { name: 'Inviter une personne' }).first().click()

    cy.visit(appUrl('/coop/mon-equipe/inviter'))

    searchAndInviteUser({
      search: 'conseiller',
      displayName: nomAfficheDe(conseillerNumerique),
      email: conseillerNumerique.email,
    })

    searchAndInviteUser({
      search: 'mediateur',
      displayName: nomAfficheDe(mediateurInscription),
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
