import adressesConsignees from './adresses-consignees.json'
import {
  adresseDuNumero,
  registreDesAdressesConsignees,
} from './situer-les-adresses-consignees'

describe('le registre des adresses consignées', () => {
  it('se lit sans erreur', () => {
    expect(registreDesAdressesConsignees(adressesConsignees).size).toBe(
      adressesConsignees.length,
    )
  })

  it('ne consigne qu’une adresse par lieu', () => {
    expect(new Set(adressesConsignees.map(({ lieuId }) => lieuId)).size).toBe(
      adressesConsignees.length,
    )
  })

  it('refuse une consignation sans source', () => {
    expect(() =>
      registreDesAdressesConsignees([
        {
          lieuId: '550e8400-e29b-41d4-a716-446655440000',
          nom: 'Mairie de Reims',
          adresse: '9 Place de l’Hôtel de Ville 51100 Reims',
          codeInsee: '51454',
          source: '',
        },
      ]),
    ).toThrow()
  })
})

describe('le numéro que la BAN rend par son identifiant', () => {
  const NUMERO = {
    type: 'numero',
    cleInterop: '84138_7cw24f_00005',
    numero: 5,
    suffixe: null,
    lat: 44.383318,
    lon: 4.989868,
    codePostal: '84600',
    voie: { nomVoie: 'Place Aristide Briand La Ville' },
    commune: { code: '84138', nom: 'Valréas' },
  }

  it('devient une adresse géocodée, sûre puisque désignée par son identifiant', () => {
    expect(adresseDuNumero(NUMERO)).toEqual({
      type: 'housenumber',
      score: 1,
      banId: '84138_7cw24f_00005',
      voie: '5 Place Aristide Briand La Ville',
      commune: 'Valréas',
      codePostal: '84600',
      codeInsee: '84138',
      ancienCodeInsee: '',
      latitude: 44.383318,
      longitude: 4.989868,
      libelle: '5 Place Aristide Briand La Ville 84600 Valréas',
    })
  })

  it('accole le suffixe au numéro', () => {
    expect(adresseDuNumero({ ...NUMERO, suffixe: 'bis' })?.voie).toBe(
      '5bis Place Aristide Briand La Ville',
    )
  })

  it('ne rend rien pour une voie ou un lieu-dit, qui n’a pas de code postal à lui', () => {
    expect(
      adresseDuNumero({ type: 'voie', id: '84138_7cw24f', nomVoie: 'Place' }),
    ).toBeNull()
  })

  it('ne rend rien pour une réponse inattendue', () => {
    expect(adresseDuNumero({ code: 404, message: 'introuvable' })).toBeNull()
  })
})
