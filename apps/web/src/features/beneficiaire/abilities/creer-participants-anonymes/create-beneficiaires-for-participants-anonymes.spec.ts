import { Genre } from '@app/web/features/beneficiaire/domain/genre'
import { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@app/web/features/beneficiaire/domain/tranche-age'
import { v4 } from 'uuid'
import {
  createBeneficiairesForParticipantsAnonymes,
  createCounterUuid,
} from './create-beneficiaires-for-participants-anonymes'
import { participantsAnonymesDefault } from './domain/participants-anonymes'

describe('createCounterUuid', () => {
  const uuid = '75bb7e05-9dd8-417e-b4c0-5b30d24a6e58'

  it.each([
    { index: 0, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2400000' },
    { index: 1, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2400001' },
    { index: 10, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2400010' },
    { index: 100, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2400100' },
    { index: 1090, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2401090' },
    { index: 10_000, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2410000' },
  ])('generates uuid with counter $index at the end', ({ index, expected }) => {
    expect(createCounterUuid(uuid, index)).toEqual(expected)
  })
})

describe('createBeneficiairesForParticipantsAnonymes', () => {
  it('returns empty array for 0 participants', () => {
    expect(
      createBeneficiairesForParticipantsAnonymes({
        participantsAnonymes: participantsAnonymesDefault,
        mediateurId: 'mediateur-id',
      }),
    ).toEqual([])
  })

  it('creates 1 beneficiaire with correct demographics', () => {
    const rootUuid = v4()
    const result = createBeneficiairesForParticipantsAnonymes({
      participantsAnonymes: {
        ...participantsAnonymesDefault,
        total: 1,
        trancheAgeQuaranteCinquanteNeuf: 1,
        genreNonCommunique: 1,
      },
      mediateurId: 'mediateur-id',
      rootUuid,
    })

    expect(result).toEqual([
      {
        id: createCounterUuid(rootUuid, 0),
        mediateurId: 'mediateur-id',
        dejaAccompagne: false,
        anonyme: true,
        attributionsAleatoires: true,
        trancheAge: TrancheAge('QuaranteCinquanteNeuf'),
        statutSocial: StatutSocial('NonCommunique'),
        genre: Genre('NonCommunique'),
      },
    ])
  })

  it('creates multiple beneficiaires distributing demographics', () => {
    const rootUuid = v4()
    const result = createBeneficiairesForParticipantsAnonymes({
      participantsAnonymes: {
        ...participantsAnonymesDefault,
        total: 2,
        trancheAgeQuaranteCinquanteNeuf: 1,
        genreFeminin: 1,
      },
      mediateurId: 'mediateur-id',
      rootUuid,
    })

    expect(result).toHaveLength(2)
    expect(result.map((b) => b.id)).toEqual([
      createCounterUuid(rootUuid, 0),
      createCounterUuid(rootUuid, 1),
    ])

    const allGenres = result.map((b) => b.genre)
    expect(allGenres).toContain(Genre('Feminin'))
    expect(allGenres.filter((g) => g === Genre('NonCommunique'))).toHaveLength(
      1,
    )

    const allTranches = result.map((b) => b.trancheAge)
    expect(allTranches).toContain(TrancheAge('QuaranteCinquanteNeuf'))
    expect(
      allTranches.filter((t) => t === TrancheAge('NonCommunique')),
    ).toHaveLength(1)
  })

  it('assigns dejaAccompagne to first N beneficiaires', () => {
    const result = createBeneficiairesForParticipantsAnonymes({
      participantsAnonymes: {
        ...participantsAnonymesDefault,
        total: 3,
        dejaAccompagne: 2,
      },
      mediateurId: 'mediateur-id',
    })

    expect(result.map((b) => b.dejaAccompagne)).toEqual([true, true, false])
  })
})
