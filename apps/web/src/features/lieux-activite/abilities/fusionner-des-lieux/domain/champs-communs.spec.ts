import { champsCommuns } from './champs-communs'
import type { ChampsPartageables } from './lieu-a-fusionner'

describe('champsCommuns', () => {
  const emptyMergeData: ChampsPartageables = {
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
    expect(champsCommuns(emptyMergeData, emptyMergeData)).toEqual(
      emptyMergeData,
    )
  })

  it('returns intersection of employesIds', () => {
    const source: ChampsPartageables = {
      ...emptyMergeData,
      employesIds: ['user-1', 'user-2', 'user-3'],
    }
    const target: ChampsPartageables = {
      ...emptyMergeData,
      employesIds: ['user-2', 'user-3', 'user-4'],
    }

    const result = champsCommuns(source, target)

    expect(result.employesIds).toEqual(['user-2', 'user-3'])
  })

  it('returns intersection of typologies', () => {
    const source: ChampsPartageables = {
      ...emptyMergeData,
      typologies: ['ASSO', 'CCAS'],
    }
    const target: ChampsPartageables = {
      ...emptyMergeData,
      typologies: ['CCAS', 'MAIRIE'],
    }

    const result = champsCommuns(source, target)

    expect(result.typologies).toEqual(['CCAS'])
  })

  it('returns empty arrays when no common elements exist', () => {
    const source: ChampsPartageables = {
      ...emptyMergeData,
      employesIds: ['user-1'],
      services: ['service-a'],
    }
    const target: ChampsPartageables = {
      ...emptyMergeData,
      employesIds: ['user-2'],
      services: ['service-b'],
    }

    const result = champsCommuns(source, target)

    expect(result.employesIds).toEqual([])
    expect(result.services).toEqual([])
  })

  it('computes intersection for all fields', () => {
    const source: ChampsPartageables = {
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
    const target: ChampsPartageables = {
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

    const result = champsCommuns(source, target)

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
