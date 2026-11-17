import { getSessionUserFromId } from '@/auth/getSessionUserFromSessionToken'
import type { SessionUser } from '@/auth/sessionUser'

export const utilisateurDuPartage = async ({
  proprietaire,
  utilisateurId,
}: {
  readonly proprietaire: { readonly _tag: string }
  readonly utilisateurId: string
}): Promise<SessionUser> => {
  const user = await getSessionUserFromId(utilisateurId)
  return {
    ...user,
    emplois: [],
    rdvAccount: null,
    coordinateur:
      proprietaire._tag === 'Coordinateur' ? user.coordinateur : null,
  }
}
