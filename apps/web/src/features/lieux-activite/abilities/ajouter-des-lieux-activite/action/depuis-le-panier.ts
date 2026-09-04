import { failure, type Result, success } from '@app/web/libraries/result'
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
}: LieuSoumis) => ({ nom, siret, structureCartographieNationaleId })

/**
 * L'adresse soumise, si la Base Adresse Nationale l'a reconnue.
 *
 * Les quatre champs voyagent facultatifs — un lieu déjà connu de la coop n'a
 * pas à les porter — mais ils ne valent qu'ensemble : c'est leur présence
 * conjointe qui atteste du géocodage.
 */
const adresseValidee = (lieu: LieuSoumis): AdresseValidee | null =>
  lieu.codeInsee == null ||
  lieu.banId == null ||
  lieu.latitude == null ||
  lieu.longitude == null
    ? null
    : {
        adresse: lieu.adresse,
        commune: lieu.commune,
        codePostal: lieu.codePostal,
        codeInsee: lieu.codeInsee,
        banId: lieu.banId,
        latitude: lieu.latitude,
        longitude: lieu.longitude,
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
          {
            ...identite(lieu),
            id: lieu.id,
            adresse: lieu.adresse,
            commune: lieu.commune,
            codePostal: lieu.codePostal,
            codeInsee: lieu.codeInsee,
          },
        ])

      const validee = adresseValidee(lieu)

      return validee == null
        ? failure(AdresseNonValidee(lieu.nom))
        : success([...precedents.data, { ...identite(lieu), ...validee }])
    },
    success([]),
  )
