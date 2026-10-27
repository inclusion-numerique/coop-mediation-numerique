import { CodeDepartement, NomDepartement } from '@app/web/libraries/departement'
import { Jour, NombreDAccompagnements } from '../../domain'
import {
  exportDesAccompagnementsCsv,
  nomDuFichierDExport,
} from './export-des-accompagnements.csv'

describe('exportDesAccompagnementsCsv', () => {
  it('écrit une ligne par département sous l’en-tête', () => {
    expect(
      exportDesAccompagnementsCsv([
        {
          departement: {
            code: CodeDepartement('2A'),
            nom: NomDepartement('Corse-du-Sud'),
          },
          conseillersNumeriques: NombreDAccompagnements(0),
          autresMediateurs: NombreDAccompagnements(5),
        },
      ]),
    ).toBe(
      'Département,Code,Accompagnements conum,Accompagnements médiateur\n2A,Corse-du-Sud,0,5\n',
    )
  })
})

describe('nomDuFichierDExport', () => {
  it('porte la date de fin quand elle est donnée', () => {
    expect(nomDuFichierDExport(Jour('2026-10-01'))).toBe(
      'accompagnements_2026-10-01',
    )
  })

  it('reste générique sans date', () => {
    expect(nomDuFichierDExport(null)).toBe('accompagnements')
  })
})
