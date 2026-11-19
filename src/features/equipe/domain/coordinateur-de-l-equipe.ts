import type { Telephone } from '@/libraries/telephone'
import type { Email } from './email'
import type { NomAffiche } from './nom-affiche'

export type CoordinateurDeLEquipe = {
  readonly nom: NomAffiche
  readonly email: Email
  readonly telephone: Telephone | null
}
