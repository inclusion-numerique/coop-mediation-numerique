import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { IdentifiantCartographie } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { BanId } from '../../../domain/identifiants/ban-id'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import {
  adresseSaisie,
  localisationSaisie,
} from '../../../domain/saisie/saisie'
import type { AdresseValidee, LieuSoumis } from '../domain'
import type { LieuxAAjouterData } from './ajouter-des-lieux-activite.validation'

type LieuDuPanier = LieuxAAjouterData['lieux'][number]

const identite = ({
  nom,
  siret,
  structureCartographieNationaleId,
}: LieuDuPanier) => ({
  nom: Nom(nom),
  ...(siret === undefined ? {} : { siret }),
  structureCartographieNationaleId:
    structureCartographieNationaleId == null
      ? null
      : IdentifiantCartographie.safe(structureCartographieNationaleId),
})

export type SaisieDeLAdresse = {
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee?: string | null | undefined
  readonly banId?: string | null | undefined
  readonly latitude?: number | null | undefined
  readonly longitude?: number | null | undefined
}

const ban = (lieu: SaisieDeLAdresse) =>
  lieu.codeInsee == null || lieu.latitude == null || lieu.longitude == null
    ? null
    : {
        nom: lieu.adresse,
        commune: lieu.commune,
        codePostal: lieu.codePostal,
        codeInsee: lieu.codeInsee,
        latitude: lieu.latitude,
        longitude: lieu.longitude,
      }

export const adresseSoumise = (lieu: SaisieDeLAdresse) => {
  const saisie = ban(lieu)

  return {
    adresse: saisie === null ? null : adresseSaisie(saisie, null),
    localisation: saisie === null ? null : localisationSaisie(saisie),
    banId: lieu.banId == null ? null : BanId.safe(lieu.banId),
  }
}

export const adresseValidee = (
  lieu: SaisieDeLAdresse,
): AdresseValidee | null => {
  const { adresse, localisation, banId } = adresseSoumise(lieu)

  return adresse === null || localisation === null || banId === null
    ? null
    : { adresse, localisation, banId }
}

export const depuisLePanier = (
  lieux: LieuxAAjouterData['lieux'],
): readonly LieuSoumis[] =>
  lieux.map((lieu) =>
    lieu.id == null
      ? { ...identite(lieu), ...adresseSoumise(lieu) }
      : { ...identite(lieu), id: LieuId(lieu.id) },
  )
