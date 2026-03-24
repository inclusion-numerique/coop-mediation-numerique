import { deleteBrevoContact } from './deleteBrevoContact'
import { getBrevoContactLists } from './getBrevoContactLists'

export const deleteBrevoContactIfOrphan = async (
  email: string,
): Promise<boolean> => {
  const listIds = await getBrevoContactLists(email)

  if (listIds === null || listIds.length > 0) return false

  await deleteBrevoContact(email)
  return true
}
