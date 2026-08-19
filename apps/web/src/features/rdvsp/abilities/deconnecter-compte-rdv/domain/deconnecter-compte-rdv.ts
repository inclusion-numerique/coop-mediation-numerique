import type { Result } from '@app/web/libraries/result'
import type { CompteRdv, CompteRdvDeconnecte } from '../../../domain/compte-rdv'
import type { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import type { CompteRdvIntrouvable } from './errors'

export type DeconnecterCompteRdv = (input: {
  readonly utilisateurId: UtilisateurCoopId
}) => Promise<Result<CompteRdvDeconnecte, CompteRdvIntrouvable>>

/**
 * État du compte après que le médiateur l'a délié.
 *
 * La déconnexion ne détruit que les jetons — c'est ce que l'union exprime, la
 * branche `deconnecte` n'en portant aucun. Tout le reste survit : la fenêtre de
 * synchronisation, les organisations connues et les réglages d'affichage, de
 * sorte qu'une reconnexion reprenne exactement où le médiateur s'était arrêté.
 * C'est le pendant de `compteApresConnexion`, qui préserve ces mêmes champs.
 *
 * Redéliér un compte déjà délié ne réécrit pas la date : c'est la première
 * déconnexion qui fait foi, la seconde n'étant qu'un clic sans objet.
 */
export const compteApresDeconnexion = (
  compte: CompteRdv,
  maintenant: Date,
): CompteRdvDeconnecte => ({
  _tag: 'deconnecte',
  agentId: compte.agentId,
  utilisateurId: compte.utilisateurId,
  deconnexion: compte._tag === 'deconnecte' ? compte.deconnexion : maintenant,
  organisationIds: compte.organisationIds,
  organisationIdsSansWebhook: compte.organisationIdsSansWebhook,
  synchroniserDepuis: compte.synchroniserDepuis,
  derniereSynchro: compte.derniereSynchro,
  inclureRdvsDansActivites: compte.inclureRdvsDansActivites,
})
