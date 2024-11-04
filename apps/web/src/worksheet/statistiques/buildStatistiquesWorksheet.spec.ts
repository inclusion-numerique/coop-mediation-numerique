/* eslint-disable no-sparse-arrays */

import type {
  MesStatistiquesPageData,
} from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import type { Workbook, Worksheet } from 'exceljs'
import { numberToPercentage } from '@app/web/utils/formatNumber'
import { computeProportion } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/allocatePercentages'
import { buildStatistiquesWorksheet, type BuildStatistiquesWorksheetInput } from './buildStatistiquesWorksheet'

const DATE = new Date('2024-09-11T17:42:00.000Z')

const STATISTIQUES_WORKSHEET_INPUT_BASE: Omit<
  BuildStatistiquesWorksheetInput,
  'mediateur' | 'filters'
> = {
  worksheetGenerationDate: DATE,
  user: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    role: 'User',
    mediateur: {
      id: '5',
      conseillerNumerique: { id: '4' },
    },
    coordinateur: null,
  },
  statistiques: {
    totalCounts: {
      activites: {
        collectifs: { total: 4, proportion: 20, participants: 28 },
      },
      accompagnements: {
        total: 44,
        individuels: { total: 8, proportion: 18.21 },
        collectifs: { total: 28, proportion: 63.6 },
        demarches: { total: 8, proportion: 18.2 },
      },
      beneficiaires: {
        total: 23,
        suivis: 2,
        anonymes: 21,
      },
    },
    beneficiaires: {
      genres: [
        {
          label: 'Masculin',
          count: 2,
          proportion: 10,
        },
        {
          label: 'Féminin',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Non communiqué',
          count: 18,
          proportion: 90,
        },
      ],
      trancheAges: [
        {
          label: '70 ans et plus',
          count: 0,
          proportion: 0,
        },
        {
          label: '60 - 69 ans',
          count: 0,
          proportion: 0,
        },
        {
          label: '40 - 59 ans',
          count: 11,
          proportion: 47.83,
        },
        {
          label: '25 - 39 ans',
          count: 8,
          proportion: 34.8,
        },
        {
          label: '18 - 24 ans',
          count: 1,
          proportion: 4.3,
        },
        {
          label: '12 - 18 ans',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Moins de 12 ans',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Non communiqué',
          count: 3,
          proportion: 13,
        },
      ],
      statutsSocial: [
        {
          label: 'Retraité',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Sans emploi',
          count: 0,
          proportion: 0,
        },
        {
          label: 'En emploi',
          count: 17,
          proportion: 73.91,
        },
        {
          label: 'Scolarisé',
          count: 4,
          proportion: 17.39,
        },
        {
          label: 'Non communiqué ou hétérogène',
          count: 2,
          proportion: 8.7,
        },
      ],
      communes: [
        {
          count: 2,
          label: 'Paris · 75001',
          proportion: 66.667,
        },
        {
          count: 1,
          label: 'Lyon 2eme · 69002',
          proportion: 33.33,
        },
      ],
    },
    accompagnementsParMois: [
      { count: 2, label: 'Oct.' },
      { count: 6, label: 'Nov.' },
      { count: 8, label: 'Déc.' },
      { count: 6, label: 'Jan.' },
      { count: 12, label: 'Fév.' },
      { count: 12, label: 'Mars' },
      { count: 14, label: 'Avr.' },
      { count: 9, label: 'Mai' },
      { count: 10, label: 'Juin' },
      { count: 4, label: 'Juil.' },
      { count: 2, label: 'Août' },
      { count: 7, label: 'Sep.' },
    ],
    activites: {
      thematiques: [
        {
          label: 'Prendre en main du matériel',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Navigation sur internet',
          count: 0,
          proportion: 0,
        },
        {
          label: 'E-mail',
          count: 6,
          proportion: 25,
        },
        {
          label: 'Bureautique',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Réseaux sociaux communication',
          count: 4,
          proportion: 16.67,
        },
        {
          label: 'Santé',
          count: 6,
          proportion: 25,
        },
        {
          label: 'Banque et achats en ligne',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Entrepreneuriat',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Insertion professionnelle',
          count: 2,
          proportion: 8.33,
        },
        {
          label: 'Prévention en sécurité numérique',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Parentalité',
          count: 2,
          proportion: 8.33,
        },
        {
          label: 'Scolarité et numérique',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Créer avec le numérique',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Culture numérique',
          count: 4,
          proportion: 16.67,
        },
      ],
      thematiquesDemarches: [
        {
          label: 'Papiers - Élections Citoyenneté',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Famille - Scolarité',
          count: 2,
          proportion: 12.5,
        },
        {
          label: 'Social - Santé',
          count: 6,
          proportion: 37.5,
        },
        {
          label: 'Travail - Formation',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Logement',
          count: 2,
          proportion: 12.5,
        },
        {
          label: 'Transports - Mobilité',
          count: 2,
          proportion: 12.5,
        },
        {
          label: 'Argent - Impôts',
          count: 0,
          proportion: 0,
        },
        {
          label: 'Justice',
          count: 2,
          proportion: 12.5,
        },
        {
          label: 'Étrangers - Europe',
          count: 2,
          proportion: 12.5,
        },
        {
          label: 'Loisirs - Sports Culture',
          count: 0,
          proportion: 0,
        },
      ],
      materiels: [
        {
          label: 'Ordinateur',
          count: 6,
          proportion: 50,
        },
        {
          label: 'Téléphone',
          count: 2,
          proportion: 16.67,
        },
        {
          label: 'Tablette',
          count: 2,
          proportion: 16.67,
        },
        {
          label: 'Autre matériel',
          count: 2,
          proportion: 16.67,
        },
        {
          label: 'Pas de matériel',
          count: 0,
          proportion: 0,
        },
      ],
      mergedTypeLieu: [
        {
          label: 'Lieu d’activité',
          count: 0,
          proportion: 0,
        },
        {
          label: 'À domicile',
          count: 4,
          proportion: 20,
        },
        {
          label: 'À distance',
          count: 12,
          proportion: 60,
        },
        {
          label: 'Autre lieu',
          count: 4,
          proportion: 20,
        },
      ],
      durees: [
        {
          label: '30min',
          count: 0,
          proportion: 0,
        },
        {
          label: '1h',
          count: 0,
          proportion: 0,
        },
        {
          label: '1h30',
          count: 20,
          proportion: 100,
        },
        {
          label: '2h',
          count: 0,
          proportion: 0,
        },
      ],
    },
    structures: [
      {
        nom: 'Exemple de Mediateque',
        count: 4,
        proportion: 100,
        label: 'Exemple de Mediateque',
      },
    ],
  } as MesStatistiquesPageData,
}

