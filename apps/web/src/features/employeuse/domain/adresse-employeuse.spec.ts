import type { Model } from '@app/web/libraries/model'
import { AdresseEmployeuse } from './adresse-employeuse'

// Le type d'ENTRÉE du modèle, pas sa sortie brandée : c'est lui qui décrit ce
// qu'on a le droit de soumettre au constructeur, y compris des valeurs que la
// validation rejettera.
type AdresseInput = Model.InputOf<typeof AdresseEmployeuse>

const adresse = (overrides: Partial<AdresseInput> = {}): AdresseInput => ({
  voie: '12 rue des Tests',
  codePostal: '44000',
  codeInsee: '44109',
  commune: 'Nantes',
  ...overrides,
})

describe('AdresseEmployeuse', () => {
  it('accepte une adresse complète', () => {
    expect(AdresseEmployeuse(adresse())).toEqual({
      voie: '12 rue des Tests',
      codePostal: '44000',
      codeInsee: '44109',
      commune: 'Nantes',
    })
  })

  it('tolère l’absence de voie — seule elle peut manquer dans main.adresse', () => {
    expect(AdresseEmployeuse(adresse({ voie: null }))).toMatchObject({
      voie: null,
    })
  })

  describe('code postal', () => {
    it('exige 5 chiffres', () => {
      expect(AdresseEmployeuse.safe(adresse({ codePostal: '4400' }))).toBeNull()
      expect(
        AdresseEmployeuse.safe(adresse({ codePostal: '440000' })),
      ).toBeNull()
      expect(
        AdresseEmployeuse.safe(adresse({ codePostal: '4400A' })),
      ).toBeNull()
      expect(AdresseEmployeuse.safe(adresse({ codePostal: '' }))).toBeNull()
    })

    it('accepte les DOM — 5 chiffres couvre 97xxx et 98xxx', () => {
      expect(AdresseEmployeuse(adresse({ codePostal: '97400' }))).toMatchObject(
        {
          codePostal: '97400',
        },
      )
    })

    it('normalise les espaces, y compris imbriqué dans l’adresse', () => {
      expect(
        AdresseEmployeuse(adresse({ codePostal: ' 44 000 ' })),
      ).toMatchObject({ codePostal: '44000' })
    })

    // Le schéma est TOTAL : le code postal ne dégrade pas à `null`, il emporte
    // l'adresse entière — donc le code INSEE avec lui, et le rattachement au
    // département. Arbitrage assumé (cf. en-tête d'adresse-employeuse.ts) :
    // 22 lignes sur 43 313 en base. Si ce comptage monte, c'est ce test qu'il
    // faudra rouvrir en premier.
    it('fait tomber l’adresse ENTIÈRE quand le code postal est hors format', () => {
      expect(
        AdresseEmployeuse.safe(adresse({ codePostal: 'pas-un-code' })),
      ).toBeNull()
    })
  })

  describe('code INSEE', () => {
    it('accepte la Corse', () => {
      expect(AdresseEmployeuse(adresse({ codeInsee: '2A004' }))).toMatchObject({
        codeInsee: '2A004',
      })
    })

    // Régression : le normalisateur de CodeInsee vivait dans le second argument
    // de defineModel, qui n'est PAS appliqué quand `.schema` est imbriqué ici.
    // Un code corse en minuscules faisait donc tomber l'adresse entière, alors
    // que CodeInsee('2a004') l'acceptait.
    it('normalise la casse de la Corse, y compris imbriqué dans l’adresse', () => {
      expect(AdresseEmployeuse(adresse({ codeInsee: '2a004' }))).toMatchObject({
        codeInsee: '2A004',
      })
    })

    it('écarte un code hors format', () => {
      expect(AdresseEmployeuse.safe(adresse({ codeInsee: '441' }))).toBeNull()
    })
  })

  it('exige une commune', () => {
    expect(AdresseEmployeuse.safe(adresse({ commune: '' }))).toBeNull()
  })
})
