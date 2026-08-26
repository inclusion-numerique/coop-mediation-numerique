/**
 * Reconnaissance de deux dénominations désignant le même établissement.
 *
 * Une même structure ne porte pas le même libellé selon la source qui la
 * décrit : la coop garde la saisie de l'utilisateur, la cartographie nationale
 * sa dénomination normalisée, l'annuaire des entreprises la raison sociale.
 * « MAIRIE DU PRÊCHEUR », « Commune du Precheur » et « Ville du Prêcheur »
 * sont le même lieu — les comparer caractère à caractère crée un doublon.
 */

/**
 * Préfixes administratifs interchangeables, ramenés à un jeton canonique :
 * « commune de X », « mairie de X », « ville de X », « hôtel de ville de X »
 * désignent la même entité.
 */
const prefixesEquivalents: readonly (readonly [RegExp, string])[] = [
  [/^commune (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^com (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^mairie (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^ville (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^hotel de ville (?:de(?:s)?|du|de la|de l)\s+/, 'ville '],
  [/^conseil departemental (?:de(?:s)?|du|de la|de l)\s+/, 'departement '],
  [/^departement (?:de(?:s)?|du|de la|de l)\s+/, 'departement '],
  [/^communaute de communes?\s+/, 'cc '],
  [/^communaute d agglomeration\s+/, 'cagglo '],
  [/^communaute com\s+/, 'cc '],
  [/^conseil regional (?:de(?:s)?|du|de la|de l)\s+/, 'region '],
  [/^region\s+/, 'region '],
]

/**
 * Mots-clés désignant un service précis d'une entité plus large. Si l'un des
 * deux noms en porte un et pas l'autre, ce sont deux entités distinctes :
 * « EPN de Fleury » n'est pas « Commune de Fleury », même adresse comprise.
 */
const motsClesDeService: readonly string[] = [
  'epn',
  'mediatheque',
  'bibliotheque',
  'ccas',
  'cias',
  'centre social',
  'maison quartier',
  'maison de quartier',
  'france services',
  'mjc',
  'espace numerique',
  'cyber espace',
  'cyberbase',
  'pole emploi',
  'mission locale',
  'point information',
  'point info',
  'fablab',
]

const sansAccentsNiPonctuation = (nom: string): string =>
  nom
    .toLowerCase()
    .normalize('NFD')
    // Diacritiques combinantes détachées par NFD.
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Libellés qui tiennent la place d'une information absente. L'INSEE rend
 « [Non diffusible] » pour les établissements qui refusent la diffusion de leurs
 * données : nom comme adresse. Ce n'est pas une identité — deux établissements
 * non diffusibles ne sont pas le même, et les rapprocher les fusionnerait tous.
 */
const libellesSansIdentite = [/^non diffusible/, /^non communique/, /^inconnu/]

/**
 * Vrai quand le libellé ne désigne rien : vide, ou marqueur d'absence. Un tel
 * libellé ne peut ni rapprocher deux établissements ni les distinguer.
 */
export const libelleSansIdentite = (libelle: string): boolean => {
  const normalise = sansAccentsNiPonctuation(libelle)

  return (
    normalise === '' ||
    libellesSansIdentite.some((absent) => absent.test(normalise))
  )
}

/**
 * Adresse ramenée à sa forme comparable : casse, accents et ponctuation ne
 * distinguent pas deux libellés de la même voie.
 */
export const normaliserAdresse = (adresse: string): string =>
  sansAccentsNiPonctuation(adresse)

/** Dénomination ramenée à sa forme comparable. */
export const normaliserNom = (nom: string): string =>
  prefixesEquivalents
    .reduce(
      (normalise, [prefixe, canonique]) =>
        normalise.replace(prefixe, canonique),
      sansAccentsNiPonctuation(nom),
    )
    .trim()

const servicesMentionnes = (nom: string): readonly string[] =>
  motsClesDeService.filter((motCle) => nom.includes(motCle))

/**
 * Vrai quand l'un des deux noms mentionne un service que l'autre ignore : la
 * partie et le tout ne sont pas le même établissement.
 */
const servicesDivergents = (un: string, autre: string): boolean => {
  const services = servicesMentionnes(un)
  const autresServices = servicesMentionnes(autre)

  if (services.length === 0 && autresServices.length === 0) return false

  return (
    services.some((service) => !autresServices.includes(service)) ||
    autresServices.some((service) => !services.includes(service))
  )
}

/**
 * Vrai quand les deux dénominations désignent le même établissement : une fois
 * normalisées, elles sont égales ou l'une contient l'autre (« Ville de Boult »
 * et « Boult »), sauf si elles ne mentionnent pas les mêmes services.
 */
export const nomsCorrespondent = (un: string, autre: string): boolean => {
  const normalise = normaliserNom(un)
  const autreNormalise = normaliserNom(autre)

  // Un nom qui ne désigne personne — vide, ou marqueur d'absence — ne peut pas
  // rapprocher : sans cette garde un nom vide serait contenu dans tous les
  // autres, et tous les « [Non diffusible] » ne feraient plus qu'un.
  if (libelleSansIdentite(un) || libelleSansIdentite(autre)) return false

  if (servicesDivergents(normalise, autreNormalise)) return false

  return (
    normalise === autreNormalise ||
    normalise.includes(autreNormalise) ||
    autreNormalise.includes(normalise)
  )
}
