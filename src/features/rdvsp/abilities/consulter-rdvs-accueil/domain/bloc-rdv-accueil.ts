import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import {
  consulterRdvsAccueil,
  type DependancesConsulterRdvsAccueil,
} from './consulter-rdvs-accueil'
import { synchroniserAuChargement, type WidgetRdvAccueil } from './widget-rdv'

export const blocRdvAccueil =
  (dependances: DependancesConsulterRdvsAccueil) =>
  async (
    utilisateurId: UtilisateurCoopId,
    maintenant: Date,
  ): Promise<{
    readonly widget: WidgetRdvAccueil
    readonly synchroniserAuChargement: boolean
  }> => {
    const compte = await dependances.compteDuMediateur(utilisateurId)

    return {
      widget: await consulterRdvsAccueil(dependances)({
        utilisateurId,
        maintenant,
      }),
      synchroniserAuChargement:
        compte !== null && synchroniserAuChargement(compte),
    }
  }
