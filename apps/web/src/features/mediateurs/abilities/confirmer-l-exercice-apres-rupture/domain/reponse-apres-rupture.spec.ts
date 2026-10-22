import { ReponseApresRupture, visibiliteApres } from './reponse-apres-rupture'

describe('visibilité après la réponse à la rupture', () => {
  it('reste visible quand la personne continue d’exercer', () => {
    expect(visibiliteApres(ReponseApresRupture('ContinueDExercer'), true)).toBe(
      true,
    )
  })

  it('reste masquée quand la personne continue d’exercer sans s’être rendue visible', () => {
    expect(
      visibiliteApres(ReponseApresRupture('ContinueDExercer'), false),
    ).toBe(false)
  })

  it('est retirée quand la personne n’exerce plus', () => {
    expect(visibiliteApres(ReponseApresRupture('NExercePlus'), true)).toBe(
      false,
    )
  })
})
