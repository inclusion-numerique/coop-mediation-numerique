import type { Adresse, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { NomAffiche } from '@/libraries/nom-affiche'
import type { IdentifiantCartographie } from './cartographie-nationale/ids-cartographie-nationale'
import type { VisibiliteCartographie } from './cartographie-nationale/visibilite-cartographie'
import type { LieuId } from './identifiants/lieu-id'
import type { NomUsage } from './identite-sirene'
import type { NombreDeMediateurs } from './nombres'
import type { SourceCartographie } from './registre/tracabilite'

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
