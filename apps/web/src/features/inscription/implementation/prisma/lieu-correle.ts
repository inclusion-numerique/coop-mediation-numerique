import {
  libelleSansIdentite,
  nomsCorrespondent,
  normaliserAdresse,
  normaliserNom,
} from '@app/web/libraries/nom-etablissement'
import type { Prisma } from '@prisma/client'

/**
 * Sonde de corrélation des lieux d'inclusion, partagée par les abilities de
 * l'inscription qui en matérialisent un : le renseignement des lieux d'activité
 * (recherche, cartographie, annuaire, création) et la déclaration de la
 * structure employeuse comme lieu. D'où sa place au niveau feature.
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
  readonly siret?: string | null
  readonly latitude?: number | null
  readonly longitude?: number | null
}

/**
 * Ratissage : tout ce qui partage le code INSEE ou le code postal. Volontairement
 * large — c'est `dansLaMemeCommune` qui resserre ensuite, sur des libellés que
 * SQL ne sait pas comparer (accents).
 */
const auMemeEndroit = ({ codeInsee, codePostal }: LieuAMaterialiser) => ({
  OR: [...(codeInsee ? [{ codeInsee }] : []), { codePostal }],
})

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
 * dénominations qui correspondent, sont le même établissement : c'est la
 * largeur d'une parcelle, pas celle d'un quartier. Mesuré sur la base : à ce
 * seuil, les rapprochements gagnés sont des doublons manifestes, et aucun ne
 * heurte le veto SIRET.
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

type LieuCandidat = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly latitude: number | null
  readonly longitude: number | null
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string | null
  readonly siret: string | null
  readonly synchronisationSiret: Date | null
  readonly suppression: Date | null
}

/**
 * Un SIRET n'a valeur de preuve que si l'on sait d'où il vient. Seuls font foi
 * ceux issus de l'API entreprise, de ProConnect, ou d'une structure
 * administrative du schéma `main` ; celui de la cartographie nationale, lui,
 * n'est pas fiable — c'est déjà la règle des imports.
 *
 * En base, cette provenance se lit sur `synchronisationSiret` : la date n'est
 * posée qu'après confrontation à une source faisant foi (job `normalize-sirets`,
 * et matérialisation depuis l'annuaire ci-dessous). Un SIRET sans cette date ne
 * dit donc rien — ni pour rapprocher, ni pour distinguer.
 */
const siretFiable = (candidat: LieuCandidat): string | null =>
  candidat.synchronisationSiret === null ? null : candidat.siret

const memeSiret = (
  candidat: LieuCandidat,
  lieu: LieuAMaterialiser,
): boolean => {
  const fiable = siretFiable(candidat)
  return fiable != null && fiable === lieu.siret
}

/**
 * Deux SIRET renseignés et différents désignent deux établissements distincts,
 * quoi que disent les dénominations : « LA POSTE » ou « COMMUNE DE TOULON »
 * ouvrent plusieurs sites dans la même commune. Le SIRET a donc valeur de VETO —
 * s'y fier seulement quand il rapproche, et l'ignorer quand il sépare,
 * fusionnerait des antennes bien réelles.
 */
const siretsDivergents = (
  candidat: LieuCandidat,
  lieu: LieuAMaterialiser,
): boolean => {
  const fiable = siretFiable(candidat)
  return fiable != null && lieu.siret != null && fiable !== lieu.siret
}

/**
 * Le candidat désigne-t-il le même établissement ?
 *
 * - SIRET divergents : jamais, c'est le veto.
 * - Même SIRET : oui, c'est la preuve d'identité — l'adresse peut différer, elle
 *   a pu être corrigée.
 * - Sinon : la dénomination doit correspondre ET l'adresse aussi. Sans SIRET
 *   pour arbitrer, deux antennes homonymes dans la même commune ne se
 *   distinguent que par leur adresse ; s'en passer fusionnerait la nouvelle
 *   antenne dans l'ancienne et perdrait son adresse au passage.
 */
const designeLeMemeLieu = (
  candidat: LieuCandidat,
  lieu: LieuAMaterialiser,
): boolean => {
  if (siretsDivergents(candidat, lieu)) return false
  if (memeSiret(candidat, lieu)) return true
  if (!dansLaMemeCommune(candidat, lieu)) return false

  return (
    nomsCorrespondent(candidat.nom, lieu.nom) &&
    adressesConcordantes(candidat, lieu)
  )
}

/**
 * Corrélation forte : deux identités qui ne se confondent pas par hasard — même
 * SIRET, ou même dénomination (et non un simple nom contenu dans l'autre) à la
 * même adresse. Une corrélation faible suffit à rattacher un lieu actif sans
 * risque, mais pas à relever un lieu supprimé : le seuil pour défaire une
 * suppression doit être plus haut.
 */
