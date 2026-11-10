import type { ParticipantsAnonymesCraCollectifDataKey } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/ParticipantsAnonymesCraCollectifValidation'
import {
  countGenreNonCommunique,
  participantsAnonymesDefault,
} from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/participantsAnonymes'
import {
  GENRES,
  STATUTS_SOCIAUX,
  TRANCHES_D_AGE,
} from '@app/web/features/activites/domain'

describe('participantsAnonymes', () => {
  /**
   * This test ensure that the ParticipantsAnonymesCraCollectifData type
   * is correctly defined with a count for each of the modelisation enum values
   */
  describe('ParticipantsAnonymesCraCollectifData', () => {
    const participantsAnonymes = participantsAnonymesDefault

    const genreKeys = [...GENRES].map(
      (key) => `genre${key}`,
    ) as ParticipantsAnonymesCraCollectifDataKey[]

    const trancheAgeKeys = [...TRANCHES_D_AGE].map(
      (key) => `trancheAge${key}`,
    ) as ParticipantsAnonymesCraCollectifDataKey[]

    const statutSocialKeys = [...STATUTS_SOCIAUX].map(
      (key) => `statutSocial${key}`,
    ) as ParticipantsAnonymesCraCollectifDataKey[]

    it('has a total', () => {
      expect(participantsAnonymes.total).toEqual(0)
    })

    it('has a count for every Genre enum values', () => {
      for (const key of genreKeys) {
        expect(participantsAnonymes[key]).toEqual(0)
      }
    })

    it('has a count for every TrancheAge enum values', () => {
      for (const key of trancheAgeKeys) {
        expect(participantsAnonymes[key]).toEqual(0)
      }
    })

    it('has a count for every StatutSocial enum values', () => {
      for (const key of statutSocialKeys) {
        expect(participantsAnonymes[key]).toEqual(0)
      }
    })

    it('has no additional counts', () => {
      const { total: _total, ...enumCounts } = participantsAnonymes

      const modelKeys = [
        'dejaAccompagne',
        ...genreKeys,
        ...trancheAgeKeys,
        ...statutSocialKeys,
      ]

      expect(Object.keys(enumCounts)).toEqual(modelKeys)
    })
  })

  it('remains 2 genres non communiqués when there is 7 bénéficiaires anonymes and 3 genres féminin and 2 genres masculin are already set', () => {
    const data = {
      total: 7,
      genreFeminin: 3,
      genreMasculin: 2,
    }

    const result = countGenreNonCommunique(data)

    expect(result).toEqual(2)
  })
})
