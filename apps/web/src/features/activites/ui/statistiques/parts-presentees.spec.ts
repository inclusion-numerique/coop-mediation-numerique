import { Commune, Effectif } from '../../domain'
import { libelleDeLaCommune, partsPresentees } from './parts-presentees'

describe('parts présentées', () => {
  it('calcule la part de chaque ligne sur leur total', () => {
    expect(
      partsPresentees(
        [
          { valeur: 'a', nombre: Effectif(1) },
          { valeur: 'b', nombre: Effectif(3) },
        ],
        (valeur) => ({ value: valeur, label: valeur.toUpperCase() }),
      ),
    ).toEqual([
      { value: 'a', label: 'A', count: 1, proportion: 25 },
      { value: 'b', label: 'B', count: 3, proportion: 75 },
    ])
  })

  it('libelle une commune avec son code postal, sinon non communiqué', () => {
    const commune = Commune({
      nom: 'Thuir',
      codePostal: '66300',
      codeInsee: '66210',
    })
    expect(libelleDeLaCommune({ type: 'Renseignee', commune })).toBe(
      'Thuir · 66300',
    )
    expect(libelleDeLaCommune({ type: 'Renseignee', commune }, ' ')).toBe(
      'Thuir · 66300',
    )
    expect(libelleDeLaCommune({ type: 'NonCommuniquee' })).toBe(
      'Non communiqué',
    )
  })
})
