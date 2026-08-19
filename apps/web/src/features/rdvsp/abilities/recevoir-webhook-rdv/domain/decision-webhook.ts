import type { EvenementWebhook } from '../../../domain/evenement-webhook'
import type { Rdv } from '../../../domain/rdv'

/**
 * Rendez-vous déjà détenu, avec la seule information que RDV Service Public
 * ignore : le médiateur a-t-il refusé d'en rédiger un compte rendu.
 */
export type RdvConnu = {
  readonly rdv: Rdv
  readonly compteRenduRegle: boolean
}

export type RaisonIgnore =
  | 'dejaSupprime'
  | 'horsFenetreDeSynchronisation'
  | 'reglageDuCompteRenduPreserve'

export type DecisionWebhookRdv =
  | { readonly _tag: 'enregistrer' }
  | { readonly _tag: 'supprimer' }
  | { readonly _tag: 'ignorer'; readonly raison: RaisonIgnore }

/**
 * Comparaison propre au webhook, volontairement plus étroite que celle de la
 * synchronisation : la notification ne porte ni le détail du lieu ni les
 * participations sous la même forme, et l'on ne cherche ici qu'à savoir si le
 * rendez-vous lui-même a bougé.
 */
export const webhookRdvModifie = (connu: Rdv, recu: Rdv): boolean =>
  connu.statutPresence !== recu.statutPresence ||
  connu.duree !== recu.duree ||
  (connu.collectif ? connu.nom : null) !== (recu.collectif ? recu.nom : null) ||
  connu.debut.getTime() !== recu.debut.getTime() ||
  connu.fin.getTime() !== recu.fin.getTime() ||
  connu.organisationId !== recu.organisationId ||
  (connu.motif?.id ?? null) !== (recu.motif?.id ?? null) ||
  (connu.lieu?.id ?? null) !== (recu.lieu?.id ?? null)

/**
 * Que faire d'une notification.
 *
 * Trois règles s'y superposent, dans cet ordre.
 *
 * Une suppression annoncée est appliquée si le rendez-vous est détenu, ignorée
 * sinon — le webhook peut arriver deux fois.
 *
 * La fenêtre de synchronisation fait autorité : un rendez-vous antérieur à la
 * date à partir de laquelle le compte est suivi n'a pas à entrer dans La Coop, et
 * s'il s'y trouve déjà — parce que la fenêtre a été déplacée — il en sort.
 *
 * Enfin, un refus de compte rendu survit aux notifications sans substance. RDV
 * Service Public en émet pour des changements qui ne nous concernent pas ;
 * réécrire le rendez-vous à chaque fois rallumerait l'invitation à rédiger un CRA
 * que le médiateur a explicitement écartée.
 */
export const decisionPourWebhookRdv = ({
  evenement,
  recu,
  connu,
  synchroniserDepuis,
}: {
  evenement: EvenementWebhook
  recu: Rdv
  connu: RdvConnu | null
  synchroniserDepuis: Date | null
}): DecisionWebhookRdv => {
  if (evenement === 'destroyed') {
    return connu === null
      ? { _tag: 'ignorer', raison: 'dejaSupprime' }
      : { _tag: 'supprimer' }
  }

  if (synchroniserDepuis !== null && recu.debut < synchroniserDepuis) {
    return connu === null
      ? { _tag: 'ignorer', raison: 'horsFenetreDeSynchronisation' }
      : { _tag: 'supprimer' }
  }

  if (
    connu !== null &&
    connu.compteRenduRegle &&
    !webhookRdvModifie(connu.rdv, recu)
  ) {
    return { _tag: 'ignorer', raison: 'reglageDuCompteRenduPreserve' }
  }

  return { _tag: 'enregistrer' }
}
