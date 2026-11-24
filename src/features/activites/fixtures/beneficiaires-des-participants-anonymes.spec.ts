import { v4 } from 'uuid'
import { describe, expect, it, test } from 'vitest'
import { participantsAnonymesDefault } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/participants-anonymes.form-data'
import {
  beneficiairesDesParticipantsAnonymes,
  compteurDUuid,
} from '@/features/activites/fixtures/beneficiaires-des-participants-anonymes'

describe('beneficiairesDesParticipantsAnonymes', () => {
  describe('compteurDUuid', () => {
    const uuid = '75bb7e05-9dd8-417e-b4c0-5b30d24a6e58'

    const cases = [
      { index: 0, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2400000' },
      { index: 1, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2400001' },
      { index: 10, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2400010' },
      { index: 100, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2400100' },
      { index: 1090, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2401090' },
      { index: 10_000, expected: '75bb7e05-9dd8-417e-b4c0-5b30d2410000' },
    ]

    test.each(cases)(
      'should generate a uuid with the right length and counter at the end for index $index',
      ({ index, expected }) => {
        expect(compteurDUuid(uuid, index)).toEqual(expected)
      },
    )
  })

  it('should work for 0 beneficiaires', () => {
    expect(
      beneficiairesDesParticipantsAnonymes({
        participantsAnonymes: participantsAnonymesDefault,
        mediateurId: 'mediateur-id',
      }),
    ).toEqual([])
  })

  it('should work for 1 beneficiaire', () => {
    const participants = {
      ...participantsAnonymesDefault,
      total: 1,
      trancheAgeQuaranteCinquanteNeuf: 1,
      genreNonCommunique: 1,
    }

    const id = v4()
    expect(
      beneficiairesDesParticipantsAnonymes({
        participantsAnonymes: participants,
        mediateurId: 'mediateur-id',
        rootUuid: id,
      }),
    ).toEqual([
      {
        id: compteurDUuid(id, 0),
        mediateurId: 'mediateur-id',
        dejaAccompagne: false,
        anonyme: true,
        attributionsAleatoires: true,
        trancheAge: 'QuaranteCinquanteNeuf',
        statutSocial: 'NonCommunique',
        genre: 'NonCommunique',
      },
    ])
  })

  it('should work for multiple beneficiaires', () => {
    const participants = {
      ...participantsAnonymesDefault,
      total: 2,
      trancheAgeQuaranteCinquanteNeuf: 1,
      genreFeminin: 1,
    }

    const id = v4()
    expect(
      beneficiairesDesParticipantsAnonymes({
        participantsAnonymes: participants,
        mediateurId: 'mediateur-id',
        rootUuid: id,
      }),
    ).toEqual([
      {
        id: compteurDUuid(id, 0),
        mediateurId: 'mediateur-id',
        dejaAccompagne: false,
        anonyme: true,
        attributionsAleatoires: true,
        trancheAge: 'QuaranteCinquanteNeuf',
        statutSocial: 'NonCommunique',
        genre: 'Feminin',
      },
      {
        id: compteurDUuid(id, 1),
        mediateurId: 'mediateur-id',
        dejaAccompagne: false,
        anonyme: true,
        attributionsAleatoires: true,
        trancheAge: 'NonCommunique',
        statutSocial: 'NonCommunique',
        genre: 'NonCommunique',
      },
    ])
  })
})
