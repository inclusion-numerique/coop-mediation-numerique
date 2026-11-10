import {
  ComplementAdresse,
  Courriel,
  DETAIL_LONGUEUR_MAXIMALE,
  FicheAccesLibre,
  Nom,
  RESUME_LONGUEUR_MAXIMALE,
  Siret,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Schedule } from '@gouvfr-anct/timetable-to-osm-opening-hours'
import { z } from 'zod'
import {
  type AdresseSaisie,
  adresseSaisie,
  horairesSaisis,
  nonVide,
  SEPARATEUR_LISTE,
  telephoneValide,
  urlSaisie,
} from './saisie'

export const RESUME_MAX_LENGTH = RESUME_LONGUEUR_MAXIMALE

export const DETAIL_MAX_LENGTH = DETAIL_LONGUEUR_MAXIMALE

export const texteFacultatif = z.string().trim().nullish()

export const reconnu = (
  estReconnue: (valeur: string) => boolean,
  message: string,
) =>
  texteFacultatif.refine(
    (valeur) => {
      const saisi = nonVide(valeur)

      return saisi == null || estReconnue(saisi)
    },
    { message },
  )

const estUneUrl = (valeur: string): boolean => urlSaisie(valeur) != null

const sontDesUrls = (valeur: string): boolean =>
  valeur.split(SEPARATEUR_LISTE).every(estUneUrl)

export const NomDuLieuSaisi = z
  .string()
  .trim()
  .refine((valeur) => Nom.safe(valeur) != null, {
    message: 'Veuillez renseigner le nom du lieu d’activité',
  })

export const SiretSaisi = reconnu(
  (valeur) => Siret.safe(valeur) != null,
  'Le SIRET doit être composé de 14 chiffres et respecter sa clé de contrôle',
)

export const ComplementAdresseSaisi = reconnu(
  (valeur) => ComplementAdresse.safe(valeur) != null,
  'Ce complément contient un caractère que le schéma national n’accepte pas : évitez #, %, les guillemets droits (") et un tiret ou une arobase en tête',
)

export const SiteWebSaisi = reconnu(
  sontDesUrls,
  'Veuillez renseigner une URL valide, ou plusieurs séparées par « | »',
)

export const FicheAccesLibreSaisie = reconnu(
  (valeur) => FicheAccesLibre.safe(valeur) != null,
  'Veuillez renseigner une URL Acceslibre (https://acceslibre.beta.gouv.fr/...)',
)

export const PriseRdvSaisie = reconnu(
  estUneUrl,
  'Veuillez renseigner une URL de prise de rendez-vous valide',
)

export const NumeroTelephoneSaisi = reconnu(
  (valeur) => telephoneValide(valeur) != null,
  'Veuillez renseigner un numéro de téléphone français ou d’outre-mer',
)

export const AdresseMailSaisie = z
  .string()
  .trim()
  .refine((valeur) => Courriel.safe(valeur) != null, {
    message: 'Veuillez renseigner une adresse email valide',
  })
  .nullish()

export const PresentationResumeSaisie = z
  .string()
  .trim()
  .max(
    RESUME_MAX_LENGTH,
    `Cette description doit faire au plus ${RESUME_MAX_LENGTH} caractères`,
  )
  .nullish()

export const PresentationDetailSaisi = z
  .string()
  .trim()
  .max(
    DETAIL_MAX_LENGTH,
    `Cette description doit faire au plus ${DETAIL_MAX_LENGTH} caractères`,
  )
  .nullish()

export const CaseCochee = z.boolean().nullish()

export const adresseReconnue: [
  (data: { adresseBan?: AdresseSaisie }) => boolean,
  { message: string; path: (string | number)[] },
] = [
  ({ adresseBan }) =>
    adresseBan == null || adresseSaisie(adresseBan, null) != null,
  {
    message:
      'Cette adresse n’est pas reconnue par le schéma national ; choisissez-en une autre',
    path: ['adresseBan'],
  },
]

export const commentaireAdosseAUnCreneau: [
  (data: {
    openingHours?: Schedule
    horairesComment?: string | null
  }) => boolean,
  { message: string; path: (string | number)[] },
] = [
  ({ openingHours, horairesComment }) =>
    nonVide(horairesComment) == null ||
    (openingHours != null && horairesSaisis(openingHours, null) != null),
  {
    message:
      'Renseignez au moins un créneau pour ajouter un commentaire aux horaires',
    path: ['horairesComment'],
  },
]
