import {
  candidatDuRegistre,
  type InscriptionPourLaCorrelation,
} from './candidat-du-registre'

const inscription = (
  surcharge: Partial<InscriptionPourLaCorrelation> = {},
): InscriptionPourLaCorrelation => ({
  id: 4218,
  nom: 'Espace numérique',
  typologies: [],
  adresse: {
    numeroVoie: 12,
    repetition: null,
    nomVoie: 'rue Foch',
    nomCommune: 'Reims',
    codePostal: '51100',
    codeInsee: '51454',
  },
  ...surcharge,
})

describe('l’inscription du registre, présentée à la corrélation', () => {
  it('rend l’adresse en une ligne, comme la coop la tient', () => {
    expect(candidatDuRegistre(inscription())?.adresse).toBe('12 rue Foch')
  })

  it('porte l’identifiant en chaîne, ce que le standard attend', () => {
    expect(candidatDuRegistre(inscription())?.id).toBe('4218')
  })

  it('ne présente pas une inscription sans adresse', () => {
    expect(candidatDuRegistre(inscription({ adresse: null }))).toBeNull()
  })

  it('ne présente jamais de coordonnées', () => {
    const candidat = candidatDuRegistre(inscription())

    expect(candidat?.latitude).toBeNull()
    expect(candidat?.longitude).toBeNull()
  })
})
