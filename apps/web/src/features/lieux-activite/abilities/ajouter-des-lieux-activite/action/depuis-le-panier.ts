import { failure, type Result, success } from '@app/web/libraries/result'
import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { BanId } from '../../../domain/ban-id'
import { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import { LieuId } from '../../../domain/lieu-id'
import { adresseSaisie, localisationSaisie } from '../../../domain/saisie'
import {
  AdresseNonValidee,
  type AdresseValidee,
  type LieuDemande,
} from '../domain'
import type { LieuxAAjouterData } from './ajouter-des-lieux-activite.validation'

type LieuSoumis = LieuxAAjouterData['lieux'][number]

const identite = ({
  nom,
  siret,
  structureCartographieNationaleId,
}: LieuSoumis) => ({
  nom: Nom(nom),
  siret,
  structureCartographieNationaleId:
    structureCartographieNationaleId == null
      ? null
      : IdentifiantCartographie.safe(structureCartographieNationaleId),
})

/**
 * L'adresse soumise, si la Base Adresse Nationale l'a reconnue.
 *
 * Les champs voyagent facultatifs — un lieu déjà connu de la coop n'a pas à les
 * porter — mais ils ne valent qu'ensemble : c'est leur présence conjointe, et
 * la reconnaissance de chacun par son modèle, qui atteste du géocodage.
 */
const adresseValidee = (lieu: LieuSoumis): AdresseValidee | null => {
  if (lieu.codeInsee == null || lieu.latitude == null || lieu.longitude == null)
    return null

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
  const banId = lieu.banId == null ? null : BanId.safe(lieu.banId)

  return adresse == null || localisation == null || banId == null
    ? null
    : { adresse, localisation, banId }
}

/**
 * Le panier soumis devient une liste de demandes.
 *
 * C'est ici que se tient la règle : un lieu que la coop connaît déjà se
 * rattache tel quel, son adresse ne sera pas réécrite ; tout autre lieu sera
 * CRÉÉ, et l'on n'admet plus de créer un lieu dont l'adresse n'a pas été
 * validée par la Base Adresse Nationale — sans code INSEE, sans identifiant
 * BAN ni coordonnées, rien ne distingue une adresse reconnue d'une adresse
 * saisie à l'estime, et un lieu qu'on ne sait pas situer n'apparaît sur aucune
 * carte.
 *
 * L'écran valide l'adresse avant de mettre le lieu au panier ; cette garde est
 * le filet, pour les paniers qui n'en viendraient pas.
 */
export const depuisLePanier = (
  lieux: LieuxAAjouterData['lieux'],
): Result<readonly LieuDemande[], AdresseNonValidee> =>
  lieux.reduce<Result<readonly LieuDemande[], AdresseNonValidee>>(
    (precedents, lieu) => {
      if (!precedents.success) return precedents

      if (lieu.id != null)
        return success([
          ...precedents.data,
          { ...identite(lieu), id: LieuId(lieu.id) },
        ])

      const validee = adresseValidee(lieu)

      return validee == null
        ? failure(AdresseNonValidee(lieu.nom))
        : success([...precedents.data, { ...identite(lieu), ...validee }])
    },
    success([]),
  )
