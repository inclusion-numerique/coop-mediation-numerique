import { avecIdentifiantCarto } from './identifiants-carto'

describe('l’identité cartographique, aplatie depuis l’inscription', () => {
  it('remonte l’identifiant que porte l’inscription', () => {
    expect(
      avecIdentifiantCarto({
        inscriptionRegistre: { structureCartographieNationaleId: 'carto-42' },
      }).structureCartographieNationaleId,
    ).toBe('carto-42')
  })

  it('rend null quand le lieu n’est pas inscrit au registre', () => {
    expect(
      avecIdentifiantCarto({ inscriptionRegistre: null })
        .structureCartographieNationaleId,
    ).toBeNull()
  })

  it('rend null quand l’inscription ne porte pas d’identifiant', () => {
    expect(
      avecIdentifiantCarto({
        inscriptionRegistre: { structureCartographieNationaleId: null },
      }).structureCartographieNationaleId,
    ).toBeNull()
  })

  it('garde tout ce que le lieu disait par ailleurs', () => {
    const aplati = avecIdentifiantCarto({
      id: '550e8400-e29b-41d4-a716-446655440000',
      nom: 'Espace numérique',
      inscriptionRegistre: { structureCartographieNationaleId: 'carto-42' },
    })

    expect(aplati.id).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(aplati.nom).toBe('Espace numérique')
    expect(aplati).not.toHaveProperty('inscriptionRegistre')
  })
})
