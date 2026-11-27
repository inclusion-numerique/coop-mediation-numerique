import type { LieuId, UtilisateurId } from '@/features/inscription/domain'
import type { CodePostal } from '@/libraries/code-postal'
import type { CodeInsee } from '@/libraries/insee'
import type { Result } from '@/libraries/result'
import type { EmployeuseId } from './employeuse-id'

type AdresseAGeocoder = {
  readonly adresse: string
  readonly codePostal: string
  readonly commune: string
  readonly codeInsee: string | null
}

export type EmployeuseLue = {
  readonly id: EmployeuseId
  readonly denomination: string | null
  readonly siret: string | null
  readonly rna: string | null
  readonly adresse: {
    readonly voie: string | null
    readonly commune: string
    readonly codePostal: CodePostal
    readonly codeInsee: CodeInsee
  } | null
  readonly contactReferent:
    | { readonly _tag: 'nonRenseigne' }
    | {
        readonly _tag: 'renseigne'
        readonly nom: string | null
        readonly courriel: string | null
        readonly telephone: string | null
      }
}

export type ConsulterEmployeuseActuelle = (input: {
  readonly userId: UtilisateurId
}) => Promise<{ readonly employeuse: EmployeuseLue } | null>

export type AdresseGeocodee = {
  readonly id: string
  readonly nom: string
  readonly commune: string
  readonly codePostal: CodePostal
  readonly codeInsee: CodeInsee
  readonly latitude: number
  readonly longitude: number
}

export type LieuDecrit = {
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: CodePostal
  readonly codeInsee: CodeInsee | null
  readonly banId?: string
  readonly latitude?: number
  readonly longitude?: number
  readonly complementAdresse: null
  readonly siret: string | null
  readonly synchronisationSiret: Date | null
  readonly rna: string | null
  readonly nomReferent: string | null
  readonly courrielReferent: string | null
  readonly telephoneReferent: string | null
}

export type TraceDeLEmployeuse = {
  readonly userId: UtilisateurId
  readonly structureId: EmployeuseId
}

export type DestinationDuLieuDecrit<Destination> = (input: {
  readonly lieu: LieuDecrit
}) => Promise<Result<Destination, never>>

export type RattachementAuLieuDecrit =
  | { readonly _tag: 'Rattaches' }
  | { readonly _tag: 'LieuDisparu'; readonly lieuId: LieuId }

export type RattacherAuLieuDecrit<Destination> = (input: {
  readonly utilisateurId: UtilisateurId
  readonly destination: Destination
  readonly trace: TraceDeLEmployeuse
  readonly maintenant: Date
}) => Promise<RattachementAuLieuDecrit>

export type LieuCorreleAuLieuDecrit = (input: {
  readonly lieu: LieuDecrit
}) => Promise<Result<LieuId | null, never>>

export type DetacherDuLieu = (input: {
  readonly utilisateurId: UtilisateurId
  readonly lieuId: LieuId
  readonly trace: TraceDeLEmployeuse
  readonly maintenant: Date
}) => Promise<void>

export type LireLAdresseDeLEmployeuse = (
  employeuseId: EmployeuseId,
) => Promise<AdresseAGeocoder | null>

export type Geocodage =
  | { readonly _tag: 'AdresseReconnue'; readonly adresse: AdresseGeocodee }
  | { readonly _tag: 'AdresseInconnue' }
  | { readonly _tag: 'ServiceIndisponible' }

export type GeocoderLAdresse = (adresse: AdresseAGeocoder) => Promise<Geocodage>

export type AjouterStructureEmployeuseEnLieuPorts<Destination> = {
  readonly consulterEmployeuseActuelle: ConsulterEmployeuseActuelle
  readonly lireLAdresseDeLEmployeuse: LireLAdresseDeLEmployeuse
  readonly geocoderLAdresse: GeocoderLAdresse
  readonly destinationDuLieuDecrit: DestinationDuLieuDecrit<Destination>
  readonly rattacherAuLieuDecrit: RattacherAuLieuDecrit<Destination>
  readonly lieuCorreleAuLieuDecrit: LieuCorreleAuLieuDecrit
  readonly detacherDuLieu: DetacherDuLieu
}
