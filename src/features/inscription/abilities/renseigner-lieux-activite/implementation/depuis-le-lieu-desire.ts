import {
  adresseSaisie,
  BanId,
  IdentifiantCartographie,
  type LieuDemande,
  LieuId,
  localisationSaisie,
} from '@app/web/features/lieux-activite'
import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuActiviteInput } from '../domain'

/**
 * Le lieu désiré par l'inscription, dit dans les termes de `lieux-activite`.
 *
 * L'inscription tient son propre modèle du formulaire ; la matérialisation
 * appartient à l'autre feature et parle ses modèles. La traduction se fait ici,
 * une fois, plutôt que de faire voyager des chaînes jusqu'à l'écriture.
 *
 * Un lieu à créer que la Base Adresse Nationale n'a pas reconnu ne peut pas
 * l'être : `depuisLaSaisie` l'a déjà refusé en amont, et un survivant ne
 * traduirait qu'un invariant rompu.
 */
export const depuisLeLieuDesire = (lieu: LieuActiviteInput): LieuDemande => {
  const identite = {
    nom: Nom(lieu.nom),
    siret: lieu.siret,
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
