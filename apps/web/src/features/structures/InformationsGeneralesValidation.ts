import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import { validateValidRnaDigits } from '@app/web/libraries/rna'
import { validateValidSiretDigits } from '@app/web/libraries/siret'
import z from 'zod'
import { typologieStructureValue } from './typologieStructure'

/**
 * Identité d'un lieu telle qu'elle se saisit sans immatriculation : de quoi
 * décrire un lieu introuvable dans les annuaires. C'est le socle commun de la
 * création (où le SIRET n'a pas sa place, puisqu'on n'a rien trouvé) et de la
 * modification (qui, elle, peut rattacher une immatriculation).
 */
export const IdentiteLieuShape = {
  nom: z.string().trim().min(1, 'Veuillez renseigner le nom de la structure'),
  adresseBan: AdresseBanValidation,
  lieuItinerant: z.boolean().nullish(),
  complementAdresse: z.string().nullish(),
  typologies: z
    .array(z.enum(typologieStructureValue))
    .min(1, 'Sélectionnez au moins une typologie de structure'),
}

export const InformationsGeneralesShape = {
  ...IdentiteLieuShape,
  siret: z
    .string()
    .nullish()
    .refine(
      (value) =>
        !value ||
        validateValidSiretDigits(value) ||
        validateValidRnaDigits(value),
      {
        message: 'Ceci n’est pas un n°SIRET ou RNA valide',
      },
    ),
  rna: z.string().nullish(),
  nomUsage: z.string().trim().nullish(),
}

export const InformationsGeneralesValidation = z.object({
  id: z.string().uuid(),
  ...InformationsGeneralesShape,
})

export type InformationsGeneralesData = z.infer<
  typeof InformationsGeneralesValidation
>
