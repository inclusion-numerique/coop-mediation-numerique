import type { UtilisateurId } from '@/features/inscription/domain'
import type { AdresseBanData } from '@/libraries/adresse'
import type { EmployeuseId } from './employeuse-id'

type AdresseAGeocoder = {
  readonly adresse: string
  readonly codePostal: string
  readonly commune: string
  readonly codeInsee: string | null
}

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
  readonly userId: UtilisateurId
}) => Promise<{ readonly employeuse: EmployeuseLue } | null>

export type LieuDecrit = {
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
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
  readonly structureId: number
}

export type RattacherAuLieuDecrit = (input: {
  readonly userId: UtilisateurId
  readonly lieu: LieuDecrit
  readonly trace: TraceDeLEmployeuse
}) => Promise<void>

export type DetacherDuLieuDecrit = (input: {
  readonly userId: UtilisateurId
  readonly lieu: LieuDecrit
  readonly trace: TraceDeLEmployeuse
}) => Promise<void>

export type LireLAdresseDeLEmployeuse = (
  employeuseId: EmployeuseId,
) => Promise<AdresseAGeocoder | null>

export type Geocodage =
  | { readonly _tag: 'AdresseReconnue'; readonly adresse: AdresseBanData }
  | { readonly _tag: 'AdresseInconnue' }
  | { readonly _tag: 'ServiceIndisponible' }

export type GeocoderLAdresse = (adresse: AdresseAGeocoder) => Promise<Geocodage>

export type AjouterStructureEmployeuseEnLieuPorts = {
  readonly consulterEmployeuseActuelle: ConsulterEmployeuseActuelle
  readonly lireLAdresseDeLEmployeuse: LireLAdresseDeLEmployeuse
  readonly geocoderLAdresse: GeocoderLAdresse
  readonly rattacherAuLieuDecrit: RattacherAuLieuDecrit
  readonly detacherDuLieuDecrit: DetacherDuLieuDecrit
}
