import { CreerBeneficiaireValidation } from './creer-beneficiaire.validation'

const minimal = { prenom: 'Jean', nom: 'Dupont' }

describe('CreerBeneficiaireValidation', () => {
  it('maps a minimal form to a domain input', () => {
    expect(CreerBeneficiaireValidation.parse(minimal)).toEqual({
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

  it('requires prenom and nom', () => {
    expect(() => CreerBeneficiaireValidation.parse({ nom: 'Dupont' })).toThrow()
    expect(() =>
      CreerBeneficiaireValidation.parse({ prenom: 'Jean' }),
    ).toThrow()
  })

  it('trims prenom and nom', () => {
    const result = CreerBeneficiaireValidation.parse({
      prenom: '  Jean  ',
      nom: '  Dupont  ',
    })
    expect(result.prenom).toBe('Jean')
    expect(result.nom).toBe('Dupont')
  })

  it('rejects a prenom or nom over the max length', () => {
    expect(() =>
      CreerBeneficiaireValidation.parse({ ...minimal, nom: 'x'.repeat(101) }),
    ).toThrow()
    expect(() =>
      CreerBeneficiaireValidation.parse({
        ...minimal,
        prenom: 'x'.repeat(101),
      }),
    ).toThrow()
  })

  it('builds a disponible contact when a telephone is provided', () => {
    expect(
      CreerBeneficiaireValidation.parse({
        ...minimal,
        telephone: '0102030405',
      }).contactTelephone,
    ).toEqual({ _tag: 'disponible', numero: '+33102030405' })
  })

  it('builds a pasDeTelephone contact', () => {
    expect(
      CreerBeneficiaireValidation.parse({
        ...minimal,
        pasDeTelephone: true,
      }).contactTelephone,
    ).toEqual({ _tag: 'pasDeTelephone' })
  })

  it('treats blank email and telephone as absent', () => {
    const result = CreerBeneficiaireValidation.parse({
      ...minimal,
      email: '',
      telephone: '',
    })
    expect(result.email).toBeNull()
    expect(result.contactTelephone).toEqual({ _tag: 'nonRenseigne' })
  })

  it('rejects an invalid email', () => {
    expect(() =>
      CreerBeneficiaireValidation.parse({ ...minimal, email: 'not-an-email' }),
    ).toThrow()
  })

  it('builds a commune residence from flat fields', () => {
    expect(
      CreerBeneficiaireValidation.parse({
        ...minimal,
        communeResidence: {
          commune: 'Paris',
          codePostal: '75001',
          codeInsee: '75101',
          adresse: '12 rue de la Paix',
        },
      }).communeResidence,
    ).toEqual({
      commune: 'Paris',
      codePostal: '75001',
      codeInsee: '75101',
      adresse: '12 rue de la Paix',
    })
  })

  it('ignores any trancheAge sent by the form (derived from année)', () => {
    const result = CreerBeneficiaireValidation.parse({
      ...minimal,
      trancheAge: 'SoixanteDixPlus',
    })
    expect(result).not.toHaveProperty('trancheAge')
  })
})
