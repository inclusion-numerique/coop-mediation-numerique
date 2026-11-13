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
  describe('ParticipantsAnonymesCraCollectifData', () => {
    const participantsAnonymes = participantsAnonymesDefault

    const genreKeys = GENRES.map((genre) => `genre${genre}` as const)

    const trancheAgeKeys = TRANCHES_D_AGE.map(
      (trancheAge) => `trancheAge${trancheAge}` as const,
    )

    const statutSocialKeys = STATUTS_SOCIAUX.map(
      (statutSocial) => `statutSocial${statutSocial}` as const,
    )

    it('has a total', () => {
      expect(participantsAnonymes.total).toEqual(0)
    })

    it.each([...genreKeys, ...trancheAgeKeys, ...statutSocialKeys])(
      'has a count for %s',
      (key) => {
        expect(participantsAnonymes[key]).toEqual(0)
      },
    )

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
