import { Typologie } from '@gouvfr-anct/lieux-de-mediation-numerique'
import z from 'zod'
import {
  ComplementAdresseSaisi,
  NomDuLieuSaisi,
} from '@/features/lieux-activite/domain/saisie/regles-de-saisie'
import { AdresseBanValidation } from '@/libraries/adresse/adresse-ban-validation'

export const IdentiteLieuShape = {
  nom: NomDuLieuSaisi,
  adresseBan: AdresseBanValidation,
  lieuItinerant: z.boolean().nullish(),
  complementAdresse: ComplementAdresseSaisi,
  typologies: z
    .array(z.enum(Typologie))
    .min(1, 'Sélectionnez au moins une typologie de structure'),
}
