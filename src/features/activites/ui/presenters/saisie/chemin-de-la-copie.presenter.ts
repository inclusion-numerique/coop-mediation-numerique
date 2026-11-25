import {
  decodeSerializableState,
  type EncodedState,
  encodeSerializableState,
} from '@/libraries/etat-encode'

export type TypeDeSaisie =
  | 'individuel'
  | 'collectif'
  | 'animation'
  | 'evenement'
  | 'partenariat'

export const cheminDeLaCopie = <T>(
  type: TypeDeSaisie,
  valeurs: T,
  retour?: string | undefined,
) =>
  `/coop/mes-activites/cra/${type}?${
    retour ? `retour=${encodeURIComponent(retour)}&` : ''
  }v=${encodeSerializableState(valeurs)}` as const

export const cheminDeLaSaisie = <T>(
  type: TypeDeSaisie,
  valeurs: T,
  retour?: string | undefined,
) =>
  `/coop/mes-activites/cra/${type}?v=${encodeSerializableState(valeurs)}${
    retour ? (`&retour=${encodeURIComponent(retour)}` as const) : ''
  }` as const

export const etatDeLUrl = <T extends object>(
  v: EncodedState<T> | undefined,
): Partial<T> => (v ? decodeSerializableState<Partial<T>>(v, {}) : {})
