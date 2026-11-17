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

/**
 * Ce qu'une passe a fait subir à un élément. Les quatre valeurs sont les clés de
 * `BilanModele` : chaque opération y incrémente son compteur.
 */
export type OperationSynchronisation = keyof BilanModele

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
export const derive = (
  bilan: BilanModele,
  suppressionEstUnEcart = true,
): number =>
  bilan.created + bilan.updated + (suppressionEstUnEcart ? bilan.deleted : 0)

/**
 * Une suppression signale un écart pour tous les modèles sauf les motifs.
 *
 * Un motif n'est jamais supprimé chez RDV Service Public à notre connaissance :
 * on ne retire que ceux qu'aucun rendez-vous ne référence plus, c'est-à-dire du
 * cache que la passe libère. Les compter aurait fait paraître le premier
 * ramassage — 138 motifs sur un compte qui a deux rendez-vous — comme 138
 * notifications manquées, et donc comme une alerte.
 *
 * Le compteur reste affiché dans le bilan : il dit ce que la passe a fait. Il ne
 * pèse simplement pas sur la mesure de ce que les webhooks n'ont pas rapporté.
 */
const suppressionEstUnEcart: Readonly<Record<ModeleSynchronise, boolean>> = {
  rdvs: true,
  organisations: true,
  webhooks: true,
  users: true,
  motifs: false,
  lieux: true,
}

/** Dérive d'un modèle nommé, la règle de suppression du modèle appliquée. */
export const deriveDuModele = (
  modele: ModeleSynchronise,
  bilan: BilanSynchronisation,
): number => derive(bilan[modele], suppressionEstUnEcart[modele])

export const deriveTotale = (bilan: BilanSynchronisation): number =>
  modelesSynchronises.reduce(
    (total, modele) => total + deriveDuModele(modele, bilan),
    0,
  )
