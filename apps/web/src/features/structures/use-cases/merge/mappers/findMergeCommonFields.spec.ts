import type { MergeStructureData } from '../types'
import { findMergeCommonFields } from './findMergeCommonFields'

describe('findMergeCommonFields', () => {
  const emptyMergeData: MergeStructureData = {
    employesIds: [],
    mediateursEnActiviteIds: [],
    activitesEmployeurIds: [],
    activitesLieuIds: [],
    typologies: [],
    services: [],
    publicsSpecifiquementAdresses: [],
    priseEnChargeSpecifique: [],
    fraisACharge: [],
    dispositifProgrammesNationaux: [],
    formationsLabels: [],
    autresFormationsLabels: [],
    itinerance: [],
    modalitesAcces: [],
    modalitesAccompagnement: [],
    courriels: [],
  }

  it('returns empty data when both sources are empty', () => {
    expect(findMergeCommonFields(emptyMergeData, emptyMergeData)).toEqual(
      emptyMergeData,
    )
  })

  it('returns intersection of employesIds', () => {
    const source: MergeStructureData = {
      ...emptyMergeData,
      employesIds: ['user-1', 'user-2', 'user-3'],
    }
    const target: MergeStructureData = {
      ...emptyMergeData,
      employesIds: ['user-2', 'user-3', 'user-4'],
    }

    const result = findMergeCommonFields(source, target)

    expect(result.employesIds).toEqual(['user-2', 'user-3'])
  })

  it('returns intersection of typologies', () => {
    const source: MergeStructureData = {
      ...emptyMergeData,
      typologies: ['ASSO', 'CCAS'],
    }
    const target: MergeStructureData = {
      ...emptyMergeData,
      typologies: ['CCAS', 'MAIRIE'],
    }

    const result = findMergeCommonFields(source, target)

    expect(result.typologies).toEqual(['CCAS'])
  })

  it('returns empty arrays when no common elements exist', () => {
    const source: MergeStructureData = {
      ...emptyMergeData,
      employesIds: ['user-1'],
      services: ['service-a'],
    }
    const target: MergeStructureData = {
      ...emptyMergeData,
      employesIds: ['user-2'],
      services: ['service-b'],
    }

    const result = findMergeCommonFields(source, target)

    expect(result.employesIds).toEqual([])
    expect(result.services).toEqual([])
  })

  it('computes intersection for all fields', () => {
    const source: MergeStructureData = {
      employesIds: ['e1', 'e2'],
      mediateursEnActiviteIds: ['m1', 'm2'],
      activitesEmployeurIds: ['ae1'],
      activitesLieuIds: ['al1', 'al2'],
      typologies: ['t1'],
      services: ['s1', 's2'],
      publicsSpecifiquementAdresses: ['p1'],
      priseEnChargeSpecifique: ['pc1'],
      fraisACharge: ['f1'],
      dispositifProgrammesNationaux: ['d1', 'd2'],
      formationsLabels: ['fl1'],
      autresFormationsLabels: ['afl1'],
      itinerance: ['i1'],
      modalitesAcces: ['ma1'],
      modalitesAccompagnement: ['mac1'],
      courriels: ['c1@test.fr'],
    }
    const target: MergeStructureData = {
      employesIds: ['e2', 'e3'],
      mediateursEnActiviteIds: ['m2', 'm3'],
      activitesEmployeurIds: ['ae2'],
      activitesLieuIds: ['al2', 'al3'],
      typologies: ['t2'],
      services: ['s2', 's3'],
      publicsSpecifiquementAdresses: ['p2'],
      priseEnChargeSpecifique: ['pc2'],
      fraisACharge: ['f2'],
      dispositifProgrammesNationaux: ['d2', 'd3'],
      formationsLabels: ['fl2'],
      autresFormationsLabels: ['afl2'],
      itinerance: ['i2'],
      modalitesAcces: ['ma2'],
      modalitesAccompagnement: ['mac2'],
      courriels: ['c2@test.fr'],
    }

    const result = findMergeCommonFields(source, target)

    expect(result).toEqual({
      employesIds: ['e2'],
      mediateursEnActiviteIds: ['m2'],
      activitesEmployeurIds: [],
      activitesLieuIds: ['al2'],
      typologies: [],
      services: ['s2'],
      publicsSpecifiquementAdresses: [],
      priseEnChargeSpecifique: [],
      fraisACharge: [],
      dispositifProgrammesNationaux: ['d2'],
      formationsLabels: [],
      autresFormationsLabels: [],
      itinerance: [],
      modalitesAcces: [],
      modalitesAccompagnement: [],
      courriels: [],
    })
  })
})
