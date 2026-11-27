import { describe, expect, it } from 'vitest'
import type { Genre } from '@/features/beneficiaire/domain/genre'
import {
  AnalysisSchema,
  analyserLaFeuille,
  type CommunesClient,
} from './analyse-de-l-import'
import type { FeuilleImport, ValeurCellule } from './feuille-import'

const maintenant = new Date('2026-06-15T12:00:00.000Z')

const blaziert: CommunesClient = {
  findCommuneByInsee: () => ({
    codeInsee: '32057',
    nom: 'Blaziert',
    codePostal: '32100',
  }),
}

const bourgEnBresse: CommunesClient = {
  findCommuneByInsee: () => ({
    codeInsee: '01053',
    nom: 'Bourg-en-Bresse',
    codePostal: '01000',
  }),
}

const lieusaint: CommunesClient = {
  findCommuneByInsee: () => ({
    codeInsee: '77251',
    nom: 'Lieusaint',
    codePostal: '77127',
  }),
}

const sansCommune: CommunesClient = { findCommuneByInsee: () => null }

const analyser = (communesClient: CommunesClient, feuille: FeuilleImport) =>
  analyserLaFeuille(communesClient)({ feuille, maintenant })

const enTetes: FeuilleImport = [
  ['Instructions'],
  ['Nom', 'Prénom', 'Année de naissance', 'Commune', 'Commune', 'Commune'],
  ['Nom', 'Prénom', 'Année de naissance', 'Nom', 'Code INSEE', 'Code postal'],
]

const feuilleDepuisLignes = (
  lignes: ReadonlyArray<ReadonlyArray<ValeurCellule>>,
): FeuilleImport => [...enTetes, ...lignes]

const ligneDExemple = [
  'Exemple',
  'Léa',
  1970,
  'Blaziert',
  '32057',
  '32100',
  '0102030405',
  null,
  'Féminin',
]

const lignesAvecErreurs = [
  [
    'Exemple',
    'Léa',
    1970,
    'Bourg-en-Bresse',
    '01053',
    '01000',
    '0102030405',
    null,
    'Féminin',
  ],
  ['Exemple', null, 1970, null, 0, 0, null, null, null],
  [null, 'Albert', 'nuage', null, 0, 0, null, null, null],
]

