import { SessionUser } from '@app/web/auth/sessionUser'
import { getAvailableDestinationTags } from './getAvailableDestinationTags'

export const canMergeTag = async (
  sessionUser: SessionUser,
  sourceTagId: string,
  destinationTagId: string,
): Promise<boolean> => {
  const { items: availableDestinationTags } = await getAvailableDestinationTags(
    sessionUser,
    sourceTagId,
  )

  return availableDestinationTags.some((tag) => tag.id === destinationTagId)
}
