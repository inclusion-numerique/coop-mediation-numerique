import type { NomAffiche } from '@app/web/libraries/nom-affiche'
import type { Adresse, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { NomUsage } from './identite-sirene'
import type { IdentifiantCartographie } from './ids-cartographie-nationale'
import type { LieuId } from './lieu-id'
import type { NombreDeMediateurs } from './nombres'
import type { SourceCartographie } from './tracabilite'
import type { VisibiliteCartographie } from './visibilite-cartographie'

export type ModificationEnListe =
  | {
      readonly _tag: 'ParUtilisateur'
      readonly date: Date
      readonly auteur: NomAffiche
    }
  | {
      readonly _tag: 'ParSource'
      readonly date: Date
      readonly source: SourceCartographie
    }
  | { readonly _tag: 'Inconnue'; readonly date: Date }

export type LieuEnListe = {
  readonly id: LieuId
  readonly nom: Nom
  readonly nomUsage: NomUsage | null
  readonly adresse: Adresse | null
  readonly adresseAPreciser: boolean
  readonly derniereModification: ModificationEnListe
  readonly visibilite: VisibiliteCartographie
  readonly identifiantCartographie: IdentifiantCartographie | null
  readonly mediateurs: NombreDeMediateurs
}
