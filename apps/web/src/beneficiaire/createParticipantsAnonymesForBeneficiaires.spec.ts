import { createParticipantsAnonymesForBeneficiaires } from '@app/web/beneficiaire/createParticipantsAnonymesForBeneficiaires'
import { participantsAnonymesDefault } from '@app/web/features/activites/use-cases/cra/collectif/validation/participantsAnonymes'
import { Beneficiaire } from '@prisma/client'

describe('createParticipantsAnonymesForBeneficiaires', () => {
  it('should work for 0 beneficiaires', () => {
    const result = createParticipantsAnonymesForBeneficiaires([])
    expect(result).toEqual({
      participantsAnonymes: { ...participantsAnonymesDefault },
      beneficiairesSuivis: [],
    })
  })

  const cases: {
    description: string
    beneficiaires: (Pick<
      Beneficiaire,
      'anonyme' | 'statutSocial' | 'genre' | 'trancheAge'
    > & { premierAccompagnement: boolean })[]
    expected: ReturnType<typeof createParticipantsAnonymesForBeneficiaires>
  }[] = [
    {
      description: 'should handle 1 anonymous beneficiaire',
      beneficiaires: [
        {
          anonyme: true,
          genre: 'Feminin',
          statutSocial: 'Scolarise',
          trancheAge: 'DixHuitVingtQuatre',
          premierAccompagnement: false,
        },
      ],
      expected: {
        participantsAnonymes: {
          ...participantsAnonymesDefault,
          total: 1,
          genreFeminin: 1,
          statutSocialScolarise: 1,
          trancheAgeDixHuitVingtQuatre: 1,
          dejaAccompagne: 1,
        },
        beneficiairesSuivis: [],
      },
    },
    {
      description: 'should handle 1 non-anonymous beneficiaire',
      beneficiaires: [
        {
          anonyme: false,
          genre: 'Masculin',
          statutSocial: 'EnEmploi',
          trancheAge: 'VingtCinqTrenteNeuf',
          premierAccompagnement: false,
        },
      ],
      expected: {
        participantsAnonymes: { ...participantsAnonymesDefault },
        beneficiairesSuivis: [
          {
            premierAccompagnement: false,
            anonyme: false,
            genre: 'Masculin',
            statutSocial: 'EnEmploi',
            trancheAge: 'VingtCinqTrenteNeuf',
          },
        ],
      },
    },
    {
      description: 'should handle multiple anonymous beneficiaires',
      beneficiaires: [
        {
          anonyme: true,
          genre: 'NonCommunique',
          statutSocial: 'SansEmploi',
          trancheAge: 'QuaranteCinquanteNeuf',
          premierAccompagnement: false,
        },
        {
          anonyme: true,
          genre: 'Masculin',
          statutSocial: 'EnEmploi',
          trancheAge: 'VingtCinqTrenteNeuf',
          premierAccompagnement: false,
        },
      ],
      expected: {
        participantsAnonymes: {
          ...participantsAnonymesDefault,
          total: 2,
          genreNonCommunique: 1,
          genreMasculin: 1,
          statutSocialSansEmploi: 1,
          statutSocialEnEmploi: 1,
          trancheAgeQuaranteCinquanteNeuf: 1,
          trancheAgeVingtCinqTrenteNeuf: 1,
          dejaAccompagne: 2,
        },
        beneficiairesSuivis: [],
      },
    },
    {
      description:
        'should handle mixed anonymous and non-anonymous beneficiaires',
      beneficiaires: [
        {
          anonyme: true,
          genre: 'Feminin',
          statutSocial: 'Retraite',
          trancheAge: 'SoixanteDixPlus',
          premierAccompagnement: false,
        },
        {
          anonyme: false,
          genre: 'NonCommunique',
          statutSocial: 'NonCommunique',
          trancheAge: 'NonCommunique',
          premierAccompagnement: false,
        },
      ],
      expected: {
        participantsAnonymes: {
          ...participantsAnonymesDefault,
          total: 1,
          genreFeminin: 1,
          statutSocialRetraite: 1,
          trancheAgeSoixanteDixPlus: 1,
          dejaAccompagne: 1,
        },
        beneficiairesSuivis: [
          {
            premierAccompagnement: false,
            anonyme: false,
            genre: 'NonCommunique',
            statutSocial: 'NonCommunique',
            trancheAge: 'NonCommunique',
          },
        ],
      },
    },
  ]

  test.each(cases)('$description', ({ beneficiaires, expected }) => {
    const result = createParticipantsAnonymesForBeneficiaires(beneficiaires)
    expect(result).toEqual(expected)
  })
})
