import { estUtilisable } from '../../../domain/compte-rdv'
import type {
  CompteDuMediateur,
  ConsulterRdvsAccueil,
  LireDonneesAccueilRdv,
} from '../domain/consulter-rdvs-accueil'
import { widgetPour } from '../domain/widget-rdv'

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
