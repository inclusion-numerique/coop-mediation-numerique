import type { ActionNonAutorisee, ActiviteIntrouvable } from '../../../domain'

export type EchecDeSupprimerUneActiviteDeCoordination =
  | ActiviteIntrouvable
  | ActionNonAutorisee