const STATISTIQUES_WORKSHEET_INPUT_FOR_MEDIATEUR: BuildStatistiquesWorksheetInput =
  {
    ...STATISTIQUES_WORKSHEET_INPUT_BASE,
    mediateur: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'User',
      mediateur: {
        id: '5',
        conseillerNumerique: { id: '4' },
      },
      coordinateur: null,
    },
    filters: {
      du: '01/08/2024',
      au: '31/08/2024',
      typeLieu: 'Commune',
      nomLieu: 'Lyon',
      type: 'Accompagnement',
      beneficiaire: null,
      mediateur: null,
      lieu: null,
      periode: null,
    },
  }

const STATISTIQUES_WORKSHEET_INPUT_FOR_COORDINATEUR: BuildStatistiquesWorksheetInput =
  {
    ...STATISTIQUES_WORKSHEET_INPUT_BASE,
    mediateur: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'User',
      mediateur: null,
      coordinateur: { id: '1', mediateursCoordonnes: [] },
    },
    filters: {
      du: '01/08/2024',
      au: '31/08/2024',
      typeLieu: 'Commune',
      nomLieu: 'Lyon',
      type: 'Accompagnement',
      beneficiaire: null,
      mediateur: 'Marie Doe',
      lieu: null,
      periode: null,
    },
  }

