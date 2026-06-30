import type { Telephone } from './telephone'

export type ContactTelephone =
  | { readonly _tag: 'disponible'; readonly numero: Telephone }
  | { readonly _tag: 'pasDeTelephone' }
  | { readonly _tag: 'nonRenseigne' }

/**
 * Construit le contact à partir des champs fournis : un numéro prime ; sinon le
 * drapeau « pas de téléphone » ; sinon `nonRenseigne`. Constructeur total :
 * l'absence (`nonRenseigne`) est une valeur du domaine.
 */
export const ContactTelephone = (
  telephone: Telephone | undefined,
  pasDeTelephone: boolean | null | undefined,
): ContactTelephone =>
  telephone
    ? { _tag: 'disponible', numero: telephone }
    : pasDeTelephone
      ? { _tag: 'pasDeTelephone' }
      : { _tag: 'nonRenseigne' }
