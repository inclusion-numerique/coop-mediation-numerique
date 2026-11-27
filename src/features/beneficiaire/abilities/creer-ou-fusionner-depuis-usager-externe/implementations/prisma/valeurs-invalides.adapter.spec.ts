import { describe, expect, it } from 'vitest'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { valeursInvalidesEnErreurs } from './valeurs-invalides.adapter'

describe('valeurs invalides d’un bénéficiaire fusionné', () => {
  it('nomme chaque champ invalide, sans en donner la valeur', () => {
    expect(
      valeursInvalidesEnErreurs({
        beneficiaire: {
          id: BeneficiaireId('5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f'),
          nom: null,
          prenom: null,
          email: null,
          telephone: null,
          mediateurId: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
          adresse: null,
          anneeNaissance: null,
          commune: null,
        },
        invalides: ['telephone', 'email'],
      }).map(({ message }) => message),
    ).toEqual([
      'Bénéficiaire 5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f : telephone invalide en base, lu comme absent pour la fusion',
      'Bénéficiaire 5f0c7a52-1b9e-4c3a-9d2e-7a8b6c5d4e3f : email invalide en base, lu comme absent pour la fusion',
    ])
  })
})