const correlationForte = (
  candidat: LieuCandidat,
  lieu: LieuAMaterialiser,
): boolean =>
  memeSiret(candidat, lieu) ||
  normaliserNom(candidat.nom) === normaliserNom(lieu.nom)

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
 * Sonde de corrélation : cherche dans la coop un lieu qui désigne le même
 * établissement que celui qu'on s'apprête à créer, pour s'y rattacher plutôt
 * que d'en créer un doublon.
 *
 * Aucune identité ne relie les deux. Un lieu venu de la cartographie nationale
 * ou de l'annuaire des entreprises ne porte pas l'id du lieu coop qui lui
 * correspond, et l'id de cartographie nationale ne peut pas jouer ce rôle : il
 * n'est posé qu'a posteriori par le job nightly de la carto, si bien qu'un lieu
 * créé dans la coop et publié depuis n'en a pas encore — et serait recréé.
 *
 * On corrèle donc sur ce qui désigne un établissement, dans la commune : son
 * SIRET s'il est de provenance sûre (cf. `siretFiable`) — qui vaut alors aussi
 * bien preuve d'identité que preuve de distinction —, sinon sa dénomination
 * À LA MÊME ADRESSE. Les dénominations se
 * comparent normalisées, parce que la même structure ne porte pas le même
 * libellé selon la source qui la décrit (« Mairie de Fleury » côté coop,
 * « COMMUNE DE FLEURY » côté annuaire).
 *
 * En cas de doute on ne fusionne pas : un doublon se détecte
 * (`detect-duplicate-lieux`) et se répare (fusion de lieux), une fusion à tort
 * perd l'adresse du lieu absorbé sans laisser de trace.
 *
 * Rend aussi la force de la corrélation et l'état de suppression du lieu trouvé,
 * dont dépend le droit de relever un lieu supprimé (cf. `preparerCorrele`).
 *
 * Même hiérarchie que la sonde des imports (`findOrCreateLieuInclusion`), sans
 * son géocodage : on est ici dans une transaction, qui n'a rien à attendre du
 * réseau. Le filtrage se fait en mémoire, la comparaison de noms n'étant pas
 * exprimable en SQL — une commune compte 2 lieux en moyenne, 89 au maximum.
 */
export const lieuCorrele = async (
  transaction: Prisma.TransactionClient,
  lieu: LieuAMaterialiser,
): Promise<Correle | null> => {
  const selection = {
    id: true,
    nom: true,
    adresse: true,
    latitude: true,
    longitude: true,
    commune: true,
    codePostal: true,
    codeInsee: true,
    siret: true,
    synchronisationSiret: true,
    suppression: true,
  } as const

  // Un SIRET fiable identifie un établissement à l'échelle nationale : il n'a
  // pas à passer par le périmètre géographique, qui le manquerait dès que les
  // deux fiches ne s'accordent pas sur la commune.
  const parSiret = lieu.siret
    ? await transaction.lieuInclusion.findMany({
        where: { siret: lieu.siret, synchronisationSiret: { not: null } },
        orderBy: { creation: 'asc' },
        select: selection,
      })
    : []

  const candidats =
    parSiret.length > 0
      ? parSiret
      : await transaction.lieuInclusion.findMany({
          where: auMemeEndroit(lieu),
          orderBy: { creation: 'asc' },
          select: selection,
        })

  const correles = candidats.filter((candidat) =>
    designeLeMemeLieu(candidat, lieu),
  )

  const candidat = meilleurCandidat(correles, lieu.adresse)

  return candidat
    ? {
        id: candidat.id,
        suppression: candidat.suppression,
        forte: correlationForte(candidat, lieu),
      }
    : null
}

/**
 * Résout la corrélation en un lieu prêt à porter une activité, ou `null` s'il
 * faut en matérialiser un nouveau.
 *
 * - Lieu corrélé actif : on s'y rattache — c'est tout l'intérêt de la sonde.
 * - Lieu corrélé supprimé : la suppression est un acte de modération (un lieu
 *   illégitime retiré de la cartographie). On ne la défait que sur corrélation
 *   FORTE — un simple homonyme ne doit pas pouvoir ressusciter un lieu banni —,
 *   et le lieu relevé revient INVISIBLE de la cartographie : le rendre à nouveau
 *   visible demande une nouvelle décision, jamais une simple ré-inscription.
 *   Sinon, il n'est pas relevé (`null`) : on matérialisera un lieu neuf, lui
 *   aussi invisible par défaut, sans toucher au lieu modéré.
 */
export const preparerCorrele = async (
  transaction: Prisma.TransactionClient,
  correle: Correle,
): Promise<{ readonly id: string } | null> => {
  if (correle.suppression === null) return { id: correle.id }

  if (!correle.forte) return null

  return transaction.lieuInclusion.update({
    where: { id: correle.id },
    data: {
      suppression: null,
      suppressionParId: null,
      // Un lieu relevé ne réapparaît pas de lui-même sur la cartographie : la
      // visibilité se re-décide, elle ne se réhérite pas d'un lieu modéré.
      visiblePourCartographieNationale: false,
      derniereModificationSource: null,
    },
    select: { id: true },
  })
}
