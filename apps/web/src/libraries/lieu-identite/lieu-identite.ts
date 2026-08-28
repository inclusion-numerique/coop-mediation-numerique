import {
  type Comparaison,
  comparer,
  type LieuPrepare,
  preparer,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

/**
 * Reconnaissance d'un lieu : à quelles conditions deux fiches désignent le même
 * ENDROIT.
 *
 * Le jugement lui-même n'est plus écrit ici. Il appartient au standard —
 * `@gouvfr-anct/lieux-de-mediation-numerique` —, d'où tous les consommateurs du
 * schéma le tirent : la coop, mednum-cli, et les producteurs de données qui
 * viendront. Deux règles concurrentes, c'était deux vérités, et des
 * contradictions qu'aucun arbitrage ne peut trancher au moment de mettre les
 * données en commun.
 *
 * Ce qui reste à la coop est ce que le standard ne peut pas savoir : le seuil
 * qu'elle se donne, la façon de départager plusieurs corrélés, et ce qui
 * autorise à relever un lieu supprimé.
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
  readonly typologies?: readonly string[] | null
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
  readonly typologies?: readonly string[] | null
}

/**
 * Le seuil de la coop.
 *
 * Le standard rend un score gradué et laisse chaque consommateur poser sa
 * limite. 80 est celle de la cartographie nationale, établie sur ses 21 000
 * lieux : c'est le dernier palier qui n'admet aucune paire dont les
 * dénominations divergent franchement. En dessous, des libellés sans rapport
 * commencent à se rejoindre.
 */
const SCORE_MINIMAL = 80

/**
 * Une dénomination identique, et pas seulement proche.
 *
 * Sert au seul cas où le doute ne se paie pas de la même façon : relever un lieu
 * supprimé, c'est-à-dire défaire un acte de modération. Un homonyme approchant
 * ne doit pas pouvoir ressusciter un lieu banni.
 */
const NOM_IDENTIQUE = 100

/**
 * Le standard raisonne sur des lieux du schéma. La coop lui présente les siens.
 *
 * La typologie n'est pas toujours portée par le candidat ; le standard la déduit
 * alors de la dénomination. C'est un garde-fou volontaire : opposer « France
 * services de Fleury » à « Mairie de Fleury » crée au pire un doublon, là où les
 * confondre rattache quelqu'un à l'établissement d'un autre.
 */
const VOCABULAIRE = new Set<string>(Object.values(Typologie))

/**
 * Une typologie que le standard ne connaît pas ne peut rien opposer : on la
 * laisse de côté plutôt que de refuser le lieu entier. Le garde-fou reste porté
 * par celles qu'il reconnaît, et par la déduction depuis la dénomination.
 */
const auVocabulaire = (typologies: readonly string[]): Typologie[] | null => {
  const connues = typologies.filter((typologie): typologie is Typologie =>
    VOCABULAIRE.has(typologie),
  )

  return connues.length === 0 ? null : connues
}

const auStandard = (lieu: LieuAMaterialiser | LieuCandidat): LieuPrepare =>
  preparer({
    nom: lieu.nom,
    adresse: lieu.adresse,
    codeInsee: lieu.codeInsee ?? null,
    localisation:
      lieu.latitude == null || lieu.longitude == null
        ? null
        : { latitude: lieu.latitude, longitude: lieu.longitude },
    typologies: lieu.typologies == null ? null : auVocabulaire(lieu.typologies),
    source: null,
  })

export type Correle = {
  readonly id: string
  readonly suppression: Date | null
  readonly forte: boolean
}

type CandidatJuge = {
  readonly candidat: LieuCandidat
  readonly comparaison: Comparaison
}

const retenu = ({ comparaison }: CandidatJuge): boolean =>
  comparaison.vetos.length === 0 &&
  'score' in comparaison &&
  comparaison.score > SCORE_MINIMAL

/**
 * Départage les candidats retenus : un lieu actif d'abord — un lieu supprimé l'a
 * été volontairement —, et à ce niveau le mieux noté. À défaut, le plus ancien
 * (les candidats arrivent triés).
 */
const meilleur = (juges: readonly CandidatJuge[]): CandidatJuge | null => {
  const note = ({ comparaison }: CandidatJuge): number =>
    'score' in comparaison ? comparaison.score : 0
  const parNoteDecroissante = (un: CandidatJuge, autre: CandidatJuge): number =>
    note(autre) - note(un)

  const actifs = juges.filter(({ candidat }) => candidat.suppression === null)

  return (
    [...actifs].sort(parNoteDecroissante).at(0) ??
    [...juges].sort(parNoteDecroissante).at(0) ??
    null
  )
}

/**
 * Le lieu de la coop qui désigne le même endroit, s'il en est un.
 *
 * Seule entrée publique : les candidats arrivent déjà ratissés (même code INSEE)
 * et TRIÉS — l'ordre porte l'ancienneté, qui départage à note égale.
 */
export const correler = (
  candidats: readonly LieuCandidat[],
  lieu: LieuAMaterialiser,
): Correle | null => {
  const aReconnaitre = auStandard(lieu)
  const juges = candidats
    .map((candidat) => ({
      candidat,
      comparaison: comparer(auStandard(candidat), aReconnaitre),
    }))
    .filter(retenu)

  const elu = meilleur(juges)

  if (!elu) return null

  return {
    id: elu.candidat.id,
    suppression: elu.candidat.suppression,
    forte: 'nom' in elu.comparaison && elu.comparaison.nom === NOM_IDENTIQUE,
  }
}
