import type { MergeStructureData } from '../types'

const intersectArrays = <T>(source: T[], target: T[]): T[] =>
  source.filter((item) => target.includes(item))

const mergeStructureDataKeys: (keyof MergeStructureData)[] = [
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
  mergeSource: MergeStructureData,
  mergeTarget: MergeStructureData,
): MergeStructureData =>
  Object.fromEntries(
    mergeStructureDataKeys.map((key) => [
      key,
      intersectArrays(mergeSource[key], mergeTarget[key]),
    ]),
  ) as MergeStructureData
