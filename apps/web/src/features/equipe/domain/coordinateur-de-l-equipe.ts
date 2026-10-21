import type { Email } from './email'
import type { NomAffiche } from './nom-affiche'
import type { Telephone } from './telephone'

export type CoordinateurDeLEquipe = {
  readonly nom: NomAffiche
  readonly email: Email
  readonly telephone: Telephone | null
}
