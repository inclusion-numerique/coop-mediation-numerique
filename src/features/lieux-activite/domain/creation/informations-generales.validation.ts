import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import {
  ComplementAdresseSaisi,
  NomDuLieuSaisi,
} from '@app/web/features/lieux-activite/domain/regles-de-saisie'
import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import z from 'zod'

export const IdentiteLieuShape = {
  nom: NomDuLieuSaisi,
  adresseBan: AdresseBanValidation,
  lieuItinerant: z.boolean().nullish(),
  complementAdresse: ComplementAdresseSaisi,
  typologies: z
    .array(z.enum(Typologie))
    .min(1, 'Sélectionnez au moins une typologie de structure'),
}
