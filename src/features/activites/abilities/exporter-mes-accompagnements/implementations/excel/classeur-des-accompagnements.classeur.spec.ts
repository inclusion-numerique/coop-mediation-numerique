import type { Worksheet } from 'exceljs'
import { describe, expect, it } from 'vitest'
import type { AuteurDExport } from '@/libraries/tableur/add-export-metadata'
import { classeurDesAccompagnements } from './classeur-des-accompagnements.classeur'

const demandeur: AuteurDExport = {
  nom: 'Doe',
  prenom: 'John',
  role: 'Médiateur',
}

const filtres = [
  { label: 'Commune : Lyon 2eme · 69002', type: 'Communes' },
  { label: 'Accompagnement individuel', type: 'Type d’accompagnement' },
]

const entetes = ['Date', 'Enregistré le', 'Type']

const ligne = (jour: string) => [
  new Date(`${jour}T00:00:00.000Z`),
  `${jour} à 10:00`,
  'Individuel',
]

const feuilleDe = (
  lignes: readonly (readonly (string | Date)[])[],
): Worksheet => {
  const feuille = classeurDesAccompagnements({
    demandeur,
    filtres,
    entetes,
    lignes,
    total: lignes.length,
    fuseau: 'Europe/Paris',
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
    const feuille = feuilleDe([ligne('2026-03-09')])
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

  it('écrit une ligne par ligne reçue, date au format jour', () => {
    const feuille = feuilleDe([
      ligne('2026-03-09'),
      ligne('2026-03-09'),
      ligne('2026-03-10'),
    ])
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
