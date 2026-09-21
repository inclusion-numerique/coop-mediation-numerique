import {
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
  horairesSaisis,
  nonVide,
  SEPARATEUR_LISTE,
  telephoneValide,
  urlSaisie,
} from './saisie'

/**
 * Ce qu'une saisie de lieu doit respecter, quelle que soit la porte d'entrée.
 *
 * Créer un lieu et corriger sa fiche décrivent les mêmes choses : deux jeux de
 * règles pour un seul objet finissent par diverger, et l'écart se voit en base
 * — un numéro de téléphone qui se range sous deux formes selon l'écran par
 * lequel on est passé, une liste de sites web qu'un formulaire accepte et que
 * l'autre refuse.
 *
 * Ces règles sont le pendant des primitives de `saisie.ts`, qui traduisent la
 * saisie en modèles du standard : ce que celles-ci écarteraient en silence,
 * celles-ci le refusent en le disant.
 */

/**
 * Longueurs de présentation, telles que le standard les fixe. Réexportées parce
 * que les formulaires les affichent en compteur de caractères.
 */
export const RESUME_MAX_LENGTH = RESUME_LONGUEUR_MAXIMALE

export const DETAIL_MAX_LENGTH = DETAIL_LONGUEUR_MAXIMALE

export const texteFacultatif = z.string().trim().nullish()

/**
 * Un champ facultatif qui, dès qu'il porte quelque chose, doit être reconnu.
 *
 * Le prédicat est emprunté au mapper — `urlSaisie`, `telephoneValide` — plutôt
 * que réécrit : deux lectures d'une même valeur finissent par diverger, et
 * l'écart se paie en saisies effacées sans un mot. L'enregistrement réussit, le
 * champ revient vide, et rien n'a été dit.
 */
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

/** Le schéma national joint plusieurs sites web par « | » : chacun doit valoir. */
const sontDesUrls = (valeur: string): boolean =>
  valeur.split(SEPARATEUR_LISTE).every(estUneUrl)

export const NomDuLieuSaisi = z
  .string()
  .trim()
  .refine((valeur) => Nom.safe(valeur) != null, {
    message: 'Veuillez renseigner le nom du lieu d’activité',
  })

/**
 * L'immatriculation se mesure au modèle du standard, qui porte déjà la règle de
 * la coop — quatorze chiffres, clé de Luhn, dérogation au SIREN de La Poste.
 */
export const SiretSaisi = reconnu(
  (valeur) => Siret.safe(valeur) != null,
  'Le SIRET doit être composé de 14 chiffres et respecter sa clé de contrôle',
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

/**
 * Le numéro se tape comme on veut — `01 02 03 04 05`, `+33 1 02 03 04 05`,
 * `0033102030405` — pourvu qu'on sache le reconnaître ; c'est la normalisation,
 * et non la saisie, qui porte la forme canonique. Seule contrainte de fond : le
 * schéma national n'admet que les indicatifs français et d'outre-mer, un lieu
 * paraissant sur la cartographie nationale.
 */
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

/**
 * Le détail n'avait aucune borne à la saisie, alors que `Presentation` en pose
 * une. Au-delà, le constructeur rendait `null` et la présentation entière
 * tombait — résumé compris — sans que rien ne soit dit.
 */
export const PresentationDetailSaisi = z
  .string()
  .trim()
  .max(
    DETAIL_MAX_LENGTH,
    `Cette description doit faire au plus ${DETAIL_MAX_LENGTH} caractères`,
  )
  .nullish()

/**
 * Une case à cocher isolée, telle que le composant la rend : `true` cochée,
 * `null` décochée — jamais `false`. Tout champ booléen alimenté par
 * `field.Checkbox` passe par ici.
 *
 * La règle vit au niveau de la feature parce que les deux formulaires partagent
 * ces champs, et que l'écart s'est déjà payé deux fois : la création acceptait
 * `null`, la modification exigeait un booléen, et l'utilisateur se voyait
 * répondre « Expected boolean, received null » en décochant — d'abord sur
 * « tout public », puis sur « Téléphoner » et « Contacter par mail ».
 */
export const CaseCochee = z.boolean().nullish()

/**
 * Un commentaire d'horaires ne vaut qu'adossé à un créneau.
 *
 * Seul, il ne peut pas former une valeur OpenStreetMap : la composition rendait
 * ` "Sur rendez-vous"`, que le standard refuse, et la coop le publiait. Le dire
 * vaut mieux que de laisser tomber le commentaire, et mieux encore que
 * d'affirmer par un `Mo-Su off` une fermeture que personne n'a déclarée.
 *
 * Le prédicat est emprunté au mapper, comme les autres : c'est `horairesSaisis`
 * qui décide, et la saisie ne fait que le redire à l'utilisateur.
 */
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
