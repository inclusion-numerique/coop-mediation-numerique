import { failure, type Result, success } from '@app/web/libraries/result'
import {
  AdresseNonValidee,
  type AdresseValidee,
  type LieuActiviteInput,
} from '../domain'
import type { RenseignerLieuxActiviteData } from './renseigner-lieux-activite.validation'

type LieuSoumis = RenseignerLieuxActiviteData['lieuxActivite'][number]

const identite = ({
  nom,
  siret,
  structureCartographieNationaleId,
}: LieuSoumis) => ({ nom, siret, structureCartographieNationaleId })

/** L'adresse soumise, si la Base Adresse Nationale l'a reconnue. */
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
 * Les lieux soumis deviennent des lieux désirés.
 *
 * C'est ici que se tient la règle : un lieu que la coop connaît déjà se
 * rattache tel quel ; tout autre sera CRÉÉ, et l'on n'admet plus de créer un
 * lieu dont l'adresse n'a pas été validée par la Base Adresse Nationale. Le
 * formulaire géocode avant d'ajouter ; cette garde est le filet.
 */
export const depuisLaSaisie = (
  lieux: RenseignerLieuxActiviteData['lieuxActivite'],
): Result<readonly LieuActiviteInput[], AdresseNonValidee> =>
  lieux.reduce<Result<readonly LieuActiviteInput[], AdresseNonValidee>>(
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
