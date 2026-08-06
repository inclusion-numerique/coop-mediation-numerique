import { buildEquipeWorksheet } from './buildEquipeWorksheet'
import type { EquipeExportMembre } from './getEquipeExportData'

const membre = (
  surcharges: Partial<EquipeExportMembre> = {},
): EquipeExportMembre =>
  ({
    prenom: 'Estelle',
    nom: 'Blanqui',
    role: 'Conseiller numérique',
    typeContrat: null,
    dateDebutContrat: null,
    dateFinContrat: null,
    email: 'estelle.blanqui@lot.fr',
    telephone: null,
    structureEmployeuse: null,
    statut: 'Actif',
    ...surcharges,
  }) as EquipeExportMembre

const lignesDuTableau = (membres: EquipeExportMembre[]): unknown[] => {
  const workbook = buildEquipeWorksheet({
    membres,
    filters: {} as never,
    user: { name: 'Ulysse Osmont', role: 'Coordinateur' } as never,
    worksheetGenerationDate: new Date('2026-08-06T12:00:00Z'),
  })
  // `addTable` conserve ses lignes dans le modèle de table, pas dans les lignes de la feuille —
  // et exceljs ne les expose pas dans ses types.
  const table = workbook
    .getWorksheet('Équipe')
    ?.getTable('Membres') as unknown as
    | { table: { rows: unknown[][] } }
    | undefined
  const premiereLigne = table?.table.rows[0]
  if (!premiereLigne) throw new Error('Tableau « Membres » introuvable')
  return premiereLigne
}

describe('buildEquipeWorksheet', () => {
  // Cas de production : les composantes d'adresse arrivent en chaîne VIDE quand `main` ne les
  // porte pas — une employeuse sans voie. Le `??` les laissait passer telles quelles et la
  // colonne restait blanche, là où tout le reste de l'export écrit `-`.
  it('écrit « - » pour une composante d’adresse vide, pas une cellule blanche', () => {
    const ligne = lignesDuTableau([
      membre({
        structureEmployeuse: {
          nom: 'Departement Du Lot Cahors',
          adresse: '',
          commune: 'Cahors',
          codePostal: '46000',
          codeInsee: '46042',
        },
      }),
    ])

    expect(ligne[8]).toBe('Departement Du Lot Cahors')
    expect(ligne[9]).toBe('-')
    expect(ligne[10]).toBe('Cahors')
  })

  it('met le téléphone au format national', () => {
    expect(lignesDuTableau([membre({ telephone: '+33650219046' })])[7]).toBe(
      '06 50 21 90 46',
    )
  })

  // Les deux formes cohabitaient dans la même colonne : E.164 pour les numéros normalisés,
  // national historique pour les autres.
  it('rend la même forme quel que soit le format stocké', () => {
    expect(lignesDuTableau([membre({ telephone: '0565380379' })])[7]).toBe(
      '05 65 38 03 79',
    )
  })

  it('écrit « - » quand le téléphone manque', () => {
    expect(lignesDuTableau([membre({ telephone: null })])[7]).toBe('-')
  })
})
