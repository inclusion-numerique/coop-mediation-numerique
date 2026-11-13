import { Effectif, Jour } from '../../../domain'
import { Mois } from '../domain'
import { parPeriodePresentes } from './par-periode.presenter'

describe('accompagnements par période présentés', () => {
  it('libelle les jours en JJ/MM et les mois en MM/AA', () => {
    expect(
      parPeriodePresentes({
        parJour: [{ jour: Jour('2026-03-02'), nombre: Effectif(3) }],
        parMois: [{ mois: Mois('2026-03'), nombre: Effectif(4) }],
      }),
    ).toEqual({
      accompagnementsParJour: [{ label: '02/03', count: 3 }],
      accompagnementsParMois: [{ label: '03/26', count: 4 }],
    })
  })
})
