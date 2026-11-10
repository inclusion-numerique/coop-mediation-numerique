import {
  AdresseMailSaisie,
  NumeroTelephoneSaisi,
} from '@app/web/features/lieux-activite/domain/regles-de-saisie'
import { Frais } from '@gouvfr-anct/lieux-de-mediation-numerique'
import z from 'zod'

export const ModalitesAccesAuServiceShape = {
  modalitesAcces: z
    .object({
      surPlace: z.boolean().nullish(),
      parTelephone: z.boolean().nullish(),
      numeroTelephone: NumeroTelephoneSaisi,
      parMail: z.boolean().nullish(),
      adresseMail: AdresseMailSaisie,
    })
    .nullish()
    .superRefine((data, refinementContext) => {
      if (data?.parMail && !data.adresseMail) {
        refinementContext.addIssue({
          code: 'custom',
          message: "L'adresse email est obligatoire.",
          path: ['adresseMail'],
        })
      }
      if (data?.parTelephone && !data.numeroTelephone) {
        refinementContext.addIssue({
          code: 'custom',
          message: 'Le numéro de téléphone est obligatoire.',
          path: ['numeroTelephone'],
        })
      }
    }),
  fraisACharge: z.array(z.enum(Frais)).nullish(),
}
