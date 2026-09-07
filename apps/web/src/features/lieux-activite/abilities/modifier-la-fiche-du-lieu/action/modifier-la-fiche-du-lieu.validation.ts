import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import { FormationLabelPropose } from '@app/web/features/lieux-activite/domain/nomenclatures'
import {
  AdresseMailSaisie,
  FicheAccesLibreSaisie,
  NomDuLieuSaisi,
  NumeroTelephoneSaisi,
  PresentationResumeSaisie,
  PriseRdvSaisie,
  RnaSaisi,
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

/**
 * La saisie, telle que le formulaire l'envoie.
 *
 * Le vocabulaire y circule sous les valeurs du schéma national, celles-là mêmes
 * que le domaine manipule : le mapper n'a plus rien à traduire, et la seule
 * table de correspondance qui subsiste est celle du transfer, vers les noms
 * sous lesquels la base les stocke.
 *
 * Les règles de chaque champ vivent au niveau de la feature, dans
 * `domain/regles-de-saisie` : la création décrit le même lieu, et deux jeux de
 * règles pour un seul objet finissent par diverger.
 */

export const InformationsGeneralesSaisie = z.object({
  section: z.literal('InformationsGenerales'),
  nom: NomDuLieuSaisi,
  adresseBan: AdresseBanValidation,
  complementAdresse: texteFacultatif,
  lieuItinerant: z.boolean().nullish(),
  typologies: z
    .array(z.nativeEnum(Typologie))
    .min(1, 'Sélectionnez au moins une typologie de structure'),
  siret: SiretSaisi,
  rna: RnaSaisi,
  nomUsage: texteFacultatif,
})

export const VisibiliteCartographieSaisie = z.object({
  section: z.literal('VisibiliteCartographie'),
  visiblePourCartographieNationale: z.boolean(),
})

export const InformationsPratiquesSaisie = z.object({
  section: z.literal('InformationsPratiques'),
  siteWeb: SiteWebSaisi,
  ficheAccesLibre: FicheAccesLibreSaisie,
  priseRdv: PriseRdvSaisie,
  /**
   * Les horaires se saisissent en grille hebdomadaire et se stockent en une
   * chaîne au format OpenStreetMap : la composition a lieu à la frontière, dans
   * le mapper, pour que le domaine n'ait affaire qu'à la chaîne du standard.
   */
  openingHours: HorairesValidation,
  horairesComment: texteFacultatif,
})

export const DescriptionSaisie = z.object({
  section: z.literal('Description'),
  presentationResume: PresentationResumeSaisie,
  presentationDetail: texteFacultatif,
  formationsLabels: z.array(z.nativeEnum(FormationLabelPropose)),
})

export const ServicesEtAccompagnementSaisie = z.object({
  section: z.literal('ServicesEtAccompagnement'),
  services: z.array(z.nativeEnum(Service)),
  modalitesAccompagnement: z.array(z.nativeEnum(ModaliteAccompagnement)),
})

/**
 * Les modalités d'accès se saisissent en cases à cocher, chacune apportant son
 * moyen de contact. Les deux règles « cochée sans son moyen » restent ici : la
 * saisie peut être incohérente, le domaine non.
 */
export const ModalitesAccesAuServiceSaisie = z.object({
  section: z.literal('ModalitesAccesAuService'),
  surPlace: z.boolean(),
  parTelephone: z.boolean(),
  numeroTelephone: NumeroTelephoneSaisi,
  parMail: z.boolean(),
  adresseMail: AdresseMailSaisie,
  fraisACharge: z.array(z.nativeEnum(Frais)),
})

export const TypesDePublicsAccueillisSaisie = z.object({
  section: z.literal('TypesDePublicsAccueillis'),
  toutPublic: z.boolean(),
  publicsSpecifiquementAdresses: z.array(
    z.nativeEnum(PublicSpecifiquementAdresse),
  ),
  priseEnChargeSpecifique: z.array(z.nativeEnum(PriseEnChargeSpecifique)),
})

export const ModifierLaFicheDuLieuValidation = z.object({
  id: z.string().uuid(),
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
          code: z.ZodIssueCode.custom,
          message: 'Le numéro de téléphone est obligatoire.',
          path: ['numeroTelephone'],
        })

      if (saisie.parMail && !saisie.adresseMail)
        contexte.addIssue({
          code: z.ZodIssueCode.custom,
          message: "L'adresse email est obligatoire.",
          path: ['adresseMail'],
        })
    }),
})

export type ModifierLaFicheDuLieuSaisie = z.infer<
  typeof ModifierLaFicheDuLieuValidation
>

export type SaisieDeSection = ModifierLaFicheDuLieuSaisie['modification']
