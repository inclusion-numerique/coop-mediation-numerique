import { NomDuRegistre, PrenomDuRegistre } from './nom-du-registre'

describe('nom au registre', () => {
  it('passe en majuscules et retire les espaces autour', () => {
    expect(NomDuRegistre('  de la Fontaine ')).toBe('DE LA FONTAINE')
  })

  it('conserve les accents', () => {
    expect(NomDuRegistre('Lefèvre')).toBe('LEFÈVRE')
  })

  it('refuse un nom vide', () => {
    expect(NomDuRegistre.safe('   ')).toBeNull()
  })

  it('refuse un nom trop long pour la colonne', () => {
    expect(NomDuRegistre.safe('a'.repeat(51))).toBeNull()
    expect(NomDuRegistre.safe('a'.repeat(50))).toBe('A'.repeat(50))
  })
})

describe('prénom au registre', () => {
  it('met une majuscule initiale au prénom', () => {
    expect(PrenomDuRegistre('  cAMILLE ')).toBe('Camille')
  })

  it('traite chaque segment séparé par un tiret ou un espace', () => {
    expect(PrenomDuRegistre('jean-luc')).toBe('Jean-Luc')
    expect(PrenomDuRegistre('MARIE anne')).toBe('Marie Anne')
  })

  it('met en majuscule une initiale accentuée', () => {
    expect(PrenomDuRegistre('élodie')).toBe('Élodie')
  })

  it('refuse un prénom vide ou trop long', () => {
    expect(PrenomDuRegistre.safe('')).toBeNull()
    expect(PrenomDuRegistre.safe('a'.repeat(51))).toBeNull()
  })
})
