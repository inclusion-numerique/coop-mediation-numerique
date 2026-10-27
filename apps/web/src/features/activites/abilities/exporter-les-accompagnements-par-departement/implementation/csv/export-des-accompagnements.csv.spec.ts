import {
  exportDesAccompagnementsCsv,
  nomDuFichierDExport,
} from './export-des-accompagnements.csv'

describe('exportDesAccompagnementsCsv', () => {
  it('aligne les accompagnements des conseillers numériques et des médiateurs par département', () => {
    expect(
      exportDesAccompagnementsCsv({
        conseillersNumeriques: [
          { departement: { code: '01', nom: 'Ain' }, accompagnements: 3 },
          {
            departement: { code: '2A', nom: 'Corse-du-Sud' },
            accompagnements: 0,
          },
        ],
        mediateurs: [
          {
            departement: { code: '2A', nom: 'Corse-du-Sud' },
            accompagnements: 5,
          },
        ],
      }),
    ).toBe(
      'Département,Code,Accompagnements conum,Accompagnements médiateur\n01,Ain,3,0\n2A,Corse-du-Sud,0,5\n',
    )
  })
})

describe('nomDuFichierDExport', () => {
  it('porte la date de fin quand elle est donnée', () => {
    expect(nomDuFichierDExport(new Date('2026-10-01'))).toBe(
      'accompagnements_2026-10-01',
    )
  })

  it('reste générique sans date', () => {
    expect(nomDuFichierDExport(undefined)).toBe('accompagnements')
  })
})
