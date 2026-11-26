import type { Telephone } from '@/libraries/telephone'

export type ContactTelephone =
  | { readonly _tag: 'disponible'; readonly numero: Telephone }
  | { readonly _tag: 'pasDeTelephone' }
  | { readonly _tag: 'nonRenseigne' }

export const ContactTelephone = (
  telephone: Telephone | undefined,
  pasDeTelephone: boolean | null | undefined,
): ContactTelephone =>
  telephone
    ? { _tag: 'disponible', numero: telephone }
    : pasDeTelephone
      ? { _tag: 'pasDeTelephone' }
      : { _tag: 'nonRenseigne' }
