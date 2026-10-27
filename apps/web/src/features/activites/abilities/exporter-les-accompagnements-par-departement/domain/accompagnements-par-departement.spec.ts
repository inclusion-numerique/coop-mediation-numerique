import {
  CodeDepartement,
  type Departement,
  NomDepartement,
} from '@app/web/libraries/departement'
import { lignesDExport } from './accompagnements-par-departement'
import { NombreDAccompagnements } from './nombre-d-accompagnements'

const departement = (code: string, nom: string): Departement => ({
  code: CodeDepartement(code),
  nom: NomDepartement(nom),
})

describe('lignesDExport', () => {
  it('met en regard les accompagnements des deux populations, département par département', () => {
    expect(
      lignesDExport({
        conseillersNumeriques: [
          {
            departement: departement('01', 'Ain'),
            accompagnements: NombreDAccompagnements(3),
          },
          {
            departement: departement('2A', 'Corse-du-Sud'),
            accompagnements: NombreDAccompagnements(0),
          },
        ],
        autresMediateurs: [
          {
            departement: departement('2A', 'Corse-du-Sud'),
            accompagnements: NombreDAccompagnements(5),
          },
        ],
      }),
    ).toEqual([
      {
        departement: { code: '01', nom: 'Ain' },
        conseillersNumeriques: 3,
        autresMediateurs: 0,
      },
      {
        departement: { code: '2A', nom: 'Corse-du-Sud' },
        conseillersNumeriques: 0,
        autresMediateurs: 5,
      },
    ])
  })
})
