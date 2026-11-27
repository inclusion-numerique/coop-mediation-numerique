import { type Result, success } from '@/libraries/result'
import type { CompteRdv } from '../../../domain/compte/compte-rdv'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { ConsulterRdvsAccueilPorts, LireDonneesAccueilRdv } from './ports'
import {
  synchroniserAuChargement,
  type WidgetRdvAccueil,
  widgetSansDonnees,
} from './widget-rdv'

export type BlocRdvAccueil = {
  readonly widget: WidgetRdvAccueil
  readonly synchroniserAuChargement: boolean
}

const widgetDuCompte = async (
  compte: CompteRdv | null,
  lireDonnees: LireDonneesAccueilRdv,
  maintenant: Date,
): Promise<WidgetRdvAccueil> =>
  compte === null || compte._tag !== 'lie'
    ? widgetSansDonnees(compte)
    : { _tag: 'donnees', donnees: await lireDonnees({ compte, maintenant }) }

export const consulterRdvsAccueil =
  ({ compteDuMediateur, lireDonnees }: ConsulterRdvsAccueilPorts) =>
  async ({
    utilisateurId,
    maintenant,
  }: {
    readonly utilisateurId: UtilisateurCoopId
    readonly maintenant: Date
  }): Promise<Result<BlocRdvAccueil, never>> => {
    const compte = await compteDuMediateur(utilisateurId)

    return success({
      widget: await widgetDuCompte(compte, lireDonnees, maintenant),
      synchroniserAuChargement:
        compte !== null && synchroniserAuChargement(compte),
    })
  }
