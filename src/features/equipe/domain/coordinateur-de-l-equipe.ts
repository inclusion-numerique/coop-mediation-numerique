import type { Telephone } from '@/libraries/telephone'
import type { Courriel } from './identite/courriel'
import type { NomAffiche } from './identite/nom-affiche'

export type CoordinateurDeLEquipe = {
  readonly nom: NomAffiche
  readonly email: Courriel
  readonly telephone: Telephone | null
}
