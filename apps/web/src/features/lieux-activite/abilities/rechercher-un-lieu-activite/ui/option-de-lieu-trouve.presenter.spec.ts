import { Adresse, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { LieuId } from '../../../domain/lieu-id'
import { NombreDActivites } from '../../../domain/nombres'
import { optionDeLieuTrouve } from './option-de-lieu-trouve.presenter'

const trouve = {
  id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
  nom: Nom('Maison France Services'),
  activites: NombreDActivites(12),
  lePlusUtilise: true,
}

describe('un lieu trouvé, proposé dans la saisie d’une activité', () => {
  it('écrit son adresse sur une ligne', () => {
    expect(
      optionDeLieuTrouve({
        ...trouve,
        adresse: Adresse({
          voie: '12 rue de la Paix',
          commune: 'Reims',
          code_postal: '51100',
        }),
      }),
    ).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nom: 'Maison France Services',
      adresse: '12 rue de la Paix, 51100 Reims',
      lePlusUtilise: true,
    })
  })

  it('n’écrit rien quand l’adresse n’est pas reconnue', () => {
    expect(optionDeLieuTrouve({ ...trouve, adresse: null }).adresse).toBe('')
  })
})
