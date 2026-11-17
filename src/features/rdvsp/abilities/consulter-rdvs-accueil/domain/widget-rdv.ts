import type { CompteRdv } from '../../../domain/compte-rdv'
import type { DonneesAccueilRdv } from './donnees-accueil-rdv'

/**
 * Ce que l'accueil montre au sujet de RDV Service Public.
 *
 * Trois états, et trois seulement. L'ancien assemblage en laissait un quatrième
 * possible : les données étaient calculées à part de l'alerte, chacune sous sa
 * propre condition, si bien qu'un compte pouvait n'obtenir ni l'une ni l'autre —
 * la section disparaissait sans un mot. L'union rend ce silence irreprésentable.
 */
export type WidgetRdvAccueil =
  | { readonly _tag: 'masque' }
  | { readonly _tag: 'alerte' }
  | { readonly _tag: 'donnees'; readonly donnees: DonneesAccueilRdv }

/**
 * Décide de l'état du widget.
 *
 * Un compte délié est masqué, non signalé : l'utilisateur l'a débranché lui-même,
 * lui présenter une erreur reviendrait à lui reprocher sa propre décision. C'est
 * le seul écart de comportement — l'ancien calcul, qui ne regardait que la
 * présence de jetons, ne distinguait pas une déconnexion voulue d'une panne.
 *
 * Un compte en erreur ou resté non lié appelle une alerte : dans les deux cas
 * une reconnexion est nécessaire, et elle n'est pas destructive.
 */
export const widgetPour = (
  compte: CompteRdv | null,
  donnees: DonneesAccueilRdv | null,
): WidgetRdvAccueil => {
  if (compte === null || compte._tag === 'deconnecte') {
    return { _tag: 'masque' }
  }

  if (compte._tag === 'nonLie' || compte._tag === 'enErreur') {
    return { _tag: 'alerte' }
  }

  return donnees === null ? { _tag: 'alerte' } : { _tag: 'donnees', donnees }
}

/**
 * Certaines organisations n'ont pas accepté la pose d'un webhook : leurs
 * rendez-vous n'arrivent pas d'eux-mêmes, l'accueil déclenche donc une
 * synchronisation à son ouverture pour ne pas afficher un état périmé.
 */
export const synchroniserAuChargement = (compte: CompteRdv): boolean =>
  compte.organisationIdsSansWebhook.length > 0
