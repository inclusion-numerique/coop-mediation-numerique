import {
  AvertissementsEtatInscription,
  type EtatInscriptionUtilisateur,
} from '@app/web/features/inscription/components/AvertissementsEtatInscription'
import React from 'react'

const PREMIERE_ETAPE = 'Inscription restée à la première étape'
const VALIDEE_SANS_ROLE = 'Inscription validée sans compte de rôle'

const utilisateur = (
  etat: Partial<EtatInscriptionUtilisateur>,
): EtatInscriptionUtilisateur => ({
  role: 'User',
  inscriptionValidee: null,
  mediateur: null,
  coordinateur: null,
  ...etat,
})

/**
 * Le composant est monté dans une zone repérable, et toute assertion d'ABSENCE
 * attend d'abord cette zone.
 *
 * Sans cela, `should('not.exist')` est satisfait dès le premier essai — à t=0,
 * avant que React n'ait peint — et ne réessaie jamais : les cas « aucun
 * avertissement » passaient alors même que la notice finissait par s'afficher.
 * Attendre la zone suffit à lever la course, React committant l'arbre d'un bloc.
 *
 * Pour la même raison, on n'écrit jamais `cy.contains(texte).should('not.exist')`.
 */
const monter = (user: EtatInscriptionUtilisateur) =>
  cy.mount(
    <div data-cy="zone">
      <AvertissementsEtatInscription user={user} />
    </div>,
  )

const avertissements = () => cy.get('[data-cy=zone] .fr-notice')

const aucunAvertissement = () => {
  cy.get('[data-cy=zone]').should('exist')
  cy.get('[data-cy=zone] .fr-notice').should('not.exist')
}

describe('<AvertissementsEtatInscription />', () => {
  it('signale une inscription restée à la première étape : ni validée, ni compte de rôle', () => {
    monter(utilisateur({}))

    avertissements().should('have.length', 1)
    avertissements().should('contain.text', PREMIERE_ETAPE)
    avertissements().should('not.contain.text', VALIDEE_SANS_ROLE)
  })

  // Le cas que `isUserInscriptionEnCours` ne voit pas : elle ne regarde que
  // `inscriptionValidee`, donc ce compte échappait aux deux avertissements.
  it('signale une inscription validée sans compte de rôle', () => {
    monter(utilisateur({ inscriptionValidee: new Date('2026-08-24') }))

    avertissements().should('have.length', 1)
    avertissements().should('contain.text', VALIDEE_SANS_ROLE)
    avertissements().should('not.contain.text', PREMIERE_ETAPE)
  })

  it('ne signale rien pour une inscription validée avec un compte de rôle', () => {
    monter(
      utilisateur({
        inscriptionValidee: new Date('2026-08-24'),
        mediateur: { id: 'un-mediateur' },
      }),
    )

    aucunAvertissement()
  })

  // Un administrateur n'a ni médiateur ni coordinateur par nature : sans la garde
  // sur le rôle, il déclencherait l'avertissement à chaque affichage de sa fiche.
  it('ne signale rien pour un administrateur, qui n’a pas de compte de rôle par nature', () => {
    monter(
      utilisateur({
        role: 'Admin',
        inscriptionValidee: new Date('2026-08-24'),
      }),
    )

    aucunAvertissement()
  })
})
