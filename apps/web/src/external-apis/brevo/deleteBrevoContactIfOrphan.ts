import { deleteBrevoContact } from './deleteBrevoContact'
import { getBrevoContactLists } from './getBrevoContactLists'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const deleteBrevoContactIfOrphan = async (
  email: string,
): Promise<boolean> => {
  await sleep(1000)

  const listIds = await getBrevoContactLists(email)

  if (listIds === null || listIds.length > 0) return false

  await deleteBrevoContact(email)
  return true
}
