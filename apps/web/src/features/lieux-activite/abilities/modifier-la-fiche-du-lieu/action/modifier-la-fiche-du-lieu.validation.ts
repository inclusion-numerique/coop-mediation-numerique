import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import { formationLabelValues } from '@app/web/features/structures/formationLabel'
import { fraisAChargeValues } from '@app/web/features/structures/fraisACharge'
import { modaliteAccompagnementValues } from '@app/web/features/structures/modaliteAccompagnement'
import { priseEnChargeSpecifiqueValues } from '@app/web/features/structures/priseEnChargeSpecifique'
import { publicSpecifiquementAdresseValues } from '@app/web/features/structures/publicSpecifiquementAdresse'
import { serviceValues } from '@app/web/features/structures/service'
import { typologieStructureValue } from '@app/web/features/structures/typologieStructure'
import { z } from 'zod'
import { HorairesValidation } from './horaires.validation'

/**
 * La saisie, telle que le formulaire l'envoie.
 *
 * Le vocabulaire y circule sous ses noms Prisma — c'est ce que les listes
 * d'options affichent déjà — et le mapper le traduit vers le schéma national à
 * l'entrée du domaine. Une seule table de correspondance existe, celle du
 * transfer ; l'action s'en sert plutôt que d'en tenir une seconde.
 *
 * Les valeurs admises viennent des mêmes listes que les options du formulaire,
 * et non des enums `@prisma/client` : ce fichier est importé par les composants
 * `'use client'` des sections, où un import Prisma au runtime embarquerait le
 * client de base de données dans le bundle du navigateur.
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
    .array(z.enum(typologieStructureValue))
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
  formationsLabels: z.array(z.enum(formationLabelValues)),
})

export const ServicesEtAccompagnementSaisie = z.object({
  section: z.literal('ServicesEtAccompagnement'),
  services: z.array(z.enum(serviceValues)),
  modalitesAccompagnement: z.array(z.enum(modaliteAccompagnementValues)),
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
  fraisACharge: z.array(z.enum(fraisAChargeValues)),
})

export const TypesDePublicsAccueillisSaisie = z.object({
  section: z.literal('TypesDePublicsAccueillis'),
  toutPublic: z.boolean(),
  publicsSpecifiquementAdresses: z.array(
    z.enum(publicSpecifiquementAdresseValues),
  ),
  priseEnChargeSpecifique: z.array(z.enum(priseEnChargeSpecifiqueValues)),
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
