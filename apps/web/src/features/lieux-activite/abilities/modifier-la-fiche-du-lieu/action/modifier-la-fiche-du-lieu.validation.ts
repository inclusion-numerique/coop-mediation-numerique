import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import { FormationLabelPropose } from '@app/web/features/lieux-activite/domain/nomenclatures'
import {
  nonVide,
  SEPARATEUR_LISTE,
  telephoneValide,
  urlSaisie,
} from '@app/web/features/lieux-activite/domain/saisie'
import { validateValidRnaDigits } from '@app/web/libraries/rna'
import { validateValidSiretDigits } from '@app/web/libraries/siret'
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

/**
 * Un champ facultatif qui, dès qu'il porte quelque chose, doit être reconnu.
 *
 * La règle est toujours la même : refuser ici exactement ce que le mapper
 * écarterait plus loin. Le prédicat lui est donc emprunté — `urlSaisie`,
 * `telephoneValide` — plutôt que réécrit, car deux lectures d'une même valeur
 * finissent par diverger, et l'écart se paie en saisies effacées sans un mot :
 * l'enregistrement réussit, le champ revient vide, et rien n'a été dit.
 *
 * Les deux immatriculations font exception et sont volontairement PLUS strictes
 * que le mapper : `isSiret` du standard vaut `length === 14` et son `isRna`
 * accepte des lettres. On leur préfère les prédicats de la coop — clé de Luhn,
 * `W` suivi de neuf chiffres —, qui n'acceptent qu'un sous-ensemble : resserrer
 * ne peut donc pas créer d'effacement silencieux.
 */
const reconnu = (estReconnue: (valeur: string) => boolean, message: string) =>
  texteFacultatif.refine(
    (valeur) => {
      const saisi = nonVide(valeur)

      return saisi == null || estReconnue(saisi)
    },
    { message },
  )

const PREFIXE_ACCESLIBRE = 'https://acceslibre.beta.gouv.fr/'

const estUneUrl = (valeur: string): boolean => urlSaisie(valeur) != null

/** Le schéma national joint plusieurs sites web par « | » : chacun doit valoir. */
const sontDesUrls = (valeur: string): boolean =>
  valeur.split(SEPARATEUR_LISTE).every(estUneUrl)

export const InformationsGeneralesSaisie = z.object({
  section: z.literal('InformationsGenerales'),
  nom: z.string().trim().min(1, 'Veuillez renseigner le nom du lieu'),
  adresseBan: AdresseBanValidation,
  complementAdresse: texteFacultatif,
  lieuItinerant: z.boolean().nullish(),
  typologies: z
    .array(z.nativeEnum(Typologie))
    .min(1, 'Sélectionnez au moins une typologie de structure'),
  siret: reconnu(
    validateValidSiretDigits,
    'Le SIRET doit être composé de 14 chiffres et respecter sa clé de contrôle',
  ),
  rna: reconnu(
    validateValidRnaDigits,
    'Le RNA doit être composé d’un W suivi de 9 chiffres',
  ),
  nomUsage: texteFacultatif,
})

export const VisibiliteCartographieSaisie = z.object({
  section: z.literal('VisibiliteCartographie'),
  visiblePourCartographieNationale: z.boolean(),
})

export const InformationsPratiquesSaisie = z.object({
  section: z.literal('InformationsPratiques'),
  siteWeb: reconnu(
    sontDesUrls,
    'Veuillez renseigner une URL valide, ou plusieurs séparées par « | »',
  ),
  ficheAccesLibre: reconnu(
    (valeur) => estUneUrl(valeur) && valeur.startsWith(PREFIXE_ACCESLIBRE),
    `Veuillez renseigner une URL Acceslibre (${PREFIXE_ACCESLIBRE}...)`,
  ),
  priseRdv: reconnu(
    estUneUrl,
    'Veuillez renseigner une URL de prise de rendez-vous valide',
  ),
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
  /**
   * Le numéro se tape comme on veut — `01 02 03 04 05`, `+33 1 02 03 04 05`,
   * `0033102030405` — pourvu qu'on sache le reconnaître ; c'est la
   * normalisation, et non la saisie, qui porte la forme canonique. Seule
   * contrainte de fond : le schéma national n'admet que les indicatifs français
   * et d'outre-mer, un lieu paraissant sur la cartographie nationale.
   */
  numeroTelephone: reconnu(
    (valeur) => telephoneValide(valeur) != null,
    'Veuillez renseigner un numéro de téléphone français ou d’outre-mer',
  ),
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
