import {
  CoordinateurId,
  MediateurId,
} from '@app/web/features/utilisateurs/domain'
import { activationDe } from './mediation'

const coordinateur = CoordinateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const mediateur = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')

describe('activer la médiation numérique', () => {
  it('ajoute le rôle médiateur à un coordinateur', () => {
    expect(activationDe({ _tag: 'coordinateur', coordinateur })).toEqual({
      success: true,
      data: 'AActiver',
    })
  })

  it('ne refait rien si la médiation est déjà active', () => {
    expect(
      activationDe({
        _tag: 'mediateurEtCoordinateur',
        mediateur,
        coordinateur,
      }),
    ).toEqual({
      success: true,
      data: 'DejaActivee',
    })
  })

  it('est réservée aux coordinateurs', () => {
    expect(activationDe({ _tag: 'aucun' })).toEqual({
      success: false,
      error: { _tag: 'NonCoordinateur' },
    })
  })
})
