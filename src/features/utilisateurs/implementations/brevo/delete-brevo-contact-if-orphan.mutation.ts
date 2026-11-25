import { listesDeContactsBrevo } from '@/features/utilisateurs/implementations/brevo/brevo-contact-lists.client'
import { deleteBrevoContact } from '@/features/utilisateurs/implementations/brevo/delete-brevo-contact.mutation'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const deleteBrevoContactIfOrphan = async (
  email: string,
): Promise<boolean> => {
  await sleep(1000)

  const listIds = await listesDeContactsBrevo(email)

  if (listIds === null || listIds.length > 0) return false

  await deleteBrevoContact(email)
  return true
}
