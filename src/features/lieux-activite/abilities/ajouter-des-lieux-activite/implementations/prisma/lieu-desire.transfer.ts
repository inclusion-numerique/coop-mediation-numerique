import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { IdentifiantCartographie } from '../../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { BanId } from '../../../../domain/identifiants/ban-id'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import {
  adresseSaisie,
  localisationSaisie,
} from '../../../../domain/saisie/saisie'
import type { LieuDemande } from '../../domain'

type Identite = {
  readonly nom: string
  readonly siret?: string | null
  readonly structureCartographieNationaleId?: string | null
}

export type LieuDesire =
  | (Identite & { readonly id: string })
  | (Identite & {
      readonly id?: null
      readonly adresse: string
      readonly commune: string
      readonly codePostal: string
      readonly codeInsee: string
      readonly banId: string
      readonly latitude: number
      readonly longitude: number
    })

export const lieuDemandeDepuisLeLieuDesire = (
  lieu: LieuDesire,
): LieuDemande => {
  const identite = {
    nom: Nom(lieu.nom),
    ...(lieu.siret === undefined ? {} : { siret: lieu.siret }),
    structureCartographieNationaleId:
      lieu.structureCartographieNationaleId == null
        ? null
        : IdentifiantCartographie.safe(lieu.structureCartographieNationaleId),
  }

  if (lieu.id != null) return { ...identite, id: LieuId(lieu.id) }

  const ban = {
    nom: lieu.adresse,
    commune: lieu.commune,
    codePostal: lieu.codePostal,
    codeInsee: lieu.codeInsee,
    latitude: lieu.latitude,
    longitude: lieu.longitude,
  }

  const adresse = adresseSaisie(ban, null)
  const localisation = localisationSaisie(ban)
  const banId = BanId.safe(lieu.banId)

  if (adresse == null || localisation == null || banId == null)
    throw new Error(
      `Le lieu « ${lieu.nom} » n'a pas d'adresse validée : il n'aurait pas dû arriver jusqu'à la création`,
    )

  return { ...identite, adresse, localisation, banId }
}
