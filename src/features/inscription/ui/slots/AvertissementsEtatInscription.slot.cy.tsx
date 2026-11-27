import {
  AvertissementsEtatInscription,
  type EtatInscriptionUtilisateur,
} from '@/features/inscription/ui/slots/AvertissementsEtatInscription.slot'

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
