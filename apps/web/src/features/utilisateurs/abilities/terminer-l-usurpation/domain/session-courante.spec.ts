import { type SessionCourante, usurpateurARetrouver } from './session-courante'

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
          usurpateurId: 'admin',
          usurpateurEstAdministrateur: true,
        }),
      ),
    ).toEqual({ success: true, data: 'admin' })
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
          usurpateurId: 'ancien-admin',
          usurpateurEstAdministrateur: false,
        }),
      ),
    ).toEqual({
      success: false,
      error: { _tag: 'UsurpateurNonAdministrateur' },
    })
  })
})
