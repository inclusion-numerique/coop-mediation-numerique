import {
  libelleSansIdentite,
  nomsCorrespondent,
  normaliserAdresse,
  normaliserNom,
} from '@app/web/libraries/nom-etablissement'

/**
 * Reconnaissance d'un lieu : à quelles conditions deux fiches désignent le même
 * ENDROIT.
 *
 * Le calcul est pur et vit ici, hors de toute base : c'est une règle métier, pas
 * une requête. Les deux sondes du produit (l'inscription, les imports) lui
 * fournissent leurs candidats et lui demandent de trancher — elles décident
 * seules du ratissage SQL qui les précède.
 *
 * Ce qui désigne un endroit : la commune, la dénomination, l'adresse. Le SIRET
 * n'y figure pas — il identifie une entité juridique, pas un endroit (le siège
 * parisien d'une association est légitimement déclaré pour son antenne de
 * Nantes, et deux structures partagent l'adresse d'un tiers-lieu).
 */

/**
 * Un lieu qu'on s'apprête à matérialiser, réduit aux signaux qui désignent un
 * établissement — de quoi reconnaître celui que la coop connaît peut-être déjà.
 */
export type LieuAMaterialiser = {
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee?: string | null
  readonly latitude?: number | null
  readonly longitude?: number | null
}

/**
 * Même commune ? Le code INSEE tranche quand les deux en portent un. Restent
 * deux cas où il ne suffit pas :
 *
 * - le candidat n'en porte pas — la colonne est facultative — et son code postal
 *   concorde ;
 * - les deux en portent un mais différent, alors que c'est bien la même commune :
 *   Paris, Lyon et Marseille sont désignées tantôt par leur code de commune
 *   (75056), tantôt par celui de l'arrondissement (75118). Le libellé de commune
 *   les réunit là où les codes les séparent.
 *
 * Deux villages partageant un code postal restent, eux, deux communes : leurs
 * libellés diffèrent, et une « Mairie » de l'un ne se confond pas avec celle de
 * l'autre.
 */
const dansLaMemeCommune = (
  candidat: LieuCandidat,
  lieu: LieuAMaterialiser,
): boolean =>
  (lieu.codeInsee != null && candidat.codeInsee === lieu.codeInsee) ||
  (candidat.codeInsee === null && candidat.codePostal === lieu.codePostal) ||
  (candidat.codePostal === lieu.codePostal &&
    !libelleSansIdentite(lieu.commune) &&
    normaliserAdresse(candidat.commune) === normaliserAdresse(lieu.commune))

const memeAdresse = (une: string, autre: string) =>
  normaliserAdresse(une) === normaliserAdresse(autre)

/**
 * Distance à vol d'oiseau, en mètres (formule de haversine).
 */
const distanceEnMetres = (
  candidat: LieuCandidat,
  lieu: LieuAMaterialiser,
): number => {
  if (
    candidat.latitude == null ||
    candidat.longitude == null ||
    lieu.latitude == null ||
    lieu.longitude == null
  )
    return Number.POSITIVE_INFINITY

  const rayonTerrestre = 6_371_000
  const enRadians = Math.PI / 180
  const deltaLatitude = (lieu.latitude - candidat.latitude) * enRadians
  const deltaLongitude = (lieu.longitude - candidat.longitude) * enRadians
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(candidat.latitude * enRadians) *
      Math.cos(lieu.latitude * enRadians) *
      Math.sin(deltaLongitude / 2) ** 2

  return 2 * rayonTerrestre * Math.asin(Math.sqrt(haversine))
}

/**
 * Deux points plus proches que cela, dans la même commune et sous des
 * dénominations qui correspondent, sont le même endroit : c'est la largeur
 * d'une parcelle, pas celle d'un quartier. Mesuré sur la base : à ce seuil, les
 * rapprochements gagnés sont des doublons manifestes.
 */
const memeEmplacementEnMetres = 50

/**
 * L'adresse départage deux homonymes d'une même commune — encore faut-il
 * qu'elle soit renseignée des deux côtés. Trois cas :
 *
 * - les deux sont renseignées : elles doivent concorder ;
 * - les deux manquent (`main` sans adresse, « [Non diffusible] », payload carto
 *   incomplet) : l'adresse ne distingue rien, on s'en remet au nom dans la
 *   commune — sans quoi chaque déclaration créerait une ligne de plus ;
 * - une seule manque : rien à comparer, et l'absence n'est pas une concordance.
 */
