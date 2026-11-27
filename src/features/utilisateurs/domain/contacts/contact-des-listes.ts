export type RetraitDeLaListe =
  | { readonly _tag: 'Retire' }
  | { readonly _tag: 'DejaAbsent' }

export type PresenceDuContact =
  | { readonly _tag: 'Introuvable' }
  | { readonly _tag: 'Present'; readonly listes: number }

type SortDuContact =
  | { readonly _tag: 'Supprime' }
  | { readonly _tag: 'Conserve' }

export type RetraitDuContact = {
  readonly listeDesUtilisateurs: RetraitDeLaListe
  readonly contact: SortDuContact
}
