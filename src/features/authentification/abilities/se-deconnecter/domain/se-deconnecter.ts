import { type Result, success } from '@/libraries/result'
import type { Deconnexion } from './deconnexion'
import type { EchecDeSeDeconnecter } from './errors'
import type { IdToken, SeDeconnecterPorts } from './ports'

const MARGE_DE_DECALAGE_D_HORLOGE_EN_MILLISECONDES = 3000

const encoreValable = ({ expiration }: IdToken, maintenant: Date): boolean =>
  expiration !== null &&
  expiration.getTime() >
    maintenant.getTime() + MARGE_DE_DECALAGE_D_HORLOGE_EN_MILLISECONDES

const aupresDeProConnect = (idTokenHint: string): Deconnexion => ({
  _tag: 'AupresDeProConnect',
  idTokenHint,
})

const locale: Deconnexion = { _tag: 'Locale' }

export const seDeconnecter =
  ({ lireLesJetonsProconnect, rafraichirLIdToken }: SeDeconnecterPorts) =>
  async ({
    utilisateurId,
    maintenant,
  }: {
    readonly utilisateurId: string
    readonly maintenant: Date
  }): Promise<Result<Deconnexion, EchecDeSeDeconnecter>> => {
    const { idToken, refreshToken } =
      await lireLesJetonsProconnect(utilisateurId)

    if (idToken !== null && encoreValable(idToken, maintenant))
      return success(aupresDeProConnect(idToken.valeur))
    if (refreshToken === null) return success(locale)

    const rafraichi = await rafraichirLIdToken(refreshToken)

    return success(
      rafraichi.success ? aupresDeProConnect(rafraichi.data) : locale,
    )
  }
