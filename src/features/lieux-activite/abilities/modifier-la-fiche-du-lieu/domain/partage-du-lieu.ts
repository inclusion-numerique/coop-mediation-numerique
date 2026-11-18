import type {
  NombreDActivites,
  NombreDeMediateurs,
} from '../../../domain/nombres'

export type PartageDuLieu = {
  readonly autresMediateurs: NombreDeMediateurs
  readonly activites: NombreDActivites
}

export const estPartage = ({ autresMediateurs }: PartageDuLieu): boolean =>
  autresMediateurs > 0
