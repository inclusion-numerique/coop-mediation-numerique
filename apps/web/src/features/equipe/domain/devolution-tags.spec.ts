import { CoordinateurId } from './coordinateur-id'
import {
  devolutionDesTagsDuMediateur,
  essaimageDesTagsDuCoordinateur,
} from './devolution-tags'
import { MediateurId } from './mediateur-id'

const UN = CoordinateurId('11111111-1111-4111-8111-111111111111')
const AUTRE = CoordinateurId('22222222-2222-4222-8222-222222222222')
const MEDIATEUR = MediateurId('33333333-3333-4333-8333-333333333333')
const AUTRE_MEDIATEUR = MediateurId('44444444-4444-4444-8444-444444444444')

describe('dévolution des tags d’un médiateur', () => {
  it('les transfère à son coordinateur quand il n’en a qu’un', () => {
    expect(devolutionDesTagsDuMediateur([UN])).toEqual({
      _tag: 'transfere',
      vers: UN,
    })
  })

  it('les supprime faute de destinataire', () => {
    expect(devolutionDesTagsDuMediateur([])).toEqual({ _tag: 'supprime' })
  })

  // Le cas que la suite BDD ne couvrait pas : arbitrer entre deux héritiers
  // n'est pas le rôle d'une suppression de compte.
  it('les supprime plutôt que d’arbitrer entre plusieurs coordinateurs', () => {
    expect(devolutionDesTagsDuMediateur([UN, AUTRE])).toEqual({
      _tag: 'supprime',
    })
  })

  it('voit un seul destinataire derrière des coordinations en double', () => {
    expect(devolutionDesTagsDuMediateur([UN, UN])).toEqual({
      _tag: 'transfere',
      vers: UN,
    })
  })
})

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
