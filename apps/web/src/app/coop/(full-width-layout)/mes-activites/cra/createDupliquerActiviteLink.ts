import type { Activite } from '@prisma/client'

export const createDupliquerActiviteLink = (
  { id, type }: Pick<Activite, 'type' | 'id'>,
  { retour }: { retour?: string } = {},
) => {
  const retourQueryParam = retour ? `?retour=${retour}` : ''

  if (type === 'Individuel') {
    return `/coop/mes-activites/cra/individuel/${id}/dupliquer${retourQueryParam}`
  }

  if (type === 'Collectif') {
    return `/coop/mes-activites/cra/collectif/${id}/dupliquer${retourQueryParam}`
  }

  throw new Error('Invalid activity type for dupliquer link')
}