describe('analyse de la feuille d’import', () => {
  it('analyse la ligne d’exemple du modèle', () => {
    expect(analyser(blaziert, feuilleDepuisLignes([ligneDExemple]))).toEqual({
      status: 'ok',
      rows: [
        {
          values: {
            nom: 'Exemple',
            prenom: 'Léa',
            anneeNaissance: 1970,
            numeroTelephone: '0102030405',
            communeCodeInsee: '32057',
            communeNom: 'Blaziert',
            communeCodePostal: '32100',
            email: null,
            genre: 'Féminin',
            notesSupplementaires: null,
          },
          parsed: {
            anneeNaissance: 1970,
            genre: 'Feminin',
            commune: {
              codePostal: '32100',
              nom: 'Blaziert',
              codeInsee: '32057',
            },
          },
        },
      ],
    })
  })

  it('produit une analyse conforme à son schéma', () => {
    expect(
      AnalysisSchema.safeParse(
        analyser(blaziert, feuilleDepuisLignes([ligneDExemple])),
      ).error,
    ).toBe(undefined)
  })

  it('signale les lignes en erreur', () => {
    expect(
      analyser(bourgEnBresse, feuilleDepuisLignes(lignesAvecErreurs)),
    ).toEqual({
      status: 'error',
      rows: [
        {
          values: {
            nom: 'Exemple',
            prenom: 'Léa',
            anneeNaissance: 1970,
            numeroTelephone: '0102030405',
            communeCodeInsee: '01053',
            communeNom: 'Bourg-en-Bresse',
            communeCodePostal: '01000',
            email: null,
            genre: 'Féminin',
            notesSupplementaires: null,
          },
          parsed: {
            genre: 'Feminin',
            anneeNaissance: 1970,
            commune: {
              codePostal: '01000',
              nom: 'Bourg-en-Bresse',
              codeInsee: '01053',
            },
          },
        },
        {
          values: {
            nom: 'Exemple',
            prenom: null,
            anneeNaissance: 1970,
            numeroTelephone: null,
            communeCodeInsee: null,
            communeNom: null,
            communeCodePostal: null,
            email: null,
            genre: null,
            notesSupplementaires: null,
          },
          parsed: {
            genre: 'NonCommunique',
            anneeNaissance: 1970,
            commune: null,
          },
          errors: {
            prenom: 'Le prénom est obligatoire',
          },
        },
        {
          values: {
            nom: null,
            prenom: 'Albert',
            anneeNaissance: null,
            numeroTelephone: null,
            communeCodeInsee: null,
            communeNom: null,
            communeCodePostal: null,
            email: null,
            genre: null,
            notesSupplementaires: null,
          },
          parsed: {
            genre: 'NonCommunique',
            anneeNaissance: null,
            commune: null,
          },
          errors: {
            nom: 'Le nom est obligatoire',
          },
        },
      ],
    })
  })

  it('produit une analyse en erreur conforme à son schéma', () => {
    expect(
      AnalysisSchema.safeParse(
        analyser(bourgEnBresse, feuilleDepuisLignes(lignesAvecErreurs)),
      ).error,
    ).toBe(undefined)
  })

  it('lit un code postal numérique et ignore une ligne vide', () => {
    expect(
      analyser(
        blaziert,
        feuilleDepuisLignes([
          [
            'Exemple',
            'Léa',
            1970,
            'Blaziert',
            '32057',
            32100,
            '0102030405',
            'lea@exemple.fr',
            'Féminin',
          ],
          [null, null, null, null, null],
        ]),
      ),
    ).toEqual({
      status: 'ok',
      rows: [
        {
          values: {
            nom: 'Exemple',
            prenom: 'Léa',
            anneeNaissance: 1970,
            numeroTelephone: '0102030405',
            communeCodeInsee: '32057',
            communeNom: 'Blaziert',
            communeCodePostal: '32100',
            email: 'lea@exemple.fr',
            genre: 'Féminin',
            notesSupplementaires: null,
          },
          parsed: {
            anneeNaissance: 1970,
            genre: 'Feminin',
            commune: {
              codePostal: '32100',
              nom: 'Blaziert',
              codeInsee: '32057',
            },
          },
        },
      ],
    })
  })

  it('refuse une année de naissance lue comme un numéro de série Excel', () => {
    const result = analyser(
      sansCommune,
      feuilleDepuisLignes([['Exemple', 'Léa', 25_569]]),
    )

    expect({
      status: result.status,
      nombreDeLignes: result.rows.length,
      anneeNaissance: result.rows[0]?.values.anneeNaissance,
      errors: result.rows[0]?.errors,
    }).toEqual({
      status: 'error',
      nombreDeLignes: 1,
      anneeNaissance: 25_569,
      errors: {
        anneeNaissance: 'Veuillez renseigner une année de naissance valide',
      },
    })
  })

  it('accepte une commune homonyme désignée par son nom et son code postal', () => {
    const result = analyser(
      lieusaint,
      feuilleDepuisLignes([
        ['Exemple', 'Léa', 1970, 'Lieusaint (77127)', '77251', '77127'],
      ]),
    )

    expect({
      status: result.status,
      commune: result.rows[0]?.parsed.commune,
    }).toEqual({
      status: 'ok',
      commune: { codeInsee: '77251', nom: 'Lieusaint', codePostal: '77127' },
    })
  })

  it('accepte encore le nom seul des modèles déjà téléchargés', () => {
    expect(
      analyser(
        lieusaint,
        feuilleDepuisLignes([
          ['Exemple', 'Léa', 1970, 'Lieusaint', '77251', '77127'],
        ]),
      ).status,
    ).toBe('ok')
  })

  it("refuse le libellé d'une autre commune homonyme", () => {
    expect(
      analyser(
        lieusaint,
        feuilleDepuisLignes([
          ['Exemple', 'Léa', 1970, 'Lieusaint (50700)', '77251', '77127'],
        ]),
      ).rows[0]?.errors,
    ).toEqual({
      communeNom: 'Le nom de la commune ne correspond pas',
    })
  })

  it('refuse un nom porté par plusieurs communes tant que le code postal manque', () => {
    const result = analyser(
      sansCommune,
      feuilleDepuisLignes([
        [
          'Exemple',
          'Léa',
          1970,
          'Lieusaint',
          'Précisez : Lieusaint (code postal)',
          '50700 ou 77127',
        ],
      ]),
    )

    expect({
      commune: result.rows[0]?.parsed.commune,
      errors: result.rows[0]?.errors,
    }).toEqual({
      commune: null,
      errors: { communeCodeInsee: 'Code commune non trouvé' },
    })
  })
})

describe('analyse des saisies de la feuille d’import', () => {
  it.each<{ saisie: string; genre: Genre }>([
    { saisie: 'Masculin', genre: 'Masculin' },
    { saisie: 'Féminin', genre: 'Feminin' },
    { saisie: 'Non communiqué', genre: 'NonCommunique' },
  ])('lit le genre $saisie comme $genre', ({ saisie, genre }) => {
    expect(
      analyser(
        sansCommune,
        feuilleDepuisLignes([
          ['Exemple', 'Léa', null, null, null, null, null, null, saisie],
        ]),
      ).rows,
    ).toMatchObject([{ parsed: { genre } }])
  })

  it('refuse un genre inconnu', () => {
    expect(
      analyser(
        sansCommune,
        feuilleDepuisLignes([
          ['Exemple', 'Léa', null, null, null, null, null, null, 'Autre'],
        ]),
      ).rows,
    ).toMatchObject([
      { parsed: { genre: null }, errors: { genre: 'Genre invalide' } },
    ])
  })

  it('refuse un code postal qui n’est pas celui de la commune', () => {
    expect(
      analyser(
        blaziert,
        feuilleDepuisLignes([
          ['Exemple', 'Léa', 1970, 'Blaziert', '32057', '32200'],
        ]),
      ).rows,
    ).toMatchObject([
      {
        errors: {
          communeCodePostal: 'Le code postal de la commune ne correspond pas',
        },
      },
    ])
  })

  it('lit une année de naissance saisie en texte', () => {
    expect(
      analyser(sansCommune, feuilleDepuisLignes([['Exemple', 'Léa', '1970']]))
        .rows,
    ).toMatchObject([{ parsed: { anneeNaissance: 1970 } }])
  })

  it('ne trouve aucun bénéficiaire dans une feuille réduite à ses instructions', () => {
    expect(analyser(sansCommune, [['Instructions']])).toEqual({
      status: 'ok',
      rows: [],
    })
  })
})
