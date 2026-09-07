import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import {
  NomDuLieuSaisi,
  texteFacultatif,
} from '@app/web/features/lieux-activite/domain/regles-de-saisie'
import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import z from 'zod'

/**
 * Identité d'un lieu telle qu'elle se saisit sans immatriculation : de quoi
 * décrire un lieu introuvable dans les annuaires. Un SIRET vient toujours de
 * l'Annuaire des entreprises, et l'on ne crée un lieu que lorsque la recherche
 * n'a rien rendu — il n'y a donc rien à immatriculer ici.
 */
export const IdentiteLieuShape = {
  nom: NomDuLieuSaisi,
  adresseBan: AdresseBanValidation,
  lieuItinerant: z.boolean().nullish(),
  complementAdresse: texteFacultatif,
  typologies: z
    .array(z.nativeEnum(Typologie))
    .min(1, 'Sélectionnez au moins une typologie de structure'),
}