const adressesConcordantes = (
  candidat: LieuCandidat,
  lieu: LieuAMaterialiser,
): boolean => {
  const candidatSansAdresse = libelleSansIdentite(candidat.adresse)
  const lieuSansAdresse = libelleSansIdentite(lieu.adresse)

  if (candidatSansAdresse && lieuSansAdresse) return true
  if (candidatSansAdresse || lieuSansAdresse) return false
  if (memeAdresse(candidat.adresse, lieu.adresse)) return true

  // Deux libellés d'une même adresse ne se ressemblent pas toujours : « PL DU
  // HUIT MAI 1945 » et « Place du 8 Mai 1945 », un complément en préfixe, un
  // numéro de voie que la BAN ne connaît pas. Les coordonnées, elles, tombent
  // au même endroit — et 99 % des lieux en portent.
  return distanceEnMetres(candidat, lieu) <= memeEmplacementEnMetres
}

export type LieuCandidat = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly latitude: number | null
  readonly longitude: number | null
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
  readonly suppression: Date | null
}

/**
 * Le candidat désigne-t-il le même lieu ?
 *
 * Un lieu est un ENDROIT, et se reconnaît comme tel : la même commune, une
 * dénomination qui correspond, une adresse qui concorde — au libellé près, ou
 * à quelques dizaines de mètres près.
 *
 * Le SIRET n'entre pas dans ce jugement, dans aucune des deux directions. Il
 * identifie un établissement JURIDIQUE, ce qui n'est pas la même chose qu'un
 * lieu : une association dont le siège est à Paris déclare légitimement ce
 * SIRET pour son antenne de Nantes, et deux structures distinctes partagent
 * l'adresse d'un même tiers-lieu. L'égalité de SIRET n'est donc ni nécessaire
 * ni suffisante — et sa divergence ne prouve pas davantage deux endroits
 * différents. Cela vaut quelle que soit la provenance de la valeur : le SIRET
 * de l'API entreprise est exact, il ne dit simplement pas où l'on se trouve.
 */
const designeLeMemeLieu = (
  candidat: LieuCandidat,
  lieu: LieuAMaterialiser,
): boolean => {
  if (!dansLaMemeCommune(candidat, lieu)) return false

  return (
    nomsCorrespondent(candidat.nom, lieu.nom) &&
    adressesConcordantes(candidat, lieu)
  )
}

/**
 * Corrélation forte : deux identités qui ne se confondent pas par hasard — la
 * même dénomination (et non un simple nom contenu dans l'autre) au même
 * endroit. Une corrélation faible suffit à rattacher un lieu actif sans risque,
 * mais pas à relever un lieu supprimé : le seuil pour défaire une suppression
 * doit être plus haut.
 *
 * Le SIRET en est exclu comme il l'est de l'identité : il ne doit pas pouvoir
 * défaire un acte de modération.
 */
const correlationForte = (
  candidat: LieuCandidat,
  lieu: LieuAMaterialiser,
): boolean => normaliserNom(candidat.nom) === normaliserNom(lieu.nom)

export type Correle = {
  readonly id: string
  readonly suppression: Date | null
  readonly forte: boolean
}

/**
 * Départage les candidats corrélés : un lieu actif d'abord — un lieu supprimé
 * l'a été volontairement —, et à ce niveau celui dont l'adresse correspond
 * aussi. À défaut, le plus ancien (les candidats arrivent triés).
 */
const meilleurCandidat = (
  candidats: readonly LieuCandidat[],
  adresse: string,
): LieuCandidat | null =>
  candidats.find(
    (candidat) =>
      candidat.suppression === null && memeAdresse(candidat.adresse, adresse),
  ) ??
  candidats.find((candidat) => candidat.suppression === null) ??
  candidats.find((candidat) => memeAdresse(candidat.adresse, adresse)) ??
  candidats.at(0) ??
  null

/**
 * Le lieu de la coop qui désigne le même endroit, s'il en est un.
 *
 * Seule entrée publique : les candidats arrivent déjà ratissés (même commune ou
 * même code postal) et TRIÉS — l'ordre porte l'ancienneté, dont dépend le
 * départage.
 */
export const correler = (
  candidats: readonly LieuCandidat[],
  lieu: LieuAMaterialiser,
): Correle | null => {
  const correles = candidats.filter((candidat) =>
    designeLeMemeLieu(candidat, lieu),
  )

  const candidat = meilleurCandidat(correles, lieu.adresse)

  if (!candidat) return null

  return {
    id: candidat.id,
    suppression: candidat.suppression,
    forte: correlationForte(candidat, lieu),
  }
}
