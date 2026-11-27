export type StructuresTrouvees<Structure> = {
  readonly structures: readonly Structure[]
  readonly totalCount: number
  readonly moreResults: number
  readonly apiUnavailable: boolean
}
