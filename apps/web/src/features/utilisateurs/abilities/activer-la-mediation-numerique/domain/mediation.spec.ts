import { activationDe } from './mediation'

describe('activer la médiation numérique', () => {
  it('ajoute le rôle médiateur à un coordinateur', () => {
    expect(
      activationDe({ estCoordinateur: true, estMediateur: false }),
    ).toEqual({
      success: true,
      data: 'AActiver',
    })
  })

  it('ne refait rien si la médiation est déjà active', () => {
    expect(activationDe({ estCoordinateur: true, estMediateur: true })).toEqual(
      {
        success: true,
        data: 'DejaActivee',
      },
    )
  })

  it('est réservée aux coordinateurs', () => {
    expect(
      activationDe({ estCoordinateur: false, estMediateur: false }),
    ).toEqual({
      success: false,
      error: { _tag: 'NonCoordinateur' },
    })
  })
})
