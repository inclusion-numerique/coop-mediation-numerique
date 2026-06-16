import { ModifierBeneficiaireValidation } from './modifier-beneficiaire.validation'

const id = '550e8400-e29b-41d4-a716-446655440000'
const minimal = { id, prenom: 'Jean', nom: 'Dupont' }

describe('ModifierBeneficiaireValidation', () => {
  it('maps a minimal form to a domain input carrying the id', () => {
    expect(ModifierBeneficiaireValidation.parse(minimal)).toEqual({
      id,
      prenom: 'Jean',
      nom: 'Dupont',
      contactTelephone: { _tag: 'nonRenseigne' },
      email: null,
      anneeNaissance: null,
      communeResidence: null,
      genre: 'NonCommunique',
      statutSocial: 'NonCommunique',
      notes: null,
    })
  })

  it('requires a valid uuid id', () => {
    expect(() =>
      ModifierBeneficiaireValidation.parse({ prenom: 'Jean', nom: 'Dupont' }),
    ).toThrow()
    expect(() =>
      ModifierBeneficiaireValidation.parse({ ...minimal, id: 'not-a-uuid' }),
    ).toThrow()
  })

  it('reuses the création mapping (derived contact, enum defaults)', () => {
    const result = ModifierBeneficiaireValidation.parse({
      ...minimal,
      telephone: '0102030405',
      genre: 'Feminin',
    })
    expect(result.contactTelephone).toEqual({
      _tag: 'disponible',
      numero: '0102030405',
    })
    expect(result.genre).toBe('Feminin')
  })
})
