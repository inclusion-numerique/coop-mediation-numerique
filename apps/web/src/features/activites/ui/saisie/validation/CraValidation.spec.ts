import { CraValidation } from './CraValidation'

const materiel = CraValidation.shape.materiel

describe('validation du matériel de la saisie', () => {
  it('accepte « Pas de matériel » seul', () => {
    expect(materiel.safeParse(['Aucun']).success).toBe(true)
  })

  it('accepte plusieurs matériels', () => {
    expect(materiel.safeParse(['Ordinateur', 'Telephone']).success).toBe(true)
  })

  it('refuse « Pas de matériel » combiné à un matériel', () => {
    const resultat = materiel.safeParse(['Ordinateur', 'Aucun'])

    expect(resultat.error?.issues[0]?.message).toBe(
      '« Pas de matériel » ne se combine pas avec un matériel',
    )
  })
})
