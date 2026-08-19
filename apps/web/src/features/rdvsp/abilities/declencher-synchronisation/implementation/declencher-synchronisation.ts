import { failure, success } from '@app/web/libraries/result'
import {
  type CompteACible,
  CompteRdvIntrouvable,
  type DeclencherSynchronisation,
  type LancerSynchronisation,
  type MarquerEchecDeSynchronisation,
  NonAutorise,
  peutDeclencherPour,
  porteePour,
  SynchronisationEchouee,
} from '../domain/declencher-synchronisation'

export type DependancesDeclencherSynchronisation = {
  readonly compteACible: CompteACible
  readonly lancer: LancerSynchronisation
  readonly marquerEchec: MarquerEchecDeSynchronisation
  /** Remontée de l'erreur technique — Sentry en production, rien sous test. */
  readonly signaler?: (erreur: unknown) => void
  /**
   * Un échec qu'un nouvel essai ne résoudra pas. Lui seul justifie de marquer le
   * compte : le drapeau déclenche l'alerte de reconnexion chez le médiateur, et
   * une API momentanément injoignable ne doit pas la lui adresser.
   */
  readonly echecDefinitif?: (erreur: unknown) => boolean
  readonly maintenant?: () => Date
}

/**
 * Message consigné sur le compte, repris tel quel par l'écran d'administration.
 * Il reste volontairement générique : l'erreur technique part vers Sentry, pas
 * vers un médiateur.
 */
export const MESSAGE_ECHEC =
  'Impossible de récupérer les données du compte RDV Service Public'

/**
 * Déclenche une passe de synchronisation à la demande.
 *
 * Le contrôle d'accès précède la lecture du compte : refuser avant de regarder
 * évite de révéler par le message d'erreur qu'un compte existe.
 *
 * Un échec de la passe n'est pas une erreur technique remontée telle quelle : il
 * est consigné sur le compte — c'est ce que lit l'administration — puis rendu
 * comme un échec métier, que l'appelant traduit en message.
 */
export const declencherSynchronisation =
  ({
    compteACible,
    lancer,
    marquerEchec,
    signaler = () => {
      // Remontée facultative.
    },
    echecDefinitif = () => true,
    maintenant = () => new Date(),
  }: DependancesDeclencherSynchronisation): DeclencherSynchronisation =>
  async ({ demandeur, utilisateurId, seulementSansWebhook }) => {
    if (!peutDeclencherPour(demandeur, utilisateurId)) {
      return failure(NonAutorise())
    }

    const compte = await compteACible(utilisateurId)

    if (compte === null) {
      return failure(CompteRdvIntrouvable())
    }

    const portee = porteePour(compte, seulementSansWebhook)

    if (portee._tag === 'sansObjet') {
      return success({ derive: 0, synchroniseeLe: null })
    }

    try {
      const { derive } = await lancer({
        utilisateurId,
        organisationIds:
          portee._tag === 'organisations' ? portee.organisationIds : undefined,
      })

      return success({ derive, synchroniseeLe: maintenant() })
    } catch (erreur) {
      signaler(erreur)

      // L'échec est toujours consigné au journal de synchronisation, quel qu'il
      // soit : c'est là qu'on diagnostique. Le compte, lui, n'est marqué que si
      // réessayer ne servirait à rien.
      if (echecDefinitif(erreur)) {
        await marquerEchec({ compte, message: MESSAGE_ECHEC })
      }

      return failure(SynchronisationEchouee())
    }
  }
