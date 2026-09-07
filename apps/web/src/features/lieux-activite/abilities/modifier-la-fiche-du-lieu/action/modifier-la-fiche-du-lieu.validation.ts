import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import { FormationLabelPropose } from '@app/web/features/lieux-activite/domain/nomenclatures'
import {
  Frais,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { z } from 'zod'
import { HorairesValidation } from './horaires.validation'

/**
 * La saisie, telle que le formulaire l'envoie.
 *
 * Le vocabulaire y circule sous les valeurs du schéma national, celles-là mêmes
 * que le domaine manipule : le mapper n'a plus rien à traduire, et la seule
 * table de correspondance qui subsiste est celle du transfer, vers les noms
 * sous lesquels la base les stocke.
 */
export const resumeMaxLength = 280

const texteFacultatif = z.string().trim().nullish()

export const InformationsGeneralesSaisie = z.object({
  section: z.literal('InformationsGenerales'),
  nom: z.string().trim().min(1, 'Veuillez renseigner le nom du lieu'),
  adresseBan: AdresseBanValidation,
  complementAdresse: texteFacultatif,
  lieuItinerant: z.boolean().nullish(),
  typologies: z
    .array(z.nativeEnum(Typologie))
    .min(1, 'Sélectionnez au moins une typologie de structure'),
  siret: texteFacultatif,
  rna: texteFacultatif,
  nomUsage: texteFacultatif,
})

export const VisibiliteCartographieSaisie = z.object({
  section: z.literal('VisibiliteCartographie'),
  visiblePourCartographieNationale: z.boolean(),
})

export const InformationsPratiquesSaisie = z.object({
  section: z.literal('InformationsPratiques'),
  siteWeb: texteFacultatif,
  ficheAccesLibre: texteFacultatif.refine(
    (valeur) =>
      valeur == null ||
      valeur === '' ||
      valeur.startsWith('https://acceslibre.beta.gouv.fr/'),
    {
      message:
        'Veuillez renseigner une URL Acceslibre (https://acceslibre.beta.gouv.fr/...)',
    },
  ),
  priseRdv: texteFacultatif,
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
  presentationResume: z
    .string()
    .trim()
    .max(
      resumeMaxLength,
      `Cette description doit faire moins de ${resumeMaxLength} caractères`,
    )
    .nullish(),
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
  numeroTelephone: texteFacultatif,
  parMail: z.boolean(),
  adresseMail: z
    .string()
    .trim()
    .email('Veuillez renseigner une adresse email valide')
    .nullish(),
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
