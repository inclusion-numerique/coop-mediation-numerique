import { RenseignerStructureEmployeuseValidation } from './renseigner-structure-employeuse.validation'

const adresseBan = {
  id: 'adr-1',
  nom: '12 rue de la Paix',
  commune: 'Paris',
  codeInsee: '75101',
  codePostal: '75001',
  contexte: '75, Paris',
  latitude: 48.86,
  longitude: 2.33,
}

describe('RenseignerStructureEmployeuseValidation', () => {
  it('projette la structure validée vers l’input domaine', () => {
    const result = RenseignerStructureEmployeuseValidation.parse({
      structureEmployeuse: {
        nom: 'Ma Structure',
        siret: '35600000000048',
        adresseBan,
      },
    })

    expect(result.structureEmployeuse).toMatchObject({
      id: null,
      nom: 'Ma Structure',
      siret: '35600000000048',
      adresse: { commune: 'Paris', codeInsee: '75101' },
      typologies: [],
    })
  })

  it('rejette un SIRET invalide', () => {
    expect(
      RenseignerStructureEmployeuseValidation.safeParse({
        structureEmployeuse: { nom: 'X', siret: '123', adresseBan },
      }).success,
    ).toBe(false)
  })
})
