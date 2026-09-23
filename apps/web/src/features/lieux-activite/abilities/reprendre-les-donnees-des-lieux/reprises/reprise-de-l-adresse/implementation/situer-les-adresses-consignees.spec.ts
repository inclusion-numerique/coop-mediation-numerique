import adressesConsignees from './adresses-consignees.json'
import { registreDesAdressesConsignees } from './situer-les-adresses-consignees'

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
