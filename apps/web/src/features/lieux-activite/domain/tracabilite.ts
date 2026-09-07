import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { UserId } from './user-id'

/**
 * Le producteur de données à l'origine d'une mise à jour venue de la
 * cartographie nationale (`dora`, `SIILAB`, `France Services`…). Texte libre :
 * la liste appartient aux producteurs, pas à la coop.
 */
export const SourceCartographie = defineModel(
  z.string().trim().min(1).brand('SourceCartographie'),
)

export type SourceCartographie = Model.TypeOf<typeof SourceCartographie>

/**
 * `par` est nul quand l'écriture ne vient de personne — un import, un job, une
 * reprise de données. C'est une absence pure, pas un état : contrairement à la
 * dernière modification, rien d'autre ne se déduit de cette information, donc
 * elle n'a pas besoin d'être une variante.
 */
export type Creation = {
  readonly date: Date
  readonly par: UserId | null
}

/**
 * `derniere_modification_par_id` et `derniere_modification_source` encodent un
 * seul état, et le schéma Prisma l'écrit noir sur blanc : « lors de l'update un
 * seul des 2 doit être non-null ». La base le respecte (aucune ligne ne porte
 * les deux), mais 9 825 lieux sur 12 750 n'en portent aucun — d'où la troisième
 * variante, qui est le cas courant et non l'exception.
 */
export type DerniereModification =
  | {
      readonly _tag: 'ParUtilisateur'
      readonly date: Date
      readonly par: UserId
    }
  | {
      readonly _tag: 'ParSource'
      readonly date: Date
      readonly source: SourceCartographie
    }
  | { readonly _tag: 'Inconnue'; readonly date: Date }

export const ModifieParUtilisateur = (
  date: Date,
  par: UserId,
): Extract<DerniereModification, { _tag: 'ParUtilisateur' }> => ({
  _tag: 'ParUtilisateur',
  date,
  par,
})

export const ModifieParSource = (
  date: Date,
  source: SourceCartographie,
): Extract<DerniereModification, { _tag: 'ParSource' }> => ({
  _tag: 'ParSource',
  date,
  source,
})

export const ModificationInconnue = (
  date: Date,
): Extract<DerniereModification, { _tag: 'Inconnue' }> => ({
  _tag: 'Inconnue',
  date,
})

export type Suppression =
  | { readonly _tag: 'Actif' }
  | {
      readonly _tag: 'Supprime'
      readonly date: Date
      readonly par: UserId | null
    }

export const Actif: Suppression = { _tag: 'Actif' }

export const Supprime = (date: Date, par: UserId | null): Suppression => ({
  _tag: 'Supprime',
  date,
  par,
})

export type Tracabilite = {
  readonly creation: Creation
  readonly derniereModification: DerniereModification
  readonly suppression: Suppression
}

export const estSupprime = (tracabilite: Tracabilite): boolean =>
  tracabilite.suppression._tag === 'Supprime'

/**
 * Un rattachement ne se met à jour que depuis la coop : sa table ne porte pas
 * de colonne `derniere_modification_source`, donc la variante « par une source »
 * n'a nulle part où aller.
 *
 * Il ne porte pas non plus de `suppression` : son propre tag la dit déjà. La
 * répéter ici autoriserait un rattachement « en cours » dont la traçabilité le
 * déclare supprimé — un état contradictoire que rien ne rattraperait.
 */
export type TracabiliteRattachement = {
  readonly creation: Creation
  readonly derniereModification: Exclude<
    DerniereModification,
    { readonly _tag: 'ParSource' }
  >
}
