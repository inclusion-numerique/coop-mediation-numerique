import { essaimageDesTagsDuCoordinateur } from './essaimage-tags'
import { MediateurId } from './mediateur-id'

const MEDIATEUR = MediateurId('33333333-3333-4333-8333-333333333333')
const AUTRE_MEDIATEUR = MediateurId('44444444-4444-4444-8444-444444444444')

describe('essaimage des tags d’un coordinateur', () => {
  it('essaime chez chaque médiateur qui s’en est servi', () => {
    expect(
      essaimageDesTagsDuCoordinateur([MEDIATEUR, AUTRE_MEDIATEUR]),
    ).toEqual({ _tag: 'essaime', vers: [MEDIATEUR, AUTRE_MEDIATEUR] })
  })

  it('n’essaime qu’une fois chez un médiateur qui a taggué plusieurs comptes rendus', () => {
    expect(essaimageDesTagsDuCoordinateur([MEDIATEUR, MEDIATEUR])).toEqual({
      _tag: 'essaime',
      vers: [MEDIATEUR],
    })
  })

  it('supprime un tag que personne n’a employé', () => {
    expect(essaimageDesTagsDuCoordinateur([])).toEqual({ _tag: 'supprime' })
  })
})
