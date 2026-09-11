import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { getAdresseBanLabel } from '@app/web/external-apis/ban/adresseBanLabel'
import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import type { StructureSearchResult } from '@app/web/features/employeuse'
import {
  Itinerance,
  isSiret,
  type Pivot,
  type Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../../domain/fiche'
import type { Lieu } from '../../../../domain/lieu'

export type InformationsGeneralesAffichees = {
  readonly nom: string
  readonly adresse: string | null
  readonly commune: string | null
  readonly codePostal: string | null
  readonly codeInsee: string | null
  readonly complementAdresse: string | null
  readonly latitude: number | null
  readonly longitude: number | null
  readonly banId: string | null
  readonly adresseBan: AdresseBanData
  readonly siretSearch: StructureSearchResult | null
  readonly lieuItinerant: boolean | null
  readonly typologies: readonly Typologie[]
  readonly siret: string | null
  readonly rna: string | null
  readonly nomUsage: string | null
}

const itinerant = (itinerance: Fiche['itinerance']): boolean | null =>
  itinerance.length === 0 ? null : itinerance.includes(Itinerance.Itinerant)

const siretDuPivot = (pivot: Pivot | null): string | null =>
  pivot != null && isSiret(pivot) ? pivot : null

const rnaDuPivot = (pivot: Pivot | null): string | null =>
  pivot != null && !isSiret(pivot) ? pivot : null

const adresseBanDepuis = (fiche: Fiche): AdresseBanData => {
  const adresse = banDefaultValueToAdresseBanData({
    codeInsee: fiche.adresse?.code_insee,
    codePostal: fiche.adresse?.code_postal ?? '',
    commune: fiche.adresse?.commune ?? '',
    nom: fiche.adresse?.voie ?? '',
    latitude: fiche.localisation?.latitude,
    longitude: fiche.localisation?.longitude,
  })

  return { ...adresse, label: getAdresseBanLabel(adresse) }
}

const rechercheSiret = (fiche: Fiche): StructureSearchResult | null =>
  fiche.pivot != null && isSiret(fiche.pivot)
    ? {
        siret: fiche.pivot,
        nom: fiche.nom,
        adresse: fiche.adresse?.voie ?? '',
        commune: fiche.adresse?.commune ?? '',
        codePostal: fiche.adresse?.code_postal ?? '',
        codeInsee: fiche.adresse?.code_insee ?? '',
        source: 'database',
      }
    : null

export const informationsGenerales = ({
  fiche,
  banId,
  identiteSirene,
}: Lieu): InformationsGeneralesAffichees => ({
  nom: fiche.nom,
  adresse: fiche.adresse?.voie ?? null,
  commune: fiche.adresse?.commune ?? null,
  codePostal: fiche.adresse?.code_postal ?? null,
  codeInsee: fiche.adresse?.code_insee ?? null,
  complementAdresse: fiche.adresse?.complement_adresse ?? null,
  latitude: fiche.localisation?.latitude ?? null,
  longitude: fiche.localisation?.longitude ?? null,
  banId,
  adresseBan: adresseBanDepuis(fiche),
  siretSearch: rechercheSiret(fiche),
  lieuItinerant: itinerant(fiche.itinerance),
  typologies: fiche.typologies,
  siret: siretDuPivot(fiche.pivot),
  rna: rnaDuPivot(fiche.pivot),
  nomUsage: identiteSirene.nomUsage,
})
