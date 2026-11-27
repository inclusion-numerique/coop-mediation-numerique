import type { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuId, UtilisateurId } from '@/features/inscription/domain'
import type { CodePostal } from '@/libraries/code-postal'
import type { CodeInsee, Siret } from '@/libraries/insee'
import type { Result } from '@/libraries/result'
import type { BanId } from './ban-id'
import type { EmployeuseId } from './employeuse-id'

type AdresseAGeocoder = {
  readonly adresse: string
  readonly codePostal: string
  readonly commune: string
  readonly codeInsee: string | null
}

export type EmployeuseLue = {
  readonly id: EmployeuseId
  readonly denomination: Nom | null
  readonly siret: Siret | null
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
  readonly id: BanId
  readonly nom: string
  readonly commune: string
  readonly codePostal: CodePostal
  readonly codeInsee: CodeInsee
  readonly latitude: number
  readonly longitude: number
}

type LocaliteDuLieu = {
  readonly commune: string
  readonly codePostal: CodePostal
  readonly codeInsee: CodeInsee
}

export type AdresseGeocodeeDuLieu = LocaliteDuLieu & {
  readonly _tag: 'AdresseGeocodee'
  readonly voie: string
  readonly banId: BanId
  readonly latitude: number
  readonly longitude: number
}

export type AdresseDeclareeDuLieu = LocaliteDuLieu & {
  readonly _tag: 'AdresseDeclaree'
  readonly voie: string | null
}

type DescriptionDuLieu<Adresse> = {
  readonly nom: Nom
  readonly adresse: Adresse
  readonly siret: Siret | null
  readonly synchronisationSiret: Date | null
  readonly rna: string | null
  readonly nomReferent: string | null
  readonly courrielReferent: string | null
  readonly telephoneReferent: string | null
}

export type LieuDecrit = DescriptionDuLieu<
  AdresseGeocodeeDuLieu | AdresseDeclareeDuLieu
>

export type LieuDecritGeocode = DescriptionDuLieu<AdresseGeocodeeDuLieu>

export type TraceDeLEmployeuse = {
  readonly userId: UtilisateurId
  readonly structureId: EmployeuseId
}

export type DestinationDuLieuDecrit<Destination> = (input: {
  readonly lieu: LieuDecritGeocode
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
