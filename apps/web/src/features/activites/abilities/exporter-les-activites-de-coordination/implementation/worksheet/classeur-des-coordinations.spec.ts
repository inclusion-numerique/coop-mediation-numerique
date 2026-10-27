import type { WorksheetUser } from '@app/web/libs/worksheet/addExportMetadata'
import {
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  criteresDesCoordinations,
  Effectif,
  NomDeLActivite,
  NomDeStructure,
  NomDeTag,
  Precision,
  TagId,
  TypeDeStructurePartenaire,
} from '../../../../domain'
import { classeurDesCoordinations } from './classeur-des-coordinations'

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

const TAG = {
  id: TagId('6f1c2a4e-8b3d-4c5e-9f7a-1b2c3d4e5f60'),
  nom: NomDeTag('Été'),
}

const commun = {
  id: ActiviteDeCoordinationId('0e7c3a52-4d1b-4f6a-8e9d-2c3b4a5d6e7f'),
  date: new Date('2026-06-01'),
  duree: null,
  tags: [TAG],
  notes: null,
  creation: new Date('2026-06-01T10:00:00Z'),
  modification: new Date('2026-06-01T10:00:00Z'),
}

const partenariat: ActiviteDeCoordination = {
  ...commun,
  _tag: 'Partenariat',
  nom: NomDeLActivite('Convention'),
  natures: [{ _tag: 'Autre', precision: Precision('Mutualisation') }],
  structuresPartenaires: [
    {
      nom: NomDeStructure('Mairie'),
      type: TypeDeStructurePartenaire('Commune'),
    },
  ],
  echelon: null,
}

const animation: ActiviteDeCoordination = {
  ...commun,
  _tag: 'Animation',
  typeDAnimation: null,
  thematiques: [],
  initiative: null,
  intervenants: {
    mediateurs: Effectif(4),
    structures: null,
    autresActeurs: null,
  },
}

const lignesDuTableau = (
  activites: readonly ActiviteDeCoordination[],
  parametres = {},
) => {
  const feuille = classeurDesCoordinations({
    activites,
    criteres: criteresDesCoordinations(parametres),
    tags: [TAG],
    auteur,
  }).getWorksheet('Activités de coordination')
  if (feuille === undefined) throw new Error('Feuille introuvable')
  const valeurs = Array.from(feuille.getSheetValues(), (ligne) =>
    Array.isArray(ligne)
      ? Array.from(ligne.slice(1), (cellule) => cellule ?? '')
      : [],
  )
  const entete = valeurs.findIndex((ligne) => ligne[0] === 'Date de l’activité')
  return { valeurs, lignes: valeurs.slice(entete + 1) }
}

describe('classeur des activités de coordination', () => {
  it('écrit « / » dans les colonnes sans objet pour le type', () => {
    const [ligne] = lignesDuTableau([partenariat]).lignes

    expect(ligne.slice(1, 15)).toEqual([
      'Partenariat',
      '/',
      '/',
      '/',
      '/',
      '/',
      'Convention',
      'Autre : Mutualisation',
      '/',
      'Mairie',
      'Une commune',
      '',
      '/',
      '/',
    ])
    expect(ligne[15]).toBe('Été')
  })

  it('reprend les intervenants d’une animation', () => {
    const [ligne] = lignesDuTableau([animation]).lignes

    expect(ligne.slice(2, 8)).toEqual(['', '/', 4, '', '', '/'])
  })

  it('résume les filtres appliqués', () => {
    const { valeurs } = lignesDuTableau([], {
      types: 'Animation,Evenement',
      tags: TAG.id,
    })

    expect(valeurs).toEqual(
      expect.arrayContaining([
        ['Période', '-'],
        ['Type d’activité', 'Animation, Évènement'],
        ['Tags', 'Été'],
      ]),
    )
  })
})
