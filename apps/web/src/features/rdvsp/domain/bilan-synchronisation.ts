/**
 * Ce qu'une passe de synchronisation a fait subir à un modèle.
 *
 * Partagé par les abilities qui synchronisent et par celle qui orchestre : il
 * vit au niveau de la feature, aucune d'elles n'ayant à dépendre d'une autre.
 */
export type BilanModele = {
  readonly noop: number
  readonly created: number
  readonly updated: number
  readonly deleted: number
}

export const bilanVide: BilanModele = {
  noop: 0,
  created: 0,
  updated: 0,
  deleted: 0,
}

export const cumulerBilans = (
  premier: BilanModele,
  second: BilanModele,
): BilanModele => ({
  noop: premier.noop + second.noop,
  created: premier.created + second.created,
  updated: premier.updated + second.updated,
  deleted: premier.deleted + second.deleted,
})

export type ModeleSynchronise =
  | 'rdvs'
  | 'organisations'
  | 'webhooks'
  | 'users'
  | 'motifs'
  | 'lieux'

export const modelesSynchronises = [
  'rdvs',
  'organisations',
  'webhooks',
  'users',
  'motifs',
  'lieux',
] as const

export type BilanSynchronisation = Readonly<
  Record<ModeleSynchronise, BilanModele>
>

export const bilanSynchronisationVide: BilanSynchronisation = {
  rdvs: bilanVide,
  organisations: bilanVide,
  webhooks: bilanVide,
  users: bilanVide,
  motifs: bilanVide,
  lieux: bilanVide,
}

/**
 * Dérive d'un modèle : tout ce que la synchronisation a dû changer.
 *
 * C'est la mesure de ce que les webhooks n'ont pas rapporté. En régime normal
 * les notifications tiennent La Coop à jour et une passe ne trouve rien à faire ;
 * une dérive élevée signale que les notifications n'arrivent pas — c'est ce que
 * l'administration surveille. Les `noop` en sont exclus : ne rien avoir à faire
 * n'est pas un écart.
 */
export const derive = (bilan: BilanModele): number =>
  bilan.created + bilan.updated + bilan.deleted

export const deriveTotale = (bilan: BilanSynchronisation): number =>
  modelesSynchronises.reduce(
    (total, modele) => total + derive(bilan[modele]),
    0,
  )
