import type { CompteRdv, CompteRdvUtilisable } from '../../../domain/compte-rdv'
import type { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import type { DonneesAccueilRdv } from './donnees-accueil-rdv'
import type { WidgetRdvAccueil } from './widget-rdv'

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
