import type { DonneesAccueilRdv } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/domain/donnees-accueil-rdv'
import type { WidgetRdvAccueil } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/domain/widget-rdv'
import { widgetPour } from '@/features/rdvsp/abilities/consulter-rdvs-accueil/domain/widget-rdv'
import type {
  CompteRdv,
  CompteRdvUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import { estUtilisable } from '@/features/rdvsp/domain/compte/compte-rdv'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'

export type ConsulterRdvsAccueil = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly maintenant: Date
}) => Promise<WidgetRdvAccueil>

export type CompteDuMediateur = (
  utilisateurId: UtilisateurCoopId,
) => Promise<CompteRdv | null>

export type LireDonneesAccueilRdv = (input: {
  readonly compte: CompteRdvUtilisable
  readonly maintenant: Date
}) => Promise<DonneesAccueilRdv>

export type DependancesConsulterRdvsAccueil = {
  readonly compteDuMediateur: CompteDuMediateur
  readonly lireDonnees: LireDonneesAccueilRdv
}

/**
 * Les données ne sont lues que si le compte peut les porter : inutile de compter
 * les rendez-vous de quelqu'un qui doit d'abord se reconnecter.
 */
export const consulterRdvsAccueil =
  ({
    compteDuMediateur,
    lireDonnees,
  }: DependancesConsulterRdvsAccueil): ConsulterRdvsAccueil =>
  async ({ utilisateurId, maintenant }) => {
    const compte = await compteDuMediateur(utilisateurId)

    if (compte === null || !estUtilisable(compte) || compte._tag !== 'lie') {
      return widgetPour(compte, null)
    }

    return widgetPour(compte, await lireDonnees({ compte, maintenant }))
  }
