import { Workbook } from 'exceljs'
import { addFilters } from './addFilters'

const availabelFilters = [
  { label: 'Rôles', type: 'roles' },
  { label: 'Dispositif', type: 'conseiller_numerique' },
  { label: 'Statut', type: 'statut' },
  { label: 'Lieux', type: 'lieux' },
  { label: 'Communes', type: 'communes' },
  { label: 'Départements', type: 'departements' },
]

describe('add filters', () => {
  it('sets no filters', () => {
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Test')

    addFilters(worksheet, availabelFilters)([])

    const worksheetFilterLabels = [
      [worksheet.getCell('A1').value, worksheet.getCell('B1').value],
      [worksheet.getCell('A2').value, worksheet.getCell('B2').value],
      [worksheet.getCell('A3').value, worksheet.getCell('B3').value],
      [worksheet.getCell('A4').value, worksheet.getCell('B4').value],
      [worksheet.getCell('A5').value, worksheet.getCell('B5').value],
      [worksheet.getCell('A6').value, worksheet.getCell('B6').value],
    ]

    expect(worksheetFilterLabels).toStrictEqual([
      ['Rôles', '-'],
      ['Dispositif', '-'],
      ['Statut', '-'],
      ['Lieux', '-'],
      ['Communes', '-'],
      ['Départements', '-'],
    ])
  })

  it('sets all filters', () => {
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Test')

    addFilters(
      worksheet,
      availabelFilters,
    )([
      { label: 'Médiateur', key: 'mediateur', type: 'roles' },
      { label: 'Coordinateur', key: 'coordinateur', type: 'roles' },
      {
        label: 'Hors dispositif',
        key: '0',
        type: 'conseiller_numerique',
      },
      { label: 'Inscrit', key: 'inscrit', type: 'statut' },
      { label: 'CCAS de Nîmes', key: '27', type: 'lieux' },
      { label: 'Les bricodeurs', key: '61', type: 'lieux' },
      { label: 'Lyon', key: '27', type: 'communes' },
      { label: 'Toulouse', key: '61', type: 'communes' },
      { label: '27 · Eure', key: '27', type: 'departements' },
      { label: '61 · Orne', key: '61', type: 'departements' },
    ])

    const worksheetFilterLabels = [
      [worksheet.getCell('A1').value, worksheet.getCell('B1').value],
      [worksheet.getCell('A2').value, worksheet.getCell('B2').value],
      [worksheet.getCell('A3').value, worksheet.getCell('B3').value],
      [worksheet.getCell('A4').value, worksheet.getCell('B4').value],
      [worksheet.getCell('A5').value, worksheet.getCell('B5').value],
      [worksheet.getCell('A6').value, worksheet.getCell('B6').value],
    ]

    expect(worksheetFilterLabels).toStrictEqual([
      ['Rôles', 'Médiateur, Coordinateur'],
      ['Dispositif', 'Hors dispositif'],
      ['Statut', 'Inscrit'],
      ['Lieux', 'CCAS de Nîmes, Les bricodeurs'],
      ['Communes', 'Lyon, Toulouse'],
      ['Départements', '27 · Eure, 61 · Orne'],
    ])
  })
})
