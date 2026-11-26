import { describe, expect, it } from 'vitest'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { versBeneficiaireFusionne } from './beneficiaire-fusionne.transfer'

const ligne = {
  id: '5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f',
  prenom: 'Léa',
  nom: 'Martin',
  email: null,
  telephone: null,
  mediateurId: '8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
  adresse: null,
  anneeNaissance: 1996,
  commune: 'Évreux',
}

describe('bénéficiaire fusionné lu en base', () => {
  it('brande les identifiants du bénéficiaire et de son médiateur', () => {
    expect(versBeneficiaireFusionne(ligne)).toEqual({
      ...ligne,
      id: BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f'),
      mediateurId: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
    })
  })

  it('refuse un identifiant de bénéficiaire invalide', () => {
    expect(() =>
      versBeneficiaireFusionne({ ...ligne, id: 'invalide' }),
    ).toThrow()
  })
})