const expectQuantifiedShareRows = (
  // label, count
  expectedRows: [string, number][],
) => {
  const proportionTotal = expectedRows.reduce(
    (total, [, count]) => total + count,
    0,
  )

  return expectedRows.map(([label, count]) => [
    ,
    label,
    count,
    numberToPercentage(computeProportion(count, proportionTotal)),
  ])
}

describe('build statistiques worksheet for médiateur', () => {
  let workbook: Workbook
  let worksheet: Worksheet

  beforeAll(() => {
    workbook = buildStatistiquesWorksheet(
      STATISTIQUES_WORKSHEET_INPUT_FOR_MEDIATEUR,
    )
    const generatedWorksheet = workbook.getWorksheet('Statistiques')
    if (!generatedWorksheet) {
      throw new Error('Worksheet "Statistiques" not found')
    }
    worksheet = generatedWorksheet
  })

  it('should create a workbook with Statistiques worksheet', () => {
    expect(worksheet).toBeDefined()
  })

  it('should contains bold `Informations export` in Statistiques worksheet at position A1', () => {
    const exportTitleCell = worksheet.getCell('A1')

    expect(exportTitleCell?.value).toBe('Informations export')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Informations export in Statistiques worksheet from row 2 to 6', () => {
    const rows = worksheet.getRows(2, 6)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      [, 'Nom', 'Doe'],
      [, 'Prénom', 'John'],
      [, 'Rôle', 'Conseiller Numérique'],
      [, 'Date d’export', '11/09/2024'],
      [, 'Heure d’export', '17:42'],
      [],
    ])
  })

  it('should contains bold `Filtres :` in Statistiques worksheet at position A8', () => {
    const exportTitleCell = worksheet.getCell('A8')

    expect(exportTitleCell?.value).toBe('Filtres')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Filters in Statistiques worksheet from row 9 to 15', () => {
    const rows = worksheet.getRows(9, 6)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      [, 'Début de période', '01/08/2024'],
      [, 'Fin de période', '31/08/2024'],
      [, 'Type de lieu', 'Commune'],
      [, 'Nom du lieu', 'Lyon'],
      [, 'Type d’accompagnement', 'Accompagnement'],
      [],
    ])
  })

  it('should contains bold `Statistiques générales sur vos accompagnements` in Statistiques worksheet at position A15', () => {
    const exportTitleCell = worksheet.getCell('A15')

    expect(exportTitleCell?.value).toBe(
      'Statistiques générales sur vos accompagnements',
    )
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains statistiques general in Statistiques worksheet from row 16 to 21', () => {
    const rows = worksheet.getRows(16, 7)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      [, 'Accompagnements au total', 44],
      [, 'Bénéficiaires accompagnés', 23],
      [, 'Bénéficiaires suivis', 2],
      [, 'Nom Bénéficiaires anonymes', 21],
      [
        ,
        'Accompagnements sur les 12 derniers mois',
        'Oct.',
        'Nov.',
        'Déc.',
        'Jan.',
        'Fév.',
        'Mars',
        'Avr.',
        'Mai',
        'Juin',
        'Juil.',
        'Août',
        'Sep.',
      ],
      [, '', 2, 6, 8, 6, 12, 12, 14, 9, 10, 4, 2, 7],
      [],
    ])
  })

  it('should contains bold `Statistiques sur vos activités` in Statistiques worksheet at position A22', () => {
    const exportTitleCell = worksheet.getCell('A23')

    expect(exportTitleCell?.value).toBe('Statistiques sur vos activités')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains statistiques activités in Statistiques worksheet from row 23 to 26', () => {
    const rows = worksheet.getRows(24, 5)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      ...expectQuantifiedShareRows([
        ['Accompagnements individuels', 8],
        ['Ateliers collectifs', 28],
        ['Aide aux démarches administratives', 8],
      ]),
      [, 'Nombre total de participants aux ateliers', 28],
      [],
    ])
  })

  it('should contains bold `Thématiques Médiation numérique` in Statistiques worksheet at position A28', () => {
    const exportTitleCell = worksheet.getCell('A29')

    expect(exportTitleCell?.value).toBe('Thématiques Médiation numérique')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Thématiques Médiation numérique in Statistiques worksheet from row 29 to 34', () => {
    const rows = worksheet.getRows(30, 15)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      ...expectQuantifiedShareRows([
        ['Prendre en main du matériel', 0],
        ['Navigation sur internet', 0],
        ['E-mail', 6],
        ['Bureautique', 0],
        ['Réseaux sociaux communication', 4],
        ['Santé', 6],
        ['Banque et achats en ligne', 0],
        ['Entrepreneuriat', 0],
        ['Insertion professionnelle', 2],
        ['Prévention en sécurité numérique', 0],
        ['Parentalité', 2],
        ['Scolarité et numérique', 0],
        ['Créer avec le numérique', 0],
        ['Culture numérique', 4],
      ]),
      [],
    ])
  })

  it('should contains bold `Thématiques Démarches administratives` in Statistiques worksheet at position A44', () => {
    const exportTitleCell = worksheet.getCell('A45')

    expect(exportTitleCell?.value).toBe('Thématiques Démarches administratives')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Thématiques Démarches administratives in Statistiques worksheet from row 45 to 55', () => {
    const rows = worksheet.getRows(46, 11)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      ...expectQuantifiedShareRows([
        ['Papiers - Élections Citoyenneté', 0],
        ['Famille - Scolarité', 2],
        ['Social - Santé', 6],
        ['Travail - Formation', 0],
        ['Logement', 2],
        ['Transports - Mobilité', 2],
        ['Argent - Impôts', 0],
        ['Justice', 2],
        ['Étrangers - Europe', 2],
        ['Loisirs - Sports Culture', 0],
      ]),
      [],
    ])
  })

  it('should contains bold `Matériel utilisés` in Statistiques worksheet at position A44', () => {
    const exportTitleCell = worksheet.getCell('A57')

    expect(exportTitleCell?.value).toBe('Matériel utilisés')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Matériel utilisés in Statistiques worksheet from row 57 to 61', () => {
    const rows = worksheet.getRows(58, 6)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      ...expectQuantifiedShareRows([
        ['Ordinateur', 6],
        ['Téléphone', 2],
        ['Tablette', 2],
        ['Autre matériel', 2],
        ['Pas de matériel', 0],
      ]),
      [],
    ])
  })

  it('should contains bold `Canaux des activités` in Statistiques worksheet at position A63', () => {
    const exportTitleCell = worksheet.getCell('A64')

    expect(exportTitleCell?.value).toBe('Canaux des activités')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Canaux des activités in Statistiques worksheet from row 64 to 68', () => {
    const rows = worksheet.getRows(65, 5)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      ...expectQuantifiedShareRows([
        ['Lieu d’activité', 0],
        ['À domicile', 4],
        ['À distance', 12],
        ['Autre lieu', 4],
      ]),
      [],
    ])
  })

  it('should contains bold `Durées des activités` in Statistiques worksheet at position A68', () => {
    const exportTitleCell = worksheet.getCell('A70')

    expect(exportTitleCell?.value).toBe('Durées des activités')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Durées des activités in Statistiques worksheet from row 70 to 75', () => {
    const rows = worksheet.getRows(71, 5)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      ...expectQuantifiedShareRows([
        ['30min', 0],
        ['1h', 0],
        ['1h30', 20],
        ['2h', 0],
      ]),
      [],
    ])
  })

  it('should contains bold `Nombre d’activités par lieux` in Statistiques worksheet at position A75', () => {
    const exportTitleCell = worksheet.getCell('A76')

    expect(exportTitleCell?.value).toBe('Nombre d’activités par lieux')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Nombre d’activités par lieux in Statistiques worksheet from row 76 to 77', () => {
    const rows = worksheet.getRows(77, 2)?.map((row) => row.values)

    expect(rows).toStrictEqual([[, 'Exemple de Mediateque', 4, '100 %'], []])
  })

  it('should contains bold `Statistiques sur vos bénéficiaires` in Statistiques worksheet at position A78', () => {
    const exportTitleCell = worksheet.getCell('A79')

    expect(exportTitleCell?.value).toBe('Statistiques sur vos bénéficiaires')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains bold `Statistiques sur vos bénéficiaires` in Statistiques worksheet at position A79', () => {
    const exportTitleCell = worksheet.getCell('A80')

    expect(exportTitleCell?.value).toBe('Genre')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Statistiques bénéficiaires in Statistiques worksheet from row 80 to 84', () => {
    const rows = worksheet.getRows(81, 4)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      ...expectQuantifiedShareRows([
        ['Masculin', 2],
        ['Féminin', 0],
        ['Non communiqué', 18],
      ]),
      [],
    ])
  })

  it('should contains bold `Tranches d’âge` in Statistiques worksheet at position A84', () => {
    const exportTitleCell = worksheet.getCell('A85')

    expect(exportTitleCell?.value).toBe('Tranches d’âge')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Tranches d’âge in Statistiques worksheet from row 85 to 92', () => {
    const rows = worksheet.getRows(86, 9)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      ...expectQuantifiedShareRows([
        ['70 ans et plus', 0],
        ['60 - 69 ans', 0],
        ['40 - 59 ans', 11],
        ['25 - 39 ans', 8],
        ['18 - 24 ans', 1],
        ['12 - 18 ans', 0],
        ['Moins de 12 ans', 0],
        ['Non communiqué', 3],
      ]),
      [],
    ])
  })

  it('should contains bold `Statuts` in Statistiques worksheet at position A93', () => {
    const exportTitleCell = worksheet.getCell('A95')

    expect(exportTitleCell?.value).toBe('Statuts')
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Statuts in Statistiques worksheet from row 6 to 100', () => {
    const rows = worksheet.getRows(96, 6)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      ...expectQuantifiedShareRows([
        ['Retraité', 0],
        ['Sans emploi', 0],
        ['En emploi', 17],
        ['Scolarisé', 4],
        ['Non communiqué ou hétérogène', 2],
      ]),
      [],
    ])
  })

  it('should contains bold `Commune de résidence des bénéficiaires` in Statistiques worksheet at position A100', () => {
    const exportTitleCell = worksheet.getCell('A102')

    expect(exportTitleCell?.value).toBe(
      'Commune de résidence des bénéficiaires',
    )
    expect(exportTitleCell?.font.bold).toBe(true)
  })

  it('should contains Commune de résidence des bénéficiaires in Statistiques worksheet from row 101 to 104', () => {
    const rows = worksheet.getRows(103, 3)?.map((row) => row.values)

    expect(rows).toStrictEqual([
      ...expectQuantifiedShareRows([
        ['Paris · 75001', 2],
        ['Lyon 2eme · 69002', 1],
      ]),
      [],
    ])
  })
})

describe('build statistiques worksheet for coordinateur', () => {
  let workbook: Workbook
  let worksheet: Worksheet

  beforeAll(() => {
    workbook = buildStatistiquesWorksheet(
      STATISTIQUES_WORKSHEET_INPUT_FOR_COORDINATEUR,
    )
    const generatedWorksheet = workbook.getWorksheet('Statistiques')
    if (!generatedWorksheet) {
      throw new Error('Worksheet "Statistiques" not found')
    }
    worksheet = generatedWorksheet
  })

  it('should contains médiateur filter in Statistiques worksheet in row 16 when', () => {
    const rows = worksheet.getRows(14, 2)?.map((row) => row.values)

    expect(rows).toStrictEqual([[, 'Médiateur', 'Marie Doe'], []])
  })
})

/* eslint-enable */
