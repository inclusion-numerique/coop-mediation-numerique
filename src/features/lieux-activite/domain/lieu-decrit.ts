import type {
  CodeInsee,
  CodePostal,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Siret } from '@/libraries/insee'
import type { LieuAMaterialiser } from './lieu-identite'

type Localite = {
  readonly commune: string
  readonly codePostal: CodePostal
  readonly codeInsee: CodeInsee
}

export type AdresseGeocodeeDuLieu = Localite & {
  readonly _tag: 'AdresseGeocodee'
  readonly voie: string
  readonly banId: string
  readonly latitude: number
  readonly longitude: number
}

export type AdresseDeclareeDuLieu = Localite & {
  readonly _tag: 'AdresseDeclaree'
  readonly voie: string | null
}

type Description<Adresse> = {
  readonly nom: string
  readonly adresse: Adresse
  readonly siret: Siret | null
  readonly synchronisationSiret: Date | null
  readonly rna: string | null
  readonly nomReferent: string | null
  readonly courrielReferent: string | null
  readonly telephoneReferent: string | null
}

export type LieuDecrit = Description<
  AdresseGeocodeeDuLieu | AdresseDeclareeDuLieu
>

export type LieuDecritGeocode = Description<AdresseGeocodeeDuLieu>

export const lieuAMaterialiserDuLieuDecrit = ({
  nom,
  adresse,
}: LieuDecrit): LieuAMaterialiser => ({
  nom,
  adresse: adresse.voie,
  commune: adresse.commune,
  codePostal: adresse.codePostal,
  codeInsee: adresse.codeInsee,
  ...(adresse._tag === 'AdresseGeocodee'
    ? { latitude: adresse.latitude, longitude: adresse.longitude }
    : {}),
})
