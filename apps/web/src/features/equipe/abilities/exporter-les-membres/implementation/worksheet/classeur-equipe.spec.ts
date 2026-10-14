import type { WorksheetUser } from '@app/web/libs/worksheet/addExportMetadata'
import { criteresEquipe } from '../../../../domain'
import type { MembreExporte } from '../../domain'
import { classeurEquipe } from './classeur-equipe'

const auteur: WorksheetUser = {
  id: '550e8400-e29b-41d4-a716-446655440071',
  firstName: 'Ulysse',
  lastName: 'Osmont',
  role: 'User',
  coordinateur: null,
  emplois: [],
  isConseillerNumerique: false,
  mediateur: null,
}

const membre = (surcharges: Partial<MembreExporte> = {}): MembreExporte => ({
  prenom: 'Estelle',
  nom: 'Blanqui',
  role: 'Conseiller numérique',
  contrat: null,
  email: 'estelle.blanqui@lot.fr',
  telephone: null,
  structureEmployeuse: null,
  statut: 'Actif',
  ...surcharges,
})

const premiereLigne = (membres: MembreExporte[]): unknown[] => {
  const tableau = classeurEquipe({
    membres,
    criteres: criteresEquipe({}),
    auteur,
    genereLe: new Date('2026-08-06T12:00:00Z'),
  })
    .getWorksheet('Équipe')
    ?.getTable('Membres')
  const modele: unknown = tableau
  const lignes =
    typeof modele === 'object' &&
    modele !== null &&
    'table' in modele &&
    typeof modele.table === 'object' &&
    modele.table !== null &&
    'rows' in modele.table &&
    Array.isArray(modele.table.rows)
      ? modele.table.rows
      : []
  const [ligne] = lignes
  if (!Array.isArray(ligne)) throw new Error('Tableau « Membres » introuvable')
  return ligne
}

describe('classeur de l’équipe', () => {
  it('écrit « - » pour une composante d’adresse vide, pas une cellule blanche', () => {
    const ligne = premiereLigne([
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
    expect(premiereLigne([membre({ telephone: '+33650219046' })])[7]).toBe(
      '06 50 21 90 46',
    )
  })

  it('rend la même forme quel que soit le format stocké', () => {
    expect(premiereLigne([membre({ telephone: '0565380379' })])[7]).toBe(
      '05 65 38 03 79',
    )
  })

  it('écrit « - » quand le téléphone manque', () => {
    expect(premiereLigne([membre({ telephone: null })])[7]).toBe('-')
  })
})
