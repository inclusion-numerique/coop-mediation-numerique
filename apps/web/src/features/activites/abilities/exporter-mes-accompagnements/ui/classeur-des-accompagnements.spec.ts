import type { WorksheetUser } from '@app/web/libs/worksheet/addExportMetadata'
import type { Worksheet } from 'exceljs'
import { classeurDesAccompagnements } from './classeur-des-accompagnements'
import { collectifExporte, individuelExporte } from './fixtures-d-export'

const demandeur: WorksheetUser = {
  id: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
  firstName: 'John',
  lastName: 'Doe',
  role: 'User',
  isConseillerNumerique: false,
  coordinateur: null,
  mediateur: { id: 'c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f' },
  emplois: [],
}

const filtres = [
  { label: 'Commune : Lyon 2eme · 69002', type: 'communes' },
  { label: 'Accompagnement individuel', type: 'types' },
]

const feuilleDe = (
  activites: Parameters<
    typeof classeurDesAccompagnements
  >[0]['exportDes']['activites'],
): Worksheet => {
  const feuille = classeurDesAccompagnements({
    demandeur,
    filtres,
    exportDes: { activites, colonnes: { personnel: true, source: false } },
    date: new Date('2026-03-10T09:00:00.000Z'),
  }).getWorksheet('Activités')
  if (!feuille) throw new Error('Onglet « Activités » absent')
  return feuille
}

const ligneDEntete = (feuille: Worksheet) => {
  const ligne = feuille
    .getRows(1, feuille.rowCount)
    ?.find((candidate) => candidate.getCell(1).value === 'Date')
  if (!ligne) throw new Error('Ligne d’en-tête absente')
  return ligne
}

describe('classeur des accompagnements', () => {
  it('ouvre sur les informations de l’export puis les filtres', () => {
    const feuille = feuilleDe([individuelExporte])
    expect(feuille.getCell('A1').value).toBe('Informations export')
    expect(feuille.getCell('A1').font?.bold).toBe(true)
    expect([feuille.getCell('A2').value, feuille.getCell('B2').value]).toEqual([
      'Nom',
      'Doe',
    ])
    expect([feuille.getCell('A5').value, feuille.getCell('B5').value]).toEqual([
      'Total',
      1,
    ])
    expect(feuille.getCell('A9').value).toBe('Filtres')
    expect([
      feuille.getCell('A13').value,
      feuille.getCell('B13').value,
    ]).toEqual(['Communes', 'Commune : Lyon 2eme · 69002'])
  })

  it('ne nomme jamais de médiateur dans les filtres', () => {
    const feuille = feuilleDe([])
    const libelles = feuille
      .getRows(1, feuille.rowCount)
      ?.map((ligne) => ligne.getCell(1).value)
    expect(libelles).not.toContain('Médiateur')
  })

  it('garde ses en-têtes quand aucune activité n’est exportée', () => {
    const feuille = feuilleDe([])
    const entete = ligneDEntete(feuille)
    expect(entete.getCell(2).value).toBe('Enregistré le')
    expect(feuille.rowCount).toBe(entete.number)
  })

  it('écrit une ligne par accompagnement, date au format jour', () => {
    const feuille = feuilleDe([individuelExporte, collectifExporte])
    const entete = ligneDEntete(feuille)
    const premiere = feuille.getRow(entete.number + 1)
    expect(feuille.rowCount).toBe(entete.number + 3)
    expect(premiere.getCell(1).value).toEqual(
      new Date('2026-03-09T00:00:00.000Z'),
    )
    expect(premiere.getCell(1).numFmt).toBe('dd/mm/yyyy')
    expect(premiere.alignment).toEqual({ wrapText: true, vertical: 'top' })
  })
})
