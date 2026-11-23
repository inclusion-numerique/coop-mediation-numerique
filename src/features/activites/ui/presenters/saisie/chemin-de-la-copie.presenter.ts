import {
  decodeSerializableState,
  type EncodedState,
  encodeSerializableState,
} from '@/libraries/parametres-d-url/encodeSerializableState'

export type TypeDeSaisie =
  | 'individuel'
  | 'collectif'
  | 'animation'
  | 'evenement'
  | 'partenariat'

export const cheminDeLaCopie = <T>(
  type: TypeDeSaisie,
  valeurs: T,
  retour?: string,
): string =>
  `/coop/mes-activites/cra/${type}?${
    retour ? `retour=${retour}&` : ''
  }v=${encodeSerializableState(valeurs)}`

export const etatDeLUrl = <T extends object>(
  v: EncodedState<T> | undefined,
): Partial<T> => (v ? decodeSerializableState<Partial<T>>(v, {}) : {})
