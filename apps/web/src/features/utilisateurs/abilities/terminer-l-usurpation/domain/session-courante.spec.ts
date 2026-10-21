import { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { type SessionCourante, usurpateurARetrouver } from './session-courante'

const administrateur = UtilisateurId('1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f')

const session = (
  usurpation: SessionCourante['usurpation'],
): SessionCourante => ({
  jeton: 'jeton',
  usurpation,
})

describe('terminer une usurpation', () => {
  it('rend la session à l’administrateur usurpateur', () => {
    expect(
      usurpateurARetrouver(
        session({
          _tag: 'EnCours',
          usurpateurId: administrateur,
          usurpateurEstAdministrateur: true,
        }),
      ),
    ).toEqual({ success: true, data: administrateur })
  })

  it('refuse sans usurpation en cours', () => {
    expect(usurpateurARetrouver(session({ _tag: 'Aucune' }))).toEqual({
      success: false,
      error: { _tag: 'AucuneUsurpationEnCours' },
    })
  })

  it('refuse si l’usurpateur n’est plus administrateur', () => {
    expect(
      usurpateurARetrouver(
        session({
          _tag: 'EnCours',
          usurpateurId: administrateur,
          usurpateurEstAdministrateur: false,
        }),
      ),
    ).toEqual({
      success: false,
      error: { _tag: 'UsurpateurNonAdministrateur' },
    })
  })
})
