import type { MergeLieuInclusionData } from '../types'

const intersectArrays = <T>(source: T[], target: T[]): T[] =>
  source.filter((item) => target.includes(item))

const mergeLieuInclusionDataKeys: (keyof MergeLieuInclusionData)[] = [
  'employesIds',
  'mediateursEnActiviteIds',
  'activitesEmployeurIds',
  'activitesLieuIds',
  'typologies',
  'services',
  'publicsSpecifiquementAdresses',
  'priseEnChargeSpecifique',
  'fraisACharge',
  'dispositifProgrammesNationaux',
  'formationsLabels',
  'autresFormationsLabels',
  'itinerance',
  'modalitesAcces',
  'modalitesAccompagnement',
  'courriels',
]

export const findMergeCommonFields = (
  mergeSource: MergeLieuInclusionData,
  mergeTarget: MergeLieuInclusionData,
): MergeLieuInclusionData =>
  Object.fromEntries(
    mergeLieuInclusionDataKeys.map((key) => [
      key,
      intersectArrays(mergeSource[key], mergeTarget[key]),
    ]),
  ) as MergeLieuInclusionData
