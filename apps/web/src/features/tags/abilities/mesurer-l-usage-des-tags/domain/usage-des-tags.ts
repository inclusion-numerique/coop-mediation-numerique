import type { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'

export type Proportion = {
  readonly total: number
  readonly percentage: number
}

export type TagLePlusUtilise = {
  readonly id: string
  readonly nom: string
  readonly scope: TagScope
  readonly description?: string
  readonly usageCount: number
  readonly accompagnementsCount: number
}

export type UsageDesTags = {
  readonly tagsCreators: Proportion
  readonly tagsUsedInCRAs: Proportion
  readonly mostUsedTags: readonly TagLePlusUtilise[]
}
