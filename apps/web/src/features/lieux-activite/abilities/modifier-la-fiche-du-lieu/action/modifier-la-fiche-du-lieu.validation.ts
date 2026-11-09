import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import { FormationLabelPropose } from '@app/web/features/lieux-activite/domain/nomenclatures'
import {
  AdresseMailSaisie,
  adresseReconnue,
  CaseCochee,
  ComplementAdresseSaisi,
  commentaireAdosseAUnCreneau,
  FicheAccesLibreSaisie,
  NomDuLieuSaisi,
  NumeroTelephoneSaisi,
  PresentationDetailSaisi,
  PresentationResumeSaisie,
  PriseRdvSaisie,
  SiretSaisi,
  SiteWebSaisi,
  texteFacultatif,
} from '@app/web/features/lieux-activite/domain/regles-de-saisie'
import {
  Frais,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { z } from 'zod'
import { HorairesValidation } from '../../../domain/horaires.validation'

export const InformationsGeneralesSaisie = z
  .object({
    section: z.literal('InformationsGenerales'),
    nom: NomDuLieuSaisi,
    adresseBan: AdresseBanValidation,
    complementAdresse: ComplementAdresseSaisi,
    lieuItinerant: z.boolean().nullish(),
    typologies: z
      .array(z.enum(Typologie))
      .min(1, 'Sélectionnez au moins une typologie de structure'),
    siret: SiretSaisi,
    nomUsage: texteFacultatif,
  })
  .refine(...adresseReconnue)

export const VisibiliteCartographieSaisie = z.object({
  section: z.literal('VisibiliteCartographie'),
  visiblePourCartographieNationale: z.boolean(),
})

export const InformationsPratiquesSaisie = z
  .object({
    section: z.literal('InformationsPratiques'),
    siteWeb: SiteWebSaisi,
    ficheAccesLibre: FicheAccesLibreSaisie,
    priseRdv: PriseRdvSaisie,
    openingHours: HorairesValidation,
    horairesComment: texteFacultatif,
  })
  .refine(...commentaireAdosseAUnCreneau)

export const DescriptionSaisie = z.object({
  section: z.literal('Description'),
  presentationResume: PresentationResumeSaisie,
  presentationDetail: PresentationDetailSaisi,
  formationsLabels: z.array(z.enum(FormationLabelPropose)),
})

export const ServicesEtAccompagnementSaisie = z.object({
  section: z.literal('ServicesEtAccompagnement'),
  services: z.array(z.enum(Service)),
  modalitesAccompagnement: z.array(z.enum(ModaliteAccompagnement)),
})

export const ModalitesAccesAuServiceSaisie = z.object({
  section: z.literal('ModalitesAccesAuService'),
  surPlace: CaseCochee,
  parTelephone: CaseCochee,
  numeroTelephone: NumeroTelephoneSaisi,
  parMail: CaseCochee,
  adresseMail: AdresseMailSaisie,
  fraisACharge: z.array(z.enum(Frais)),
})

export const TypesDePublicsAccueillisSaisie = z.object({
  section: z.literal('TypesDePublicsAccueillis'),
  toutPublic: CaseCochee,
  publicsSpecifiquementAdresses: z.array(z.enum(PublicSpecifiquementAdresse)),
  priseEnChargeSpecifique: z.array(z.enum(PriseEnChargeSpecifique)),
})

export const ModalitesAccesAuServiceFormValidation =
  ModalitesAccesAuServiceSaisie.superRefine((saisie, contexte) => {
    if (saisie.parTelephone && !saisie.numeroTelephone)
      contexte.addIssue({
        code: 'custom',
        message: 'Le numéro de téléphone est obligatoire.',
        path: ['numeroTelephone'],
      })

    if (saisie.parMail && !saisie.adresseMail)
      contexte.addIssue({
        code: 'custom',
        message: "L'adresse email est obligatoire.",
        path: ['adresseMail'],
      })
  })

export const ModifierLaFicheDuLieuValidation = z.object({
  id: z.guid(),
  modification: z
    .discriminatedUnion('section', [
      InformationsGeneralesSaisie,
      VisibiliteCartographieSaisie,
      InformationsPratiquesSaisie,
      DescriptionSaisie,
      ServicesEtAccompagnementSaisie,
      ModalitesAccesAuServiceSaisie,
      TypesDePublicsAccueillisSaisie,
    ])
    .superRefine((saisie, contexte) => {
      if (saisie.section !== 'ModalitesAccesAuService') return

      if (saisie.parTelephone && !saisie.numeroTelephone)
        contexte.addIssue({
          code: 'custom',
          message: 'Le numéro de téléphone est obligatoire.',
          path: ['numeroTelephone'],
        })

      if (saisie.parMail && !saisie.adresseMail)
        contexte.addIssue({
          code: 'custom',
          message: "L'adresse email est obligatoire.",
          path: ['adresseMail'],
        })
    }),
})

export type ModifierLaFicheDuLieuSaisie = z.infer<
  typeof ModifierLaFicheDuLieuValidation
>

export type SaisieDeSection = ModifierLaFicheDuLieuSaisie['modification']
