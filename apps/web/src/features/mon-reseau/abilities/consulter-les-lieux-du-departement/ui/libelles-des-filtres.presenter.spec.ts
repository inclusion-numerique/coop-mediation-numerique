import { criteresDesLieux } from '../domain'
import { etiquettesDesCommunes } from './libelles-des-filtres.presenter'

describe('étiquettes des filtres de l’annuaire des lieux', () => {
  it('nomme chaque commune retenue', () => {
    expect(
      etiquettesDesCommunes(criteresDesLieux({ communes: '15014' }), [
        { value: '15014', label: 'Aurillac · 15000' },
        { value: '15187', label: 'Saint-Flour · 15100' },
      ]),
    ).toEqual([{ cle: '15014', libelle: 'Commune : Aurillac · 15000' }])
  })
})
