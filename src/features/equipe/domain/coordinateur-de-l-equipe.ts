import type { Telephone } from '@/libraries/telephone'
import type { Email } from './identite/courriel'
import type { NomAffiche } from './identite/nom-affiche'

export type CoordinateurDeLEquipe = {
  readonly nom: NomAffiche
  readonly email: Email
  readonly telephone: Telephone | null
}
