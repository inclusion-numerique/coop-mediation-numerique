import type { Result } from '@/libraries/result'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { EchecDuRattrapage } from './errors'

export type DemandeurDuRafraichissement = {
  readonly id: UtilisateurCoopId
  readonly role: 'User' | 'Admin'
}

export type RattraperLesRdvsSansWebhook = (rattrapage: {
  readonly demandeur: DemandeurDuRafraichissement
  readonly utilisateurId: UtilisateurCoopId
  readonly seulementSansWebhook: true
  readonly maintenant: Date
}) => Promise<Result<{ readonly derive: number }, EchecDuRattrapage>>

export type ConsulterLAccueil<Widget> = (consultation: {
  readonly utilisateurId: UtilisateurCoopId
  readonly maintenant: Date
}) => Promise<Result<{ readonly widget: Widget }, never>>

export type RafraichirAccueilRdvPorts<Widget> = {
  readonly declencher: RattraperLesRdvsSansWebhook
  readonly consulter: ConsulterLAccueil<Widget>
}
