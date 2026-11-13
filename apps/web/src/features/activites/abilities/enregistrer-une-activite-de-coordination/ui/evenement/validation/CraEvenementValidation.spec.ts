import { CraEvenementValidation } from './CraEvenementValidation'

describe('validation de la saisie d’un évènement', () => {
  it('demande le nombre de participants quand il est vide', () => {
    const resultat = CraEvenementValidation.shape.participants.safeParse(
      Number.NaN,
    )

    expect(resultat.error?.issues[0]?.message).toBe(
      'Veuillez renseigner le nombre de participants',
    )
  })
})
