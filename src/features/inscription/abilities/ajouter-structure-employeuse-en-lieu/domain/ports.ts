import type { AdresseAGeocoder } from '@/configuration/ban/geocodeStructureAdresse'
import type { UserId } from '@/features/inscription/domain'
import type { AdresseBanData } from '@/libraries/adresse/AdresseBanValidation'
import type { EmployeuseId } from './employeuse-id'

export type EmployeuseLue = {
  readonly id: number
  readonly denomination: string | null
  readonly siret: string | null
  readonly rna: string | null
  readonly adresse: {
    readonly voie: string | null
    readonly commune: string
    readonly codePostal: string
    readonly codeInsee: string
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
  readonly userId: UserId
}) => Promise<{ readonly employeuse: EmployeuseLue } | null>

export type LierStructureEmployeuseEnLieu = (input: {
  readonly userId: UserId
  readonly employeuse: EmployeuseLue
  readonly adresseBan: AdresseBanData
}) => Promise<void>

export type DelierStructureEmployeuseEnLieu = (input: {
  readonly userId: UserId
  readonly employeuse: EmployeuseLue
}) => Promise<void>

export type LireLAdresseDeLEmployeuse = (
  employeuseId: EmployeuseId,
) => Promise<AdresseAGeocoder | null>

export type Geocodage =
  | { readonly _tag: 'AdresseReconnue'; readonly adresse: AdresseBanData }
  | { readonly _tag: 'AdresseInconnue' }
  | { readonly _tag: 'ServiceIndisponible' }

export type GeocoderLAdresse = (adresse: AdresseAGeocoder) => Promise<Geocodage>
