import type {
  ActionNonAutorisee,
  DestinationNonAutorisee,
  TagIntrouvable,
} from '../../../domain'

export type EchecDeFusionnerUnTag =
  | TagIntrouvable
  | ActionNonAutorisee
  | DestinationNonAutorisee
