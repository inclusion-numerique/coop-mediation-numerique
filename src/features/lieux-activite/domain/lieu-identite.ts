import {
  type CodeInsee,
  type CodePostal,
  type ComparaisonMesuree,
  comparer,
  type LieuPrepare,
  preparer,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

export type LieuAMaterialiser = {
  readonly nom: string
  readonly adresse: string | null
  readonly commune: string
  readonly codePostal: CodePostal
  readonly codeInsee?: CodeInsee | null
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
  readonly codePostal: CodePostal | null
  readonly codeInsee: CodeInsee | null
  readonly suppression: Date | null
  readonly typologies?: readonly string[] | null
}

const SCORE_MINIMAL = 80

const NOM_IDENTIQUE = 100

const VOCABULAIRE = new Set<string>(Object.values(Typologie))

const auVocabulaire = (typologies: readonly string[]): Typologie[] | null => {
  const connues = typologies.filter((typologie): typologie is Typologie =>
    VOCABULAIRE.has(typologie),
  )

  return connues.length === 0 ? null : connues
}

const auStandard = (lieu: LieuAMaterialiser | LieuCandidat): LieuPrepare =>
  preparer({
    nom: lieu.nom,
    adresse: lieu.adresse ?? '',
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

type CandidatJuge<Candidat extends LieuCandidat> = {
  readonly candidat: Candidat
  readonly comparaison: ComparaisonMesuree
}

const juger =
  (aReconnaitre: LieuPrepare) =>
  <Candidat extends LieuCandidat>(
    candidat: Candidat,
  ): readonly CandidatJuge<Candidat>[] => {
    const comparaison = comparer(auStandard(candidat), aReconnaitre)
    return 'score' in comparaison && comparaison.score > SCORE_MINIMAL
      ? [{ candidat, comparaison }]
      : []
  }

const meilleur = <Candidat extends LieuCandidat>(
  juges: readonly CandidatJuge<Candidat>[],
): CandidatJuge<Candidat> | null => {
  const parNoteDecroissante = (
    un: CandidatJuge<Candidat>,
    autre: CandidatJuge<Candidat>,
  ): number => autre.comparaison.score - un.comparaison.score

  const actifs = juges.filter(({ candidat }) => candidat.suppression === null)

  return (
    [...actifs].sort(parNoteDecroissante).at(0) ??
    [...juges].sort(parNoteDecroissante).at(0) ??
    null
  )
}

export const correler = <Candidat extends LieuCandidat>(
  candidats: readonly Candidat[],
  lieu: LieuAMaterialiser,
): (Correle & { readonly id: Candidat['id'] }) | null => {
  const juges = candidats.flatMap(juger(auStandard(lieu)))

  const elu = meilleur(juges)

  if (!elu) return null

  return {
    id: elu.candidat.id,
    suppression: elu.candidat.suppression,
    forte: elu.comparaison.nom === NOM_IDENTIQUE,
  }
}
