import { Workbook } from 'exceljs'
import { describe, expect, it } from 'vitest'
import { addFilters } from './add-filters'

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
      { label: 'Médiateur', type: 'roles' },
      { label: 'Coordinateur', type: 'roles' },
      {
        label: 'Hors dispositif',

        type: 'conseiller_numerique',
      },
      { label: 'Inscrit', type: 'statut' },
      { label: 'CCAS de Nîmes', type: 'lieux' },
      { label: 'Les bricodeurs', type: 'lieux' },
      { label: 'Lyon', type: 'communes' },
      { label: 'Toulouse', type: 'communes' },
      { label: '27 · Eure', type: 'departements' },
      { label: '61 · Orne', type: 'departements' },
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

  it('omet un filtre masqué quand il est vide', () => {
    const worksheet = new Workbook().addWorksheet('Test')

    addFilters(worksheet, [
      { label: 'Rôles', type: 'roles' },
      { label: 'Bénéficiaires', type: 'beneficiaires', masqueSiVide: true },
    ])([])

    expect(worksheet.getColumn(1).values.slice(1)).toStrictEqual(['Rôles'])
  })

  it('écrit un filtre masqué quand il est renseigné', () => {
    const worksheet = new Workbook().addWorksheet('Test')

    addFilters(worksheet, [
      { label: 'Bénéficiaires', type: 'beneficiaires', masqueSiVide: true },
    ])([{ label: 'Camille Martin', type: 'beneficiaires' }])

    expect([
      worksheet.getCell('A1').value,
      worksheet.getCell('B1').value,
    ]).toStrictEqual(['Bénéficiaires', 'Camille Martin'])
  })
})
