import type { Tag } from './tag'
import type { TagId } from './tag-id'

export type LireUnTagActif = (tagId: TagId) => Promise<Tag | null>
