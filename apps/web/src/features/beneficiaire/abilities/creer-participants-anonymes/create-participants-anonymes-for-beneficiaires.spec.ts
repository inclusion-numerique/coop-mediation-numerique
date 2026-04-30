import { Genre } from '@app/web/features/beneficiaire/domain/genre'
import { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@app/web/features/beneficiaire/domain/tranche-age'
import { createParticipantsAnonymesForBeneficiaires } from './create-participants-anonymes-for-beneficiaires'
import { participantsAnonymesDefault } from './domain/participants-anonymes'

describe('createParticipantsAnonymesForBeneficiaires', () => {
  it('returns defaults for empty array', () => {
    expect(createParticipantsAnonymesForBeneficiaires([])).toEqual({
      participantsAnonymes: { ...participantsAnonymesDefault },
      beneficiairesSuivis: [],
    })
  })

  it('aggregates 1 anonymous beneficiaire into counters', () => {
    const result = createParticipantsAnonymesForBeneficiaires([
      {
        anonyme: true,
        genre: Genre('Feminin'),
        statutSocial: StatutSocial('Scolarise'),
        trancheAge: TrancheAge('DixHuitVingtQuatre'),
        premierAccompagnement: false,
      },
    ])

    expect(result).toEqual({
      participantsAnonymes: {
        ...participantsAnonymesDefault,
        total: 1,
        genreFeminin: 1,
        statutSocialScolarise: 1,
        trancheAgeDixHuitVingtQuatre: 1,
        dejaAccompagne: 1,
      },
      beneficiairesSuivis: [],
    })
  })

  it('keeps non-anonymous beneficiaire in beneficiairesSuivis', () => {
    const beneficiaire = {
      anonyme: false,
      genre: Genre('Masculin'),
      statutSocial: StatutSocial('EnEmploi'),
      trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
      premierAccompagnement: false,
    }

    const result = createParticipantsAnonymesForBeneficiaires([beneficiaire])

    expect(result).toEqual({
      participantsAnonymes: { ...participantsAnonymesDefault },
      beneficiairesSuivis: [beneficiaire],
    })
  })

  it('aggregates multiple anonymous beneficiaires', () => {
    const result = createParticipantsAnonymesForBeneficiaires([
      {
        anonyme: true,
        genre: Genre('NonCommunique'),
        statutSocial: StatutSocial('SansEmploi'),
        trancheAge: TrancheAge('QuaranteCinquanteNeuf'),
        premierAccompagnement: false,
      },
      {
        anonyme: true,
        genre: Genre('Masculin'),
        statutSocial: StatutSocial('EnEmploi'),
        trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
        premierAccompagnement: false,
      },
    ])

    expect(result).toEqual({
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
    })
  })

  it('separates anonymous from non-anonymous', () => {
    const nonAnonymous = {
      anonyme: false,
      genre: Genre('NonCommunique'),
      statutSocial: StatutSocial('NonCommunique'),
      trancheAge: TrancheAge('NonCommunique'),
      premierAccompagnement: false,
    }

    const result = createParticipantsAnonymesForBeneficiaires([
      {
        anonyme: true,
        genre: Genre('Feminin'),
        statutSocial: StatutSocial('Retraite'),
        trancheAge: TrancheAge('SoixanteDixPlus'),
        premierAccompagnement: false,
      },
      nonAnonymous,
    ])

    expect(result).toEqual({
      participantsAnonymes: {
        ...participantsAnonymesDefault,
        total: 1,
        genreFeminin: 1,
        statutSocialRetraite: 1,
        trancheAgeSoixanteDixPlus: 1,
        dejaAccompagne: 1,
      },
      beneficiairesSuivis: [nonAnonymous],
    })
  })

  it('does not count premierAccompagnement as dejaAccompagne', () => {
    const result = createParticipantsAnonymesForBeneficiaires([
      {
        anonyme: true,
        genre: Genre('Masculin'),
        statutSocial: StatutSocial('EnEmploi'),
        trancheAge: TrancheAge('VingtCinqTrenteNeuf'),
        premierAccompagnement: true,
      },
    ])

    expect(result.participantsAnonymes.dejaAccompagne).toBe(0)
  })
})
