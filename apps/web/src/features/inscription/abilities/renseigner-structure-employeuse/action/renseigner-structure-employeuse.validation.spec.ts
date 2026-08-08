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

  it('accepte l’identifiant main de la recherche, qui n’est pas un uuid', () => {
    // Régression : la recherche d'employeuse rend `String(main.structure_administrative.id)`,
    // un entier stringifié. Exiger un uuid ici — hypothèse héritée du monde coop —
    // faisait échouer la validation à la soumission, sans navigation ni message
    // exploitable pour l'utilisateur.
    const result = RenseignerStructureEmployeuseValidation.safeParse({
      structureEmployeuse: {
        id: '42',
        nom: 'Ma Structure',
        siret: '35600000000048',
        adresseBan,
      },
    })

    expect(result.success).toBe(true)
  })

  it('rejette un SIRET invalide', () => {
    expect(
      RenseignerStructureEmployeuseValidation.safeParse({
        structureEmployeuse: { nom: 'X', siret: '123', adresseBan },
      }).success,
    ).toBe(false)
  })
})
