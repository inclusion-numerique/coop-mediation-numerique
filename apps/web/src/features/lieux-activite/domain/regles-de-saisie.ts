import { validateValidRnaDigits } from '@app/web/libraries/rna'
import { validateValidSiretDigits } from '@app/web/libraries/siret'
import { z } from 'zod'
import { nonVide, SEPARATEUR_LISTE, telephoneValide, urlSaisie } from './saisie'

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

/** Longueur du résumé de présentation, telle que la carte du lieu l'affiche. */
export const RESUME_MAX_LENGTH = 280

const PREFIXE_ACCESLIBRE = 'https://acceslibre.beta.gouv.fr/'

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
  .min(1, 'Veuillez renseigner le nom du lieu d’activité')

/**
 * Les deux immatriculations sont volontairement PLUS strictes que le standard :
 * son `isSiret` vaut `length === 14` et son `isRna` accepte des lettres. On leur
 * préfère les prédicats de la coop — clé de Luhn, `W` suivi de neuf chiffres —,
 * qui n'acceptent qu'un sous-ensemble : resserrer ne peut donc pas créer
 * d'effacement silencieux.
 */
export const SiretSaisi = reconnu(
  validateValidSiretDigits,
  'Le SIRET doit être composé de 14 chiffres et respecter sa clé de contrôle',
)

export const RnaSaisi = reconnu(
  validateValidRnaDigits,
  'Le RNA doit être composé d’un W suivi de 9 chiffres',
)

export const SiteWebSaisi = reconnu(
  sontDesUrls,
  'Veuillez renseigner une URL valide, ou plusieurs séparées par « | »',
)

export const FicheAccesLibreSaisie = reconnu(
  (valeur) => estUneUrl(valeur) && valeur.startsWith(PREFIXE_ACCESLIBRE),
  `Veuillez renseigner une URL Acceslibre (${PREFIXE_ACCESLIBRE}...)`,
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
  .email('Veuillez renseigner une adresse email valide')
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
