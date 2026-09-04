import type { ChampsPartageables } from './lieu-a-fusionner'

const intersectArrays = <T>(source: T[], target: T[]): T[] =>
  source.filter((item) => target.includes(item))

const mergeLieuInclusionDataKeys: (keyof ChampsPartageables)[] = [
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

export const champsCommuns = (
  mergeSource: ChampsPartageables,
  mergeTarget: ChampsPartageables,
): ChampsPartageables =>
  Object.fromEntries(
    mergeLieuInclusionDataKeys.map((key) => [
      key,
      intersectArrays(mergeSource[key], mergeTarget[key]),
    ]),
  ) as ChampsPartageables
